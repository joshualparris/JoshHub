# Conformance — what "done" means

The reports say what is wrong. `TRIAGE.md` says what to fix first. **This file
defines what conformance actually means**, so that "the repo follows the
principles" becomes a claim you can check rather than a feeling.

## Why this exists

The audit was asked a fair question: if every finding is fixed, will the repo
fully conform to all eighteen principles? The honest answer was no, for four
reasons:

1. **The audit is not finished.** 30 route files and 6 components have never had
   a line-by-line read.
2. **It was biased toward what a search can find.** P2 and P13 attracted 26 and
   28 findings; P14, P10, P7 and P5 attracted 1, 2, 3 and 4. Report 16 measures
   what that bias hid.
3. **No principle had a definition of done.** "Are functions small enough?" had
   no answer because "small enough" was never defined.
4. **Fixing does not prevent recurrence.** Enforcement has now started with the
   9 September baseline CI and agent protocol, but most principles still have no
   mechanical prevention (XC-07).

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
> `src/` (excluding `apps.ts.bak`). Enforcement status updated after baseline CI
> run `34337559585` on 2026-09-09.

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

**Enforced by:** ◐ documented human/agent enforcement. `AGENTS.md` now makes
"understand before changing" the overriding rule, requires an anchored starting
SHA and atomic checkpoints, and forbids blind repository-wide replacement.
`.github/copilot-instructions.md` points agents to that protocol and
`docs/PROJECT_STATE.md`. This is durable process enforcement, but not a
mechanical code gate, so review judgement is still required.

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

> **This definition was wrong until 2026-09-09.** It only covered filenames.
> The principle is about the names a reader actually meets — identifiers. The
> old bar could be met in full while every variable in the repo was called `d`.

**Conformant when:** *(both parts)*
1. **Identifiers** say what they hold. No single-letter bindings outside a tight
   idiomatic scope (a `map`/`filter`/`sort` callback parameter, or a loop index),
   and no `data` / `val` / `res` / `tmp` / `obj` / `item` as a standalone name.
2. **Filenames** follow one convention per kind — kebab-case modules,
   PascalCase components, `*-client.tsx` for client components — and no two
   modules share a basename.

**Verify:**
```bash
# 1. identifiers
git ls-files 'src/**/*.ts' 'src/**/*.tsx' | grep -v '\.bak' | tr '\n' '\0' | xargs -0 \
  grep -nE "\b(const|let) ([a-z]|data|val|res|tmp|temp|arr|obj|item|thing|stuff)\b" 2>/dev/null

# 2. filenames
git ls-files 'src/**' | grep -E "client" | sed 's|.*/||' | sort -u   # expect one pattern
```
The identifier check reports declarations only, not callback parameters, so a
hit is nearly always worth renaming. Read them; do not bulk-rename.

**Now:** ❌ **50 vague bindings** — `s`(5), `q`(5), `t`(4), `r`(4), `m`(4),
`data`(4), `d`(4) and more. Four filename conventions in use (40 lowercase, 24
kebab, 21 camel, 6 Pascal); five spellings of "client component".
Open: XC-06, XC-08, FEAT-03, SCAF-08.

**Enforced by:** nothing yet. Proposed: `id-length` with an allowlist for
callback parameters — but this one mostly needs review attention, not a rule.

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

> **This check undercounted by 3× until 2026-09-09.** It searched only for
> arithmetic, so it found 7 files. Business logic that is not arithmetic —
> ranking comparators, eligibility predicates, state rules — passed straight
> through. The real number is 22.

**Conformant when:** no component contains a decision worth testing. That covers
three kinds, not one:
- **calculation** — unit conversion, aggregation, correlation, thresholds;
- **ranking** — sort comparators that encode priority (status order, stage
  order, due-date-then-created);
- **eligibility** — predicates deciding what counts as upcoming, overdue,
  broken, matched or duplicate.

All three belong in pure modules with tests.

**Verify:**
```bash
git grep -lE "\.reduce\(|\/ 1000|\* 60|toFixed\(|sort\(\(a, b\)|\.filter\(\(\w+\) =>.*(===|!==|>=|<=)" \
  -- src/app src/components
```
Expect no output; each hit is a candidate for extraction. This is a review
prompt, not a gate — a trivial `filter(x => x.id === id)` is fine, a predicate
encoding a business rule is not.

**Now:** ❌ **22 files** carry inline logic — 7 arithmetic, 15 more with ranking
or eligibility rules. Open: XC-02, LIB-01, COMP-06.

**Enforced by:** nothing yet — it needs judgement.

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

**Enforced by:** partially through baseline CI for catalogue structural
validation, but dead local assets are not yet a required gate. Proposed:
`check-assets.js` in CI closes the dead-link half mechanically once the known
failures are resolved.

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

