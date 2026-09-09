# JoshHub Project State

**Purpose:** durable resume point for humans and AI agents. Read this before substantial work so JoshHub is resumed from evidence instead of rediscovered from memory.

**Project:** JoshHub  
**Repository:** `joshualparris/JoshHub`  
**Primary branch:** `main`  
**State date:** 9 September 2026  
**Baseline for the current ChatGPT corrective session:** `10c98e778b5805d2bd4d608af220073467f4d9dc`  
**Current corrective work:** PR #10, `chatgpt/fix-antigravity-corrections`

> Git is authoritative. If `main` has advanced, compare the delta from the baseline above. Do not restart the audit merely because another agent committed in parallel.

---

## 1. Current truth

JoshHub is buildable and protected by a real GitHub Actions CI pipeline, but it is **not globally conformant with all 18 engineering principles**.

The current CI workflow runs these as blocking checks on pushes to `main` and pull requests:

- `npm run format:check`
- `npm run lint`
- `npm test` (`vitest run`, terminating)
- `npm run build`
- `npm run validate:apps`
- `npm run check:mutation`
- `npm run check:conflict-markers`
- `npm run check:assets`
- `npm run check:duplicate-modules`

The old statements that `npm test` is watch mode, that `check:assets` is advisory, or that the dependency rule is only a warning are stale and must not be repeated.

### Audit rollup warning

`docs/code-audit/README.md` and several older area reports have not been reconciled after every 9 September fix. Their finding counts and some individual `Open` labels are therefore historical, not a reliable live rollup. Do not copy those counts into a new status report without re-counting the report headings after reconciliation.

`docs/code-audit/CONFORMANCE.md` remains the definition of done for each principle; this file records the current operational resume point.

---

## 2. Important completed checkpoints

These are landed work and should not be reimplemented from memory.

### Safety, CI and agent protocol

- `3c0bf78` — repaired the widespread `ms` -> `care2` corruption and restored the build.
- `e94e809` — repaired canonical backup/reset behaviour and added destructive-data tests.
- `ead6146` — labelled dashboard example values and fixed known dashboard mutation/hydration issues.
- `d04dced` — added `AGENTS.md`.
- `7e99a44` — added this durable handoff.
- `689ed32` — made Copilot/AI instructions resume from the durable protocol/state.
- `8b741f5` — made `npm test` terminating and retained `npm run test:watch` for deliberate watch mode.
- `081a7d9` — added baseline GitHub Actions CI.
- `004aaf7` — introduced blocking formatting, mutation, duplicate-module and conflict-marker gates.
- `7dd79cc` — introduced `import/no-restricted-paths` as a blocking dependency-direction rule.

### Theme, inputs, time and data flow

- `492eb54` + merge `e0d569d` — fixed the Tailwind/theme root causes, semantic colour tokens and uncovered dark-mode views.
- `1881aae` — centralised tag/comma/URL validation, moved app pins into backed-up Dexie state, removed render-time Recent storage reads, made unknown status safe, removed invented family defaults and made Capture validation visible.
- `02806ad` — made calendar time persistence/conversion and ICS parsing explicit and tested, including visible calendar validation.
- `385dac0` — moved Care behind its feature boundary, removed duplicated timezone conversion, added Care logic tests and visible validation.
- `6119192` — unified task grouping and Platform write paths, removed duplicate direct Platform CRUD and stopped task/review query-result mutation.

### Source-of-truth, layering and catalogue integrity

- `8e46de0` + `fcdfa54` — removed Everything Map's duplicate backup format and routed it through canonical data flows.
- `3b6bbf1` — removed the redundant app-level `care-client.tsx` wrapper; it did **not** create the duplicate-module CI gate.
- `3631931` — closed the remaining `components` <-> `features` reverse import cycle and cleaned code-quality lints.
- `f47baf4` — removed/disabled dishonest missing catalogue destinations rather than inventing placeholder assets.
- `c2f1f2f` — made `check:assets` blocking again after catalogue integrity was repaired.
- `b6cbc7f` — expanded the engineering standard from 15 to 18 principles.

### Antigravity corrective history

