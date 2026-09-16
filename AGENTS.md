# JoshHub Agent Working Protocol

This file is the standing operating protocol for every AI coding agent working on JoshHub (ChatGPT, Claude, Codex, Antigravity, Copilot, or any other agent).

Its purpose is to prevent context loss, project mixing, unsafe sweeping edits, duplicated architecture, and sessions that do a lot of investigation but finish without landing useful work.

## 1. Anchor the project before editing

At the start of every substantial coding session, explicitly establish:

- **Project:** JoshHub
- **Repository:** `joshualparris/JoshHub`
- **Canonical repository:** `joshualparris/JoshHub`
- **Assurance tier:** Tier 2
- **Branch:** normally `main`
- **Starting commit:** record the exact SHA you began from
- **Goal:** state the concrete task for this session

Do not mix context, assumptions, instructions, files, or decisions from other repositories unless the task explicitly requires it.

## 2. Read the durable project state first

Before rediscovering the repository, read:

1. `codingprinciples.md` — canonical cross-repository engineering standard (v5.1)
2. `AGENTS.md` — this repository-specific working protocol
3. `docs/PROJECT_STATE.md`
4. `docs/code-audit/TRIAGE.md` when choosing stabilisation work
5. `docs/code-audit/CONFORMANCE.md` before claiming repository conformance
6. the relevant area report under `docs/code-audit/`
7. `.github/copilot-instructions.md` for repository-specific conventions

Use git history and these documents to recover settled decisions. Do not make the user repeat decisions that are already recorded.

If a repository-specific instruction conflicts with `codingprinciples.md`, follow the conflict order and blocker protocol in `codingprinciples.md`. Do not silently route around a MUST.

## 3. Understand before changing

The overriding engineering rule is:

> Never optimise for making the diff before understanding the system.

Before changing a subsystem:

- read the files that own the behaviour;
- trace where the data comes from and where it goes;
- search imports/usages before declaring code dead;
- identify the canonical source of truth;
- understand persistence and destructive behaviour before editing it;
- verify whether a suspected duplicate is genuinely duplicate behaviour rather than an unfinished feature.

Do **not** run blind global replacements across the repository. Every changed match must be known to be semantically equivalent. Generated/minified/public build artefacts must not be mechanically edited when the source can be fixed instead.

## 4. Engineering principles

The normative engineering standard is **`codingprinciples.md` v5.1**. It defines MUST / SHOULD / MAY, assurance-tier applicability, the universal safety floor, canonical-repository governance, the agent blocker protocol, verification expectations, and LLM-specific safeguards.

JoshHub is **Tier 2 — durable personal software** because it is actively used and stores persistent personal data in IndexedDB/Dexie.

The existing 18 principles in `docs/code-audit/README.md` remain useful as a **JoshHub-specific audit/checklist** and historical conformance framework. They pre-date v5.1. Do not treat them as a newer or competing universal standard. When the two overlap, `codingprinciples.md` owns the general rule and the audit documents provide repo-specific evidence/checks.

The current dependency direction defined by the audit is:

`app -> features -> components -> lib -> data`

Do not introduce reverse dependencies or a new parallel architecture without an explicit documented decision.

## 5. Sources of truth and known repository rules

- `codingprinciples.md` is the canonical engineering standard.
- `joshualparris/JoshHub` is the canonical repository for JoshHub.
- `src/data/apps.ts` is the canonical apps catalogue.
- Dexie/IndexedDB persistence lives under `src/lib/db`.
- Database schema changes must update schema/versioning/migration behaviour coherently.
- Do not create another backup/export/import implementation when the canonical persistence layer can be reused.
- Do not create a second vocabulary/model for a concept that already has one canonical definition.
- Static/demo/example values must be clearly labelled as such; do not display them in a way that implies they are current user data.

For unused scaffolding, verify references and intent before acting. Prefer making the intended architecture explicit and coherent. Delete code only when it is genuinely obsolete or leaving it would actively mislead future work.

## 6. Data-safety invariants

Destructive or persistence-related work requires behavioural tests before or with the fix.

