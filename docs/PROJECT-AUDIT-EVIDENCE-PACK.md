# Local Project Evidence Pack — Read-Only Verification

## Executive Snapshot

| Project | Path | Source of Truth? | Git Status | Risk Level | First Safe Action |
|---------|------|------------------|-----------|-----------|-------------------|
| Avance Professional Development | OneDrive/02_Personal/Avance | Yes | dirty (4 modified) | Medium | Commit or stash app changes |
| JoshHub | `C:\Users\joshua.parris\JoshHub` | Yes | dirty (50+ modified) | High | Save git status, do not commit yet |
| DCSPrep / DCSPD | OneDrive/DCSPrepApp | Yes | clean | Medium | Document as portfolio-only, archive zips |
| Parris Compass / Waypoint | `C:\parris-compass` | Yes | clean | Low | Maintain; clarify relationship to C:\waypoint |
| C:\waypoint / AnchorFlow | `C:\waypoint` | No (prototype) | clean | Low | Decide: archive or keep as prototype |
| Sylvie Phonics | Downloads/Learning-Path-Engine | Yes | dirty (modified docs) | Medium | Plan relocation; do not move yet |
| NebulaDice | `C:\Users\joshua.parris\Documents\NebulaDice` | Unclear | no git | Low | Decide: archive or init git |

---

## Project Evidence Sheets

### 1. Avance Professional Development

**Identity**
- **Project name:** Avance Professional Development
- **Exact path:** `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\02_Personal\Avance`
- **Purpose:** Next.js app for MSP professional development, ticket practice, scenario training, and progress evidence logging
- **Source of truth?** Yes

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):** `origin https://github.com/joshparri/AvanceProfessionalDevelopment.git`
- **Latest commit:** `eb0d51b (HEAD -> main, origin/main) Add manual dark mode toggle and Tailwind v4 dark variant`
- **Git status summary:** dirty
- **Modified files:** 4
  - `app/src/app/learning-cockpit/page.tsx`
  - `app/src/app/msp-quiz/page.tsx`
  - `app/src/components/Dashboard.tsx`
  - `app/src/contexts/dark-mode.tsx`
- **Untracked files/folders:** none reported
- **Deleted files:** none

**Package / stack evidence**
- **package.json present?** Yes (`app/package.json`)
- **Framework/stack:** Next.js 16.2.4, React 19.2.4, Tailwind 4, Dexie (IndexedDB), Zod
- **Package manager:** npm (based on `app/package-lock.json`)
- **Conflicting lockfiles?** No
- **Available scripts:**
  - `npm run dev`
  - `npm run build`
  - `npm run start`
  - `npm run lint`

**Repo risk evidence**
- **Large files or archives in root?** Yes — `app.zip` (363,825,927 bytes / ~363 MB)
- **Build output folders present?** Yes — `build/` and `app-checkpoint-msp-pd-slice-working/`
- **Duplicate/static/export folders?** Yes — `archive/`
- **OneDrive location risk?** Yes — Project is on OneDrive; file-locking and sync conflicts are documented in DCSPrep KNOWN_ISSUES.md as a risk
- **Downloads location risk?** No
- **Missing Git risk?** No
- **Local file:// links?** None found in README or main config

**Security hygiene**
- **.env or .env.local?** Not found in root; not read in detail due to secret protection
- **.npmrc or credentials?** Not found in root
- **Tokens or config files?** None found

**Recommended classification**
- **active source repo** requiring stabilisation before feature work

**First safe next action**
- [ ] Run `git status` and decide: commit the 4 app file changes or stash them?
  - If complete and stable: commit with message `chore: app dark mode and learning cockpit updates`
  - If work-in-progress: stash and start fresh on next feature

---

### 2. JoshHub

**Identity**
- **Project name:** JoshHub
- **Exact path:** `C:\Users\joshua.parris\JoshHub`
- **Purpose:** Personal browser-based dashboard for apps, games, projects, tasks, notes, health tracking, and calendar; central app inventory and life dashboard
- **Source of truth?** Yes

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):**
  - `origin https://github.com/joshualparris/JoshHub.git`
  - `mspquest https://github.com/joshuaparris-max/MSPQuest.git`
