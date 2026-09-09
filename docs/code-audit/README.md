# JoshHub Code Audit

A file-by-file review of this repository against an agreed set of engineering
principles. Every area of the repo gets one report. Each report lists findings,
and each finding is a checkbox — so once something is fixed you tick it off and
the audit turns into a completed to-do list rather than a document nobody reads.

**This audit is about the source code.** It is not about which apps and games
are worth keeping — that is `docs/IMPROVEMENTS.md` — and not about which
projects to prioritise, which is `document.md`.

---

## How to use this

1. Pick a report from the coverage table below that is still `Not started`.
2. Read every file in that area before writing anything down. The point is to
   understand the area, not to skim for smells.
3. Record findings using the format shown further down.
4. When a finding is fixed, change `[ ]` to `[x]` and add the commit hash.
5. Update this file's coverage table and the rollup.

The rule that matters most: **a finding is only worth writing down if the next
person could act on it without asking you what you meant.** Say where it is,
what is wrong, why it matters, and what to do.

---

## The principles

Reports cite these by number, e.g. `P2, P11`.

| # | Principle | In short |
|---|-----------|----------|
| P1 | Understand before changing | Read the surrounding system. No sweeping find-and-replace unless every match is proven equivalent. |
| P2 | One concept → one source of truth | One `LifeArea`, one backup system, one canonical model. |
| P3 | Keep related things together | A module has one clear responsibility. |
| P4 | Prefer boring, obvious names | `exportUserData()`, not `handleData()`. |
| P5 | Keep functions small and single-purpose | One meaningful thing per function. |
| P6 | Make data flow explicit | IndexedDB → repository → domain logic → hook → component. |
| P7 | Separate UI from business logic | A component answers "what appears on screen". |
| P8 | Never pretend static data is live data | Calculate it, or label it as an example. |
| P9 | Delete dead code | Dead architecture is worse than none — people assume it works. |
| P10 | Don't mutate unless mutation is intended | Copy before sorting query results. |
| P11 | Protect important operations with invariants | State the invariant, then test exactly it. |
| P12 | Comments explain WHY, not WHAT | The code already says what. |
| P13 | Consistent structure beats cleverness | Same conventions everywhere. |
| P14 | Keep dependencies directional | UI → features → domain → persistence. |
| P15 | Tests protect behaviour, not implementation | Backups, migrations, calculations, key flows. |

> Above all: **never optimise for making the diff before understanding the
> system.** A clean 300-file automated edit can be far worse than an ugly
> five-line fix if nobody understands what those files mean.

On P9 specifically: in this repo the standing preference is to **keep code and
make it make sense** rather than delete large chunks. Prefer wiring something up
or documenting clearly why it exists. Delete only when leaving it would actively
mislead — for example a second, broken copy of something that already works
elsewhere.

---

## Finding format