> **This list had no method until 2026-09-09.** It was the seven invariants the
> audit happened to trip over. Deriving them from the schema instead adds a
> whole category that was missing entirely: **referential integrity**. Six
> foreign-key-like fields exist and not one had an invariant.

**Conformant when:** every operation that can destroy or misrepresent data has
its invariant written down *and tested*.

**How the list is derived** — so it can be regenerated rather than remembered:
1. Every operation that writes or deletes across more than one table.
2. Every field in `schema.ts` that references another table's key
   (`grep -nE "(lifeAreaSlug|projectId|nodeId|topicId|resourceId|routineId)" src/lib/db/schema.ts`).
3. Every pure calculation whose output a user acts on.

**Behavioural invariants**

| Operation | Invariant | Tested/enforced |
|---|---|---|
| Backup / restore | export → wipe → restore leaves the DB unchanged | ✅ |
| Backup registry | `BACKUP_TABLES` matches the Dexie schema | ✅ |
| Activity import | importing the same file twice = importing it once | ❌ DB-07 |
| Catalogue | ids unique, URLs well-formed, statuses valid | ✅ validator runs in CI |
| Local assets | every referenced `/games` and `/docs` path exists | ⚠️ script exists, not a CI gate yet |
| Event times | `startIso`/`endIso` are always true ISO instants | ❌ APP-01 |
| CSV import | quoted fields containing commas parse correctly | ❌ COMP-06 |

**Referential invariants** — none currently tested, none previously listed

| Field | Must reference | Tested |
|---|---|---|
| `Note.lifeAreaSlug` | a slug in `data/life.ts` | ❌ |
| `Note.nodeId` | a node in the everything-map TOC | ❌ |
| `Task.projectId` | a project — currently misused to hold a life area (SCAF-05) | ❌ |
| `RoutineRun.routineId` | an existing `routines` row | ❌ |
| `LearnResource.topicIds[]` | existing `learnTopics` rows | ❌ |
| `LearnNote/Session.topicId`, `.resourceId` | existing rows | ❌ |
| `Pin.id` | a life-area slug (and, after FEAT-02, an app id) | ❌ |

**Verify:** `npm test` plus `npm run validate:apps` plus `npm run check:assets`.
All three now run automatically in CI — the first two blocking, the third
advisory until PUB-02 closes.

**Now:** ❌ **3 of 14 invariants enforced.** The backup round-trip and the
registry-drift test are covered by the test suite; the catalogue validator now
runs on every push. The asset check runs advisory. The entire referential half
is unprotected — nothing stops a note pointing at a life area that no longer
exists, which matters immediately because DATA-04 proposes renaming every slug.

**Enforced by:** ◐ baseline GitHub Actions CI plus the existing backup tests.
The remaining named invariants still need behavioural tests/gates.

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

**Enforced by:** nothing mechanical, and it should not be — a density target
would produce worse comments. The rule instead: **every fix in this audit leaves
behind a comment naming the constraint that made it a bug.** `AGENTS.md` now
records that expectation for future agent work.

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
is the highest leverage remaining Wave 1 item.

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

**Now:** ✅ Broken and clean. All platform stateful components were moved into
`features/platform/ui/`, presentation components in `src/components` have zero
imports from `src/features`, and the layer hierarchy flows strictly unidirectional
(`app → features → components → lib → data`). XC-03 closed.

**Enforced by:** ✅ `eslint-plugin-import` rule `import/no-restricted-paths` is
configured at `"error"` level in `eslint.config.mjs` and enforced in CI on every push and PR.

---

## P15 — Tests protect behaviour

**Conformant when:** every item in the P11 invariant table is tested, and every
pure calculation module has a test. Not a coverage percentage — a named list.

**Verify:** `npm test`, and check the P11 table above. Baseline CI also runs lint,
production build, and `npm run validate:apps` on pushes to `main` and pull
requests.

**Now:** ❌ **2 test files for 132 source files.** 7 of 9 critical paths remain
untested: ICS parsing, daily-metrics roll-up, CSV import, catalogue invariants as
behavioural tests, lifestyle analytics, tag parsing, date helpers. Open: XC-05,
LIB-06, DATA-08. The important improvement is that the existing tests now run
automatically and terminate correctly.

**Enforced by:** ◐ GitHub Actions CI (`081a7d9`) now runs `npm test` on every
push to `main` and pull request; CFG-02 is fixed by `8b741f5`. CI prevents tested
behaviour from silently regressing, but it cannot protect critical paths that
still have no tests.

---

## P16 — Fail loudly at boundaries, degrade gracefully in UI

**Conformant when:** system boundaries (storage, network, file parsers, database operations) fail loudly by throwing explicit errors on invalid data or constraint violations rather than silently swallowing errors or passing invalid state downstream. Meanwhile, the UI catches these errors (via error boundaries or defensive component state) to show polite, readable fallback states without crashing the entire application. No empty catch blocks or catch blocks that only `console.log(e)` while silently continuing.