- **Latest commit:** `faf488a (HEAD -> main, mspquest/main) Add MSP Quest scenario route and scenario metadata`
- **Git status summary:** very dirty
- **Modified files:** 50+
  - Modified app files: `README.md`, `docs/IMPROVEMENTS.md`, `docs/tasks.md`, `next.config.ts`, `package.json`, `package-lock.json`, `src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/data/apps.ts`, `src/lib/**/*.ts`
  - Modified public/game files: multiple game index.html files
- **Untracked files/folders:** many
  - `.tmp.driveupload/`
  - `.vscode/`
  - `Game-Fixer/` (19K+ files, no git)
  - `PartyAI/` (has .git and package.json — is a subproject)
  - `Serenity-Keep-Flying/` (has .git and package.json — is a subproject)
  - `Wilds - Sail West/` (1 file, no git)
  - `archive/` (84K+ files, no git)
  - `projects/` (3K+ files)
  - `docs/Josh Hub - 1. I want Josh hub to.txt` and other orphaned docs
  - `public/games/` various subdirs (game builds, static exports)
  - `public/docs/` static HTML exports
  - `src/app/api/`, `src/app/external/`, `src/app/faith/`, `src/app/finances/`, `src/app/games/`, `src/app/kristy/`, `src/app/life-overview/`, `src/app/studio/dnd/`, `src/app/sylvie/`, `src/app/work/`
  - `src/components/health/`, `src/components/layout/`, `src/components/modules/`
- **Deleted files:** Several
  - `"Josh Hub - 1. I want Josh hub to.txt"` (deleted)
  - `experimental/hugcoach/README.md` (deleted)
  - `public/games/josh-nfc-audio/twa-build/app/build/intermediates/module_bundle/release/buildReleasePreBundle/base.zip` (large deleted file)
  - `public/games/lexicon-journal/Lexicon/UnityCrashHandler64.exe` (large deleted file)
  - `public/games/lexicon/Lexicon/UnityCrashHandler64.exe` (large deleted file)
  - `src/lib/msp-quest/client.ts`, `engine.ts`, `types.ts` (deleted files)

**Package / stack evidence**
- **package.json present?** Yes
- **Framework/stack:** Next.js 16.0.10, React 19.2.1, Tailwind 4, Dexie (IndexedDB), Radix UI, Lucide React, Recharts
- **Package manager:** npm (primary), but also `pnpm-workspace.yaml` present
- **Conflicting lockfiles?** Yes — both `package-lock.json` (332 KB) and `pnpm-lock.yaml` (190 KB) exist
- **Available scripts:**
  - `npm run dev`
  - `npm run dev:webpack` / `npm run dev:turbo`
  - `npm run build`
  - `npm run start`
  - `npm run lint` / `npm run lint:fix`
  - `npm run typecheck` / `npm run typecheck:app`
  - `npm run test`
  - `npm run generate-projects` (inventory script)

**Repo risk evidence**
- **Large files or archives in root?** No large files in root, but many exist in `public/games/`
- **Build output folders present?** Yes — `.next/` (build output)
- **Duplicate/static/export folders?** Yes — many:
  - `archive/` (84K+ files)
  - Game-Fixer, PartyAI, Serenity-Keep-Flying, Wilds - Sail West (untracked, local builds)
  - `public/games/` contains many static game builds
  - `public/docs/` contains static HTML exports
- **OneDrive location risk?** No — local dev folder
- **Downloads location risk?** No
- **Missing Git risk?** PartyAI and Serenity-Keep-Flying subdirs have `.git`, suggesting git submodule potential but not confirmed
- **Local file:// links?** Yes (in catalog)

**Security hygiene**
- **.env or .env.local?** Not found in root
- **.npmrc or credentials?** Not found in root
- **Tokens or config files?** Not found

**Recommended classification**
- **active source repo requiring urgent stabilisation**

**First safe next action**
- [ ] Run `git status --short > joshub-status.txt` and save the output for review
- [ ] Do not commit, push, or stash yet — first stabilisation decision is needed on untracked folders

