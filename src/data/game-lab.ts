export type GameLabHealthState = "healthy" | "pending" | "blocked";

export type GameLabProject = {
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
    state: GameLabHealthState;
    note: string;
  };
};

export const gameLabProjects: GameLabProject[] = [
  {
    id: "partyquest",
    name: "PartyQuest / PartyAI",
    role: "Current sprint priority; AI-assisted party adventure alpha.",
    priority: 1,
    owner: "AndroidMansBotCool123333",
    status: "Alpha runtime stabilisation",
    nextAction: "Implement schema-validated turn flow with deterministic fallback and recap export.",
    definitionOfDone:
      "Player completes party → scene → choice → check → consequence → recap, with fallback tested.",
    liveUrl: "https://party-ai-mu.vercel.app/play",
    repoUrl: "https://github.com/joshuaparrisdadlan-stack/PartyAI",
    health: {
      state: "pending",
      note: "Waiting on recap schema, fallback guardrails, and pre-playtest checks.",
    },
  },
  {
    id: "forbidden-lands-lite",
    name: "Forbidden Lands Lite",
    role: "Most complete TTRPG tool; reusable tabletop mechanics lab.",
    priority: 2,
    owner: "GameDesignCollaborator - Bot B",
    status: "Build/runtime repair needed",
    nextAction: "Repair dependency install, then add onboarding and demo campaign.",
    definitionOfDone:
      "App builds/runs; first-time player can load demo campaign, manage a character, and roll dice within 2 minutes.",
    localPath: "linked-projects/Games/ForbiddenQuests-source",
    health: {
      state: "blocked",
      note: "Local npm install/bin repair required; see BUILD_TRIAGE_2026-05-12.md.",
    },
  },
  {
    id: "whispering-wilds",
    name: "Whispering Wilds / WhirringWilderness",
    role: "Flagship creative game direction.",
    priority: 3,
    owner: "GameDesignCollaborator - Bot B",
    status: "Flagship synthesis planning",
    nextAction: "Lock 3-layer spec: overworld travel + town/ASCII exploration + encounters.",
    definitionOfDone:
      "Three-layer flagship spec is locked with prototype tasks and reusable systems identified.",
    localPath: "linked-github-bucklandblocks/WhirringWilderness",
    health: {
      state: "blocked",
      note: "Vite/Rollup build path issue through OneDrive/junction path needs repair.",
    },
  },
  {
    id: "joshhub",
    name: "JoshHub",
    role: "Launcher, catalogue, and project command centre.",
    priority: 4,
    owner: "GameDesignCollaborator - Bot B",
    status: "Command centre expansion",
    nextAction: "Publish Game Lab page and keep project cards current.",
    definitionOfDone:
      "Game Lab lists every active project with live link, repo/folder, status, next action, and build/playtest health.",
    localPath: "linked-projects/Apps/joshhub",
    health: {
      state: "pending",
      note: "Game Lab files are local; Windows build script still needs cross-platform cleanup.",
    },
  },
];
