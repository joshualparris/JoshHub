# 04 — `src/data`

**Area:** static data shipped with the app — the app catalogue, life areas and
game showcase.
**Files reviewed:** 6

```
src/data/
  apps.ts            139-entry catalogue of every app and game (2,144 lines)
  apps.ts.bak        an older 85-entry copy of the same file, committed
  apps.synced.json   empty array, written by scripts/sync_apps_from_live.js
  events.ts          a CalendarEvent type — unused
  gamesShowcase.ts   9 featured games for /games
  life.ts            the 8 life areas used by /life
```

## What this area gets right

- `apps.ts` entries have a consistent shape and the catalogue is genuinely the
  backbone of the app — the dashboard, `/apps`, life quick links and search all
  read from it.
- `life.ts` is small, readable and does exactly one thing.
- No duplicate ids in the catalogue (checked).

---

## Findings

### [ ] DATA-01 — A `.bak` file is committed to the repository · Medium
- **Principles:** P9, P13
- **Where:** `src/data/apps.ts.bak`
- **Problem:** 1,255 lines, 85 catalogue entries — an older snapshot of
  `apps.ts`, tracked in git.
- **Why it matters:** Git already stores history; a `.bak` file is a worse copy
  of what git does properly. It is stale (85 entries vs 139), it shows up in
  every search and grep for catalogue entries, and it confused this audit's own
  tooling. Anyone editing the catalogue has to work out which file is real.
- **Fix:** Delete it and add `*.bak` to `.gitignore`. The content is recoverable
  from history if ever needed.
- **Status:** Open

### [ ] DATA-02 — `CalendarEvent` is defined twice · Medium
- **Principles:** P2, P9
- **Where:** `src/data/events.ts:3`, `src/lib/db/schema.ts:65`
- **Problem:** `src/data/events.ts` declares a `CalendarEvent` type identical in
  purpose to the one in `schema.ts`, and has no importers at all.
- **Why it matters:** Two definitions of the same record type means a schema
  change can be made in the wrong one. The unused copy will eventually be picked
  up by autocomplete and imported by mistake.
- **Fix:** Delete `src/data/events.ts`. `schema.ts` is the single source of
  truth for record types.
- **Status:** Open

### [ ] DATA-03 — `gamesShowcase` records paths from a machine that no longer exists · Medium
- **Principles:** P8, P12
- **Where:** `src/data/gamesShowcase.ts`
- **Problem:** Every entry carries a `localPath` such as
  `Games/WhirringWilderness-20251113T032854Z-1-001/WhirringWildernessv28-20251114T041104Z-1-001/WhirringWildernessv28`
  — a folder path from a specific machine, including download timestamps. The
  field is described as "relative path in your workspace".
- **Why it matters:** It is data that cannot be true for anyone reading the
  repository, including the author on a different computer. Either it is
  displayed, in which case users see meaningless paths, or it is not, in which
  case it is noise in a file people have to maintain.
- **Fix:** Check whether `/games` renders `localPath`. If not, drop the field.
  If it does, replace it with something meaningful — the source repository URL —
  and say in a comment what it is for.
- **Status:** Open

### [ ] DATA-04 — Two competing `LifeArea` vocabularies · High
- **Principles:** P2
- **Where:** `src/data/life.ts` (`LifeSlug`), `src/lib/models/life.ts` (`LIFE_AREAS`)
- **Problem:** `data/life.ts` defines eight slugs including `work-dcs` and
  `tech-projects`. `lib/models/life.ts` defines nine including `work`, `tech`
  and `inbox`. They describe the same concept with different names and different
  membership.
- **Why it matters:** "What are the life areas?" has two answers. Today only the
  `data/life.ts` set reaches the UI, so nothing is visibly broken — but any
  attempt to wire capture, tagging or the starter pack (all of which use the
  other vocabulary) will silently fail to match, because `work` is not
  `work-dcs`. This is a landmine rather than a live bug.
- **Fix:** Choose one vocabulary. `data/life.ts` is the one users see, so it
  should win; note that it lacks an `inbox` equivalent, which the capture model
  needs as a default bucket. Resolve alongside SCAF-01.
- **Status:** Open

### [ ] DATA-05 — Catalogue contains links to repositories that do not exist · Medium
- **Principles:** P8
- **Where:** `src/data/apps.ts` (entries `research-gems`, and see note)
- **Problem:** The catalogue links to `joshualparris/ResearchGems`, which does
  not exist on GitHub (checked). A related Vercel project points at
  `joshualparris/ResearchAtlas`, which also does not exist.
- **Why it matters:** The catalogue is the app's main index. Dead links there
  make the whole thing feel unreliable, and there is no automatic check.
- **Fix:** `npm run validate:apps` already exists (`scripts/validate-apps.ts`).
  Establish whether it checks reachability, extend it if not, and run it in CI
  (see area 09) so dead links are caught rather than discovered by hand.
- **Status:** Open

### [ ] DATA-06 — `apps.synced.json` is empty and unused by the app · Low
- **Principles:** P6, P9
- **Where:** `src/data/apps.synced.json`, `scripts/sync_apps_from_live.js`
- **Problem:** The file contains `[]`. Only the sync script references it;
  nothing in `src/` imports it.
- **Why it matters:** It looks like a data source the app reads. It is not, so a
  reader has to open the script to discover it is an output artefact.
- **Fix:** Either have the sync flow feed the catalogue properly, or move the
  file out of `src/data` — which is for data the app imports — into a scratch
  location, and gitignore it. Decide with area 10.
- **Status:** Open

### [ ] DATA-07 — `gamesShowcase.ts` uses a different indent style · Low
- **Principles:** P13
- **Where:** `src/data/gamesShowcase.ts`
- **Problem:** Four-space indentation against the codebase's two.
- **Why it matters:** Same as SCAF-09 — noisy diffs, assembled rather than
  written.
- **Fix:** Reformat with the rest when a formatter is adopted (area 08).
- **Status:** Open

### [ ] DATA-08 — A 2,144-line data file with no schema validation · Medium
- **Principles:** P11, P15
- **Where:** `src/data/apps.ts`
- **Problem:** 139 hand-maintained entries typed only by TypeScript's structural
  check. 133 of 139 carry `status: "ok"`, which suggests the field is set by
  default rather than assessed. There is no test asserting invariants such as
  unique ids, a non-empty `primaryUrl`, or a valid status value.
- **Why it matters:** This file drives the dashboard, search and the whole
  catalogue. A malformed entry has already broken the build once — commit
  `2ca6dab` is titled "Fix apps metadata syntax error for grey-realms".
- **Fix:** Add a `apps.test.ts` asserting unique ids, well-formed URLs and valid
  status values. Cheap, and it makes the catalogue safe to edit quickly.
- **Status:** Open
