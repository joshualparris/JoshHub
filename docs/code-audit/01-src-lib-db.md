# 01 — `src/lib/db`

**Area:** persistence layer — Dexie schema, typed records, per-record actions,
React hooks, and backup/restore.
**Files reviewed:** 11 (all read in full)

```
src/lib/db/
  actions.ts      per-record create/update/delete for the core tables
  backup.ts       export / restore / reset, built on one table registry
  backup.test.ts  round-trip and registry-drift tests
  dexie.ts        database class, schema versions 1–7, seed helpers
  events.ts       calendar event CRUD + hook + ICS parser
  family.ts       family rhythm (single record)
  health.ts       health log CRUD + hooks + activity/daily-metric roll-up
  hooks.ts        useLiveQuery hooks for the core tables
  id.ts           uuid()
  platform.ts     CRUD for the four Platform tables
  schema.ts       every record type
```

## What this area gets right

Worth stating, because a newcomer should know what to imitate:

- `schema.ts` is a single, readable list of record types with no logic in it.
- Dexie is used consistently: inline primary keys, `useLiveQuery` for reads.
- `id.ts` does one thing and degrades sensibly when `crypto` is unavailable.
- The data flow the app actually uses is the flow you would expect:
  IndexedDB → `db` → action/hook → component (P6).

## How the tables are owned

Useful map, because ownership is currently split:

| Tables | Written by |
|--------|-----------|
| notes, tasks, bookmarks, routines, routineRuns, pins | `actions.ts` |
| events | `events.ts` |
| sleep, movement, nutrition, metrics, activities, dailyMetrics, healthImports, digitalEvents | `health.ts` |
| family | `family.ts` |
| platformMoveOps, platformDecisionCards, platformOpportunities, platformWeeklyReviews | `platform.ts` **and** `src/lib/repos/dexie/platform/*` — see DB-04 |
| learnTopics, learnResources, learnNotes, learnSessions, learnSettings | `src/lib/repos/dexie/learnRepoDexie.ts` |
| all of the above | `backup.ts` |

---

## Findings

### [x] DB-01 — Backup omitted 19 of the 26 tables · Critical
- **Principles:** P2, P11
- **Where:** `src/lib/db/actions.ts` (`exportAll`, now removed)
- **Problem:** Export wrote only notes, tasks, bookmarks, routines, routineRuns,
  pins, the Platform tables and digitalEvents. Calendar events, every health log
  (sleep, movement, nutrition, metrics), imported activities and telemetry, the
  family rhythm and the entire Learn module were in no backup at all.
- **Why it matters:** JoshHub is local-first with no server copy. Moving to a
  new browser or device and restoring the "backup" would silently lose all of
  that data permanently.
- **Fix:** One `BACKUP_TABLES` registry in `backup.ts` that export, restore and
  reset all derive from, plus a test comparing it against the live Dexie schema.
- **Status:** Fixed in `e94e809`

### [x] DB-02 — Restoring a backup destroyed Platform data · Critical
- **Principles:** P2, P11, P15
- **Where:** `src/lib/db/actions.ts` (`importAll`), `src/app/settings/backups/page.tsx`
- **Problem:** `importAll` defaulted every missing table to `[]`, and in
  `replace` mode cleared the Platform and digitalEvents tables before writing
  those empty arrays back. The backups page only ever passed six tables, so a
  restore wiped move ops, decision cards, opportunities and weekly reviews —
  even when the backup file on disk contained them.
- **Why it matters:** The operation whose entire purpose is to recover data was
  the operation most likely to destroy it, silently.
- **Fix:** A restore now only clears tables the backup actually contains
  (`tablesPreservedByRestore`), and reports which tables it left alone.
- **Status:** Fixed in `e94e809`

### [x] DB-03 — "Reset all data" left several tables behind · High
- **Principles:** P2, P4
- **Where:** `src/lib/db/actions.ts` (`resetAll`)
- **Problem:** The prompt said "Reset all local data? This cannot be undone",
  but the function cleared only 11 of 26 tables — health logs, Learn, calendar
  events and the family rhythm survived.
- **Why it matters:** Someone resetting to fix a problem, or to hand the browser
  to someone else, was left with data they believed was gone.
- **Fix:** `clearUserData()` clears every table in the registry.
- **Status:** Fixed in `e94e809`

### [ ] DB-04 — Two parallel CRUD APIs for the Platform tables · High
- **Principles:** P2, P13, P14
- **Where:** `src/lib/db/platform.ts` and `src/lib/repos/dexie/platform/{moveOps,decisionCards,opportunities,weeklyReviews}RepoDexie.ts`
- **Problem:** Both files implement complete create/update/delete for the same
  four tables, with different shapes: `platform.ts` exports loose functions
  (`createOpportunity`), the repos export objects (`opportunitiesRepo.add`).
  Usage is split — `src/app/platform/weekly-review/page.tsx` imports
  `createWeeklyReview` from `platform.ts`, while everything else goes through
  `src/features/platform`, which wraps the repos.
- **Why it matters:** Two doors into the same tables means a change to how a
  Platform record is written (a new default, a validation rule, a timestamp
  convention) has to be made twice, and will eventually be made once. A reader
  cannot tell which is canonical.
- **Fix:** Make the repos canonical, since `src/features/platform` already
  builds on them and gives the UI a single entry point. Move
  `createWeeklyReview`'s defaults into `weeklyReviewsRepo.add`, point
  `weekly-review/page.tsx` at `platformActions`, and delete `platform.ts` — this
  is the "second broken copy" case where keeping it would mislead.
- **Status:** Open

