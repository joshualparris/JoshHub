# Local Project Stabilisation Plan

## Executive Decision

### Recommended Priority Order

1. **Avance Professional Development**
2. **JoshHub**
3. **DCSPrep / DCSPD**
4. **Parris Compass / Waypoint**
5. **Sylvie Phonics**

### Reasoning

- **Avance** is the highest professional opportunity. It directly supports your MSP/IT learning goals and is aligned with your current work at Avance Business Technology. It already has working source code, a clear roadmap (TODO.md), and documented product scope.
  
- **JoshHub** is the biggest stabilisation risk. It is your central app inventory and dashboard, but it is currently in an unstable state with many uncommitted changes, untracked asset folders, mixed package managers, and stale local links. Stabilising it will improve your entire development workflow.
  
- **DCSPrep** should be treated as a portfolio/training project, not your main professional priority. It is technically clean but your career focus is now MSP/IT support work at Avance, not DCS-specific systems.
  
- **Parris Compass** is stable and useful as a wellbeing/professional growth app, but it is not directly tied to your current MSP work. Keep it maintained but do not prioritise new features.
  
- **Sylvie Phonics** is a real source repo with portfolio value, but its location in Downloads is inappropriate for active development. Move it only after more urgent projects are stabilised.

---

## Immediate Safety Rules

1. **Do not delete anything yet.** Duplicates and archive files stay in place until you have confirmed backups and source-of-truth decisions.

2. **Do not move folders yet.** Do not move Sylvie Phonics, NebulaDice, or any other project until you have a clear plan and have backed up their current state.

3. **Do not feature-work or commit until Git state is stable.** For Avance and JoshHub, commit or stash current changes before starting new work.

4. **Treat OneDrive repos as high-risk.** Avance and DCSPrep are stored on OneDrive. File-locking and sync issues can interrupt work. These projects should be treated with extra caution during any restructuring.

5. **Duplicate folders should be renamed, not deleted.** If you need to quarantine a folder (e.g. `C:\Users\joshua.parris\dev\JoshHub`), rename it to `.archive-JoshHub-dev` rather than deleting it immediately.

6. **Back up before moving.** If you move a project folder (e.g. Sylvie Phonics from Downloads), create a full copy elsewhere first.

---

## 30-Minute Quick Checklist

After reading this plan, follow these steps in order:

**[ ] 0–5 min: Read the evidence pack**
- Open `docs/PROJECT-AUDIT-EVIDENCE-PACK.md` in this folder (JoshHub) or in Avance
- Understand the status of each of your 7 local projects

**[ ] 5–10 min: Decide on Avance**
- Navigate to `C:\Users\joshua.parris\OneDrive - Dubbo Christian School\Documents\02_Personal\Avance`
- Run `git status`
- Decide: commit or stash the 4 modified app files?
- Execute your decision (commit or stash)

**[ ] 10–15 min: Save JoshHub state**
- Navigate to `C:\Users\joshua.parris\JoshHub`
- Run `git status --short > joshub-git-status-snapshot.txt` to save current state
- Do not commit yet — first you need to understand what should be in the repo

**[ ] 15–20 min: Review your goals**
- Read Avance's `TODO.md` (in Avance folder)
- Read JoshHub's `docs/tasks.md` (in JoshHub)
- Identify your top 5 professional priorities

**[ ] 20–30 min: Plan next session**
- Write down the three projects you will focus on in the next week
- Decide if you will tackle Avance first, or stabilise JoshHub first
- Save your plan as a comment in one of the docs

---

## Specific Avance Plan

### Stage 1: Stabilise current work (commit or stash)
- [ ] Run `git status` to see the 4 modified app files
- [ ] Decide: commit or stash?
  - **Commit** if the changes are complete and stable
  - **Stash** if they are work-in-progress and you want to start fresh
- [ ] Either way, ensure the repo is clean before the next step

### Stage 2: Handle build archives
- [ ] Confirm `app.zip` (363 MB) is a duplicate of the `.next` build output
- [ ] Decide:
  - **Delete from repo** if you can regenerate it with `npm run build`
  - **Move to archive** if it is a hard-to-reproduce build
  - **Plan deployment** if it is needed for Vercel/production
