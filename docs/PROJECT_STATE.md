# JoshHub Project State

**Purpose:** durable resume point for humans and AI agents. Read this before starting substantial work so the repository does not have to be rediscovered every session.

**Project:** JoshHub  
**Repository:** `joshualparris/JoshHub`  
**Primary branch:** `main`  
**State date:** 9 September 2026  
**Baseline inspected for this stabilisation session:** `db5a10993c30d3a78d85fa3149b9fed115b0f898`  
**Latest verified code checkpoint before this state update:** `081a7d959579e54fa51af4142661f5759d6228a8`

> This file is a handoff, not a substitute for git. If `main` has advanced, compare the delta from the baseline/last completed checkpoint rather than restarting the whole audit.

---

## 1. Current overall state

JoshHub is **buildable again, has working baseline GitHub Actions CI, and is part-way through a formal stabilisation/audit**, but it does **not yet conform** to all agreed engineering principles.

The current code audit records:

- **93 findings total**
- **5 fixed audit findings**
- **88 open findings**
- open severity rollup: **1 Critical, 18 High, 46 Medium, 23 Low**
- 30 route files and 6 components still await a full line-by-line read for file-specific issues

The source of truth for those numbers is `docs/code-audit/README.md`. Recalculate rather than copying these numbers forward after findings are resolved.

### Completed stabilisation/checkpoints recorded so far

- `3c0bf78` — repaired the widespread `ms` -> `care2` corruption and restored the build.
- `e94e809` — fixed the canonical backup system so omitted tables, destructive Platform restores, and incomplete reset behaviour are covered.
- `ead6146` — labelled dashboard example figures and fixed the known dashboard live-query mutation/hydration issues.
- `db5a109` — added the conformance scorecard and cross-cutting principle sweep.
- `d04dced` — added `AGENTS.md`, the durable working protocol for future coding agents.
- `7e99a44` — added this durable project-state handoff.
- `689ed32` — updated `.github/copilot-instructions.md` so AI agents resume from `AGENTS.md` and this file instead of rediscovering the repo.
- `8b741f5` — changed `npm test` to terminating `vitest run` and added `npm run test:watch`.
- `081a7d9` — added baseline GitHub Actions CI on pushes to `main` and pull requests.
- CI run `34337559585` passed dependency install, lint, tests, production build, and app-catalogue validation.
- `c29b48a`, `3739218`, `b658228` — updated the audit finding, triage, and rollup to reflect the verified CI work.

Do not redo these from memory. Inspect the commits and audit reports if they need to be changed.

---

## 2. Authoritative documents

Read these in this order when resuming stabilisation work:

1. `AGENTS.md` — how agents must work in this repo.
2. `docs/PROJECT_STATE.md` — where work is currently up to.
3. `docs/code-audit/TRIAGE.md` — what to fix next and in what order.
4. `docs/code-audit/CONFORMANCE.md` — what "done" actually means for each principle.
5. `docs/code-audit/README.md` — audit methodology, principles, coverage, and rollup.
6. the specific area report for whatever code is being changed.
7. `.github/copilot-instructions.md` — repository conventions and common workflows.

For product/project prioritisation rather than source-code stabilisation, use the other project documents referenced by the audit; do not mix those goals into a code-quality pass without an explicit task.

---

## 3. Engineering decisions settled today

These decisions should not be rediscovered in each new session.

### Understand before changing

The strongest rule is:

> Never optimise for making the diff before understanding the system.

No blind repository-wide substitutions. Read the owning subsystem, search usages, trace the data flow, then make the smallest coherent change.

### One source of truth

Do not introduce parallel models or parallel persistence/export systems. Existing canonical locations must be reused or deliberately replaced with a documented migration.

Known examples:

- apps catalogue: `src/data/apps.ts` is canonical;
- IndexedDB/Dexie persistence: `src/lib/db`;
- backup/reset/import must use the canonical persistence contract rather than a screen-specific copy.

### Dependency direction

The audit currently defines the intended layer direction as:

`app -> features -> components -> lib -> data`

Do not add reverse dependencies while fixing individual findings. The audit still records an existing `components` <-> `features` cycle that must be resolved before mechanical enforcement can be enabled.

### Static values versus live values

A static/demo/example number must be clearly labelled. If the interface presents something as current user state, derive it from the canonical user data instead of hardcoding it.

### Unused/dead architecture

Do not delete code merely because a search shows it is currently unused. Verify references, history, and intended role first. Prefer making the architecture coherent and explicit. Delete only genuinely obsolete or misleading duplicates.

### Destructive-data invariant

For supported backups:

> Export -> wipe -> import must reproduce all user-owned persisted state represented by that backup version.

Destructive operations require behavioural tests. A successful build/deploy is not evidence that persistence is safe.

### Fail loudly at boundaries, degrade gracefully in UI

Throw explicitly at network, parsing, or database boundaries when invalid data or violated constraints are encountered; never swallow errors with empty `catch` blocks or silent `console.log` fallbacks. In the UI, catch boundary errors to show polite, readable fallback states.

