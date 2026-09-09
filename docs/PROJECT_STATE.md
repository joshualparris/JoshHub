# JoshHub Project State

**Purpose:** durable resume point for humans and AI agents. Read this before starting substantial work so the repository does not have to be rediscovered every session.

**Project:** JoshHub  
**Repository:** `joshualparris/JoshHub`  
**Primary branch:** `main`  
**State date:** 9 September 2026  
**Baseline inspected for this handoff:** `db5a10993c30d3a78d85fa3149b9fed115b0f898`  
**Agent working protocol added:** `d04dcedf0f5ccc88a6bed71cdd3fe3b31b2e87c1`

> This file is a handoff, not a substitute for git. If `main` has advanced, compare the delta from the baseline/last completed checkpoint rather than restarting the whole audit.

---

## 1. Current overall state

JoshHub is **buildable again and part-way through a formal stabilisation/audit**, but it does **not yet conform** to the agreed engineering principles.

The current code audit records:

- **93 findings total**
- **3 fixed audit findings**
- **90 open findings**
- open severity rollup: **2 Critical, 19 High, 46 Medium, 23 Low**
- 30 route files and 6 components still await a full line-by-line read for file-specific issues

The source of truth for those numbers is `docs/code-audit/README.md`. Recalculate rather than copying these numbers forward after findings are resolved.

### Completed stabilisation already recorded by the audit

- `3c0bf78` — repaired the widespread `ms` -> `care2` corruption and restored the build.
- `e94e809` — fixed the canonical backup system so omitted tables, destructive Platform restores, and incomplete reset behaviour are covered.
- `ead6146` — labelled dashboard example figures and fixed the known dashboard live-query mutation/hydration issues.
- `db5a109` — added the conformance scorecard and cross-cutting principle sweep.
- `d04dced` — added `AGENTS.md`, the durable operating protocol for future coding agents.

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

## 5. Exact next work: Wave 1

The current authoritative next step is **Wave 1 — Stop flying blind** from `docs/code-audit/TRIAGE.md`.

### Wave 1A — CFG-01: add CI · Critical

Add CI on push so broken production builds and regressions are visible before deployment. The audit specifies running:

- lint;
- terminating Vitest run;
- production build;
- `validate:apps`;
- `check-assets`.

Do not call this finished until the workflow actually executes successfully.

### Wave 1B — CFG-02: make tests terminate · High

The audit records `npm test` as watch mode. Change the script/CI usage so automated verification exits deterministically.

Until this lands, use a terminating invocation such as `npx vitest run` when verifying work.

### Wave 1C — mechanical enforcement

After the basic CI path works, add the enforcement described by TRIAGE/CONFORMANCE:

- Prettier + `prettier --check` in CI;
- dependency-direction enforcement using `eslint-plugin-import` / `no-restricted-paths` once the existing layer cycle is reconciled;
- precise CI checks for known duplicate-source-of-truth and in-place-mutation patterns;
- restore `react-hooks/set-state-in-effect` as a warning after its blocking finding is fixed.

Do this as small, reviewable commits rather than one sweeping formatting/architecture commit.

---

## 6. What comes after Wave 1

Follow `docs/code-audit/TRIAGE.md`; do not invent a new ordering without a reason.

Current sequence is broadly:

1. CI/testing/enforcement.
2. Theme-system root causes.
3. Live user-facing defects.
4. source-of-truth/architecture consolidation.
5. repository weight and hygiene.
6. structural decomposition/testing work.
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

For a normal stabilisation checkpoint, record the commands that were executed and their result. Depending on the files changed this can include:

- focused Vitest tests;
- `npx vitest run`;
- `npm run lint`;
- `npm run build`;
- `npm run validate:apps`;
- `npm run check-assets`.

If a command is currently broken or unavailable, record that as a blocker instead of silently skipping it.

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
