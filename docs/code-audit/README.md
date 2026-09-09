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
| 02 | `src/lib` core — recent, pins, date, utils, analytics, react | 9 | — | Not started |
| 03 | `src/lib` scaffolding — models, logic, seed, repos | 21 | — | Not started |
| 04 | `src/data` — apps catalogue, life areas, events | 6 | — | Not started |
| 05 | `src/app` — routes and pages | 50 | — | Partially reviewed |
| 06 | `src/components` — shared UI | 32 | — | Not started |
| 07 | `src/features` — everything-map, apps, platform | 9 | — | Not started |
| 08 | Root config — package.json, tsconfig, next.config, eslint | 15 | — | Not started |
| 09 | `.github` — workflows and Copilot instructions | 1 | — | Not started |
| 10 | `scripts` — inventory and sync scripts | 6 | — | Not started |
| 11 | `docs` — project documentation | 12 | — | Not started |
| 12 | `public/games` — hosted game builds (excl. josh-nfc-audio) | 161 | — | Not started |
| 13 | `public/games/josh-nfc-audio` — includes a committed Android build tree | 569 | — | Not started |
| 14 | `public` other — docs, panos, textures, portal, assets | 44 | — | Not started |
| 15 | `projects`, `experimental` | 2 | — | Not started |

Area 05 is marked *partially reviewed* rather than audited: `dashboard`,
`settings/backups`, `care` and `life` have been read in full, the rest have not.

---

## Parked observations

Things noticed while auditing a different area. They are recorded here so they
are not lost, and get written up properly — with an ID — when their own area is
audited. Do not fix from this list alone; read the area first.

- **Area 08 (root):** `Game-Fixer`, `PartyAI` and `Serenity-Keep-Flying` are
  committed as submodule gitlinks (mode `160000`) but there is no `.gitmodules`
  file, so a fresh clone produces three permanently empty directories that
  `git submodule update --init` cannot populate. `Game-Fixer` is registered
  twice — once at the root and once as `projects/Game-Fixer` — pointing at the
  same commit.
- **Area 08 / 11 (docs):** there are two separate task backlogs, `tasks.md` at
  the root and `docs/tasks.md`, with different content (P2). The root one
  references `src/lib/supabase/server.ts`, which does not exist in this repo.
- **Area 03:** the `models` / `captureRepo` / `logic` / `seed` layer (~692 lines
  from the "Prompt 16 foundation" handoff) has no importers in the running app.
  The standing preference is to wire it up rather than delete it — check whether
  `src/app/capture` reimplements `autoSort` before deciding.
- **Area 04 / 05:** two different `LifeArea` vocabularies exist —
  `src/data/life.ts` uses `work-dcs` / `tech-projects`, `src/lib/models/life.ts`
  uses `work` / `tech` / `inbox` (P2). Harmless only because the second is
  currently unused.
- **Area 04:** `src/data/apps.ts` lists `ResearchGems`, and a Vercel project
  points at `ResearchAtlas`; neither repository exists on GitHub, so both are
  dead links.

## Rollup

| Severity | Open | Fixed |
|----------|------|-------|
| Critical | 0 | 2 |
| High | 1 | 1 |
| Medium | 5 | 0 |
| Low | 2 | 0 |
| **Total** | **8** | **3** |

Last updated after report 01.