### [ ] DB-05 — Every Dexie version restates the whole schema · Medium
- **Principles:** P13, P1
- **Where:** `src/lib/db/dexie.ts` lines 66–203
- **Problem:** Versions 1–7 each repeat all previously declared stores. Dexie
  only requires the tables that changed, so ~120 of the ~140 lines are copies.
  Versions 2 and 3 are byte-identical to each other, meaning version 3 records
  no change at all.
- **Why it matters:** The diff between two versions — which is the only thing a
  reader cares about when debugging a migration — is invisible. It also invites
  the copy-paste mistake of editing one version and not the next.
- **Fix:** Reduce each version to only the stores it adds or alters, keeping
  version 1 complete, and add a short comment per version saying what changed
  and when. Do not renumber existing versions: users have databases at these
  version numbers already.
- **Status:** Open

### [ ] DB-06 — Seed data lives inside the schema file · Medium
- **Principles:** P3, P7
- **Where:** `src/lib/db/dexie.ts` (`seedRoutines`, `seedLearnData`, lines 210–279)
- **Problem:** `dexie.ts` declares the database *and* carries ~70 lines of
  starter content — routine steps, fifteen Learn topics, three prompt templates.
- **Why it matters:** The file a reader opens to answer "what shape is the
  database?" is dominated by editorial content, and content changes churn the
  schema file's history.
- **Fix:** Move both functions to `src/lib/db/seed.ts` (or fold into the
  existing `src/lib/seed/` folder once area 03 is resolved), leaving `dexie.ts`
  as schema only.
- **Status:** Open

### [ ] DB-07 — Re-importing the same activity double-counts daily metrics · Medium
- **Principles:** P11, P15
- **Where:** `src/lib/db/health.ts` (`recordActivity`, `updateDailyMetricsFromActivity`)
- **Problem:** `recordActivity` always mints a new `uuid()` and then *adds* the
  activity's distance to that day's `dailyMetrics` row. Nothing detects that a
  file has been imported before, so importing the same TCX twice stores two
  activities and doubles the day's distance and run count.
- **Why it matters:** The dashboard's "Runs (7d)" and weekly kilometre totals
  become quietly wrong, and there is no way to tell from the UI that it happened
  or to correct it short of editing IndexedDB.
- **Fix:** Give activities a stable identity (for example a hash of source file
  name + start time + duration) and make the import path idempotent, or
  recompute `dailyMetrics` from the `activities` table rather than accumulating
  into it. The invariant to test: importing the same file twice leaves
  `dailyMetrics` identical to importing it once.
- **Status:** Open

### [ ] DB-08 — `events.ts` holds persistence, a hook and a parser · Medium
- **Principles:** P3, P7
- **Where:** `src/lib/db/events.ts`
- **Problem:** The file contains event CRUD, `useEvents`, and `parseIcsEvents` /
  `toIso` — a text parser with no database involvement.
- **Why it matters:** ICS parsing is domain logic that deserves its own file and
  its own tests. Buried in a persistence module it is easy to miss and awkward
  to test.
- **Fix:** Move `parseIcsEvents` and `toIso` to `src/lib/calendar/ics.ts` with
  unit tests, and leave `events.ts` as persistence.
- **Status:** Open

### [ ] DB-09 — Hooks live in three different places · Medium
- **Principles:** P13
- **Where:** `src/lib/db/hooks.ts`, `events.ts`, `health.ts`, `family.ts`
- **Problem:** `hooks.ts` holds hooks for the core tables, but `useEvents`,
  `useSleep`, `useMovement`, `useNutrition`, `useMetrics` and `useFamilyRhythm`
  are each defined next to their write functions instead.
- **Why it matters:** There is no rule a newcomer can infer about where to add
  the next hook, so the split will keep widening.
- **Fix:** Pick one convention and apply it everywhere. Co-locating each hook
  with the table it reads is the better of the two — so move the core hooks out
  of `hooks.ts` and next to their actions, rather than the reverse.
- **Status:** Open

### [ ] DB-10 — ICS parser ignores folded lines · Low
- **Principles:** P15
- **Where:** `src/lib/db/events.ts` (`parseIcsEvents`)
- **Problem:** RFC 5545 allows a long property to continue on the next line
  prefixed with a space or tab. The parser treats every line independently, so a
  folded `SUMMARY` or `LOCATION` is truncated at the fold and the continuation
  is discarded as an unknown key.
- **Why it matters:** Google Calendar and Outlook both fold long lines, so
  imported events can arrive with clipped titles.
- **Fix:** Unfold before parsing — join any line beginning with a space or tab
  onto the previous one — and cover it in the parser tests from DB-08.
- **Status:** Open

### [ ] DB-11 — `uuid()` fallback is not cryptographically strong · Low
- **Principles:** P12
- **Where:** `src/lib/db/id.ts`
- **Problem:** When `crypto` is unavailable the function falls back to
  `Math.random()`. The comment says so, which is the right instinct, but it does
  not say what the consequence is or when it can happen.
- **Why it matters:** Nothing today — these ids are local record keys, not
  secrets or anything an attacker sees. It is only a problem if ids ever become
  security-relevant or need to be globally unique across devices for syncing.
- **Fix:** No code change needed. Extend the comment to say the fallback exists
  for very old browsers, that collisions are only a theoretical risk for local
  keys, and that this must be revisited before any cross-device sync.
- **Status:** Open

---

## Notes for whoever audits next

- `dailyMetrics.steps` looks unwritten from inside this folder, but it is
  populated by `src/app/health/import/page.tsx`. Check `src/app` before
  reporting a field as unused.
- `backup.test.ts` uses `fake-indexeddb/auto`, which is the pattern to copy for
  any future test that needs a real database rather than a stand-in.