For backups, the core invariant is:

> Export -> wipe -> import must reproduce all user-owned persisted state represented by the supported backup version.

When changing backup, reset, import, migration, or aggregation logic:

- identify every affected table;
- preserve backwards compatibility where old backup versions are supported;
- test replacement and merge semantics when both exist;
- test non-standard primary keys where relevant;
- never silently drop data that the UI describes as being backed up or reset;
- do not claim safety from a green build alone.

## 7. Work in atomic checkpoints

A substantial session should follow this loop:

1. **Resume** from `docs/PROJECT_STATE.md` and git history.
2. **Sync once** and record the starting SHA.
3. **Read** the relevant subsystem completely enough to understand it.
4. **Implement one coherent change.**
5. **Test that change.**
6. **Commit it immediately.**
7. **Push the verified checkpoint** when the user has authorised direct-to-`main` work.
8. **Update `docs/PROJECT_STATE.md`** with what changed, the new SHA, tests run, and exact next action.
9. Repeat for the next coherent change.

Do not hold several completed fixes until one giant final commit. A tool/session interruption should lose at most the uncommitted portion of the current atomic step.

## 8. Do not repeatedly refresh a moving `main`

Concurrent agents may update `main` while a session is in progress.

Do not respond by repeatedly restarting the audit or re-reading the whole repository.

Instead:

1. record the starting SHA;
2. work from that understood baseline;
3. before pushing, fetch/inspect what changed since the starting SHA;
4. if the remote changes do not overlap the files/behaviour being changed, continue;
5. if they overlap, reconcile only the relevant files and rerun affected tests;
6. never force-push over another agent's work.

A moving branch is a reason to compare deltas, not a reason to rediscover everything.

## 9. Testing and verification

Use the repository's real verification commands and do not confuse deployment success with behavioural correctness.

`npm test` is a terminating `vitest run` command in the current repository. Use the actual current scripts rather than stale audit notes when they disagree.

For each atomic change, run the smallest relevant tests first, then the broader checks needed for confidence. Before declaring a stabilisation checkpoint complete, include applicable checks such as:

- lint;
- terminating Vitest run;
- production build;
- app catalogue validation;
- asset/link checks;
- focused regression tests for the behaviour changed.

Record what actually ran. Do not say tests passed if they were not executed. Green CI is evidence, not proof that runtime/user behaviour is correct.

## 10. Documentation is part of the change

When a fix settles an architectural decision, data invariant, source of truth, or non-obvious constraint, update the relevant durable documentation in the same checkpoint.

When resolving a code-audit finding:

- tick the finding in its area report;
- record the fixing commit SHA;
- update rollups/triage/conformance status when affected;
- update `docs/PROJECT_STATE.md`.

Do not let documentation describe an architecture that the code no longer follows.

## 11. Session interruption and blocker protocol

If tool availability degrades or the session may end unexpectedly:

1. stop optional investigation;
2. finish the smallest safe current edit if possible;
3. run the relevant focused test;
4. commit/push completed work if authorised;
5. update `docs/PROJECT_STATE.md` with the exact resume point.

If the task cannot proceed without violating a MUST, guessing at missing authority, guessing at architecture, or taking an unverified irreversible step, follow `codingprinciples.md §0.5`: stop the affected action, state the blocker, preserve safe work, and continue only independent reversible work.

The desired interruption failure mode is:

> Completed checkpoints are already in GitHub; only the current atomic step remains, and the next agent knows exactly where to resume.

Never leave a long session's completed work uncommitted merely because more work remains.

## 12. Definition of a good JoshHub change

A good change is boring to review:

- small enough to understand;
- explicit about its source of truth;
- preserves user data;
- has predictable dependency direction;
- removes ambiguity rather than adding another abstraction;
- contains tests around destructive or important behaviour;
- documents the reason when future agents could otherwise repeat the mistake;
- reports verification evidence precisely;
- lands as an atomic, verified checkpoint;
- conforms to the Tier 2 requirements and agent overlay in `codingprinciples.md`.
