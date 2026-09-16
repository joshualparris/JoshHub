# 03 — `src/lib` models, logic, seed and repos

**Area:** the domain model, pure logic, seed content and repository adapters.
**Files reviewed:** 21 (all read in full; `platform/seed.ts` read structurally —
it is 301 lines of content, not logic)

This area is where most of the repository's confusion lives, so it is worth
being precise about what is actually running.

```
src/lib/
  models/     capture.ts, life.ts, lifeContent.ts            ← unused
  logic/      autoSort, tagging, date, lifeDerivations,       ← unused
              mappers/captureToDb, mappers/dbToCapture        ← unused
  seed/       defaultTags, lifeStarterPack                    ← unused
  repos/      captureRepo, lifeContentRepo                    ← unused
    dexie/    captureRepoDexie, lifeContentRepoDexie          ← unused
              learnRepoDexie                                  ← LIVE
      platform/ moveOps, decisionCards, opportunities,        ← LIVE
                weeklyReviews, seed                           ← seed never runs
```

## Where this came from

`COPILOT_SCOPE.md` and `docs/CODEX_HANDOFF_PROMPT16_FOUNDATION.md` explain it:
a branch called `copilot/prompt-16-foundation` added a domain model, pure logic
and in-memory repositories, deliberately scoped to `src/lib/**` and explicitly
not wired to any UI. The handoff says "Codex will implement the Dexie adapters
and UI wiring after Prompt 4 completes."

That wiring never happened. The scaffolding has sat unused since, while the app
grew a second, different way of doing the same things in `src/lib/db`.

**This is not dead code in the ordinary sense — it is unfinished code that was
always intended to be finished.** That matters for how it should be treated.

## What this area gets right

- The live repository adapters (`platform/*`, `learnRepoDexie`) are a good
  pattern: a small object per table, sorting rules stated explicitly and
  commented, timestamps handled in one place.
- `logic/tagging.ts` and `logic/autoSort.ts` are clean pure functions with no
  dependencies — genuinely reusable, and the kind of thing that should be tested
  and used rather than thrown away.
- `models/capture.ts` describes a sensible unified capture model, which is
  arguably a better idea than the current split across notes/tasks/bookmarks.

---

## Findings

### [ ] SCAF-01 — ~690 lines of unfinished scaffolding, unreferenced by the app · High
- **Principles:** P9, P1, P2
- **Where:** `models/*`, `logic/*` (except as noted), `seed/*`, `repos/captureRepo.ts`, `repos/lifeContentRepo.ts`, `repos/dexie/captureRepoDexie.ts`, `repos/dexie/lifeContentRepoDexie.ts`
- **Problem:** No file under `src/app`, `src/components` or `src/features`
  imports any of it. Verified by searching for each module's import path.