- `6da5fff` — improved prompt-template storage corruption handling, extracted CSV parsing/Zod validation, added tests, and corrected P2/P14 attribution.
- Independent review then found two remaining defects in that checkpoint:
  1. a failed prompt-template load still left Save enabled against the editor's empty initial value, so a user could overwrite corrupt stored data with `[]`;
  2. the hand-written CSV parser was described as RFC-4180 compliant more strongly than its syntax checks and line tracking justified.
- PR #10 is the corrective checkpoint for those remaining defects plus the stale agent/audit state they exposed.

---

## 3. Settled engineering decisions

### Understand before changing

Record one starting SHA, read the owning subsystem, trace callers/data flow, and compare concurrent changes before pushing. Do not use blind repository-wide replacement.

### One source of truth

- apps catalogue: `src/data/apps.ts`
- IndexedDB/Dexie persistence: `src/lib/db`
- supported backup/reset/import: canonical DB backup contract, not screen-specific formats
- prompt-template runtime shape: one shared schema/parser under `src/lib/learn/prompt-templates.ts` once PR #10 lands

### Dependency direction

The enforced hierarchy is:

`app -> features -> components -> lib -> data`

The former reverse `components` -> `features` cycle is already closed. `import/no-restricted-paths` is an error in CI; do not describe P14 enforcement as pending.

### Data boundaries

Invalid storage, files, URLs, imported content and other external data must be validated before domain logic/persistence uses it. Expected user-input failures may become explicit structured results for the UI; unexpected programming errors must not be silently swallowed.

### Destructive-data invariant

For supported backups:

> Export -> wipe -> import must reproduce all user-owned persisted state represented by that backup version.

A green build alone is never proof of persistence safety.

### UI honesty

Do not render controls that imply a capability that does not exist. Remove or clearly disable placeholders rather than presenting them as functional.

---

## 4. Current corrective checkpoint (PR #10)

PR #10 fixes the remaining mistakes discovered in the Antigravity checkpoint:

- prompt-template load failure now locks editing/saving so corrupt IndexedDB content cannot be overwritten by the editor's initial state;
- prompt-template schema validation is shared by editor and repository rather than duplicated;
- the repository validates again before persistence so future callers cannot bypass the boundary invariant;
- CSV parsing rejects ambiguous quote syntax, validates header uniqueness/column counts, preserves arbitrary metadata values, and reports physical source lines after multiline records;
- FileReader failures are surfaced explicitly;
- the CSV preview uses the canonical shared `Input` component;
- the non-functional `Export Merged JSON` button is removed rather than pretending to work;
- regression tests cover malformed quotes, multiline line reporting, duplicate/blank headers, wrong field counts, whitespace preservation and invalid prompt-template persistence;
- agent instructions are updated to the actual terminating test command and current blocking CI gates.

Do not mark this checkpoint complete until PR CI is green and the final `main` SHA is recorded here.

---

## 5. Exact next atomic task after PR #10

Return to the stabilisation ordering after this corrective checkpoint.

**Next confirmed live defect:** `DB-07` — activity re-import is not idempotent and can double-count daily metrics.

Before changing it:

1. re-read `AGENTS.md`, this file, `TRIAGE.md`, `CONFORMANCE.md`, and the DB/health-import findings;
2. anchor the then-current `main` SHA;
3. trace the import -> activity write -> daily-metric aggregation path;
4. state the invariant: importing the same source file twice must have the same result as importing it once;
5. add a behavioural regression test with the fix;
6. run the full blocking CI suite before pushing.

Do not restart already-completed theme, asset, calendar, Care, Everything Map backup, duplicate-module or P14 work.

---

## 6. Verification expectations

Before calling a stabilisation checkpoint complete, run or obtain passing CI evidence for all applicable checks:

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

Add focused behavioural tests for the behaviour changed. Record what actually ran; never infer success from a build or deployment alone.

---

## 7. Safe stopping point

A session stops at a durable checkpoint when:

- the coherent change is committed;
- authorised work is on `main`;
- the final `main` CI run is green;
- relevant durable documentation reflects reality;
- the exact next atomic task is written here.

If a session is interrupted, the next agent should be able to resume from git + this file without asking the user to reconstruct the work.
