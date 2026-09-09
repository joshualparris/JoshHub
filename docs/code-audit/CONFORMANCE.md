# Conformance — what "done" means

The reports say what is wrong. `TRIAGE.md` says what to fix first. **This file
defines what conformance actually means**, so that "the repo follows the
principles" becomes a claim you can check rather than a feeling.

## Why this exists

The audit was asked a fair question: if every finding is fixed, will the repo
fully conform to all fifteen principles? The honest answer was no, for four
reasons:

1. **The audit is not finished.** 30 route files and 6 components have never had
   a line-by-line read.
2. **It was biased toward what a search can find.** P2 and P13 attracted 26 and
   28 findings; P14, P10, P7 and P5 attracted 1, 2, 3 and 4. Report 16 measures
   what that bias hid.
3. **No principle had a definition of done.** "Are functions small enough?" had
   no answer because "small enough" was never defined.
4. **Fixing does not prevent recurrence.** Nothing mechanically stops any of it
   coming back (XC-07).

This file addresses 3 and 4. Reports 01–16 address 1 and 2.

## How to use it

Each principle below has:

- **Conformant when** — the concrete bar, chosen to be checkable.
- **Verify** — the command or method that checks it. Run it; do not estimate.
- **Now** — the measured current state, with the date it was measured.
- **Enforced by** — what stops it regressing, or `nothing yet`.

A principle is only ticked when its check passes **and** an enforcement exists.
Passing once without enforcement is a snapshot, not conformance.

> Baseline measured 2026-09-09, against 132 source files / 15,209 lines in
> `src/` (excluding `apps.ts.bak`).

---

## P1 — Understand before changing

**Conformant when:** every change to more than ~10 files is preceded by a
recorded reading of the affected area, and no repo-wide search-and-replace runs
without every distinct match class being enumerated and checked first.

**Verify:** human judgement, at review time. The specific question: *can the
author name what each class of match means?*

**Now:** ⚠️ This repo has been damaged twice by its absence — the `ms`→`care2`
substring replacement across 147 files, and this audit's own first pass, which
edited 147 files before reading the codebase.

**Enforced by:** nothing yet. Proposed: a line in
`.github/copilot-instructions.md` stating the rule, since most changes here are
made by AI agents.

---

## P2 — One concept, one source of truth

**Conformant when:** no concept has two live definitions. Specifically: one
`LifeArea` vocabulary, one backup system, one date module, one set of Platform
CRUD functions, one pinning mechanism, one `useNotes`, one `Input`.

**Verify:**
```bash
git ls-files 'src/**/*.ts' 'src/**/*.tsx' | grep -v '\.bak' | sed 's|.*/||' \
  | grep -vE '^(page|layout|route|loading|error|not-found)\.tsx?$' | sort | uniq -d
```
No output = no duplicated module basenames. The `grep -v` excludes Next.js's
reserved filenames, which are legitimately repeated per route. Plus the named
findings below.

**Now:** ❌ 26 findings. Three duplicated basenames (`date.ts`, `events.ts`,
`life.ts`). Open: DB-04, DATA-02, DATA-04, LIB-01, LIB-04, FEAT-01, FEAT-02,
FEAT-03, COMP-04, APP-03, APP-06, SCAF-02, CFG-07.

**Enforced by:** nothing yet. Proposed: the duplicate-basename check above as a
CI step — cheap, and it catches the most common shape.

---

## P3 — Keep related things together

**Conformant when:** each module has one responsibility a reader can state in a
sentence. No file mixes persistence, hooks and parsing (DB-08); no schema file
carries seed content (DB-06).

**Verify:** human judgement at review. Proxy: a file importing from three or
more unrelated areas is a candidate.

**Now:** ⚠️ Open: DB-06, DB-08, SCAF-07, COMP-04, FEAT-07, XC-03.

**Enforced by:** nothing yet.

---

## P4 — Boring, obvious names

