# 07 — `src/features`

**Area:** self-contained feature modules that sit between the shared library and
the route components.
**Files reviewed:** 9 (all read in full)

```
src/features/
  apps/contextPills.tsx        filter pills for the apps catalogue
  apps/hooks/usePinnedApps.ts  pinned apps, stored in localStorage
  everything-map/db.ts         note CRUD + hooks + its own export/import
  everything-map/map-client.tsx the map UI (373 lines)
  everything-map/toc.ts        the table of contents data
  everything-map/tree.ts       pure tree building / filtering / search
  everything-map/tree.test.ts  the repository's only pre-existing tests
  everything-map/types.ts      TocItem / TocNode
  platform/index.ts            hooks + actions over the platform repos
```

## What this area gets right

This is the best-organised part of the repository, and it should be the model
for the rest:

- `everything-map` is a genuine feature module — types, pure logic, persistence
  and UI together in one folder with one responsibility (P3).
- `tree.ts` is pure, well named and **tested** (`tree.test.ts`) — the only
  pre-existing tests in the repo, and they test behaviour rather than
  implementation (P15).
- `platform/index.ts` gives the UI one entry point (`usePlatform*` hooks plus a
  `platformActions` object) over four repositories. That is exactly the
  directional dependency P14 asks for.

---

## Findings

### [ ] FEAT-01 — A third, separate export/import system for notes · High
- **Principles:** P2, P11
- **Where:** `src/features/everything-map/db.ts` (`exportNotes`, `importNotes`)
- **Problem:** This module implements its own note backup — a `version: 1`
  payload containing only notes, with its own import that `bulkPut`s them back.
  It is entirely independent of `src/lib/db/backup.ts`.
- **Why it matters:** The repository now has two backup formats that both call
  themselves a JoshHub export and are not interchangeable. A user with a
  `version: 1` notes file and a `version: 3` full backup has no way to tell them
  apart, and feeding the notes file to the main restore is rejected while the
  full backup fed here would import nothing but notes. Fragmented backup is
  precisely the failure this repo has already been bitten by (DB-01, DB-02).
- **Fix:** Delete `exportNotes`/`importNotes` and have the map UI use the shared
  backup module. If a notes-only export is genuinely wanted, add it to
  `backup.ts` as a documented subset of the one format, so there is still a
  single system.
- **Status:** Open

### [ ] FEAT-02 — Two pinning systems with different storage · Medium
- **Principles:** P2, P6, P13
- **Where:** `src/features/apps/hooks/usePinnedApps.ts`, `src/lib/pins.ts`
- **Problem:** Pinned *apps* are stored in `localStorage` under
  `joshhub.pinnedApps.v1`; pinned *life areas* are stored in the Dexie `pins`
  table. Same user-facing concept, two mechanisms.
- **Why it matters:** Only one of the two is included in a backup — the Dexie
  one. Pinned apps are silently lost when moving browsers, and the difference is
  invisible to the user. It also means two answers to "where does pinned state
  live?".
- **Fix:** Move pinned apps into the Dexie `pins` table, distinguishing the two
  kinds by an id prefix or a `kind` field, so pins are one concept with one
  store and are covered by backup.
- **Status:** Open

### [ ] FEAT-03 — `useNotes` is defined twice with different behaviour · Medium
- **Principles:** P2, P4
- **Where:** `src/features/everything-map/db.ts:43`, `src/lib/db/hooks.ts:4`
- **Problem:** Both export a hook called `useNotes` taking a `nodeId`. The
  shared one returns `undefined` while loading and accepts an optional nodeId;
  the feature one requires a nodeId and always returns an array.
- **Why it matters:** Two hooks with the same name and different loading
  semantics is an easy import-the-wrong-one mistake, and the compiler cannot
  help because both type-check.
- **Fix:** Rename the feature-local one to `useMapNotes`, which is what it
  actually is, or delete it in favour of the shared hook.
- **Status:** Open

### [ ] FEAT-04 — Live query results sorted in place · Medium
- **Principles:** P10
- **Where:** `src/features/everything-map/db.ts:49`
- **Problem:** `(notes ?? []).sort((a, b) => b.updatedAt - a.updatedAt)` mutates
  the array returned by `useLiveQuery`. The same defect was fixed on the
  dashboard in `ead6146`.
- **Why it matters:** Dexie caches and shares that array; reordering it in place
  can change what other components render.
- **Fix:** `[...(notes ?? [])].sort(...)`, with the same explanatory comment used
  on the dashboard.
- **Status:** Open

### [ ] FEAT-05 — `usePinnedApps` reads localStorage during render · Medium
- **Principles:** P6
- **Where:** `src/features/apps/hooks/usePinnedApps.ts:14`
- **Problem:** The `useState` initialiser reads `localStorage`, returning `[]` on
  the server and real data in the browser — the same hydration mismatch pattern
  fixed on the dashboard in `ead6146`.
- **Why it matters:** Any page using this hook can produce a React #418
  hydration error and a flash of wrong content.
- **Fix:** Initialise to `[]` and load in an effect, or adopt `useHydrated`
  (LIB-02). Note the write-back effect then needs a guard so it does not
  overwrite stored pins with `[]` on first render.
- **Status:** Open

### [ ] FEAT-06 — `exportNotes` returns a Blob but never names the file · Low
- **Principles:** P4, P5
- **Where:** `src/features/everything-map/db.ts:59`
- **Problem:** The function builds a Blob and returns it, leaving the caller to
  invent a filename and trigger the download.
- **Why it matters:** Minor, but it means download naming is decided in the UI,
  inconsistently with `buildBackupFilename` in the shared backup module.
- **Fix:** Resolved for free by FEAT-01 — use the shared module, which owns
  filename construction.
- **Status:** Open

### [ ] FEAT-07 — `everything-map` is the only feature module · Low
- **Principles:** P3, P13
- **Where:** `src/features/`
- **Problem:** `everything-map` is a complete vertical slice. `apps` holds two
  loose files whose siblings live in `src/components`, and `platform` is a
  single re-export file whose repositories live under `src/lib/repos`.
- **Why it matters:** Not a bug — but `src/features` currently means three
  different things, so a newcomer cannot tell what belongs here.
- **Fix:** Write down the rule. The `everything-map` shape (types, logic,
  persistence, UI, tests in one folder) is the good one; state it in the audit
  README or a short `src/features/README.md`, and move things toward it
  gradually rather than in one sweep.
- **Status:** Open