- **Why it matters:** It is the single biggest obstacle to understanding this
  repository. A reader opening `src/lib` finds two complete data models — the
  `CaptureItem` world and the `Note`/`Task`/`Bookmark` world — with nothing
  saying which is real. Every question ("where do captures live?", "what is a
  LifeArea?") has two answers.
- **Fix:** Settle it deliberately, in this order:
  1. Compare `src/app/capture/page.tsx` against `logic/autoSort.ts`. If the page
     reimplements kind/area/tag inference, wire it to `autoSort` — that keeps
     the code and removes a duplicate in one move.
  2. Adopt `logic/tagging.ts` wherever tags are parsed from text.
  3. Fold `isOverdue` from `logic/date.ts` into `src/lib/date.ts` (LIB-04).
  4. Whatever remains unwired after that is genuinely speculative. Keep it only
     if a named next step exists; otherwise remove it, because leaving a second
     data model in place actively misleads.
  Until this is resolved, add a `README.md` in `src/lib/models/` stating the
  status so nobody assumes it is live.
- **Status:** Open

### [ ] SCAF-02 — `logic/date.ts` duplicates `lib/date.ts` · Medium
- **Principles:** P2
- **Where:** `src/lib/logic/date.ts`, `src/lib/date.ts`
- **Problem:** Same duplication described in LIB-04, recorded here so the fix is
  visible from both areas. `isOverdue` exists only in the unused copy.
- **Why it matters:** Timezone-sensitive logic implemented twice.
- **Fix:** Move `isOverdue` into `src/lib/date.ts`, delete `logic/date.ts`.
- **Status:** Open

### [ ] SCAF-03 — `lifeContentRepoDexie` silently discards everything written to it · High
- **Principles:** P9, P8, P6
- **Where:** `src/lib/repos/dexie/lifeContentRepoDexie.ts`
- **Problem:** The adapter checks for `db.lifeContent`, and there is no
  `lifeContent` table anywhere in the Dexie schema — confirmed, zero occurrences
  in `dexie.ts`. The check therefore always fails and the adapter returns an
  in-memory `Map` instead. Its own comment says "Codex should implement a real
  table later and remove the fallback."
- **Why it matters:** This is the worst shape a piece of code can take: it is
  named like persistence, implements the persistence interface, returns success
  on every write, and stores nothing that survives a page reload. Nothing uses
  it today, so no data has been lost — but the first person to wire it up will
  believe it works, and it will fail silently.
- **Fix:** Either add the `lifeContent` table to the schema and delete the
  fallback, or delete the adapter. Do not leave a persistence adapter that
  quietly does not persist. If it must stay pending a decision, rename the
  fallback path so it throws rather than pretending to succeed.
- **Status:** Open

### [ ] SCAF-04 — 301 lines of Platform seed data that never runs · Medium
- **Principles:** P9, P4
- **Where:** `src/lib/repos/dexie/platform/seed.ts`, `src/features/platform/index.ts:6`
- **Problem:** `seedPlatformData()` is imported by `src/features/platform/index.ts`
  and never called — ESLint already reports it as an unused variable. So the
  Platform pages start empty even though a full set of starter move ops,
  decision cards, opportunities and weekly reviews exists.
- **Why it matters:** Either the seed is wanted, in which case the Platform
  section is needlessly empty and 301 lines of content are wasted, or it is not,
  in which case the import is noise and the file is dead weight. Nobody can tell
  which from reading the code.
- **Fix:** Decide. If the seed is wanted, call it once on first load — matching
  how `seedRoutines`/`seedLearnData` are meant to work — guarded by the existing
  `count()` check so it never overwrites real data. If not, remove the import
  and the file. Either way, state the decision in a comment.
- **Status:** Open

### [ ] SCAF-05 — Capture↔DB mappers conflate life area with project id · Medium
- **Principles:** P2, P6
- **Where:** `src/lib/logic/mappers/captureToDb.ts`, `src/lib/logic/mappers/dbToCapture.ts`
- **Problem:** `captureToTask` writes the capture's life area into the task's
  `projectId` (`projectId: item.area === "inbox" ? null : item.area`), and
  `taskToCapture` reads `projectId` straight back out as the area. The round
  trip only works because nothing else writes `projectId`. A task with a real
  project id would come back with that id as its life area.
- **Why it matters:** Two unrelated concepts share one column by convention
  only, with nothing enforcing or documenting it. This is the sort of thing that
  is invisible until data is wrong.
- **Fix:** When SCAF-01 is resolved, give life area its own field on `Task`
  (`lifeAreaSlug`, matching `Note`) rather than borrowing `projectId`.
- **Status:** Open

### [ ] SCAF-06 — Mappers are explicitly speculative · Medium
- **Principles:** P1, P9
- **Where:** `src/lib/logic/mappers/captureToDb.ts`
- **Problem:** The file's own header says: "These are suggestions; exact target
  tables/fields depend on Dexie schema and should be adapted by Codex when
  wiring." The Dexie schema has existed for some time; the suggestions were
  never checked against it.
- **Why it matters:** Code that describes itself as a suggestion is not code, it
  is a comment that compiles. It will be read as authoritative by someone
  eventually.
- **Fix:** Verify each mapper against `schema.ts` and either correct and adopt
  them, or move the content into the handoff doc as prose.
- **Status:** Open

### [ ] SCAF-07 — Repos folder mixes live adapters with unused ones · Medium
- **Principles:** P3, P13
- **Where:** `src/lib/repos/`
- **Problem:** `learnRepoDexie.ts` and `platform/*` are live and imported by the
  app. `captureRepoDexie.ts`, `lifeContentRepoDexie.ts` and both in-memory repos
  are not. They sit in the same folder with no distinction.
- **Why it matters:** The folder gives no signal about what is load-bearing.
- **Fix:** Once SCAF-01 is decided, keep only live adapters here. If any
  scaffolding survives pending wiring, move it to a clearly named location such
  as `src/lib/repos/_unwired/` with a README.
- **Status:** Open

### [ ] SCAF-08 — Two ways to generate ids · Low
- **Principles:** P2, P13
- **Where:** `src/lib/db/id.ts` (`uuid`), `src/lib/models/capture.ts` (`makeId`), `src/lib/repos/dexie/captureRepoDexie.ts` (a second local `makeId`)
- **Problem:** Three id generators: the shared `uuid()`, `makeCapture`'s
  timestamp-plus-random `makeId`, and another `makeId` defined locally inside
  `captureRepoDexie.ts`.
- **Why it matters:** Ids from different generators have different formats and
  collision characteristics, which matters if capture ids ever become record
  keys.
- **Fix:** Use `uuid()` from `src/lib/db/id.ts` everywhere. Resolve with SCAF-01.
- **Status:** Open

### [ ] SCAF-09 — `learnRepoDexie.ts` uses a different indent style · Low
- **Principles:** P13
- **Where:** `src/lib/repos/dexie/learnRepoDexie.ts`
- **Problem:** Four-space indentation; the rest of the codebase uses two.
- **Why it matters:** Small, but it is the kind of inconsistency that makes a
  codebase feel assembled rather than written, and it produces noisy diffs when
  an editor reformats on save.
- **Fix:** Reformat to two spaces. Consider adding Prettier so this is settled
  mechanically rather than per file (see area 08).
- **Status:** Open

### [ ] SCAF-10 — Unused `catch` binding · Low
- **Principles:** P13
- **Where:** `src/lib/repos/dexie/learnRepoDexie.ts:137`
- **Problem:** `catch (e)` where `e` is never used — already an ESLint warning.
- **Why it matters:** Trivial, but it is one of ten standing warnings that make
  the lint output easy to ignore.
- **Fix:** Change to `catch {`. Worth clearing all ten warnings together so lint
  output is clean and future warnings stand out.
- **Status:** Open