```md
### [ ] DB-04 — Two parallel CRUD APIs for the Platform tables · High
- **Principles:** P2, P13
- **Where:** `src/lib/db/platform.ts`, `src/lib/repos/dexie/platform/*.ts`
- **Problem:** One sentence on what is actually wrong.
- **Why it matters:** The consequence for a real person using the app.
- **Fix:** The concrete change to make.
- **Status:** Open
```

**IDs** are `<AREA>-<NN>` and never change or get reused, so a finding can be
referenced from a commit message or an issue.

**Severity**

| Severity | Meaning |
|----------|---------|
| Critical | Can lose or corrupt data that exists nowhere else, or is a security hole. |
| High | Wrong behaviour, or the screen tells the user something untrue. |
| Medium | Correct today, but genuinely hard to understand or easy to break next time. |
| Low | Polish, naming, tidiness. |

**Status:** `Open` → `Fixed in <commit>` (tick the box), or `Won't fix — <reason>`.

---

## Coverage

948 tracked files. Every one belongs to exactly one area below.

| # | Area | Files | Report | Status |
|---|------|-------|--------|--------|
| 01 | `src/lib/db` — persistence, schema, backup | 11 | [01-src-lib-db.md](01-src-lib-db.md) | ✅ Audited |
| 02 | `src/lib` core — recent, pins, date, utils, analytics, react | 9 | [02-src-lib-core.md](02-src-lib-core.md) | ✅ Audited |
| 03 | `src/lib` scaffolding — models, logic, seed, repos | 21 | [03-src-lib-scaffolding.md](03-src-lib-scaffolding.md) | ✅ Audited |
| 04 | `src/data` — apps catalogue, life areas, events | 6 | [04-src-data.md](04-src-data.md) | ✅ Audited |
| 05 | `src/app` — routes and pages | 50 | [05-src-app.md](05-src-app.md) | ◐ Cross-cutting complete; 30 files await a line-by-line read |
| 06 | `src/components` — shared UI | 32 | [06-src-components.md](06-src-components.md) | ◐ Cross-cutting complete; 6 files await a line-by-line read |
| 07 | `src/features` — everything-map, apps, platform | 9 | [07-src-features.md](07-src-features.md) | ✅ Audited |
| 08 | Root config — package.json, tsconfig, next.config, eslint | 15 | [08-root-config.md](08-root-config.md) | ✅ Audited |
| 09 | `.github` — workflows and Copilot instructions | 1 | [09-11-tooling-and-docs.md](09-11-tooling-and-docs.md) | ✅ Audited |
| 10 | `scripts` — inventory and sync scripts | 6 | [09-11-tooling-and-docs.md](09-11-tooling-and-docs.md) | ✅ Audited |
| 11 | `docs` — project documentation | 12 | [09-11-tooling-and-docs.md](09-11-tooling-and-docs.md) | ✅ Audited |
| 12 | `public/games` — hosted game builds (excl. josh-nfc-audio) | 161 | [12-15-public-and-submodules.md](12-15-public-and-submodules.md) | ✅ Audited (policy level) |
| 13 | `public/games/josh-nfc-audio` — includes a committed Android build tree | 569 | [12-15-public-and-submodules.md](12-15-public-and-submodules.md) | ✅ Audited (policy level) |
| 14 | `public` other — docs, panos, textures, portal, assets | 44 | [12-15-public-and-submodules.md](12-15-public-and-submodules.md) | ✅ Audited (policy level) |
| 15 | `projects`, `experimental` | 2 | [12-15-public-and-submodules.md](12-15-public-and-submodules.md) | ✅ Audited |
| 16 | Cross-cutting sweep — size, layering, comments, tests | all of `src` | [16-cross-cutting.md](16-cross-cutting.md) | ✅ Audited |

**Areas 05 and 06 are marked ◐, not ✅.** Every finding in them labelled
*(all 50)* or *(repo-wide)* was verified by search across the entire area, so
those are complete. What remains is a line-by-line read of 30 route files and 6
components for file-specific issues — both reports list exactly which, and
`src/app/health/import/page.tsx` is the priority.

**Areas 12–14 are audited at policy level.** They are 774 compiled bundles,
sourcemaps and Gradle artefacts; reading each one individually would tell you
nothing. Findings there are measured rather than read.

### The three documents above the reports

| File | Answers |
|---|---|
| [TRIAGE.md](TRIAGE.md) | **What do I fix first?** Ordered by blast radius. |
| [CONFORMANCE.md](CONFORMANCE.md) | **When is it done?** A checkable bar per principle, how to verify it, the measured current state, and what stops it regressing. |
| [16-cross-cutting.md](16-cross-cutting.md) | **What did the first pass miss?** The sweep for the principles that a search cannot find. |

Read TRIAGE to choose work. Read CONFORMANCE before claiming any of it is
finished — fixing every finding is *necessary but not sufficient*, and that file
explains exactly why.

---

## Parked observations

Things noticed while auditing a different area, held here until that area is
properly read and they can be written up with an ID. **The list is currently
empty** — everything parked during the first pass has been promoted:

| Was parked as | Now |
|---|---|
| Submodule gitlinks with no `.gitmodules` | CFG-03 |
| Two task backlogs, one referencing Supabase | CFG-07 |
| ~690 lines of unwired scaffolding | SCAF-01 |
| Two `LifeArea` vocabularies | DATA-04 |
| `ResearchGems` / `ResearchAtlas` dead links | DATA-05 |

One parked assumption turned out to be **wrong**, which is why they get checked
before being written up: it was suspected that `src/app/capture` reimplemented
`logic/autoSort`. It does not — the capture page is three manual forms. Wiring
`autoSort` in would be a new feature, not deduplication. SCAF-01 records this.

## Rollup

93 findings — 15 area reports plus one cross-cutting sweep.

| Severity | Open | Fixed |
|----------|------|-------|
| Critical | 2 | 2 |
| High | 19 | 1 |
| Medium | 46 | 0 |
| Low | 23 | 0 |
| **Total** | **90** | **3** |

The two open Criticals are **CFG-01** (there is no CI, so nothing catches a
broken build — production deploys failed for months undetected) and **COMP-01**
(the theme toggle drives none of the 504 `dark:` styling declarations).

Counts are produced by counting `### [ ]` and `### [x]` headings across the
reports — re-run after ticking anything off:

```bash
cd docs/code-audit
grep -c '^### \[ \]' 0*.md 1*.md   # open
grep -c '^### \[x\]' 0*.md 1*.md   # fixed
```
