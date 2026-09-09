# Conformance — what "done" means

The area reports say what defects were found. `TRIAGE.md` orders stabilisation work. **This file defines the checkable bar for the 18 engineering principles and the current enforcement that actually exists.**

Do not infer conformance from a green build alone. A principle is green only when its stated bar is met and there is durable enforcement appropriate to that principle.

> Reconciled 9 September 2026 against `main` starting at `10c98e7` plus the corrective changes in PR #10. Older area-report counts are not a live status source until their checkboxes are reconciled with the later 9 September commits.

## Executable baseline

GitHub Actions currently runs these as blocking checks on pushes to `main` and pull requests:

```bash
npm ci
npm run format:check
npm run lint
npm test
npm run build
npm run validate:apps
npm run check:mutation
npm run check:conflict-markers
npm run check:assets
npm run check:duplicate-modules
```

`npm test` is terminating `vitest run`. `check:assets` is blocking. `import/no-restricted-paths` is an ESLint error. Any document saying otherwise is stale.

---

## P1 — Understand before changing

**Conformant when:** substantial changes are anchored to a starting SHA, the owning subsystem and data flow are read first, and broad edits are not made until each match class is understood.

**Verify:** review evidence: starting SHA, files/usages inspected, concurrent delta checked before merge.

**Now:** ⚠️ Partial. `AGENTS.md` makes this mandatory, but it remains a review/process property rather than a mechanical code gate.

**Enforced by:** `AGENTS.md`, `PROJECT_STATE.md`, review judgement.

---

## P2 — One concept, one source of truth

**Conformant when:** no domain concept has parallel live definitions or persistence paths: one LifeArea vocabulary, one backup path, one canonical apps catalogue, one pinning model, one Platform write path, one prompt-template schema, etc.

**Verify:**

```bash
npm run check:duplicate-modules
```

plus review of the named source-of-truth findings in the area reports.

**Now:** ❌ Not conformant globally. Duplicate module basenames are mechanically clean and blocking in CI; several deeper domain/source-of-truth findings remain. PR #10 also centralises prompt-template validation into one shared schema instead of separate UI/repository validators.

**Enforced by:** ◐ blocking duplicate-module gate plus review.

---

## P3 — Keep related things together

**Conformant when:** each module has one responsibility a reader can state in a sentence; persistence, parsing, domain rules and presentation are not tangled without reason.

**Verify:** review module responsibilities and import direction.

**Now:** ⚠️ Partial. Calendar/ICS, Care logic, task grouping and CSV parsing have been extracted into focused modules, but mixed-responsibility legacy files remain.

**Enforced by:** review plus P14 dependency boundaries.

---

## P4 — Prefer boring, obvious names

**Conformant when:** identifiers say what they hold; vague standalone names are avoided outside tight callback/index scopes; filenames follow one convention per kind.

**Verify:** targeted identifier/file naming review; do not bulk rename.

**Now:** ❌ Not conformant. Legacy vague bindings and filename convention drift remain. New corrective code uses descriptive parser/state/error names.

**Enforced by:** lint catches unused names; naming quality still needs review.

---

## P5 — Keep functions small and single-purpose

**Conformant when:** no top-level function/component exceeds 150 lines and fewer than 10% exceed 60 lines.

**Verify:** run the function-size script in `16-cross-cutting.md`.

**Now:** ❌ Not conformant. Large components remain, including Dashboard, inventory-health and Care surfaces.

**Enforced by:** nothing mechanical yet.

---

## P6 — Make data flow explicit

**Conformant when:** persisted user data flows through an explicit repository/domain/hook/component path; browser-only storage is not read during render/hydration; parallel storage paths are not created casually.

**Verify:** review storage access and hooks; search render-time `localStorage` reads.

**Now:** ⚠️ Partial. App pins have been migrated to backed-up Dexie state, Recent render-time storage reads were removed, and major feature paths are clearer; other legacy browser/storage patterns still require audit reconciliation.

**Enforced by:** partial review/lint/feature tests.

---

## P7 — Separate UI from business logic

