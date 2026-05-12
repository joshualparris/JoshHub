# JoshHub Game Lab Spec

## Purpose

Game Lab is JoshHub's command centre for active game and TTRPG projects. It should answer, at a glance:

- What projects are active?
- Where can Josh play/test them?
- Where is the repo or local folder?
- What is the current status?
- What is the next action?
- Is the build/playtest healthy?

## Initial Project Cards

### PartyQuest / PartyAI

**Role:** first sprint priority; testable AI-assisted party adventure alpha.

Fields:

- Live link: `https://party-ai-mu.vercel.app/play`
- Repo: `https://github.com/joshuaparrisdadlan-stack/PartyAI`
- Status: `Alpha runtime stabilisation`
- Owner: `AndroidMansBotCool123333`
- Next action: `Implement schema-validated turn flow with deterministic fallback`
- Build/playtest health: `Pending bot update + pushed build`
- Definition of Done: player completes party → scene → choice → check → consequence → recap, with fallback tested.

### Forbidden Lands Lite / ForbiddenQuests-source

**Role:** most complete TTRPG tool; reusable tabletop mechanics lab.

Fields:

- Local folder: `linked-projects/Games/ForbiddenQuests-source`
- Status: `Build/runtime repair needed`
- Owner: `GameDesignCollaborator - Bot B`
- Next action: `Repair local build, add onboarding and demo campaign`
- Build/playtest health: `Blocked locally: vite not available from current install/path`
- Definition of Done: app builds/runs; first-time player can load demo campaign, manage a character, and roll dice within 2 minutes.

### Whispering Wilds / WhirringWilderness

**Role:** flagship creative game direction.

Fields:

- Local folder: `linked-github-bucklandblocks/WhirringWilderness`
- Status: `Flagship synthesis planning`
- Owner: `GameDesignCollaborator - Bot B`
- Next action: `Lock 3-layer spec: overworld travel + town/ASCII exploration + encounters`
- Build/playtest health: `Build blocker: Vite/Rollup emitted path issue through OneDrive/junction path`
- Definition of Done: 3-layer flagship spec locked with prototype tasks.

### JoshHub

**Role:** launcher, catalogue, and project command centre.

Fields:

- Local folder: `linked-projects/Apps/joshhub`
- Status: `Command centre expansion`
- Owner: `GameDesignCollaborator - Bot B`
- Next action: `Implement Game Lab page and project card data`
- Build/playtest health: `Current Windows build blocker: Unix-style TMPDIR script syntax`
- Definition of Done: Game Lab page lists every active project with live link, repo/folder, status, next action, and build/playtest health.

## Page Structure

Route recommendation: `/game-lab`

Sections:

1. **Priority Sprint**
   - Shows PartyQuest as the current focus.
   - Includes playtest link, repo link, owner, status, next action.

2. **Active Projects Grid**
   - Cards for PartyQuest, Forbidden Lands Lite, Whispering Wilds, JoshHub.
   - Each card includes status badge, owner, links, next action, health.

3. **Build / Playtest Health**
   - Simple list of known blockers.
   - Later can become automated checks.

4. **Next Actions**
   - One clear next action per project.
   - Avoid giant backlog here; link to docs/task board for depth.

## Card Data Shape

```ts
type GameLabProject = {
  id: string;
  name: string;
  role: string;
  priority: number;
  owner: string;
  status: string;
  nextAction: string;
  definitionOfDone: string;
  liveUrl?: string;
  repoUrl?: string;
  localPath?: string;
  health: {
    state: 'healthy' | 'pending' | 'blocked';
    note: string;
  };
};
```

## Implementation Notes

- Keep data in `src/data/game-lab.ts`.
- Add page at `src/app/game-lab/page.tsx`.
- Reuse existing Card/Badge/Button components.
- Add a dashboard link/card to `/game-lab`.
- Do not modify unrelated catalogue data until current uncommitted repo state is cleaned up.

## First Implementation Tasks

1. Create `src/data/game-lab.ts` with the four initial project records.
2. Create `/game-lab` page rendering the records.
3. Add Game Lab entry point from dashboard or nav.
4. Fix Windows-compatible scripts separately so build can pass.