---

### 3. DCSPrep / DCSPD

**Identity**
- **Project name:** DCS Prep (repo name DCSPD)
- **Exact path:** `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\DCSPrepApp`
- **Purpose:** Next.js professional development app for DCS IT support training, scenario practice, assessment, and progress tracking
- **Source of truth?** Yes

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):** `origin https://github.com/joshualparris/DCSPD.git`
- **Latest commit:** `1ab2a89 (HEAD -> main, origin/main, origin/HEAD) Finish remaining app polish items`
- **Git status summary:** clean
- **Modified files:** 0
- **Untracked files/folders:** 0
- **Deleted files:** 0

**Package / stack evidence**
- **package.json present?** Yes
- **Framework/stack:** Next.js 14.2.35, React 18.2.0, Tailwind 3.4.10, Zustand 4.4.0, Zod 3.21.4, pdf.js
- **Package manager:** npm
- **Conflicting lockfiles?** No — only `package-lock.json`
- **Available scripts:**
  - `npm run dev`
  - `npm run dev:3000`
  - `npm run build`
  - `npm run start`
  - `npm run lint`
  - `npm run test`

**Repo risk evidence**
- **Large files or archives in root?** No
- **Build output folders present?** Yes — `.next/`
- **Duplicate/static/export folders?** Yes — archive folders exist:
  - `DCSPrepApp.zip` (in Documents parent)
  - `DCSPrepApp (2).zip` (in Documents parent)
  - `DCSPDTimeManagement.zip` (696 KB, in root)
- **OneDrive location risk?** Yes — project is on OneDrive; KNOWN_ISSUES.md explicitly warns: "Running app from OneDrive may cause file locking issues"
- **Downloads location risk?** No
- **Missing Git risk?** No
- **Local file:// links?** None found in source

**Security hygiene**
- **.env or .env.local?** `.env.local` file present in root (not read due to secret protection)
- **.npmrc or credentials?** Not found
- **Tokens or config files?** Not found

**Recommended classification**
- **active source repo, portfolio/training use only** (not primary professional priority)

**First safe next action**
- [ ] Confirm git is clean: `git status` (should return no changes)
- [ ] Document this as a "portfolio/training app" in README to clarify it is not your primary MSP project
- [ ] Plan to archive duplicate .zip files outside the repo (but do not delete yet)

---

### 4. Parris Compass / Waypoint

**Identity**
- **Project name:** Waypoint (repo folder name: parris-compass)
- **Exact path:** `C:\parris-compass`
- **Purpose:** Local-first professional growth, wellbeing, and reflection hub; daily anchoring, focused work evidence, downtime readiness loops for IT support, occupational health controls
- **Source of truth?** Yes

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):** `origin https://github.com/parristechservices-prog/Waypoint.git`
- **Latest commit:** `6ce7d63 (HEAD -> main, origin/main, origin/HEAD) Document local app discovery inventory`
- **Git status summary:** clean
- **Modified files:** 0
- **Untracked files/folders:** 0
- **Deleted files:** 0

**Package / stack evidence**
- **package.json present?** Yes
- **Framework/stack:** Next.js 14.2.35, React 18, Tailwind 3.4.1, Drizzle ORM (better-sqlite3), date-fns, Lucide React
- **Package manager:** pnpm (based on `pnpm-lock.yaml`)
- **Conflicting lockfiles?** No
- **Available scripts:**
  - `pnpm dev`
  - `pnpm build`
  - `pnpm start`
  - `pnpm lint`

**Repo risk evidence**
- **Large files or archives in root?** No
- **Build output folders present?** Yes — `.next/`
- **Duplicate/static/export folders?** No
- **OneDrive location risk?** No
- **Downloads location risk?** No
- **Missing Git risk?** No
- **Local file:// links?** None found

**Security hygiene**
- **.env or .env.local?** Not found
- **.npmrc or credentials?** Not found
- **Tokens or config files?** Not found

**Recommended classification**
- **active source repo, stable**

**First safe next action**
- [ ] Confirm git is clean: `git status` (should return no changes)
- [ ] Clarify relationship to C:\waypoint in a comment or separate doc (to avoid confusion between Waypoint main and AnchorFlow prototype)

