# 02 — `src/lib` core helpers

**Area:** the small shared helpers that sit directly under `src/lib`, outside
the database, scaffolding and repository folders.
**Files reviewed:** 9 (all read in full)

```
src/lib/
  analytics/lifestyle.ts   lifestyle metric calculations + markdown report
  appUrlResolver.ts        picks a usable URL for a catalogue app
  date.ts                  todayLocalISO / isSameLocalDayISO
  pins.ts                  pinned life areas, stored in Dexie
  react/ClientOnly.tsx     render children only after hydration
  react/useHydrated.ts     hydration flag via useSyncExternalStore
  recent.ts                recently opened apps, stored in localStorage
  utils.ts                 cn() class-name helper
  utils/ssr.ts             isBrowser / safeWindow
```

## What this area gets right

- `date.ts`, `utils.ts` and `pins.ts` are exactly the right size: one job each,
  obvious names, no surprises (P4, P5).
- `analytics/lifestyle.ts` is well structured — pure functions taking data and
  returning results, with no React or Dexie imports. It is the best example in
  the repo of business logic kept separate from UI (P7). It is also unused; see
  LIB-01.
- `recent.ts` and `utils/ssr.ts` both guard `window` correctly for server
  rendering.

---

## Findings

### [ ] LIB-01 — Lifestyle analytics is unused while a page reimplements it · High
- **Principles:** P2, P7, P9
- **Where:** `src/lib/analytics/lifestyle.ts`, `src/app/insights/lifestyle/page.tsx`
- **Problem:** `computeLifestyleMetrics` has no importers anywhere in the app.
  Meanwhile `insights/lifestyle/page.tsx` computes the same things inline inside
  a `useMemo` — total distance, run filter, longest run, the seven-day window,
  weekly run distance and count — duplicating the module's first 25 lines.
- **Why it matters:** Two implementations of the same numbers will drift, and
  the version users actually see is the one buried in a component where it
  cannot be tested. The richer calculations the module already offers
  (speed/distance correlation, flow-state windows, blind spots, the markdown
  report) are written, paid for, and invisible.
- **Fix:** Have the page call `computeLifestyleMetrics` and delete the inline
  maths. This is the "keep the code, wire it up" case — the module is the better
  home and already has the wider feature set.
- **Status:** Open

### [ ] LIB-02 — The hydration helpers are unused, and hydration bugs exist · Medium
- **Principles:** P9, P13
- **Where:** `src/lib/react/ClientOnly.tsx`, `src/lib/react/useHydrated.ts`, `src/lib/utils/ssr.ts`
- **Problem:** None of these three has a single importer. They were added
  specifically to fix hydration mismatches — `docs/CODEX_HANDOFF_PROMPT16_FOUNDATION.md`
  contains a "Hydration mismatch (React error #418)" playbook telling the reader
  to use them. A real hydration bug of exactly that kind was found and fixed on
  the dashboard in `ead6146` without touching them, because nothing in the
  codebase pointed to them.
