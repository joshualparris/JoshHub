# Triage — what to fix, in what order

The audit found **86 findings across 15 areas** — 3 already fixed, 83 open
(2 Critical, 15 High, 44 Medium, 22 Low). This is the order to fix them in,
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

Nothing else is safe to change until breakage becomes visible. Do these first
even though neither is glamorous.

### 1. CFG-01 — Add CI · Critical
The single highest-value change in the repository. Production deploys failed
continuously from June until `3c0bf78` — dozens of commits — because nothing ran
`next build`. Every other fix below is easier to keep fixed once CI exists.
Run on push: `lint`, `vitest run`, `build`, `validate:apps`, `check-assets`.

### 2. CFG-02 — `npm test` must not hang · High
`"test": "vitest"` starts watch mode and never exits, which blocks item 1 from
being done properly. One-word fix; do it as part of the same commit.

**After wave 1 you will find out what else is broken.** Expect surprises.

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
permanently by wave 1.

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

---

## Deliberately not doing

- **Reading every one of the 776 files in `public/`.** They are compiled bundles;
  policy-level findings are recorded instead.
- **Deleting the unwired scaffolding outright.** The standing preference is to
  keep code and make it make sense. Item 13 wires up what is useful and clarifies
  the rest; only genuinely misleading duplicates get removed.

---

## Still to read

Report 05 lists 30 route files not yet read line by line. The cross-cutting
findings cover them, but file-specific issues may remain.
`src/app/health/import/page.tsx` (603 lines) is the priority: it is the largest
file in the area, writes to four tables, and is the origin of DB-07.
Report 06 lists six components in the same position.