---

### 5. C:\waypoint / AnchorFlow Prototype

**Identity**
- **Project name:** Waypoint / AnchorFlow (repo remote: AnchorFlow.git)
- **Exact path:** `C:\waypoint`
- **Purpose:** Lightweight Vite/React prototype of anchor-and-trail workflow (unclear if ongoing or abandoned)
- **Source of truth?** No — different from `C:\parris-compass` main Waypoint

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):** `origin https://github.com/parristechservices-prog/AnchorFlow.git`
- **Latest commit:** `b70fd3d (HEAD -> main, origin/main) Initial commit`
- **Git status summary:** clean
- **Modified files:** 0
- **Untracked files/folders:** 0
- **Deleted files:** 0

**Package / stack evidence**
- **package.json present?** Yes
- **Framework/stack:** Vite, React 18.2.0, Tailwind 3.0.0
- **Package manager:** npm (no lockfile present in root, not verified)
- **Conflicting lockfiles?** No
- **Available scripts:**
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

**Repo risk evidence**
- **Large files or archives in root?** No
- **Build output folders present?** No
- **Duplicate/static/export folders?** No
- **OneDrive location risk?** No
- **Downloads location risk?** No
- **Missing Git risk?** No
- **Local file:// links?** None found

**Security hygiene**
- **.env or .env.local?** Not found
- **.npmrc or credentials?** Not found
- **Tokens or config files?** Not found

**Recommended classification**
- **prototype, low priority** (different remote from main Waypoint; initial commit only suggests early-stage experiment)

**First safe next action**
- [ ] Confirm git is clean: `git status` (should return no changes)
- [ ] Decide: archive this folder, keep as throwaway prototype, or merge into `C:\parris-compass`?
- [ ] Document decision in README or project plan

---

### 6. Sylvie Phonics

**Identity**
- **Project name:** Sylvie Phonics Learning Path Engine
- **Exact path:** `C:\Users\joshua.parris\Downloads\Other\Sylvie Phonics\Learning-Path-Engine\Learning-Path-Engine`
- **Purpose:** pnpm monorepo for an educational learning path engine (possibly for speech pathology / phonics training)
- **Source of truth?** Yes

