# Local Project Ecosystem - Audit Action Plan

Prepared: 2026-05-22

## Purpose

This report turns Copilot's local C: drive audit into practical project decisions. It is designed to prevent overwhelm, protect existing work, and focus development time on projects that support employment, IT/MSP capability, Microsoft 365, endpoint support, ticketing, documentation, portfolio value, learning, or daily usefulness.

This document is intentionally planning/documentation only. It does not require production app code changes, deletion, relocation, installs, or risky cleanup commands.

## Current Priority Filter

Prioritise projects that support:

- Practical IT/MSP capability.
- Microsoft 365, endpoint support, ticketing, documentation, and Level 1 / early Level 2 skills.
- Employment readiness, portfolio value, learning value, or daily usefulness.
- Reduced clutter and fewer duplicate or stale projects.
- Clear source repos with healthy Git state.

Downgrade projects that are:

- DCS-specific without strong portfolio transfer value.
- Static builds with no recoverable source.
- Emotionally interesting but professionally low value right now.
- Duplicates, archives, stale experiments, or catalog entries with unclear ownership.

## Project Decision Matrix

| Project name | Path | Type | Professional relevance | Technical health | Git health | Portfolio value | Cleanup urgency | Score /100 | Recommended action | Next action | Risk if ignored |
|---|---|---|---|---|---|---|---|---:|---|---|---|
| Avance Professional Development | `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\02_Personal\Avance` | source repo | High - directly MSP/professional development aligned | High - active Next.js app, documented roadmap; OneDrive and archive clutter remain | Medium - Git repo with 4 modified app files | High | Medium-high | 90 | develop / stabilise | Stabilise the core MSP workflow, review modified files, then implement top TODO itecare2: shift detail pages, work logs, knowledge entries, troubleshooting playbooks | Best MSP-aligned project loses momentum; OneDrive/archive clutter may create build or sync risk |
| JoshHub | `C:\Users\joshua.parris\JoshHub` | source repo + catalog/dashboard with nested subprojects | High - central project inventory and personal OS | Medium-low - active app but mixed lockfiles, stale links, many untracked assets and nested repos | Low - `main` has many modified/deleted/untracked files; local branch ahead/behind origin | High | Very high | 79 | stabilise / consolidate | Commit or stash intentional work, run a nested repo scan, separate source repos from static assets, normalise package manager, audit `src\data\apps.ts` | Central catalog becomes unreliable; nested repos could be damaged by broad cleanup; untracked work may be lost |
| DCSPrep / DCSPD | `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\DCSPrepApp` | source repo | Medium-high - useful training/portfolio bridge, but DCS-specific | Medium-high - clean Next.js app with documented known issues | High - clean `main`, GitHub remote `DCSPD.git` | Medium-high | Medium-high | 79 | stabilise / maintain | Keep as portfolio/training project; move off OneDrive if file locking appears; archive duplicate zip files after backup | Duplicate zips and OneDrive sync issues may create stale copies or build friction |
| Parris Compass / Waypoint | `C:\parris-compass` | source repo | Medium - wellbeing/professional habits value, less direct MSP alignment | High - clean documented Next.js source repo | High - clean `main`, GitHub remote `Waypoint.git` | Medium | Low-medium | 74 | maintain / develop selectively | Treat `parris-compass` as the source of truth for Waypoint; keep scope distinct from JoshHub | May overlap with JoshHub as another dashboard unless purpose boundaries are clear |
| Sylvie Phonics | `C:\Users\joshua.parris\Downloads\Other\Sylvie Phonics\Learning-Path-Engine\Learning-Path-Engine` | source repo | Medium - learning/portfolio potential, not core MSP | Medium-high - active pnpm workspace, but in Downloads | Medium - Git repo with modified and untracked files; only `gitsafe-backup` remote observed | Medium-high | High | 70 | recover / stabilise | Move out of Downloads only after backup and Git verification; confirm stable remote; decide whether it is portfolio or archive | Valuable source remains in a risky location; modified work may become hard to protect |
| Waypoint / AnchorFlow prototype | `C:\waypoint` | source repo / prototype | Low-medium - prototype value, weak current career alignment | Medium-high - clean small Vite app | High - clean `main`, GitHub remote `AnchorFlow.git` | Low-medium | Medium | 57 | archive / ignore | Preserve as prototype only; do not merge into `parris-compass` unless a clear product decision is made | Creates naming confusion with Parris Compass / Waypoint |
| NebulaDice | `C:\Users\joshua.parris\Documents\NebulaDice` | source code, no git | Low-medium - creative/technical value, not current MSP priority | Medium - Python/FastAPI/Rich source with requirements, but unknown runtime health | Low - no Git repo | Medium | Medium | 56 | archive / recover | If preserving, initialise Git or back up; otherwise archive as lower-priority creative project | Source can be lost or diverge from zip/frontend duplicates |
| JoshHub duplicate workspace copy | `C:\Users\joshua.parris\dev\JoshHub` | duplicate / unclear | Low | Low - appears to contain `node_modules` only | Low - no Git repo observed | Low | Medium-high | 23 | ignore / archive | Verify it has no unique source, then mark for deletion/archive outside active repo space | Clutter and false-positive project identity |
| NebulaDice duplicate workspace copy | `C:\Users\joshua.parris\dev\NebulaDice` | duplicate / unclear | Low | Low - frontend folder only, no Git metadata observed | Low | Low | Medium-high | 25 | ignore / archive | Verify it has no unique source, then archive or remove from active workspace | Confuses the true NebulaDice source location |
| PartyAI | `C:\Users\joshua.parris\JoshHub\PartyAI` | nested source repo / subproject inside JoshHub | Low-medium - possible portfolio/AI app value, not core MSP priority | Medium-unclear - has `.git`, `package.json`, and about 22K files, but runtime health not audited | Medium-unknown - nested Git repo, status not yet classified | Medium | Very high | 58 | do not touch yet / recover | Run nested repo Git status and package review before any JoshHub cleanup touches it | Broad JoshHub cleanup could accidentally delete, move, or stage a real nested source repo |
| Serenity / Serenity-Keep-Flying | `C:\Users\joshua.parris\JoshHub\Serenity-Keep-Flying` | nested source repo / subproject inside JoshHub | Low-medium - possible game/portfolio value, not core MSP priority | Medium-unclear - has `.git`, `package.json`, and about 23K files, but runtime health not audited | Medium-unknown - nested Git repo, status not yet classified | Medium | Very high | 58 | do not touch yet / recover | Run nested repo Git status and package review before any JoshHub cleanup touches it | Broad JoshHub cleanup could accidentally delete, move, or stage a real nested source repo |
| Game Fixer | `C:\Users\joshua.parris\JoshHub\Game-Fixer` | static assets / source-unclear | Low-medium | Unclear - about 19K files and no `.git`; source repo not confirmed | Low/unknown - no nested Git repo observed | Low-medium | High | 41 | do not touch yet / archive | Classify as source, static build, or archive before moving or deleting | Static/source-unclear content may be mistaken for disposable clutter or real source |
| JoshHub archive folder | `C:\Users\joshua.parris\JoshHub\archive` | archive / static | Low | Low-unclear - about 84K files and no `.git` | Low/unknown - no Git repo observed | Low | High | 30 | do not touch yet / archive | Inventory at a high level before deciding what belongs outside the active repo | Large archive could hide useful source or greatly bloat JoshHub |
| JoshHub projects folder | `C:\Users\joshua.parris\JoshHub\projects` | workspace / static / unclear | Low-medium | Unclear - about 3K files and no `.git` | Low/unknown - no Git repo observed | Low-medium | Medium-high | 37 | do not touch yet / clarify | Classify each child project before cleanup | Could contain source-like material without Git protection |
| Wilds - Sail West / Wilds variants | inside `C:\Users\joshua.parris\JoshHub` | static build / catalog asset | Low-medium | Unclear - several local game folders observed | Low/unknown | Medium if polished, otherwise low | Medium-high | 42 | consolidate / archive | Group Wilds variants and identify a single kept build/source path | Multiple variants make catalog links stale and cleanup risky |
| Life Dashboard | not confirmed as standalone repo in Copilot excerpt | catalog-only / unclear | Medium if daily-use, lower for employment | Unknown | Unknown | Low-medium | Medium | 45 | do not touch yet / clarify | Check JoshHub catalog/source references before deciding | Could distract from MSP work if treated as a full project without evidence |
| JoshPath | not confirmed as standalone repo in Copilot excerpt | catalog-only / unclear | Unknown | Unknown | Unknown | Unknown | Low-medium | 35 | do not touch yet / clarify | Locate source or catalog entry only after core cleanup | May be stale naming or duplicate concept |