**Conformant when:** one file-naming convention per kind — kebab-case modules,
PascalCase components, `*-client.tsx` for client components — and no two modules
share a basename.

**Verify:**
```bash
git ls-files 'src/**' | grep -E "client" | sed 's|.*/||' | sort -u   # expect one pattern
```

**Now:** ❌ Four conventions in use (40 lowercase, 24 kebab, 21 camel, 6
Pascal); five spellings of "client component". Open: XC-06, FEAT-03, SCAF-08.

**Enforced by:** nothing yet. Proposed: an ESLint filename rule.

---

## P5 — Small, single-purpose functions

**Conformant when:** no top-level function or component exceeds **150 lines**,
and fewer than 10% exceed 60. These numbers are chosen to be achievable from the
current baseline, not as an ideal — tighten them once met.

**Verify:**
```bash
# prints the longest top-level functions; see report 16 for the full script
python3 - <<'PY'
import subprocess, re
files=[f for f in subprocess.check_output(["git","ls-files","-z"],text=True).split("\0")
       if f.endswith((".ts",".tsx")) and ".bak" not in f and f.startswith("src/")]
d=re.compile(r'^(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)|^(export\s+)?const\s+(\w+)\s*[:=].*(=>|function)')
rows=[]
for f in files:
    L=open(f,encoding="utf-8",errors="replace").read().split("\n")
    s=[(i,l) for i,l in enumerate(L) if d.match(l)]
    for j,(i,l) in enumerate(s):
        e=s[j+1][0] if j+1<len(s) else len(L)
        rows.append((e-i,f,(d.match(l).group(4) or d.match(l).group(6))))
rows.sort(reverse=True)
print(f"over 150: {len([r for r in rows if r[0]>150])}, over 60: {len([r for r in rows if r[0]>60])} of {len(rows)}")
for n,f,nm in rows[:5]: print(f"  {n:5d} {nm} {f}")
PY
```

**Now:** ❌ 27 functions over 100 lines, 45 over 60, of 299. Largest is
`DashboardPage` at 727. Open: XC-01.

**Enforced by:** nothing yet. Proposed: once under the bar, a test asserting no
function exceeds 150 lines — the same shape as the backup registry-drift test.

---

## P6 — Explicit data flow

**Conformant when:** the path is always `IndexedDB → repository/action → hook →
component`. No component reaches into two storage systems; no browser-only read
happens during render.

**Verify:**
```bash
git ls-files 'src/**/*.ts' 'src/**/*.tsx' | grep -v '\.bak' | tr '\n' '\0' \
  | xargs -0 grep -nE -A4 "useState(<[^>]*>)?\(" 2>/dev/null \
  | grep -E "localStorage|loadRecent"
```
Note the `-A4` and the optional generic: an earlier version of this check missed
both real violations, because `useState<RecentItem[]>(` does not match
`useState(` and `usePinnedApps` reads storage four lines below the `useState`.
It would have reported conformance while two bugs were live.

**This is a review prompt, not a gate** — it also flags correct code
(`localStorage` inside `useEffect`) and comments that mention it. Read each hit;
the violation is specifically *reading storage in a `useState` initialiser*.

**Now:** ⚠️ Two remaining localStorage-during-render sites (COMP-07, FEAT-05);
one already fixed in `ead6146`. Pinned state is split across localStorage and
Dexie (FEAT-02). Open: DB-09, SCAF-03, LIB-07, DATA-06, SCR-02.

**Enforced by:** partially — `react-hooks/set-state-in-effect` exists but is
switched off (CFG-05). Proposed: re-enable as a warning after APP-08.

---

## P7 — Separate UI from business logic

**Conformant when:** no component contains a calculation worth testing. Unit
conversion, aggregation, correlation and threshold logic live in pure modules
with tests.

**Verify:**
```bash
git grep -l "useMemo" -- src/app src/components | \
  xargs grep -lE "\.reduce\(|\/ 1000|\* 60|toFixed\(" 
```
Expect no output; each hit is a candidate for extraction.