- [ ] Plan (do not do yet): if deleting, add `app.zip` to `.gitignore`

### Stage 3: Focus on core MSP learning workflow
- [ ] Read `TODO.md` completely
- [ ] Identify the top 5 unfinished features:
  1. Shift detail pages
  2. Work log quick capture
  3. Knowledge base entries
  4. Troubleshooting playbooks
  5. Evidence pack generation
- [ ] Decide on the order of implementation (recommend order above)

### Stage 4: Refocus features (no overbuilding)
- [ ] For each feature, ask: "Does this support the core MSP ticket workflow?"
- [ ] Avoid: building reporting dashboards, client management systems, or billing before the core learning loop works
- [ ] Focus: ticket notes practice → troubleshooting practice → evidence capture

### Stage 5: Commit stabilised state
- [ ] After stage 1 (commit/stash), make sure the repo is clean
- [ ] If app.zip is removed, commit that change: `git add . && git commit -m "chore: remove build archive from repo"`

---

## Specific JoshHub Plan

### Stage 1: Save current state (read-only, no commits)
- [ ] Run `git status --short > joshub-status.txt` to save a snapshot
- [ ] Review the untracked folders: Game-Fixer, PartyAI, Serenity-Keep-Flying, archive, etc.
- [ ] Do not commit anything yet

### Stage 2: Identify what belongs in the main repo
- [ ] Files that should be version-controlled:
  - `src/` (app source code) ✓
  - `public/` (static assets) ✓
  - `docs/` (documentation) ✓
  - `package.json`, `next.config.ts` ✓
  
- [ ] Files that should be archived or removed:
  - `archive/` (84K+ files, no source value) → archive externally
  - `Game-Fixer/` (static game assets) → archive externally
  - Large build artifacts → delete or archive
  - Dev logs (`.next-dev-*.log`, `.next/`) → add to `.gitignore`

- [ ] Unclear status (decide per repo):
  - `PartyAI/` (has .git and package.json) → is this a submodule or embedded project?
  - `Serenity-Keep-Flying/` (has .git and package.json) → same decision needed
  - `projects/` folder → what is this for?

### Stage 3: Resolve package manager conflict
- [ ] You have both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm)
- [ ] Decide: are you using npm or pnpm for JoshHub?
- [ ] Delete the unused lockfile (e.g., if using npm, delete `pnpm-lock.yaml` and `pnpm-workspace.yaml`)
- [ ] Run `npm ci` or `pnpm install` to verify the chosen package manager works

### Stage 4: Clean stale local links
- [ ] Open `src/data/apps.ts`
- [ ] Find lines 1435–1436 (HugCoach entry)
- [ ] Remove the stale `file:///C:/Users/jparris@ltu.edu.au/...` links
- [ ] Keep the Vercel/GitHub hosted links

### Stage 5: Update app catalog
- [ ] Verify `src/data/apps.ts` includes entries for:
  - Avance Professional Development (currently missing?)
  - DCSPrep / DCSPD (currently missing?)
  - Parris Compass / Waypoint (currently missing?)
  - Sylvie Phonics (currently missing?)
- [ ] Add missing entries with correct paths and GitHub links

### Stage 6: Commit stabilisation
- [ ] After stages 1–5, review what you have done
- [ ] Commit with a clear message: `git commit -m "chore(joshhub): stabilise repo structure, remove archives, clean package managers"`

---

## Context: JoshHub is your central app inventory

JoshHub serves as your dashboard for:
- App discovery and organization
- Task and project management
- Game catalog
- Health tracking
- Life planning

Its reliability is critical to your entire workflow. Stabilising it unblocks better app ecosystem management and reduces friction for starting new projects.

---

## Context: This project is the top professional priority

Avance Professional Development is your highest-priority local project because:
- **Direct MSP/IT relevance** to your current work at Avance Business Technology
- **Professional development focus** aligns with building Level 1–2 IT support skills
- **Active roadmap** documented in TODO.md with clear scope
- **Clean technical foundation** (Next.js 16, React 19, Tailwind 4, Dexie)
- **Immediate professional value** for your career trajectory

See `PROJECT-AUDIT-EVIDENCE-PACK.md` for the full audit details and context on all your local projects.