## Scoring Rubric

| Category | Max | High score | Medium score | Low score |
|---|---:|---|---|---|
| Professional relevance now | 20 | Directly supports IT/MSP skills, Microsoft 365, endpoint support, ticketing, documentation, employment, or daily work | Some indirect relevance or possible learning value | Mostly unrelated to current goals, hobby-only, stale, or DCS-specific without strong portfolio value |
| Technical health | 20 | Runs or builds clearly; dependencies are understandable; structure is maintainable; no obvious broken state | Some setup friction, outdated dependencies, unclear scripts, or partial breakage | Broken, missing key files, confusing structure, dead build output, or unknown runtime |
| Evidence of active source code | 15 | Clear source files, project config, recent meaningful edits, and not merely generated output | Some source exists but is mixed with builds, exports, or unclear duplicates | Static build only, generated files only, catalog entry only, or source missing |
| Clarity of purpose | 15 | Goal, audience, and next use are obvious from files/docs/audit evidence | Purpose is partly clear but needs documentation or consolidation | Unclear why it exists, what it does, or whether it is still needed |
| Ease of next action | 10 | A useful next step can be completed in 30 minutes | Next step is possible but needs setup, verification, or decisions first | Next step is blocked by missing source, unclear ownership, risky state, or duplicate confusion |
| Portfolio or learning value | 10 | Demonstrates practical employable skills or can become a strong portfolio artifact | Useful for learning but not clearly portfolio-ready | Low learning value, outdated, generic, or not worth showcasing |
| Cleanup urgency | 10 | Creates clutter, risk, duplicate confusion, stale references, or backup uncertainty | Some clutter or uncertainty but not harmful | Low urgency; safe to leave alone for now |

