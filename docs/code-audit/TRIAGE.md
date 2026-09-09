# Triage — what to fix, in what order

The audit found **93 findings** — 5 now fixed, 88 open
(1 Critical, 18 High, 46 Medium, 23 Low) across 15 areas plus a cross-cutting
sweep. This is the order to fix them in,
ranked by blast radius: how many other things an issue breaks, how much damage it
does to the principles, and how much other work depends on it being right.

Read this file, not the reports, when deciding what to do next. Each item links
to the finding that explains it.

**Rule of thumb used for ordering:** anything that destroys data comes first,
then anything that prevents you from *noticing* breakage, then single causes with
app-wide effects, then everything else.

---

## Wave 0 — Done

| ID | What | Commit |
|----|------|--------|
| [x] DB-01 | Backup omitted 19 of 26 tables | `e94e809` |
| [x] DB-02 | Restoring a backup destroyed Platform data | `e94e809` |
| [x] DB-03 | "Reset all data" left tables behind | `e94e809` |
| [x] — | 147-file `ms`→`care2` corruption; build restored | `3c0bf78` |
| [x] — | Dashboard example figures labelled; mutation and hydration fixed | `ead6146` |

---

## Wave 1 — Stop flying blind

### 1. CFG-01 — Add CI · Critical · ✅ Fixed in `081a7d9`

Baseline CI now runs on pushes to `main` and pull requests. It installs with
`npm ci`, lints, runs terminating tests, builds production, and validates the app
catalogue. The first run (`34337559585`) passed every step.

`node scripts/check-assets.js` is deliberately not a gate yet because the audit
already records known broken catalogue/assets and CFG-06; wire it in when those
known failures are resolved rather than making baseline CI permanently red.

### 2. CFG-02 — `npm test` must not hang · High · ✅ Fixed in `8b741f5`

`npm test` is now `vitest run`. Intentional local watch mode remains available as
`npm run test:watch`. The new `npm test` completed successfully in the first CI
run.

### 2b. Add the remaining enforcement · High · **NEXT**

These changes close principles *mechanically* rather than one finding at a time.
See `CONFORMANCE.md` for detail.

- **Prettier** + `prettier --check` in CI — retires most of P13 and part of P4
  permanently. Highest leverage remaining item in Wave 1.
- **`eslint-plugin-import` `no-restricted-paths`** — enforce the layer hierarchy
  defined in `CONFORMANCE.md` (P14) **after** XC-03 removes the existing
  `components` ↔ `features` cycle; do not add a permanently failing rule.
- **Two precise CI checks** — the P10 in-place-mutation check and the P2
  duplicate-basename check. Both should be deterministic gates, not hand-wavy
  review prompts.
- **`react-hooks/set-state-in-effect` back on as a warning**, once APP-08 lands.

**Wave 1 baseline is now green.** The remaining work is prevention/enforcement,
not basic visibility.

---

## Wave 2 — The theming system

Three findings, one root cause, ~620 affected declarations. Fix them **together
and in this order** — fixing COMP-01 alone will look like a regression, because
dark styles will apply properly for the first time and reveal everything that was
never written.

### 3. COMP-01 — The theme toggle drives no `dark:` styling · Critical
Tailwind v4 with no `@custom-variant dark` declared, so all **504** `dark:`
utilities follow the OS instead of the toggle. One line in `globals.css`.

### 4. COMP-02 — 110 colour classes reference unregistered tokens · High
`bg-card`, `text-muted-foreground`, `bg-muted`, `border-border`, `ring-ring`
generate no CSS because `@theme inline` only registers two colours. Six lines.

### 5. COMP-03 + APP-02 + APP-09 — The styling that was never written · High
`Button` and `Separator` have no dark variants; ten route files have none at all;
`<body>` hardcodes a light text colour. These only become visible once 3 and 4
land, which is exactly why they must be scheduled with them.