**Git evidence**
- **Is it a Git repo?** Yes
- **Branch:** main
- **Remote(s):** `gitsafe-backup git://gitsafe:5418/backup.git`
- **Latest commit:** `edca3d7 (HEAD -> main, gitsafe-backup/main) Update helper avatar image to display correctly`
- **Git status summary:** dirty
- **Modified files:** 13+
  - `artifacts/api-server/public/index.html`
  - `artifacts/mockup-sandbox/src/.generated/mockup-components.ts`
  - `docs/curriculum-matrix.md`
  - `package.json`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`
- **Untracked files/folders:** Many docs and content files:
  - `CONTRIBUTING.md`
  - `docs/accessibility-safe-tech.md`
  - `docs/content-bundle-schema.md`
  - `docs/manual-qa.md`
  - `docs/next-level-build-plan.md`
  - `content/` (directory)
  - `scripts/qa-check.mjs`
  - `scripts/validate-content.mjs`
  - `preinstall.cjs`
- **Deleted files:** None

**Package / stack evidence**
- **package.json present?** Yes
- **Framework/stack:** pnpm monorepo, React/Next-like structure, build artifacts
- **Package manager:** pnpm (based on `pnpm-lock.yaml` and `pnpm-workspace.yaml`)
- **Conflicting lockfiles?** No — only `pnpm-lock.yaml`
- **Available scripts:** Not examined in detail (would require reading all workspace package.json files)

**Repo risk evidence**
- **Large files or archives in root?** Yes — `frontend.zip` (108,184,802 bytes / ~108 MB)
- **Build output folders present?** Yes — `artifacts/` contains build outputs
- **Duplicate/static/export folders?** Yes — `artifacts/api-server`, `artifacts/mockup-sandbox` are build/export folders
- **OneDrive location risk?** No
- **Downloads location risk?** Yes — Deep nesting in Downloads folder is inappropriate for active development
- **Missing Git risk?** No
- **Local file:// links?** Not found

**Security hygiene**
- **.env or .env.local?** Not found in root
- **.npmrc or credentials?** Not found
- **Tokens or config files?** Not found

**Recommended classification**
- **active source repo, needs relocation** (portfolio/creativity project currently in inappropriate Downloads folder)

**First safe next action**
- [ ] Run `git status` and save the output
- [ ] Plan to move to a proper dev workspace (e.g. `C:\Users\joshua.parris\dev\Sylvie-Phonics`)
- [ ] Do not move yet; confirm backup and relocation plan first

---

### 7. NebulaDice

**Identity**
- **Project name:** Nebula Dice
- **Exact path:** `C:\Users\joshua.parris\Documents\NebulaDice`
- **Purpose:** Python-based modular text RPG engine with data-driven systems, D&D 5e-inspired mechanics, and audit-grade logging
- **Source of truth?** Unclear (source code exists, but no git repo)

**Git evidence**
- **Is it a Git repo?** No
- **Branch:** N/A
- **Remote(s):** None
- **Latest commit:** N/A
- **Git status summary:** N/A
- **Modified files:** N/A
- **Untracked files/folders:** N/A
- **Deleted files:** N/A

**Package / stack evidence**
- **package.json present?** No (Python project)
- **Framework/stack:** Python 3.10+, FastAPI, Pydantic, Rich (CLI), Pytest
- **Package manager:** pip (`requirements.txt` present)
- **Conflicting lockfiles?** No
- **Available scripts:** None (Python entrypoints: `main.py`, `run_web.py`, `run-nebula-dice.bat`)

**Repo risk evidence**
- **Large files or archives in root?** No
- **Build output folders present?** No
- **Duplicate/static/export folders?** Partially — `frontend.zip` (108 MB) exists, suggesting a built frontend artifact
- **OneDrive location risk?** No
- **Downloads location risk?** No
- **Missing Git risk?** Yes — No version control
- **Local file:// links?** Not found

**Security hygiene**
- **.env or .env.local?** Not found
- **.npmrc or credentials?** Not found
- **Tokens or config files?** Not found

**Recommended classification**
- **source code, no Git, requires decision** (preserve/archive/init-git)

**First safe next action**
- [ ] Decide: preserve as active portfolio project, or archive externally?
- [ ] If preserving: initialize git with `git init` and create a remote backup
- [ ] If archiving: create a `.zip` and move to external storage

---

## JoshHub Stale Link Evidence

**File:** `C:\Users\joshua.parris\JoshHub\src\data\apps.ts`

**Stale file:// URLs found:**

| Line | URL pattern | Status |
|------|-----------|--------|
| 1435 | `file:///C:/Users/jparris@ltu.edu.au/OneDrive%20-%20LA%20TROBE%20UNIVERSITY/Desktop/Projects/HugCoach` | **STALE** — old La Trobe email, no longer valid user path |
| 1436 | `file:///C:/Users/jparris@ltu.edu.au/OneDrive%20-%20LA%20TROBE%20UNIVERSITY/Desktop/Projects/HugCoach/README.md` | **STALE** — same old path |

**Evidence:** These links point to a user account that no longer exists (`jparris@ltu.edu.au`). They should be removed or replaced with GitHub URLs.

**Context:** HugCoach entry (lines ~1430–1450) has a Vercel hosted link but also includes these stale local paths. Recommendation: remove file:// URLs and keep only the Vercel hosted link and GitHub repo link.

---

## Duplicate / Archive Evidence

### Archive Files (in repo roots)
| Project | File | Size | Concern |
|---------|------|------|---------|
| Avance | `app.zip` | 363 MB | Large build archive in repo root; should be generated from source or archived externally |
| DCSPrep | `DCSPDTimeManagement.zip` | 696 KB | Dev artifact in root; low priority to clean, but adds clutter |