Score bands:

| Total score | Interpretation |
|---:|---|
| 80-100 | Strong candidate for active work. Develop or stabilise. |
| 60-79 | Worth keeping, but define a narrow next action. |
| 40-59 | Hold, archive, consolidate, or recover depending on evidence. |
| 0-39 | Likely low priority unless there is hidden emotional, legal, or backup value. |

## Decision Rules

- If professional relevance is high but technical health is low, stabilise before adding features.
- If professional relevance is high and technical health is high, consider it for the top active workstreacare2.
- If a project is duplicate and low relevance, archive after backup.
- If a project is duplicate but high relevance, consolidate only after identifying the true source folder.
- If a project is catalog-only but high value, recover or clone the source before making decisions.
- If a project is in Downloads but valuable, move it only after backup and Git checks.
- If a project has no Git repo but meaningful source code, initialise or connect Git only after confirming it is the correct copy.
- If a project has dirty Git state, inspect changes before backup, move, archive, or deletion.
- For JoshHub specifically, do not run broad `git add -A`, delete, move, or archive untracked folders until nested Git repositories are identified.
- If a project is static build only, do not treat it as the source of truth unless source cannot be recovered.
- If a project is DCS-specific and no longer central to employment, downgrade priority unless portfolio value is strong.
- If a project supports Microsoft 365, endpoint support, ticketing, documentation, automation, asset tracking, or MSP workflows, increase priority.
- If a project is emotionally interesting but professionally low-value, place it on the Do Not Touch Yet list.
- If a project has unclear purpose, unclear source, or unclear ownership, do not delete or move it until verified.
- If two projects overlap in purpose, keep the one with better Git health, clearer source, stronger relevance, and easier next action.
- If a project cannot be explained in one sentence after review, add a documentation task before development work.