Together these explain a long tail of "contrast polish" commits that were
treating symptoms — `dd528dc`, `96f96be`, and tasks 1–2 in `docs/tasks.md`.

---

## Wave 3 — Things that are wrong right now

Real defects a user can hit today, ordered by how likely they are to be noticed.

### 6. FEAT-01 — A third backup system · High
`everything-map/db.ts` has its own notes export/import, incompatible with the one
just fixed. Fragmented backup is the failure this project has already been bitten
by twice.

### 7. APP-01 — Local times stored and compared as UTC · High
Finished events stay in "Up next", the calendar and the care lanes for ~10 hours
in Melbourne time. Affects three screens.

### 8. SCR-01 / PUB-02 — Twelve catalogue links are 404s · High
The script that detects them already exists and has never been run. Fixed
permanently by wave 1 once it is safe to make that check a required gate.

### 9. DB-07 — Re-importing an activity double-counts daily metrics · Medium
Weekly distance and run totals drift wrong with no way to tell from the UI.

### 10. SCAF-03 — A persistence adapter that persists nothing · High
`lifeContentRepoDexie` probes for a table that does not exist and silently falls
back to an in-memory `Map`. Unused today, so no data has been lost — fix it
before anyone wires it up, not after.

### 11. COMP-05 + COMP-06 + APP-07 — UI that lies or silently fails · Medium
An "Export Merged JSON" button with no handler; a CSV parser that misaligns
quoted fields; two forms that discard invalid input without a word to the user.

### 12. APP-05 — The family page ships pre-filled personal data · Medium
Same class as the dashboard example figures, already fixed: the screen shows
content that is not the user's data without saying so.

---

## Wave 4 — One concept, one source of truth

The duplication that makes the codebase hard to reason about. Lower urgency, high
long-term value — and doing it after wave 2 avoids merge pain.

### 13. SCAF-01 — Settle the ~690 lines of unwired scaffolding · High
The biggest obstacle to understanding the repo: two complete data models with
nothing saying which is real. **Note for whoever does this:** the assumption that
`/capture` reimplements `autoSort` was checked and is *false* — the capture page
is three manual forms, so wiring `autoSort` in would be a new feature, not
deduplication. The genuine wins are `logic/tagging.ts` (APP-06) and `isOverdue`
(LIB-04).

### 14. DATA-04 — Two `LifeArea` vocabularies · High
`work-dcs`/`tech-projects` versus `work`/`tech`/`inbox`. Harmless only because
one is unused; a landmine the moment anything is wired up. Settle with item 13.

### 15. LIB-01 — Lifestyle analytics unused while a page reimplements it · High
Wire the page to the module, then add the tests (LIB-06) at the same time.

### 16. DB-04 — Two CRUD APIs for the Platform tables · High
Make the repos canonical; move `createWeeklyReview`'s defaults into
`weeklyReviewsRepo.add`.

### 17. APP-06 + FEAT-02 + FEAT-03 — Smaller duplications · Medium
Tag-splitting written out five times; two pinning systems with different storage
(only one of which is backed up); `useNotes` defined twice.

### 18. APP-03 — Archive page hardcodes 43 catalogue links · Medium

---

## Wave 5 — Weight and hygiene

### 19. PUB-01 — Remove the 31 MB committed Android build tree · High
548 files, over half the repository's file count. Build output, not code.

### 20. CFG-03 — Submodule gitlinks with no `.gitmodules` · High
Three dangling pointers, one registered twice; a fresh clone gets empty folders
that cannot be populated.

### 21. DATA-01 + CFG-06 + CFG-07 — Committed `.bak`, gaps in `.gitignore`, two task backlogs

### 22. PUB-04 — Duplicate game builds under two slugs each

---

## Wave 5b — The structural work the first pass missed

From the cross-cutting sweep (report 16). Lower urgency than live defects, but
this is where "conforms to the principles" is actually won or lost — and none of
it is findable by search, so it will not surface on its own.

