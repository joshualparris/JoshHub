# 05 — `src/app`

**Area:** the App Router — every page, layout and route-level client component.
**Files:** 50

**Coverage, stated precisely:** 16 files read in full (`page`, `layout`,
`globals.css`, `dashboard`, `capture`, `tasks`, `family`, `calendar`,
`health/page`, `archive`, `settings/backups`, `care/page`, `care/care-client`,
`life/page`, `life/[slug]/page`, `life/[slug]/life-detail-client`), plus
`insights/lifestyle` and `health/sleep` read in part. Every finding below marked
*(all 50)* was verified by search across the whole area, so its file list is
complete. The remaining route files still need a line-by-line read for
file-specific issues — see "Still to read" at the end.

---

## What this area gets right

- Routing is conventional App Router with no surprises; `page.tsx` simply
  redirects to `/dashboard`.
- Most pages are thin: read from a hook, render, call an action. That is the
  right shape (P7).
- `PageHeader` is used by the newer pages and handles both themes properly.
- `archive/page.tsx` is genuinely well built — clear structure, both themes
  handled, and honest about what it excludes.

---

## Findings

### [ ] APP-01 — Local times are stored and compared as if they were UTC · High
- **Principles:** P11, P2
- **Where:** `src/app/calendar/page.tsx:22`, `src/app/dashboard/page.tsx:143`, `src/app/care/care-client.tsx:93` *(all 50 searched)*
- **Problem:** The calendar form writes the raw value of a `datetime-local`
  input straight into `startIso` / `endIso`. That value has no timezone —
  `"2026-09-09T14:30"`. Three screens then filter upcoming events with
  `event.endIso >= new Date().toISOString()`, where the right-hand side is a UTC
  string — `"2026-09-09T04:30:00.000Z"`. The comparison is a plain string
  comparison between a local wall-clock time and a UTC instant.
- **Why it matters:** In Melbourne the local clock runs 10–11 hours ahead of
  UTC, so an event stays in "upcoming" for roughly ten hours after it has
  finished. Past appointments linger in the dashboard's "Up next", the calendar's
  "Next events" and the care lanes' "Next appointment" for most of a day. It also
  means the same field holds two different formats depending on whether the row
  came from the form or from an ICS import (which does produce real UTC).
- **Fix:** Convert on the way in — `new Date(localValue).toISOString()` — so
  `startIso`/`endIso` genuinely hold ISO instants, matching what `schema.ts`
  implies and what the ICS importer already produces. Add a test for the
  "upcoming" filter with a fixed clock. Existing rows written by the form will
  need a one-off migration or will simply age out.
- **Status:** Open

### [ ] APP-02 — Ten route files have no dark styling · High
- **Principles:** P13
- **Where:** *(all 50 searched)* `calendar`, `family`, `health/page`,
  `health/metrics`, `health/movement`, `health/nutrition`, `health/sleep`,
  `notes/[id]`, `routines/[id]`, `settings/calendar`
- **Problem:** These pages use `text-neutral-900` / `text-neutral-600` headings
  and light backgrounds with no `dark:` variants anywhere, while the rest of the
  app has them.
- **Why it matters:** Today it is masked, because COMP-01 means dark styling
  follows the OS rather than the toggle. The moment COMP-01 is fixed, these ten
  pages render dark text on dark cards — the whole health section among them.
  **Fix COMP-01 and APP-02 together, or the theme fix will look like a
  regression.**
- **Fix:** Move these pages onto `PageHeader` (which already handles both
  themes) and add `dark:` variants to their remaining colours.
- **Status:** Open

### [ ] APP-03 — The archive page hardcodes 43 links the catalogue already holds · Medium
- **Principles:** P2
- **Where:** `src/app/archive/page.tsx`
- **Problem:** A literal list of 43 game, doc and panorama links, maintained by
  hand, covering the same builds that `src/data/apps.ts` already describes with
  richer metadata.
- **Why it matters:** Adding a game means editing two places, and nothing keeps
  them in step. The archive list has no status information, so a build marked
  `broken` in the catalogue still looks fine here.
- **Fix:** Derive the archive page from `apps.ts`, filtering to locally hosted
  entries, and keep only genuinely one-off links (portal, panoramas) as
  literals.
- **Status:** Open

### [x] APP-04 — Live query results sorted in place, in four more pages · Medium
- **Principles:** P10
- **Where:** *(all 50 searched)* `health/metrics`, `health/movement`,
  `health/nutrition`, `tasks`
- **Problem:** The same `(x ?? []).sort(...)` mutation fixed on the dashboard in
  `ead6146`, still present in four pages (and in `features/everything-map/db.ts`,
  recorded as FEAT-04).
- **Why it matters:** Dexie shares those arrays between components; sorting in
  place can reorder what another component is rendering.
- **Fix:** `[...(x ?? [])].sort(...)`. Mechanical, and worth doing everywhere in
  one pass with the comment already used on the dashboard.
- **Status:** Fixed — all four pages, plus FEAT-04, each with the explanatory
  comment. `npm run check:mutation` now guards them as a blocking CI gate.