## JoshHub Nested Repo Safety Step

Before any JoshHub cleanup, run a nested project classification pass:

- List all folders under `C:\Users\joshua.parris\JoshHub` that contain `.git`.
- List all folders under `C:\Users\joshua.parris\JoshHub` that contain `package.json`.
- Classify each found folder as `source repo`, `nested source repo`, `static asset`, `archive`, or `unclear`.
- Record Git status separately for the JoshHub root repo and each nested Git repo.
- Do not delete, move, archive, or broad-stage untracked folders until this classification is complete.

Known updated evidence:

- `PartyAI` has `.git`, `package.json`, and about 22K files, so it is a nested source repo/subproject inside JoshHub.
- `Serenity-Keep-Flying` has `.git`, `package.json`, and about 23K files, so it is a nested source repo/subproject inside JoshHub.
- `archive` has about 84K files and no `.git`, so treat it as archive/static until proven otherwise.
- `Game-Fixer` has about 19K files and no `.git`, so treat it as static assets or source-unclear.
- `projects` has about 3K files and no `.git`, so treat it as workspace/static/unclear.

## Recommended Top 5 Workstreacare2

### 1. Avance Professional Development

Why this matters now:

Avance is the clearest match for current professional goals. It is explicitly MSP-oriented, has a roadmap, and can become both a learning system and a portfolio artifact for practical support capability.

Evidence from audit:

- Real Git repo at `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\02_Personal\Avance`.
- Remote: `https://github.com/joshparri/AvanceProfessionalDevelopment.git`.
- Has `README.md`, `TODO.md`, `VISION.md`, active source under `app/`, and `app/package.json`.
- Stack: Next.js 16, React 19, Tailwind, Dexie.
- Modified files: `app/src/app/learning-cockpit/page.tsx`, `app/src/app/care2p-quiz/page.tsx`, `app/src/components/Dashboard.tsx`, `app/src/contexts/dark-mode.tsx`.
- Risk itecare2: source stored in OneDrive; `app.zip` build/archive copy at repo root.

First 30-minute task:

Review the four modified files and write a short commit plan: keep, split, or revert by intention.

First 2-hour task:

Stabilise the MSP workflow: fix navigation/route issues, then implement one missing MVP feature from `TODO.md`, preferably work logs or troubleshooting playbooks.

What to avoid:

Do not add broad new feature scope until the core MSP workflow is stable and the archive/build clutter is handled.

Definition of done:

Repo state is understood, major changes are committed or intentionally deferred, and one MSP workflow can be demonstrated end-to-end.

### 2. JoshHub

Why this matters now:

JoshHub is the central project dashboard and catalog. If it stays messy, every future decision becomes harder because the inventory itself is unreliable.

Evidence from audit:

- Real Git repo at `C:\Users\joshua.parris\JoshHub`.
- Remotes: `origin` at `https://github.com/joshualparris/JoshHub.git`; `care2pquest` backup at `https://github.com/joshuaparris-max/MSPQuest.git`.
- Active Next.js 16 / React 19 / Tailwind 4 / Dexie app.
- Current worktree has many modified files, deleted files, and untracked folders.
- Mixed package managers: `package-lock.json` and `pnpm-lock.yaml`.
- Catalog source: `src/data/apps.ts`.
- Stale local `file://` references found in app catalog entries.
- Updated nested repo evidence: `PartyAI` and `Serenity-Keep-Flying` each have `.git` and `package.json`, so they are nested source repos/subprojects rather than static assets.
- Other large untracked folders require classification: `archive` has about 84K files and no Git, `Game-Fixer` has about 19K files and no Git, and `projects` has about 3K files and no Git.

First 30-minute task:

Run a nested repo scan first: list all folders under JoshHub containing `.git`, list all folders containing `package.json`, then classify each as source repo, nested source repo, static asset, archive, or unclear.

