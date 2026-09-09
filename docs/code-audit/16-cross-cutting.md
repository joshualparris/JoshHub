# 16 — Cross-cutting: the principles the first pass under-audited

**Area:** not a folder — a sweep across the whole of `src/` for the five
principles the area-by-area reading missed.

## Why this report exists

Counting how many findings cited each principle exposed a clear bias in the
first pass:

| Principle | Findings citing it |
|---|---|
| P13 consistent structure | 28 |
| P2 one source of truth | 26 |
| P9 delete dead code | 13 |
| P6 explicit data flow | 10 |
| P11 invariants | 10 |
| P12 comments explain why | 10 |
| P8 no fake-as-live | 9 |
| P3 related things together | 7 |
| P15 tests protect behaviour | 7 |
| P4 boring obvious names | 6 |
| P1 understand before changing | 4 |
| **P5 small functions** | **4** |
| **P7 UI vs business logic** | **3** |
| **P10 don't mutate** | **2** |
| **P14 directional dependencies** | **1** |

Duplication and inconsistency are findable with a search. Size, layering and
comment quality are not — so they went unmeasured, not unbroken. This report
measures them.

Every number below is reproducible; the command is given with the finding.

---

## Findings

### [ ] XC-01 — 27 functions are over 100 lines; the largest is 727 · High
- **Principles:** P5, P7
- **Where:** *(all of `src/`)*
- **Problem:** Of 299 top-level functions and components, **45 exceed 60 lines
  and 27 exceed 100**. The worst:

  | Lines | Function | File |
  |---|---|---|
  | 727 | `DashboardPage` | `app/dashboard/page.tsx` |
  | 353 | `InventoryHealthPage` | `app/projects/inventory-health/page.tsx` |
  | 316 | `HealthImportPage` | `app/health/import/page.tsx` |
  | 293 | `seedPlatformData` | `lib/repos/dexie/platform/seed.ts` |
  | 287 | `RoutineCard` | `app/routines/page.tsx` |
  | 263 | `SectionDetails` | `features/everything-map/map-client.tsx` |
  | 232 | `LifestyleReportPage` | `app/insights/lifestyle/page.tsx` |

- **Why it matters:** `DashboardPage` is a single 727-line function holding
  eleven hooks, nine `useMemo` blocks, two hardcoded card arrays and the entire
  page markup. It cannot be tested, reviewed in one screen, or changed in one
  place — every one of my own dashboard fixes (mutation, hydration, example
  labelling) had to be threaded through it separately. Size is why P5 exists.
- **Fix:** Not a single sweep. Take them opportunistically: whenever you touch
  one of these, extract the calculations into a tested pure function (XC-02) and
  the repeated markup into a component. `DashboardPage` first, since it is both
  the largest and the most frequently edited.
- **Verify:** the script in `CONFORMANCE.md` under P5.
- **Status:** Open

### [ ] XC-02 — Seven screens compute their own business logic inline · High
- **Principles:** P7, P2, P15
- **Where:** `app/dashboard`, `app/care/care-client`, `app/health/import`,
  `app/health/sleep`, `app/insights/lifestyle`, `app/projects/inventory-health`,
  `app/routines`
- **Problem:** Each contains arithmetic — `reduce`, unit conversion, `toFixed`,
  threshold logic — inside `useMemo` in the component body. `insights/lifestyle`
  is the clearest case: it recomputes totals that `lib/analytics/lifestyle.ts`
  already provides and which nothing imports (LIB-01).
- **Why it matters:** A component should answer "what appears on screen". These
  answer "what is a seven-day average", "how many kilometres is this", "is this
  day a sedentary trap" — and because the answers live inside components, none
  of them can be tested. That is why P15 is at 2 test files: the logic worth
  testing is stranded in JSX.
- **Fix:** For each screen, move the calculation into a pure module beside the
  data it uses and give it a test. This is the concrete mechanism by which both
  P7 and P15 improve, and it makes XC-01 shrink as a side effect.
- **Verify:** the script in `CONFORMANCE.md` under P7.
- **Status:** Open