### [ ] APP-05 — The family page is pre-filled with hardcoded personal data · Medium
- **Principles:** P8
- **Where:** `src/app/family/page.tsx`
- **Problem:** Initial state is `"bins,grocery,church"`, `"toothbrush,story,water"`
  and `"bath,bottle,bed"`, with bedtime 19:00 and dinner 17:00. Before anything
  is saved, the form displays these as though they were the stored rhythm; only
  the separate "Today" card reveals whether a real record exists.
- **Why it matters:** Same problem as the dashboard's example figures — the
  screen shows content that is not the user's data without saying so. Someone
  could read the page and believe their rhythm is saved when it is not.
- **Fix:** Start the fields empty with these as `placeholder` text, which is
  what they actually are, and show a clear "nothing saved yet" state.
- **Status:** Open

### [ ] APP-06 — Comma-splitting of tags is reimplemented in at least five places · Medium
- **Principles:** P2, P5
- **Where:** `capture/page.tsx` (three times in one file), `tasks/page.tsx`,
  `family/page.tsx` (three times), `care/care-client.tsx` (`splitTags`)
- **Problem:** `value.split(",").map(t => t.trim()).filter(Boolean)` is written
  out repeatedly rather than shared. `src/lib/logic/tagging.ts` already exports
  `normalizeTag`, which does the trimming and casing properly, and is unused.
- **Why it matters:** The copies differ — none of them lowercases or
  de-duplicates, so `Work`, `work` and `work ` become three different tags, and
  tag filtering silently misses matches.
- **Fix:** One `parseTagList` helper, built on `normalizeTag` from
  `logic/tagging.ts`. This is a concrete piece of the SCAF-01 "wire it up rather
  than delete it" decision.
- **Status:** Open

### [ ] APP-07 — Invalid input is silently ignored · Medium
- **Principles:** P8
- **Where:** `capture/page.tsx` (`onAddBookmark`), `calendar/page.tsx` (`onAdd`)
- **Problem:** Both handlers `return` without saving and without telling the
  user: the bookmark form when the URL does not start with `http`, the calendar
  form when title/start/end are missing.
- **Why it matters:** Pressing "Save link" appears to do nothing. There is no
  message, no field highlight, and the form keeps its contents, so the natural
  reading is that the app is broken.
- **Fix:** Show an inline validation message, or disable the submit button while
  the form is invalid.
- **Status:** Open

### [ ] APP-08 — Four `eslint-disable` directives hide a repeated pattern · Low
- **Principles:** P13
- **Where:** *(all 50 searched)* `family/page.tsx:3`, `notes/[id]/page.tsx:1`,
  `routines/[id]/page.tsx:1` (all `react-hooks/set-state-in-effect`), and
  `routines/page.tsx:178` (`exhaustive-deps`)
- **Problem:** Three files disable the same rule for the same reason —
  copying a loaded record into local form state inside an effect.
- **Why it matters:** Three suppressions of one rule is a signal that the
  pattern needs a shared solution, not that the rule is wrong. `theme-toggle.tsx`
  carries a fourth copy of the directive that suppresses nothing at all
  (COMP-11).
- **Fix:** Extract a small `useRecordForm`-style hook that syncs a loaded record
  into form state once, and use it in all three. Then remove the directives.
- **Status:** Open

### [ ] APP-09 — The layout hardcodes a light-mode text colour on `<body>` · Medium
- **Principles:** P13
- **Where:** `src/app/layout.tsx:49`
- **Problem:** `<body className="… text-neutral-900">` sets near-black text for
  the whole document with no dark variant, and the three decorative blurred
  circles behind the page are light-only pastels.
- **Why it matters:** It is the base colour everything else inherits, so any
  element that does not explicitly override it is dark-on-dark once COMP-01 is
  fixed. Part of the same theme cluster.
- **Fix:** Use the registered token (`text-foreground`) on `<body>` so it follows
  the theme variables, and give the decorative layer dark variants or hide it in
  dark mode.
- **Status:** Open

---

## Still to read

These route files have not had a line-by-line read. The cross-cutting findings
above already cover them; file-specific issues may remain.

`health/import` (603), `projects/inventory-health` (399), `routines` (343),
`studio/studio-client` (265), `insights/lifestyle` (263, partly read),
`notes` (179), `projects` (147), `health/metrics` (147), `health/movement` (145),
`routines/[id]` (129), `health/nutrition` (113), `platform/weekly-review` (112),
`apps/page.client` (109), `notes/[id]` (99), `learn/topics/[topicId]` (84),
`settings/calendar` (81), `games` (78), `learn` (65), `projects/import` (52),
`platform/platform-client` (40), `learn/resources/[resourceId]` (38),
`map/[id]` (25), `map` (19), `apps/[id]` (21), `apps` (15), `panos` (16),
`studio` (10), `platform` (10), `platform/{review,opportunities,moveops,decisions}` (7 each).

`health/import` is the priority of these: it is the largest, it writes to four
tables, and DB-07 (double-counted daily metrics) originates in the flow it
drives.