First 2-hour task:

Create a cleanup branch that documents the nested repo classification, updates `src/data/apps.ts` only where source-of-truth evidence is clear, and moves static/game/archive decisions into a documented backlog.

What to avoid:

Do not use broad `git add -A`, delete, move, or archive untracked folders until nested Git repositories are identified and protected. Do not add new catalog scope before stale links and source-of-truth entries are cleaned.

Definition of done:

JoshHub has a documented source-of-truth catalog, package manager choice is clear, nested repos are listed separately from root app assets, and static/archive folders are intentionally tracked or marked for later archive.

### 3. DCSPrep / DCSPD

Why this matters now:

DCSPrep remains useful as a training and portfolio bridge, especially for demonstrating structured app work. It should not overtake Avance, but it is healthy enough to keep.

Evidence from audit:

- Real Git repo at `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\DCSPrepApp`.
- Remote: `https://github.com/joshualparris/DCSPD.git`.
- Clean `main` branch.
- Stack: Next.js 14, React 18, Tailwind 3, Zustand.
- Has `README.md`, `KNOWN_ISSUES.md`, and `toDOlist.md`.
- `KNOWN_ISSUES.md` warns against OneDrive file locking.
- Duplicate zip files exist: `DCSPrepApp.zip`, `DCSPrepApp (2).zip`, `DCSPDTimeManagement.zip`.
- Potential sensitive file present: `.env.local`; no secret values were read.

First 30-minute task:

List duplicate zip/archive files and confirm the current source folder is the only active source of truth.

First 2-hour task:

Move or clone the repo into a safer dev workspace if OneDrive causes friction, then update README setup notes.

What to avoid:

Do not expand DCS-specific features ahead of MSP-aligned Avance work.

Definition of done:

Clean source repo is preserved, duplicate archives are documented, and OneDrive risk is either accepted or removed.

### 4. Parris Compass / Waypoint

Why this matters now:

Parris Compass is a real, clean source repo with a clear product identity. It has value as a wellbeing/professional habits app, but it should not blur into JoshHub's project-dashboard role.

Evidence from audit:

- Real source repo at `C:\parris-compass`.
- Remote: `https://github.com/parristechservices-prog/Waypoint.git`.
- Clean `main` branch.
- Stack: Next.js 14, React 18, Tailwind 3, Drizzle.
- `C:\waypoint` is a different smaller Vite app with remote `AnchorFlow.git`.

First 30-minute task:

Write a one-paragraph boundary note: what belongs in Parris Compass vs what belongs in JoshHub.

First 2-hour task:

Review the app's current routes/docs and identify one maintenance improvement that preserves its identity without broad new scope.

What to avoid:

Do not merge the `waypoint` prototype into `parris-compass` until product ownership is clear.

Definition of done:

Parris Compass remains the source of truth for Waypoint, and the smaller `waypoint` prototype has a clear archive or experiment label.

### 5. Sylvie Phonics

Why this matters now:

Sylvie Phonics appears to be a real source repo and may have creative/portfolio value, but its current location in Downloads makes it fragile.

Evidence from audit:

- Real Git repo at `C:\Users\joshua.parris\Downloads\Other\Sylvie Phonics\Learning-Path-Engine\Learning-Path-Engine`.
- Uses a pnpm workspace structure.
- Modified package/docs files and untracked docs/content exist.
- Remote observed: `gitsafe-backup` only.

First 30-minute task:

Check Git status and remote configuration, then decide whether it is actively kept, archived, or converted into a portfolio project.

First 2-hour task:

Back up the repo, then move it out of Downloads into a proper dev workspace and verify it still builds/runs.

What to avoid:

Do not let it displace Avance or JoshHub cleanup unless it becomes a defined portfolio deliverable.

Definition of done:

Source is out of Downloads, backed by a stable remote, and assigned either active-secondary or archive status.

## Cleanup Plan

### Phase 1: Document and verify

Goal: understand before acting.