### [x] XC-03 — `components` and `features` import each other · Medium
- **Principles:** P14, P3
- **Where:** `src/components` ↔ `src/features`
- **Problem:** The layer graph is clean in every direction except one:

  ```
  app        → components  103    components → lib       16
  app        → lib/db       47    components → data      13
  app        → data         15    components → features   8   ←┐ cycle
  app        → features      9    features   → components  6   ←┘
  app        → lib           7    lib        → lib/db      4
  ```

  `components/platform/*` imports from `features/platform`, while
  `features/apps/contextPills` and `features/everything-map/map-client` import
  from `components/ui`. Neither layer sits above the other.
- **Why it matters:** P14 asks for one direction, but this repo has never
  written down what its layers are — so "is this a violation?" is currently
  unanswerable, which is worse than a violation. It is also why `src/features`
  means three different things (FEAT-07).
- **Fix:** Write the hierarchy down in `CONFORMANCE.md` (`app → features → components → lib → data`, with `components` as presentation-only), move `components/platform/*` into `features/platform/ui/`, and enforce `import/no-restricted-paths` as an error in `eslint.config.mjs`.
- **Verify:** `npm run lint` and CI.
- **Status:** Fixed

### [ ] XC-04 — Two-thirds of source files carry no comments at all · Medium
- **Principles:** P12
- **Where:** *(all of `src/`)*
- **Problem:** **89 of 134** source files contain no comment of any kind.
  Overall density is **308 comment lines in 15,209** — 2%. Of the comments that
  do exist, a large share restate the code rather than explain it:
  `// Try exact name match`, `// Check for conflicts`, `// Simple CSV parser`,
  `// Sort by weekStart descending`.
- **Why it matters:** The non-obvious things in this repo are entirely
  undocumented — that `endIso` sometimes holds local time and sometimes UTC
  (APP-01), that `lifeContentRepoDexie` never persists (SCAF-03), that
  `loadRecent` must not be called during render (LIB-07). Each of those cost
  real time to rediscover during this audit. Meanwhile the comments that exist
  explain `.sort()`.
- **Fix:** Do not run a commenting pass — that produces more `// Sort notes`.
  Instead: every time a finding in this audit is fixed, leave a comment stating
  the constraint that made it a bug. The backup module and the dashboard fixes
  are the model.
- **Verify:** the script in `CONFORMANCE.md` under P12.
- **Status:** Open

### [ ] XC-05 — Seven of nine critical paths have no tests · High
- **Principles:** P15, P11
- **Where:** *(all of `src/`)*
- **Problem:** **2 test files for 132 source files.** By critical path:

  | Path | Tested |
  |---|---|
  | Backup / restore round-trip | ✅ `backup.test.ts` |
  | Everything-map tree building | ✅ `tree.test.ts` |
  | ICS parsing | ❌ |
  | Daily metrics roll-up | ❌ (and DB-07 says it is wrong) |
  | CSV import | ❌ (and COMP-06 says it is wrong) |
  | App catalogue invariants | ❌ (validator exists, never run — CFG-01) |
  | Lifestyle analytics | ❌ |
  | Tag parsing | ❌ |
  | Date helpers | ❌ |

- **Why it matters:** P15 names exactly these categories — calculations, data
  transformations, backups, migrations. Three of the untested paths already have
  confirmed defects recorded elsewhere in this audit. The tests would not merely
  guard behaviour; they would have found the bugs.
- **Fix:** Add a test with each fix rather than as a separate campaign — DB-07
  with the metrics fix, COMP-06 with the CSV fix, LIB-06 with the analytics
  wiring, APP-01 with the timezone fix. Target stated in `CONFORMANCE.md`.
- **Verify:** the script in `CONFORMANCE.md` under P15.
- **Status:** Open

### [ ] XC-06 — Four file-naming conventions, and three duplicated module names · Low
- **Principles:** P4, P13
- **Where:** *(all of `src/`)*
- **Problem:** Excluding Next.js's required `page`/`layout`, file names split
  across four conventions: 40 lowercase, 24 kebab-case, 21 camelCase, 6
  PascalCase. Client components are named five different ways —
  `care-client.tsx`, `map-client.tsx`, `studio-client.tsx`,
  `life-detail-client.tsx` and `page.client.tsx`. Three module basenames exist
  twice in different folders: `date.ts`, `events.ts`, `life.ts` — and all three
  are the duplicate-source-of-truth findings already recorded (LIB-04, DATA-02,
  DATA-04).