- **Why it matters:** A newcomer hitting a hydration error will either not find
  these, or find them and assume they are already the established pattern when
  nothing uses them. Either way the codebase has a documented solution that is
  not actually in use (P9's "developers assume it works").
- **Fix:** Decide one way. Either adopt `useHydrated`/`ClientOnly` as *the*
  pattern for client-only content and use them on the dashboard's Recent
  activity card and anywhere else reading `localStorage`, or remove them and
  update the handoff doc. Adopting them is the better fit for the standing
  keep-the-code preference, and would make the dashboard fix more declarative.
- **Status:** Open

### [ ] LIB-03 — `utils.ts` and `utils/` exist side by side · Medium
- **Principles:** P13, P3
- **Where:** `src/lib/utils.ts`, `src/lib/utils/ssr.ts`
- **Problem:** There is both a file `src/lib/utils.ts` (exporting `cn`) and a
  directory `src/lib/utils/` (containing `ssr.ts`). `@/lib/utils` resolves to
  the file; `@/lib/utils/ssr` resolves into the directory.
- **Why it matters:** It reads like a mistake, and it is a trap — anyone adding
  `src/lib/utils/index.ts` would silently change what every existing
  `@/lib/utils` import resolves to, breaking `cn` across ~10 files.
- **Fix:** Pick one shape. Simplest is to move `cn` to `src/lib/utils/cn.ts` and
  `ssr.ts` beside it, or move `ssr.ts` up to `src/lib/ssr.ts` and keep
  `utils.ts` a plain file. Either removes the ambiguity.
- **Status:** Open

### [ ] LIB-04 — Two date modules with overlapping jobs · Medium
- **Principles:** P2
- **Where:** `src/lib/date.ts` (used), `src/lib/logic/date.ts` (unused, area 03)
- **Problem:** `lib/date.ts` exports `todayLocalISO` / `isSameLocalDayISO` and
  is used by the dashboard and tasks page. `lib/logic/date.ts` exports
  `dateKeyLocal` / `isSameLocalDay` / `isOverdue` — the same local-date-key idea
  written a second time, with no importers.
- **Why it matters:** Date handling is exactly where inconsistency causes bugs
  that only appear near midnight or across timezones. Two implementations means
  two behaviours, and `isOverdue` — genuinely useful for tasks — is stranded in
  the unused one.
- **Fix:** Keep `src/lib/date.ts` as the single date module and move `isOverdue`
  into it. Cross-referenced as SCAF-02.
- **Status:** Open

### [ ] LIB-05 — App URL check downloads the whole file to test existence · Medium
- **Principles:** P5, P12
- **Where:** `src/lib/appUrlResolver.ts` (`exists`)
- **Problem:** `exists()` issues `fetch(url, { method: "GET", cache: "no-store" })`
  purely to see whether a URL responds. For the local game builds this resolver
  checks, that downloads entire bundles — some several megabytes — and
  `no-store` prevents any reuse.
- **Why it matters:** Opening the apps catalogue can pull megabytes of game
  bundles that are immediately discarded, on every check.
- **Fix:** Use `method: "HEAD"`. These are same-origin requests, so HEAD is
  reliable here. Keep the GET fallback only if a server is found that rejects
  HEAD, and say so in a comment.
- **Status:** Open

### [ ] LIB-06 — Real calculations with no tests · Medium
- **Principles:** P15
- **Where:** `src/lib/analytics/lifestyle.ts`
- **Problem:** This file computes a Pearson correlation, sliding four-hour
  windows and "blind spot" thresholds, and has no tests. It is pure and takes
  plain arrays, so it is the easiest thing in the repo to test.
- **Why it matters:** P15 names calculations specifically. A silent arithmetic
  error here produces confident, wrong numbers on a page the user trusts.
- **Fix:** Add `lifestyle.test.ts` covering the correlation against a known
  dataset, the fewer-than-four-points null case, the zero-variance guard, and
  the blind-spot threshold boundaries. Do this as part of LIB-01 so the module
  is tested at the point it starts being used.
- **Status:** Open

### [ ] LIB-07 — `loadRecent()` returns different data on server and client · Medium
- **Principles:** P12, P6
- **Where:** `src/lib/recent.ts`
- **Problem:** `loadRecent()` returns `[]` during server rendering and the real
  list in the browser. That is correct and necessary, but nothing in the file
  says so, and the obvious way to use it — seeding `useState` — causes a
  hydration mismatch. The dashboard did exactly that until `ead6146`.
- **Why it matters:** The function is a trap that has already caught someone.
  The next caller will make the same mistake for the same reason.
- **Fix:** Add a comment on `loadRecent` stating it must be called after mount,
  never during render, and pointing at `useHydrated`/`ClientOnly` once LIB-02 is
  settled.
- **Status:** Open

### [ ] LIB-08 — Blind-spot and flow-state scans are quadratic · Low
- **Principles:** P5
- **Where:** `src/lib/analytics/lifestyle.ts` (`computeBlindSpots`, `computeFlowStateWindows`)
- **Problem:** Both filter the full `digitalEvents` array once per day or per
  run, so cost grows with days × events.
- **Why it matters:** Nothing today — these datasets are small. It would begin
  to matter after a large Google Takeout import, which is a supported path.
- **Fix:** Group `digitalEvents` by date once into a `Map`, then look up per
  day. Worth doing when LIB-06 adds tests, not before.
- **Status:** Open