- Keep this report as the decision record.
- Confirm source repos versus static builds.
- Mark unclear folders as `unclear`, not disposable.
- Record duplicate candidates.
- Record stale paths and catalog-only entries.
- Identify projects with missing source, missing Git, or dirty Git.
- For JoshHub, run the nested repo scan before classifying untracked folders as clutter.
- Write a one-sentence purpose for each major project.

Output:

- Completed decision matrix.
- Initial score for each project.
- List of unclear or risky itecare2.

### Phase 2: Backup and Git safety

Goal: prevent accidental loss.

- Confirm which folders are true source folders.
- Check Git status before moving, archiving, or consolidating.
- In JoshHub, check Git status separately for the root repo and for nested repos such as `PartyAI` and `Serenity-Keep-Flying`.
- Back up valuable source folders before structural cleanup.
- Preserve uncommitted work until reviewed.
- Note projects with no remote, missing remote, or unknown Git history.
- Do not delete generated builds until source is verified.

Output:

- Backup status noted.
- Git health documented.
- Risky projects moved to Do Not Touch Yet if needed.

### Phase 3: Consolidate duplicates

Goal: reduce clutter without losing source.

- Group duplicate projects by name, purpose, and path.
- Pick one source of truth per duplicate set.
- Prefer the copy with active source, better Git health, clearer structure, and stronger relevance.
- Mark stale builds, exports, and old copies for archive.
- Keep a short consolidation note explaining what was kept and why.

Output:

- Duplicate map.
- Source-of-truth decision.
- Archive candidate list.

### Phase 4: Fix stale paths and catalog entries

Goal: make project references trustworthy.

- Review launchers, dashboards, README links, catalog files, shortcuts, scripts, and docs.
- Mark dead paths.
- Update only after confirming source location.
- Remove or archive catalog entries for projects that no longer exist.
- Add recovery tasks for high-value catalog-only projects.
- Add missing active repos to JoshHub only after the dirty repo state is controlled.

Output:

- Stale path list.
- Catalog repair list.
- Recovery list.

### Phase 5: Prioritise development work

Goal: choose what deserves active energy.

- Use Avance as the main MSP/professional development project.
- Stabilise JoshHub before making it a larger app portal.
- Keep DCSPrep as a training/portfolio app without letting it overtake Avance.
- Maintain Parris Compass with a clear boundary from JoshHub.
- Treat Sylvie Phonics as a secondary portfolio/creative project once safely relocated.

Output:

- Top 5 workstreacare2.
- First action for each.
- Deferred projects list.
- Archive/consolidation queue.

## Do Not Touch Yet List