### 23. XC-05 — Test the seven untested critical paths · High
2 test files for 132 source files. ICS parsing, daily-metrics roll-up, CSV
import, catalogue invariants, lifestyle analytics, tag parsing, date helpers —
and three of those already have confirmed defects recorded elsewhere. **Do not
run this as a campaign:** add the test with the fix, each time.

### 24. XC-02 — Move calculations out of seven screens · High
Unit conversion, aggregation and threshold logic sit inside `useMemo` in
components, which is *why* P15 is at two test files — the logic worth testing is
stranded in JSX. Fixing this makes XC-05 and XC-01 easier at the same time.

### 25. XC-03 — Break the `components` ↔ `features` cycle · Medium
`CONFORMANCE.md` now defines the hierarchy (`app → features → components → lib →
data`) for the first time. Move `components/platform/*` into
`features/platform/`, where its data already lives, then turn on
`no-restricted-paths`.

### 26. XC-01 — Shrink the 27 functions over 100 lines · High
`DashboardPage` is 727 lines. Take these opportunistically — whenever you touch
one, extract its calculations (item 24) and its repeated markup. Not a sweep.

### 27. XC-04 — Comment the constraints, not the code · Medium
89 of 134 files have no comments; the ones that exist mostly restate the code.
Rule: every fix in this audit leaves behind a comment naming the constraint that
made it a bug.

---

## Wave 6 — Consistency and polish

Do these as a single sweep once the above has settled, ideally with a formatter
so they stay fixed.

- **APP-04 + FEAT-04** — in-place `.sort()` on live-query results, five remaining files
- **COMP-07 + FEAT-05** — `localStorage` read during render, two remaining places
- **LIB-02** — adopt or remove the unused hydration helpers, and settle the pattern
- **COMP-08 + SCAF-09 + DATA-07** — mixed export style and indentation; adopt Prettier
- **CFG-05 + COMP-11 + SCAF-10** — clear all ten standing lint warnings so new ones stand out
- **LIB-03** — `utils.ts` file beside a `utils/` directory
- **LIB-05** — `HEAD` instead of `GET` for URL existence checks
- **DOC-01 + DOC-02 + DOC-03 + GH-01** — move transcripts to `docs/history/`, explain local-first storage in the README, index `docs/`, refresh the Copilot instructions

`GH-01` is partially addressed by the 9 September agent-protocol update to
`.github/copilot-instructions.md`; reconcile its finding/status when that report
is next edited rather than silently assuming the rest of GH-01 is complete.

---

## Deliberately not doing

- **Reading every one of the 776 files in `public/`.** They are compiled bundles;
  policy-level findings are recorded instead.
- **Deleting the unwired scaffolding outright.** The standing preference is to
  keep code and make it make sense. Item 13 wires up what is useful and clarifies
  the rest; only genuinely misleading duplicates get removed.

---

## Does finishing this list mean the repo conforms?

**No.** Working through every item above is necessary but not sufficient, for
three reasons, all set out in `CONFORMANCE.md`:

1. The audit is not finished — 30 route files and 6 components have never been
   read line by line, so more findings exist.
2. Fixing a finding does not stop it recurring. Wave 1 has now added baseline CI,
   but the remaining mechanical enforcement still matters.
3. Several items are decisions rather than edits (SCAF-01, DATA-04), and two
   fixes will *generate* findings — COMP-01 exposes ten unstyled pages, and
   wiring up dead scaffolding exposes whatever is wrong inside it.

`CONFORMANCE.md` holds the scorecard. Baseline CI is now real, but the repository
is still far from full conformance.

## Still to read

Report 05 lists 30 route files not yet read line by line. The cross-cutting
findings cover them, but file-specific issues may remain.
`src/app/health/import/page.tsx` (603 lines) is the priority: it is the largest
file in the area, writes to four tables, and is the origin of DB-07.
Report 06 lists six components in the same position.