### YAGNI (You Aren't Gonna Need It)

Do not introduce speculative abstractions, unused indirection layers, or preemptive models. Build strictly what is needed for current production requirements.

### Zero trust for external data (Boundary Validation)

Validate all external data (JSON backup imports, ICS calendar feeds, CSV spreadsheets, URL query params, and manual form inputs) against explicit schemas/validators before business logic or persistence processes it.

---

## 4. Work protocol from this point forward

For substantial work:

1. record the exact `main` SHA once at session start;
2. read this file, `AGENTS.md`, TRIAGE, CONFORMANCE, and the relevant area report;
3. read the affected subsystem before editing;
4. implement **one coherent change**;
5. run focused tests, then broader verification where appropriate;
6. commit the completed change immediately;
7. when direct-to-`main` work is authorised, push that verified checkpoint immediately;
8. update this file with the completed checkpoint and exact next action;
9. repeat.

Do not accumulate several completed fixes waiting for one giant final commit.

If another agent moves `main`, compare the commits since the recorded starting SHA. Do not repeatedly refresh/re-read the whole repository. Reconcile only overlapping files/behaviour and never force-push over other work.

If the tool/session begins degrading, stop optional exploration and checkpoint completed work first.

---

## 5. Exact next work: remaining Wave 1 enforcement

### Completed Wave 1 baseline

- **CFG-01 — CI:** fixed in `081a7d9` and verified by green run `34337559585`.
- **CFG-02 — terminating tests:** fixed in `8b741f5` and verified inside the same CI run.

The workflow currently runs:

- `npm ci`;
- `npm run lint`;
- `npm test`;
- `npm run build`;
- `npm run validate:apps`.

`node scripts/check-assets.js` is intentionally not a required CI gate yet because the audit already records known asset/catalogue failures and CFG-06. Add it when those known failures are resolved.

### NEXT atomic task — Wave 1C mechanical enforcement

Follow `docs/code-audit/TRIAGE.md` and `CONFORMANCE.md`.

1. Add **Prettier** and a terminating `prettier --check` CI gate in a small, reviewable change. Do not mix the dependency/setup commit with a repository-wide formatting sweep unless explicitly justified.
2. Add the precise P10 in-place-mutation and P2 duplicate-basename checks as deterministic CI gates, validating the commands against the current tree before enabling them.
3. Resolve XC-03 (`components` <-> `features` cycle) before enabling `eslint-plugin-import` / `no-restricted-paths`; do not introduce a permanently red architecture gate.
4. Re-enable `react-hooks/set-state-in-effect` as a warning only after APP-08 is resolved.

Do not skip straight to theme or feature work until the remaining Wave 1 enforcement decision is deliberately completed or deferred with a recorded reason.

---

## 6. What comes after Wave 1

Follow `docs/code-audit/TRIAGE.md`; do not invent a new ordering without a reason.

Current sequence is broadly:

1. remaining CI/testing/enforcement;
2. theme-system root causes;
3. live user-facing defects;
4. source-of-truth/architecture consolidation;
5. repository weight and hygiene;
6. structural decomposition/testing work;
7. consistency/polish.

Important known later items include:

- the third backup implementation in Everything Map;
- local/UTC event-time handling;
- broken catalogue links;
- daily-metric double counting on re-import;
- non-persisting Dexie adapter scaffolding;
- misleading/silent UI behaviour;
- unresolved scaffolding and duplicate `LifeArea` vocabularies;
- duplicate Platform CRUD APIs;
- Archive/catalogue duplication;
- dangling gitlinks without `.gitmodules`;
- committed `.bak`/generated build artefacts;
- large functions and calculations stranded in components;
- `components` <-> `features` dependency cycle;
- untested critical paths.

The detailed IDs, severity, evidence, and recommended order live in TRIAGE and the area reports.

---

## 7. Verification expectations

Never write "tests passed" unless they were actually run in the current change context.

Baseline CI now provides automatic verification for every push to `main` and pull request. Depending on the files changed, focused local/agent checks should still run before the push where possible.

Current baseline CI checks:

- `npm run lint`;
- `npm test` (`vitest run`);
- `npm run build`;
- `npm run validate:apps`.

Future checks should include `node scripts/check-assets.js` once the known failures are corrected, plus the mechanical conformance gates described in Wave 1C.

If a command is broken or unavailable, record that as a blocker instead of silently skipping it.

When a code-audit finding is resolved, update its checkbox/status and the appropriate rollups. The audit should remain an executable to-do list, not stale history.

---

## 8. Definition of the next safe stopping point

A coding session should stop only at a durable checkpoint whenever possible:

- completed code is committed;
- authorised work is pushed;
- relevant tests have actually been run;
- audit docs reflect resolved findings;
- this file says what changed and exactly what comes next.

If a session is interrupted despite that, the next agent should be able to resume from git + this file without asking the user to reconstruct the work.
