export type AppStatus = "ok" | "broken" | "wip" | "archived";
export type AppCategory = "Dubbo / DCS" | "Games" | string;

export interface AppLink {
  label: string;
  url: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: "app" | "game";
  category: AppCategory;
  status: AppStatus;
  tags: string[];
  primaryUrl: string;
  urls: AppLink[];
  notes?: string;
  lastTouched?: string;
  nextAction?: string;
}

export const apps: CatalogItem[] = [
  {
    id: "dcs-companion",
    name: "DCS Companion",
    type: "app",
    category: "Dubbo / DCS",
    status: "ok",
    tags: ["dubbo", "dcs", "companion", "web"],
    primaryUrl: "https://joshuaparris-max.github.io/DCSCompanion",
    urls: [{ label: "Live", url: "https://joshuaparris-max.github.io/DCSCompanion" }],
    lastTouched: "2025-11",
  },
  {
    id: "dcs-prep",
    name: "DCS Prep App",
    type: "app",
    category: "Dubbo / DCS",
    status: "ok",
    tags: ["dubbo", "dcs", "prep", "vercel"],
    primaryUrl: "https://dcs-prep.vercel.app/",
    urls: [{ label: "Live", url: "https://dcs-prep.vercel.app/" }],
    lastTouched: "2025-11",
  },
  {
    id: "parris-dubbo-mover",
    name: "ParrisDubboMover",
    type: "app",
    category: "Dubbo / DCS",
    status: "broken",
    tags: ["dubbo", "mover", "vercel", "api"],
    primaryUrl: "https://parris-dubbo-mover-app-main-client.vercel.app/",
    urls: [
      {
        label: "Client",
        url: "https://parris-dubbo-mover-app-main-client.vercel.app/",
      },
    ],
    notes: "API/backend not working; client link preserved for reference.",
    nextAction: "Fix API/backend and reconnect client.",
    lastTouched: "2025-11",
  },
  {
    id: "campaign-copilot",
    name: "Campaign Copilot",
    type: "app",
    category: "Dubbo / DCS",
    status: "ok",
    tags: ["dubbo", "campaign", "copilot", "web"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/campaign-copilot/",
    urls: [
      { label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/campaign-copilot/" },
    ],
    nextAction: "Review content freshness.",
  },
  {
    id: "whispering-wilds-v1",
    name: "Whispering Wilds v1",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "wilds", "v1", "github-pages"],
    primaryUrl: "https://joshuaparris-max.github.io/WhirringWilderness/",
    urls: [
      { label: "Live", url: "https://joshuaparris-max.github.io/WhirringWilderness/" },
    ],
  },
  {
    id: "whispering-wilds-v2",
    name: "Whispering Wilds v2",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "wilds", "v2", "github-pages"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/whispering-wilds/",
    urls: [
      { label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/whispering-wilds/" },
    ],
  },
  {
    id: "whispering-wilds-itch",
    name: "Whispering Wilds (itch)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "wilds", "itch"],
    primaryUrl: "https://joshualparris.itch.io/whisperingwilds",
    urls: [{ label: "itch.io", url: "https://joshualparris.itch.io/whisperingwilds" }],
  },
  {
    id: "mystery-depths-itch",
    name: "Mystery Depths (itch)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "mystery-depths", "itch"],
    primaryUrl: "https://joshualparris.itch.io/mysterydepths",
    urls: [{ label: "itch.io", url: "https://joshualparris.itch.io/mysterydepths" }],
  },
  {
    id: "mystery-depths-gh",
    name: "Mystery Depths (GH)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "mystery-depths", "github-pages"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/MysteriousDepths/",
    urls: [
      { label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/MysteriousDepths/" },
    ],
  },
  {
    id: "simple-rpg-itch",
    name: "Simple RPG (itch)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "rpg", "itch"],
    primaryUrl: "https://joshualparris.itch.io/simplerpg",
    urls: [{ label: "itch.io", url: "https://joshualparris.itch.io/simplerpg" }],
  },
  {
    id: "simple-rpg-gh",
    name: "Simple RPG (GH)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "rpg", "github-pages"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/LetsPlayDnd/",
    urls: [
      { label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/LetsPlayDnd/" },
    ],
  },
  {
    id: "infinite-office-itch",
    name: "Infinite Office (itch)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "office", "itch"],
    primaryUrl: "https://joshualparris.itch.io/infiniteoffice",
    urls: [{ label: "itch.io", url: "https://joshualparris.itch.io/infiniteoffice" }],
  },
  {
    id: "orgscape",
    name: "OrgScape",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "orgscape", "github-pages"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/OrgScape/",
    urls: [{ label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/OrgScape/" }],
  },
  {
    id: "null-itch",
    name: "Null (itch)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "null", "itch"],
    primaryUrl: "https://joshualparris.itch.io/null-html-game",
    urls: [{ label: "itch.io", url: "https://joshualparris.itch.io/null-html-game" }],
  },
  {
    id: "null-gh",
    name: "Null (GH)",
    type: "game",
    category: "Games",
    status: "ok",
    tags: ["game", "null", "github-pages"],
    primaryUrl: "https://joshuaparrisdadlan-stack.github.io/Null/",
    urls: [{ label: "Live", url: "https://joshuaparrisdadlan-stack.github.io/Null/" }],
  },
];

export function getAppById(id: string): CatalogItem | undefined {
  return apps.find((item) => item.id === id);
}