### Duplicate Zip Files (in parent Documents folders)
| Project | Files | Location | Concern |
|---------|-------|----------|---------|
| DCSPrep | `DCSPrepApp.zip`, `DCSPrepApp (2).zip` | `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents` | Multiple stale exports; source is in `DCSPrepApp/` folder |
| Sylvie Phonics | `frontend.zip` | `C:\Users\joshua.parris\Downloads\Other\Sylvie Phonics\Learning-Path-Engine\Learning-Path-Engine` | 108 MB frontend export; source is in `frontend/` folder |
| NebulaDice | `frontend.zip` (if exists) | `C:\Users\joshua.parris\Documents\NebulaDice` | Frontend export artifact |

### Duplicate Workspace Folders
| Folder | Size | Content | Concern |
|--------|------|---------|---------|
| `C:\Users\joshua.parris\dev\JoshHub` | Small | `node_modules/` only | Duplicate workspace copy; no git; no source |
| `C:\Users\joshua.parris\dev\NebulaDice` | Medium | `frontend/` only | Duplicate workspace copy; no git; no source |

### Static Game Builds (in JoshHub)
| Folder | Status | Concern |
|--------|--------|---------|
| `C:\Users\joshua.parris\JoshHub\Game-Fixer` (untracked) | Static assets | No git; 19K files; should be archived or separated from app source |
| `C:\Users\joshua.parris\JoshHub\PartyAI` (untracked) | Has .git + package.json | **Subproject** with git; 22K files; unclear if should be separate repo or kept embedded |
| `C:\Users\joshua.parris\JoshHub\Serenity-Keep-Flying` (untracked) | Has .git + package.json | **Subproject** with git; 23K files; unclear if should be separate repo or kept embedded |
| `C:\Users\joshua.parris\JoshHub\Wilds - Sail West` (untracked) | Static build | No git; 1 file; minimal content |
| `C:\Users\joshua.parris\JoshHub\archive` (untracked) | Archive folder | 84K files; no git; should be external archive |
| `C:\Users\joshua.parris\JoshHub\projects` (untracked) | Workspace folder | 3K files; unclear contents; needs review |

---

## Missing Evidence / Unclear Items

1. **PartyAI and Serenity-Keep-Flying subprojects in JoshHub:** Both have `.git` and `package.json`, indicating they are embedded git subprojects. Status is unclear; unclear whether they should remain in JoshHub or be extracted as separate repos or git submodules.

2. **Waypoint vs Parris Compass vs AnchorFlow confusion:** Three related folders exist:
   - `C:\parris-compass` (remote: Waypoint.git) — appears to be main product
   - `C:\waypoint` (remote: AnchorFlow.git) — appears to be separate prototype
   - Relationship and future direction are undocumented
   
3. **Sylvie Phonics remote:** Only has `gitsafe-backup` remote, not a public GitHub link. Unclear whether this is intentional or if a GitHub backup should be created.

4. **NebulaDice frontend.zip:** Unclear what this archive contains and whether it is a hard-to-reproduce build or just a static export that can be regenerated.

5. **OneDrive sync status:** Avance and DCSPrep are on OneDrive. Actual file-locking issues have not been observed in this audit, but are documented in DCSPrep KNOWN_ISSUES.md as a known risk.

6. **JoshHub catalog coverage:** The `src/data/apps.ts` catalog does not list Avance, DCSPrep, Parris Compass, or Sylvie Phonics, even though all are active local repos. Unclear if this is intentional or an oversight.

---

## Final Safe Next Step

**Do this today without any modifications:**

1. Create a local file `Local-Project-Stabilisation-Plan.md` with a copy of both documents (the Stabilisation Plan and this Evidence Pack).

2. Run the following in each project folder and save the output:
   ```powershell
   git status --short > status.txt 2>&1
   git log --oneline -1 >> status.txt 2>&1
   ```

3. After you have collected all status outputs, **make one decision:**
   - Should you commit the 4 modified app files in Avance, or stash them?
   
   This single decision unblocks you to begin your first real MSP learning feature.

4. **Do not commit, push, or delete anything** until you have reviewed both documents and made that decision.

---

**That is the complete evidence pack. All findings are read-only and non-invasive. You now have a precise snapshot of your local project ecosystem.**