**Now:** ❌ 7 screens carry inline calculation. Open: XC-02, LIB-01, COMP-06.

**Enforced by:** nothing yet — it needs judgement. The grep above is the review
prompt, not a gate.

---

## P8 — Never present static data as live

**Conformant when:** every figure on screen either comes from stored data or is
visibly labelled as an example, and no control implies a capability that does
not exist.

**Verify:** human review of each screen. Search aid:
```bash
git grep -nE '\$[0-9,]+\.[0-9]{2}|[0-9]{1,3}\.[0-9]%' -- src/app src/components
```

**Now:** ⚠️ Dashboard fixed in `ead6146` (Example badge). Open: APP-05 (family
page pre-filled with personal defaults), COMP-05 (button with no handler),
DATA-05 / SCR-01 / PUB-02 (12 catalogue links that 404), DATA-03.

**Enforced by:** nothing yet. Proposed: `check-assets.js` in CI closes the
dead-link half mechanically.

---

## P9 — Delete dead code

**Standing exception:** the preference in this repo is to **keep code and make
it make sense** rather than delete. Delete only when leaving it would mislead —
a second, broken copy of something that already works, or build output.

**Conformant when:** every module is either imported by the running app, or
carries a header stating that it is not and what the plan for it is.

**Verify:** for each candidate module, `git grep -l "<import path>" -- src`.

**Now:** ❌ ~690 lines unwired (SCAF-01), a persistence adapter that never
persists (SCAF-03), 301 lines of seed that never runs (SCAF-04), 31 MB of
committed build output (PUB-01), `apps.ts.bak` (DATA-01).

**Enforced by:** nothing yet. `no-unused-vars` catches symbols, not modules.
Proposed: a periodic unused-export check, or Knip.

---

## P10 — Don't mutate unless intended

**Conformant when:** no query result is sorted or reversed in place.

**Verify:**
```bash
git grep -nE "\((tasks|notes|events|sleep|movement|nutrition|metrics|bookmarks|activities|dailyMetrics|items) \?\? \[\]\)\.(sort|reverse)" -- src
```
Expect no output.

**Now:** ❌ 5 remaining sites (APP-04, FEAT-04); dashboard fixed in `ead6146`.

**Enforced by:** nothing yet. Proposed: the grep above as a CI step — it is
precise, has no false positives today, and is the cheapest enforcement on this
whole list.

---

## P11 — Protect important operations with invariants

**Conformant when:** every operation that can destroy or misrepresent data has
its invariant written down *and tested*. Current list:

| Operation | Invariant | Tested |
|---|---|---|
| Backup / restore | export → wipe → restore leaves the DB unchanged | ✅ |
| Backup registry | `BACKUP_TABLES` matches the Dexie schema | ✅ |
| Activity import | importing the same file twice = importing it once | ❌ DB-07 |
| Catalogue | ids unique, URLs well-formed, statuses valid | ⚠️ validator exists, never runs |
| Local assets | every referenced `/games` and `/docs` path exists | ⚠️ script exists, never runs |
| Event times | `startIso`/`endIso` are always true ISO instants | ❌ APP-01 |
| CSV import | quoted fields containing commas parse correctly | ❌ COMP-06 |

**Verify:** `npx vitest run` plus `npm run validate:apps` plus
`node scripts/check-assets.js`.

**Now:** ⚠️ 2 of 7 invariants tested; 2 more have tools that CI never runs.

**Enforced by:** partially — the two tested ones. CFG-01 closes the next two.

---

## P12 — Comments explain WHY

**Conformant when:** every non-obvious constraint is written down at the point
it constrains — and no comment merely restates the code.

**Verify:**
```bash
git grep -hE "^\s*// (Sort|Try|Find|Check|Get|Set|Add|Render|Loop|Filter|Map|Simple|Basic)" -- src
```
Each hit is a candidate WHAT-comment. Density is a weak proxy but worth watching:
89 of 134 files currently have none at all.