- **Why it matters:** Mostly cosmetic, except the duplicated basenames: an
  editor's "go to file" offers two `life.ts` with no way to tell which is the
  live one, which is precisely how a wrong import happens.
- **Fix:** Adopt kebab-case for modules and PascalCase for components, settle on
  `*-client.tsx`, and let the P2 fixes remove the duplicate basenames naturally.
- **Status:** Open

### [ ] XC-08 — 50 bindings named `d`, `t`, `data` or similar · Medium
- **Principles:** P4
- **Where:** *(all of `src/`)*
- **Problem:** 50 variable declarations use a single letter or a placeholder
  word: `s`(5), `q`(5), `t`(4), `r`(4), `m`(4), `data`(4), `d`(4), plus `val`,
  `item`, `obj` and others. These are declarations, not callback parameters —
  `arr.map(x => …)` is fine and is excluded from the count.
- **Why it matters:** This finding only exists because the P4 definition was
  wrong until now: it checked *filenames*, so the repo could have scored full
  marks on "boring, obvious names" while every local variable was called `d`.
  The cost is concentrated in the longest functions (XC-01), which is exactly
  where a reader most needs the names to carry meaning.
- **Fix:** Rename opportunistically when touching a function, not in a sweep — a
  bulk rename would be a large blind diff, which is how this repo acquired the
  `ms`→`care2` damage in the first place.
- **Verify:** the identifier script in `CONFORMANCE.md` under P4.
- **Status:** Open

### [ ] XC-09 — No referential integrity is checked anywhere · Medium
- **Principles:** P11, P6
- **Where:** `src/lib/db/schema.ts` — 9 reference fields across 6 relationships
- **Problem:** The schema has foreign-key-shaped fields — `Note.lifeAreaSlug`,
  `Note.nodeId`, `Task.projectId`, `RoutineRun.routineId`,
  `LearnResource.topicIds[]`, `LearnNote/Session.topicId` and `.resourceId`,
  `Pin.id` — and nothing validates any of them. IndexedDB has no foreign keys, so
  the guarantee has to be written by hand, and it never was.
- **Why it matters:** Deleting a routine leaves its runs pointing at nothing;
  deleting a Learn topic orphans its notes and sessions. More immediately,
  DATA-04 proposes renaming the life-area vocabulary — which would silently
  orphan every note carrying an old `lifeAreaSlug`, with no error and no way to
  notice.
- **Why it was missed:** the P11 invariant list was written from memory rather
  than derived from the schema. `CONFORMANCE.md` now records the derivation
  method so the list can be regenerated instead of recalled.
- **Fix:** Before DATA-04 renames anything, add a test asserting every stored
  `lifeAreaSlug` resolves. Then delete-cascade or null-out the rest — routine
  runs when a routine goes, Learn notes when a topic goes.
- **Status:** Open

### [ ] XC-07 — Nothing prevents any of these from recurring · High
- **Principles:** P11, P13, P15
- **Where:** repository-wide
- **Problem:** Even with CI (CFG-01) running build, lint and tests, **no
  principle in this list is mechanically enforced.** Nothing stops a fourth
  backup system, another set of invented figures on a dashboard, another
  in-place `sort` on a live query, or another 700-line component.
- **Why it matters:** This repository has already re-learned the same lessons
  repeatedly — three backup systems, three localStorage-during-render bugs, five
  copies of tag-splitting, ten "fix contrast" commits. Fixing 83 findings
  without adding enforcement means doing this audit again in a year.
- **Fix:** Add enforcement alongside the fixes, cheapest first:
  1. `eslint-plugin-import` with `no-restricted-paths` to enforce the layering
     from XC-03 — turns P14 into a build failure.
  2. A custom lint rule or a test asserting that `BACKUP_TABLES` matches the
     Dexie schema — this one already exists, and is the model to copy.
  3. Re-enable `react-hooks/set-state-in-effect` as a warning once APP-08 is
     fixed, to catch the hydration pattern.
  4. A test asserting no component file exceeds an agreed line count (XC-01).
  Full list and status in `CONFORMANCE.md`.
- **Status:** Open