**Conformant when:** components render and orchestrate; calculations, ranking, eligibility, parsing and domain decisions worth testing live in pure modules.

**Verify:** review `src/app`/`src/components` for non-trivial reducers, comparators, eligibility predicates and parsing logic.

**Now:** ❌ Not conformant globally. Calendar, Care, task grouping and CSV parsing have been extracted/tested, but significant inline calculations and decision logic remain.

**Enforced by:** review and behavioural tests when extracted.

---

## P8 — Never pretend static data or unavailable behaviour is live

**Conformant when:** user-facing values come from real data or are labelled as examples, broken destinations are not presented as working, and controls do not imply capabilities that do not exist.

**Verify:** UI review plus:

```bash
npm run validate:apps
npm run check:assets
```

**Now:** ⚠️ Partial. Dashboard examples are labelled, invented family defaults were removed, missing catalogue targets were made truthful, and asset integrity is blocking. PR #10 removes the non-functional `Export Merged JSON` button instead of leaving a fake action. Other audit findings may remain.

**Enforced by:** ◐ blocking catalogue/asset checks plus review.

---

## P9 — Delete dead or misleading code

**Conformant when:** code is either live/intentional with a clear role or removed when leaving it would actively mislead. Do not delete useful scaffolding merely because it is not wired yet.

**Verify:** usage/history review for each candidate.

**Now:** ❌ Not conformant. Unwired/dead architecture and repository-weight findings remain.

**Enforced by:** lint catches unused symbols, not dead modules.

---

## P10 — Do not mutate data unless mutation is intentional

**Conformant when:** shared/query results are not sorted or reversed in place.

**Verify:**

```bash
npm run check:mutation
```

**Now:** ✅ Conformant for the defined invariant. Known in-place query-result mutations were repaired and the deterministic check is blocking in CI.

**Enforced by:** ✅ blocking CI gate introduced in `004aaf7`.

---

## P11 — Protect important operations with invariants

**Conformant when:** every operation that can destroy or materially misrepresent user data has a named behavioural invariant and test.

**Current invariant table:**

| Operation | Invariant | Protected |
|---|---|---|
| Backup / restore | export -> wipe -> restore preserves supported user state | ✅ |
| Backup registry | backup table registry matches supported Dexie schema | ✅ |
| Activity import | importing the same source twice equals importing it once | ❌ DB-07 |
| Catalogue | ids/URLs/status structure valid | ✅ CI |
| Local assets | every referenced local destination exists | ✅ CI |
| Event times | persisted/compared event times use canonical instants | ✅ tests |
| CSV import | quoted/multiline fields parse safely; malformed rows do not silently shift columns | ✅ tests |
| Referential fields (7 named relationships) | references resolve to live canonical entities | ❌ |

**Verify:** focused invariant tests plus full `npm test`, catalogue and asset gates.

**Now:** ❌ **6 of 14 named invariants protected.** The next confirmed destructive/misrepresentation invariant is DB-07 activity import idempotency.

**Enforced by:** ◐ tests and blocking CI for the invariants already covered.

---

## P12 — Comments explain WHY, not WHAT

**Conformant when:** non-obvious constraints are documented where they matter, while comments that merely translate code into English are avoided.

**Verify:** review comments in changed files; use the candidate grep in `16-cross-cutting.md` as a prompt, not a density target.

**Now:** ❌ Not conformant globally. New safety code documents destructive/boundary reasons; legacy comment quality remains uneven.

**Enforced by:** review.

---

## P13 — Consistent structure beats cleverness

**Conformant when:** formatting, export style, naming conventions, error handling and repository patterns are consistent enough that a new file has an obvious shape.

**Verify:**

```bash
npm run format:check
```

plus review of naming/export conventions.

**Now:** ⚠️ Partial. Prettier is repository-wide and blocking, but broader naming/export/pattern consistency is not fully resolved.

**Enforced by:** ◐ blocking Prettier gate plus lint/review.

---

## P14 — Keep dependencies directional

The enforced hierarchy is:

```text
app -> features -> components -> lib -> data
```

**Conformant when:** no import goes right-to-left and lower layers do not depend on UI.