**Verify:**
```bash
git grep -nE "catch\s*\([a-zA-Z0-9_]+\)\s*\{\s*(console\.(log|error|warn)\([^)]*\);?\s*)?\}" -- src
```
Review each hit; verify errors at data/parsing boundaries throw or surface explicit failure results to callers.

**Now:** ⚠️ Mixed. Several catch blocks swallow errors or log without rethrowing (e.g. in ICS parsing, import fallbacks, and local sync); recent forms added user-facing validation feedback, but comprehensive boundary assertions and React error boundaries are not yet standard across every route.

**Enforced by:** ◐ partial linting (`no-empty`); comprehensive enforcement requires boundary tests asserting that bad input throws and UI tests asserting graceful fallback.

---

## P17 — YAGNI (You Aren't Gonna Need It)

**Conformant when:** no speculative abstractions, unused layers, uncalled helper functions, or forward-looking models exist without an immediate, active consumer in the live app. Build exactly what is needed today. This pairs directly with P9 (Delete dead code).

**Verify:**
```bash
npm run lint
```
Plus human review during feature additions and refactors: *can the author point to the immediate production caller of this abstraction?*

**Now:** ⚠️ Substantially improved after removing the unused Prompt-16 scaffolded models and duplicate Platform CRUD, but unreferenced seed data and scaffolding remain (SCAF-01, SCAF-04).

**Enforced by:** ◐ ESLint `no-unused-vars` and the `AGENTS.md` protocol requiring active usage for all introduced abstractions.

---

## P18 — Zero trust for external data (Boundary Validation)

**Conformant when:** all data entering the system from the outside—imported backup JSON, ICS calendar feeds, CSV spreadsheets, URL search parameters, and form submissions—is validated against an explicit schema (e.g. Zod, Yup, or a strict validator) before domain logic or persistence touches it.

**Verify:**
```bash
# Review import and parsing entry points
git grep -nE "(JSON\.parse|parseICS|parseCSV|restoreUserData)" -- src
```
Verify every entry point asserts a schema or validates all required fields before storage.

**Now:** ❌ Mixed. The app catalogue has structural validation in CI (`validate:apps`); tag parsing, comma lists, and URLs have dedicated runtime validators. However, full backup restore (`backup.ts`), CSV imports, and ICS feeds still rely on partial manual duck-typing rather than strict boundary schema validation. Open: DB-07, COMP-06.

**Enforced by:** ◐ `npm run validate:apps` for the app catalogue; runtime parsers for tags and URLs. Full external input schema validation is not yet mechanically enforced across backup and file import flows.

---

## Scorecard

| | Principle | State | Enforced |
|---|---|---|---|
| P1 | Understand before changing | ⚠️ | ◐ |
| P2 | One source of truth | ❌ | ✗ |
| P3 | Related things together | ⚠️ | ✗ |
| P4 | Boring obvious names | ❌ | ✗ |
| P5 | Small functions | ❌ | ✗ |
| P6 | Explicit data flow | ⚠️ | ◐ |
| P7 | UI vs business logic | ❌ | ✗ |
| P8 | No fake-as-live | ⚠️ | ◐ |
| P9 | Delete dead code | ❌ | ✗ |
| P10 | Don't mutate | ❌ | ✗ |
| P11 | Invariants | ❌ 3/14 | ◐ |
| P12 | Comments explain why | ❌ | n/a |
| P13 | Consistent structure | ❌ | ✗ |
| P14 | Directional dependencies | ✅ | ✅ |
| P15 | Tests protect behaviour | ❌ | ◐ |
| P16 | Fail loudly / degrade gracefully | ⚠️ | ◐ |
| P17 | YAGNI | ⚠️ | ◐ |
| P18 | Zero trust for external data | ❌ | ◐ |

**No principle is fully green yet.** The 9 September protocol/CI work materially
improves enforcement for P1, P8, P11 and P15, while P6 was already partially
enforced. Full conformance still requires the checks themselves to pass and the
remaining prevention mechanisms to land.

## The remaining high-leverage enforcement changes

1. **✅ Baseline CI (CFG-01)** — landed in `081a7d9`; first run `34337559585`
   passed lint, terminating tests, production build, and app-catalogue validation.
2. **Prettier** — retires most of P13 and part of P4, permanently.
3. **✅ `no-restricted-paths` (XC-03)** — landed; enforces directional layering as
   a blocking error in CI.
4. **Two greps in CI** — the P10 mutation check and the P2 duplicate-basename
   check. Validate them against the current tree before making them gates.

Do these alongside the remaining Wave 1 work in `TRIAGE.md`, not after — they
are what stops the other findings from returning.
