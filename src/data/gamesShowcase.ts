export type ShowcaseGame = {
    id: string;
    title: string;
    description: string;
    localPath: string; // relative path in your workspace
    playUrl?: string | null;
    notes?: string;
};

export const gamesShowcase: ShowcaseGame[] = [
    {
        id: "midnight-line",
        title: "The Midnight Line",
        description:
            "Narrative-driven project with docs, TypeScript source and assets — well-formed and close to polished demoable state.",
        localPath: "Games/_The Midnight Line",
        playUrl: "/games/midnight-line/index.html",
        notes: "Has README, implementation checklists and src/ — best candidate for polishing",
    },
    {
        id: "whirring-wilderness",
        title: "Whirring Wilderness (v28)",
        description:
            "Active versioned project with multiple releases/variants; good for further refinements and release prepping.",
        localPath: "Games/WhirringWilderness-20251113T032854Z-1-001/WhirringWildernessv28-20251114T041104Z-1-001/WhirringWildernessv28",
        playUrl: "https://joshuaparris-max.github.io/WhirringWilderness/",
    },
    {
        id: "simplerpg",
        title: "SimpleRPG",
        description:
            "Smaller codebase with `package.json` — quick to iterate, polish and ship a playable demo.",
        localPath: "Games/SimpleRPG/SimpleRPG",
        playUrl: "https://REDACTED_USER-stack.github.io/LetsPlayDnd/",
    },
    {
        id: "aagameadventure",
        title: "AAGAMEADVENTURE",
        description: "Larger standalone game project with a node toolchain — promising for feature completion.",
        localPath: "Games/AAGAMEADVENTURE/AAGAMEADVENTURE",
        playUrl: "/Games/AAGAMEADVENTURE/AAGAMEADVENTURE",
    },
    {
        id: "dnd-spider-queen",
        title: "DndPetsSpideQueenApp (Spider Queen campaign)",
        description:
            "Campaign app with content and a package.json — good choice if you want content-rich playable material.",
        localPath:
            "Games/Dnd with Jayden - Spider Queen-20251115T113107Z-1-001/DndPetsSpideQueenApp/campaign-copilot1",
        playUrl: "https://REDACTED_USER-stack.github.io/campaign-copilot/",
    },
];

export default gamesShowcase;