**Verify:**

```bash
npm run lint
```

**Now:** ✅ Conformant for the defined hierarchy. The former `components` <-> `features` cycle is closed.

**Enforced by:** ✅ `import/no-restricted-paths` at error level, introduced in `7dd79cc` and run in blocking CI.

---

## P15 — Tests protect behaviour, not implementation

**Conformant when:** every P11 invariant and important pure domain calculation has behavioural coverage.

**Verify:**

```bash
npm test
```

and compare tested paths with the P11 table.

**Now:** ⚠️ Partial. Backup, calendar/time, ICS, Care logic, task grouping, tag/comma parsing, CSV boundaries and prompt-template corruption have behavioural tests. Daily-metric idempotency and other critical calculations remain.

**Enforced by:** ◐ blocking test step in CI; untested behaviour is still unprotected.

---

## P16 — Fail loudly at boundaries, degrade gracefully in the UI

**Conformant when:** invalid/corrupt storage, network and file-boundary data becomes an explicit error or explicit failure result; unexpected programming errors are not silently swallowed; UI surfaces expected failures without destroying data or crashing the whole screen.

**Verify:** review catch blocks and boundary tests. In particular, a graceful UI fallback must not create a second destructive path.

**Now:** ⚠️ Partial. Prompt-template storage corruption throws a typed `CorruptStorageError`; PR #10 additionally prevents a failed load from leaving Save enabled against empty initial state. CSV syntax/row failures become explicit UI errors. Other catch/fallback paths still require systematic review.

**Enforced by:** ◐ lint plus focused behavioural tests and review.

---

## P17 — YAGNI

**Conformant when:** abstractions/layers have an immediate active consumer and speculative architecture is not built “for later”.

**Verify:** review each new abstraction: identify its current production caller.

**Now:** ⚠️ Partial. Several unused/dead layers were removed or consolidated, but older unwired scaffolding remains.

**Enforced by:** lint for unused symbols plus review/agent protocol.

---

## P18 — Zero trust for external data (boundary validation)

**Conformant when:** data entering from files, APIs, URLs, forms or persisted untyped storage is validated before business logic/persistence relies on its shape.

**Verify:** inspect parsing/import entry points and their runtime validators/tests.

**Now:** ⚠️ Partial. Catalogue/input/tag/URL validators exist; PR #10 uses a shared runtime prompt-template schema and a strict CSV parser + Zod row schema that rejects ambiguous quote syntax, blank/duplicate headers, wrong field counts and invalid required fields while preserving arbitrary metadata values. Full backup-import and other raw external boundaries still require systematic schema review.

**Enforced by:** ◐ runtime validators + behavioural tests + blocking CI.

---

## Scorecard

| Principle | State | Durable enforcement |
|---|---|---|
| P1 Understand before changing | ⚠️ | ◐ process/review |
| P2 One source of truth | ❌ | ◐ duplicate-module gate + review |
| P3 Related things together | ⚠️ | ◐ review/P14 |
| P4 Obvious names | ❌ | ✗ |
| P5 Small functions | ❌ | ✗ |
| P6 Explicit data flow | ⚠️ | ◐ |
| P7 UI vs business logic | ❌ | ◐ tests when extracted |
| P8 No fake-as-live | ⚠️ | ◐ catalogue/assets + review |
| P9 Dead/misleading code | ❌ | ◐ symbols only |
| **P10 Mutation invariant** | **✅** | **✅ blocking CI** |
| P11 Important invariants | ❌ 6/14 | ◐ |
| P12 Comments explain why | ❌ | review |
| P13 Consistent structure | ⚠️ | ◐ Prettier/lint |
| **P14 Dependency direction** | **✅** | **✅ blocking lint** |
| P15 Behavioural tests | ⚠️ | ◐ blocking tests |
| P16 Loud boundary failures | ⚠️ | ◐ |
| P17 YAGNI | ⚠️ | ◐ |
| P18 Boundary validation | ⚠️ | ◐ |

**Only P10 and P14 are currently fully green against their defined bars.** Green CI is necessary but does not make the remaining principles green.