**Now:** ❌ 2% density; two-thirds of files have no comments; the ones that exist
skew toward restating code. Open: XC-04.

**Enforced by:** nothing, and it should not be — a density target would produce
worse comments. The rule instead: **every fix in this audit leaves behind a
comment naming the constraint that made it a bug.**

---

## P13 — Consistent structure beats cleverness

**Conformant when:** one export style (named), one indent width (2), one naming
convention per kind, one way to build a repository adapter, one way to read
browser-only state.

**Verify:** a formatter reports no changes. There is no formatter yet.

**Now:** ❌ 28 findings. Mixed default/named exports and 2/4-space indentation
across 6+ files.

**Enforced by:** nothing yet. Proposed: **adopt Prettier** and run
`prettier --check` in CI. This single change retires most of P13 permanently and
is the highest leverage item on this page.

---

## P14 — Keep dependencies directional

**The hierarchy, defined here for the first time** — this is the missing
decision that made P14 unanswerable:

```
app  →  features  →  components  →  lib  →  data
```

- `app` — routing and page composition only.
- `features` — a vertical slice: its own types, logic, persistence and UI.
- `components` — presentation only. **Must not import from `features`.**
- `lib` — domain logic and persistence. Must not import UI.
- `data` — static data. Imports nothing.

**Conformant when:** no import goes right-to-left.

**Verify:** the layer-graph script in report 16, or once configured,
`eslint-plugin-import`'s `no-restricted-paths`.

**Now:** ❌ One cycle: `components → features` (8 imports) and
`features → components` (6). Everything else already flows correctly. Open:
XC-03.

**Enforced by:** nothing yet. Proposed: `no-restricted-paths` — this turns P14
into a build failure and is the only principle here that can be *fully*
mechanised.

---

## P15 — Tests protect behaviour

**Conformant when:** every item in the P11 invariant table is tested, and every
pure calculation module has a test. Not a coverage percentage — a named list.

**Verify:** `npx vitest run`, and check the P11 table above.

**Now:** ❌ **2 test files for 132 source files.** 7 of 9 critical paths
untested: ICS parsing, daily-metrics roll-up, CSV import, catalogue invariants,
lifestyle analytics, tag parsing, date helpers. Open: XC-05, LIB-06, DATA-08.

**Enforced by:** nothing yet — `npm test` currently starts watch mode and would
hang CI (CFG-02).

---

## Scorecard

| | Principle | State | Enforced |
|---|---|---|---|
| P1 | Understand before changing | ⚠️ | ✗ |
| P2 | One source of truth | ❌ | ✗ |
| P3 | Related things together | ⚠️ | ✗ |
| P4 | Boring obvious names | ❌ | ✗ |
| P5 | Small functions | ❌ | ✗ |
| P6 | Explicit data flow | ⚠️ | ◐ |
| P7 | UI vs business logic | ❌ | ✗ |
| P8 | No fake-as-live | ⚠️ | ✗ |
| P9 | Delete dead code | ❌ | ✗ |
| P10 | Don't mutate | ❌ | ✗ |
| P11 | Invariants | ⚠️ 2/7 | ◐ |
| P12 | Comments explain why | ❌ | n/a |
| P13 | Consistent structure | ❌ | ✗ |
| P14 | Directional dependencies | ❌ | ✗ |
| P15 | Tests protect behaviour | ❌ | ✗ |

**Nothing is currently green.** Two are partially enforced, both by work done
during this audit.

## The four changes that move the most

Ranked by how many principles they close mechanically rather than by hand:

1. **CI** (CFG-01) — activates every check that already exists. Touches P11, P15, P8.
2. **Prettier** — retires most of P13 and part of P4, permanently.
3. **`no-restricted-paths`** — fully mechanises P14, the only one that can be.
4. **Two greps in CI** — the P10 mutation check and the P2 duplicate-basename
   check. Precise, no false positives today, minutes to add.

Do these alongside Wave 1 and 2 of `TRIAGE.md`, not after — they are what stops
the other 83 findings from returning.
