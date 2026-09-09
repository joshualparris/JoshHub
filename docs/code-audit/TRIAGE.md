# Triage — current stabilisation order

This file answers one question: **what should the next JoshHub stabilisation checkpoint be?**

The detailed evidence and original severities remain in the numbered area reports. Several 9 September fixes landed faster than those reports were reconciled, so do not use an old `Open` label by itself as proof that a defect is still live. Confirm against current code and git history before editing.

The ordering rule remains:

1. data loss/corruption or silent misrepresentation;
2. checks that prevent future breakage from being noticed;
3. live user-facing defects;
4. source-of-truth/architecture duplication;
5. repository hygiene;
6. structural decomposition and consistency.

---

## Completed foundations — do not redo

These are already landed and should be treated as history, not next work.

### CI and mechanical enforcement

- **CFG-01:** baseline GitHub Actions CI — `081a7d9`.
- **CFG-02:** terminating `npm test` (`vitest run`) — `8b741f5`.
- **Formatting, mutation, duplicate-module and conflict-marker gates:** `004aaf7`.
- **P14 dependency-direction rule at error level:** `7dd79cc`; remaining layer cycle closed in `3631931`.
- **Catalogue asset integrity:** missing destinations made truthful in `f47baf4`; `check:assets` made blocking again in `c2f1f2f`.

### Theme and basic UI truthfulness

- **COMP-01 / COMP-02 / COMP-03 / APP-02 / APP-09 / COMP-11:** theme root causes, semantic tokens and uncovered dark-mode views fixed by `492eb54` and reconciled in merge `e0d569d`.
- **APP-05 / COMP-07 / FEAT-05 / COMP-10 plus related input-state issues:** family defaults, Recent/pin storage flow, unknown status and shared input validation work substantially addressed in `1881aae`.

### Calendar, Care and canonical flows

- **APP-01 / APP-07 / calendar-time + ICS defects:** fixed/tested in `02806ad`.
- **Care timezone/data-flow defect:** fixed/tested in `385dac0`.
- **Everything Map duplicate backup path:** removed/routed through canonical persistence in `8e46de0` and `fcdfa54`.
- **Duplicate Platform direct CRUD/task grouping:** consolidated in `6119192`.
- **Duplicate Care wrapper:** removed in `3b6bbf1`; the blocking duplicate-module gate itself predates that commit (`004aaf7`).

### Antigravity correction follow-up

- `6da5fff` improved prompt-template corruption handling and extracted CSV parsing/validation but left an end-to-end destructive Save path and overclaimed the parser's strictness.
- **PR #10 (`chatgpt/fix-antigravity-corrections`)** is the corrective checkpoint for those remaining defects, plus stale agent/audit guidance. Do not start another overlapping correction while it is in flight.

---

## NEXT — confirmed live defect

### 1. DB-07 — Activity re-import is not idempotent · Medium

**Why next:** it can silently inflate daily/weekly health metrics. That is a user-data correctness invariant, so it outranks cosmetic or structural cleanup.

**Required invariant:**

> Importing the same source file twice must produce the same persisted activities and daily metrics as importing it once.

**Work shape:**

1. trace health import -> activity write -> daily-metric aggregation;
2. identify the canonical source identity/deduplication key;
3. add a behavioural regression test that imports the same fixture twice;
4. fix the smallest layer that violates idempotency;
5. verify the full CI suite before pushing.

Do not combine this with unrelated UI or architecture cleanup.

---

## After DB-07

### 2. SCAF-03 — Dexie adapter that silently falls back to memory · High

A persistence adapter that does not persist is dangerous the moment it gains a caller. Resolve the contract before wiring it into product code. P16/P18 apply: a missing persistence capability must not be silently disguised as success.

### 3. SCAF-01 + DATA-04 — Unwired scaffolding and competing `LifeArea` vocabularies · High

Settle the intended model before more features depend on it. Do not create a third vocabulary or blindly rename slugs; inspect persistence/migration impact first.

### 4. LIB-01 + LIB-06 — Canonical lifestyle analytics + tests · High

Wire the existing domain module where appropriate instead of leaving a page to reimplement calculations. Add behavioural tests with the wiring change.

### 5. DB-04 and remaining source-of-truth duplication · High

Re-check current code before acting because `6119192` already removed one duplicate direct Platform path. Fix only the genuinely remaining source-of-truth problem recorded by current evidence.

### 6. APP-03 and smaller catalogue/domain duplications · Medium

Archive/catalogue duplication, pin/useNotes/tag leftovers and other repeated concepts belong here after the correctness work.

### 7. Repository weight and hygiene

- **PUB-01:** committed Android/build output.
- **CFG-03:** dangling gitlinks / missing `.gitmodules` contract.
- **DATA-01 / CFG-06 / CFG-07:** stale backup/generated/task-backlog hygiene.
- **PUB-04:** duplicate game builds.

Treat these as repository integrity changes, not product features.

### 8. Structural principle work

- **XC-02:** move remaining calculations/ranking/eligibility logic out of UI.
- **XC-05:** add tests with each remaining critical-path fix, not as a coverage-number campaign.
- **XC-01:** shrink giant components opportunistically when their logic is being fixed.
- **XC-04:** document constraints/WHY where future agents could repeat a bug.
- naming/export consistency and remaining low-risk polish last.

---

## Verification before every merge to `main`

The actual blocking CI baseline is:

```bash
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

A green run proves only those checks. It does not prove all 18 principles or all user-data invariants.

---

## Audit coverage still matters

Some route/component files have never received a full line-by-line review. Continue that work opportunistically when touching an area rather than running another broad edit campaign. `src/app/health/import/page.tsx` is especially relevant to DB-07 and should be read completely during that checkpoint.

Before marking any old finding fixed or open, verify the current implementation and then reconcile its area report. The desired end state is that area reports, `CONFORMANCE.md`, this triage, `PROJECT_STATE.md`, and executable CI all tell the same story.