| Project name | Path | Reason to pause | Risk type | Evidence needed | Revisit trigger |
|---|---|---|---|---|---|
| JoshHub working tree | `C:\Users\joshua.parris\JoshHub` | Many modified, deleted, and untracked files, including nested repos | Data loss / Git confusion / nested repo damage | Change-by-change classification and nested repo scan | Before any broad cleanup, staging, delete, move, archive, or package-manager change |
| PartyAI | `C:\Users\joshua.parris\JoshHub\PartyAI` | Nested source repo inside JoshHub with `.git`, `package.json`, and about 22K files | Accidental deletion / source loss / accidental broad staging | Nested repo Git status, package review, source purpose | Before any JoshHub cleanup touches untracked folders |
| Game Fixer | `C:\Users\joshua.parris\JoshHub\Game-Fixer` | About 19K files and no `.git`; static assets or source-unclear | Source-of-truth confusion | Find source repo or confirm static-only status | During JoshHub catalog cleanup |
| Serenity-Keep-Flying | `C:\Users\joshua.parris\JoshHub\Serenity-Keep-Flying` | Nested source repo inside JoshHub with `.git`, `package.json`, and about 23K files | Accidental deletion / source loss / accidental broad staging | Nested repo Git status, package review, source purpose | Before any JoshHub cleanup touches untracked folders |
| JoshHub archive folder | `C:\Users\joshua.parris\JoshHub\archive` | Large archive/static folder with about 84K files and no `.git` | Bloat / accidental source loss if misclassified | High-level inventory and confirmation no unique source exists | During JoshHub archive/static cleanup |
| JoshHub projects folder | `C:\Users\joshua.parris\JoshHub\projects` | Workspace/static/unclear folder with about 3K files and no `.git` | Source-of-truth confusion | Child folder classification and package/source scan | During JoshHub nested project classification |
| Wilds variants | inside `C:\Users\joshua.parris\JoshHub` | Multiple variants observed | Duplicate confusion | Decide source-of-truth build/source path | During JoshHub game asset consolidation |
| Life Dashboard | unknown / catalog-only from current evidence | No standalone source confirmed in Copilot excerpt | Scope creep / stale catalog | Locate repo or catalog entry | After JoshHub catalog cleanup begins |
| JoshPath | unknown / catalog-only from current evidence | No standalone source confirmed in Copilot excerpt | Scope creep / stale catalog | Locate repo or catalog entry | After higher-priority projects are stabilised |
| NebulaDice duplicate | `C:\Users\joshua.parris\dev\NebulaDice` | Duplicate/no Git observed | Duplicate confusion | Confirm no unique source | During duplicate cleanup phase |
| JoshHub duplicate | `C:\Users\joshua.parris\dev\JoshHub` | Duplicate/no Git observed | Duplicate confusion | Confirm no unique source | During duplicate cleanup phase |
| DCSPrep `.env.local` | `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\DCSPrepApp\.env.local` | Potential sensitive config file | Secret hygiene | Confirm ignored and not committed; do not read values unnecessarily | During DCSPrep Git hygiene review |

## Duplicate, Stale Path, and Broken Link Findings

- `JoshHub` catalog contains local `file://` paths, including references to old La Trobe / OneDrive desktop project locations.
- `JoshHub` does not appear to catalog `Avance` or `parris-compass`, even though both are active local repos.
- `DCSPrepApp` has multiple zipped copies and `.next-dev` logs in or near the root.
- `Avance` has `app.zip` at the repo root, likely duplicating build/archive output.
- `dev\JoshHub` and `dev\NebulaDice` appear to be duplicate working directories without Git metadata.
- `waypoint` and `parris-compass` are not the same repo: `parris-compass` is the main Waypoint source, while `waypoint` is a smaller Vite/AnchorFlow prototype.
- `PartyAI` and `Serenity-Keep-Flying` are nested source repos/subprojects inside JoshHub because both contain `.git` and `package.json`.
- `Game-Fixer` has about 19K files and no `.git`; treat it as static assets or source-unclear until source is confirmed.
- `archive` has about 84K files and no `.git`; treat it as archive/static until proven otherwise.
- `projects` has about 3K files and no `.git`; treat it as workspace/static/unclear until child folders are classified.
- `Wilds` folders inside JoshHub should be treated as local hosted/static assets until source repos are confirmed.

## Git and Repository Health Summary

| Project | Branch | Remote | Status summary | Concern |
|---|---|---|---|---|
| JoshHub | `main` | `origin` GitHub plus `care2pquest` backup | Many modified/deleted/untracked files; local branch reported ahead and behind origin | Highest cleanup risk; do not broad-stage; nested repos must be classified first |
| PartyAI | unknown | nested `.git` present | Nested source repo/subproject inside JoshHub with `package.json` and about 22K files | Do not touch until nested repo Git status is inspected |
| Serenity-Keep-Flying | unknown | nested `.git` present | Nested source repo/subproject inside JoshHub with `package.json` and about 23K files | Do not touch until nested repo Git status is inspected |
| Avance Professional Development | `main` | GitHub `AvanceProfessionalDevelopment.git` | 4 modified app files | OneDrive location and root archive/build clutter |
| DCSPrep / DCSPD | `main` | GitHub `DCSPD.git` | Clean | OneDrive file-locking risk documented |
| Parris Compass / Waypoint | `main` | GitHub `Waypoint.git` | Clean | Purpose overlap with JoshHub unless boundaries stay clear |
| Waypoint / AnchorFlow prototype | `main` | GitHub `AnchorFlow.git` | Clean | Lower-priority prototype; naming overlap |
| Sylvie Phonics | `main` | `gitsafe-backup` observed | Modified package/docs files plus untracked docs/content | Stored in Downloads; remote/backups need confirmation |
| NebulaDice | none observed | none observed | Source code without Git | Needs Git or archive decision if preserved |

## Security and Secrets Hygiene

- Potential sensitive file observed: `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\DCSPrepApp\.env.local`.
- No secret values were read or exposed.
- `Sylvie Phonics` contains `.npmrc` and `.replit`; these may contain configuration and should be reviewed carefully without publishing secrets.
- Primary hygiene risks are OneDrive sync behaviour, local environment files, untracked assets, and stale catalog links.

## Final Ranked List

1. Avance Professional Development - main MSP/professional development priority.
2. JoshHub - highest cleanup risk and central project inventory.
3. DCSPrep / DCSPD - useful portfolio/training project; keep stable.
4. Parris Compass / Waypoint - maintain with clear boundaries.
5. Sylvie Phonics - secondary project after relocation/backup.
6. PartyAI - nested source repo inside JoshHub; protect first, evaluate later.
7. Serenity-Keep-Flying - nested source repo inside JoshHub; protect first, evaluate later.
8. Waypoint / AnchorFlow prototype - preserve or archive as experiment.
9. NebulaDice - archive or initialise Git if worth preserving.
10. Game Fixer - static assets or source-unclear; classify before archive.
11. Wilds variants - catalog/static asset cleanup only unless source repo is found.
12. JoshHub archive folder - large archive/static folder; inventory before moving.
13. JoshHub projects folder - workspace/static/unclear; classify child folders.
14. dev workspace duplicate JoshHub - verify and archive/ignore.
15. dev workspace duplicate NebulaDice - verify and archive/ignore.

## Immediate Next Actions

1. Use this report as the decision layer for Copilot's audit evidence.
2. Do not modify or delete project folders until Git status and backups are confirmed.
3. Stabilise JoshHub's Git state before adding new catalog features.
4. Keep Avance as the primary development target for MSP capability.
5. Move or back up Sylvie Phonics only after confirming its Git state and remote.
6. Before JoshHub cleanup, run the nested repo scan and protect `PartyAI` and `Serenity-Keep-Flying` as nested source repos.
7. Put unclear/static/duplicated projects into Do Not Touch Yet until source-of-truth evidence exists.

## Observed Evidence vs Interpretation

Observed evidence:

- Avance is a Git repo with README, TODO, VISION, app package metadata, and modified source files.
- JoshHub is an active Next.js repo with a catalog source file, many untracked folders, and mixed lockfiles.
- PartyAI and Serenity-Keep-Flying are nested source repos/subprojects inside JoshHub because both contain `.git` and `package.json`.
- JoshHub `archive`, `Game-Fixer`, and `projects` do not have `.git` in the updated evidence and should be classified as archive/static/source-unclear before cleanup.
- DCSPrepApp is a clean Git repo with README, known issues, todo notes, and OneDrive path warnings.
- `parris-compass` is the main Waypoint repo; `waypoint` is a different Vite React app.
- Sylvie Phonics is a Git repo in Downloads with a pnpm workspace and modified files.
- NebulaDice is source code with Python project files, but no Git repo was observed.

Interpretation:

- Avance should be the highest professional priority because it is MSP-oriented and already in active development.
- JoshHub should be stabilised early because it is the central inventory and has the riskiest Git/worktree state.
- PartyAI and Serenity-Keep-Flying should be protected during JoshHub cleanup because nested repos can be damaged by broad staging, deletion, moving, or archiving.
- DCSPrep should remain a useful training/portfolio app, but not outrank Avance.
- Parris Compass is worth maintaining, but its role should stay distinct from JoshHub.
- Sylvie Phonics is worth protecting if kept, but should move out of Downloads after backup and Git checks.
- NebulaDice and duplicate dev folders are lower priority unless preserving them has specific portfolio or personal value.
