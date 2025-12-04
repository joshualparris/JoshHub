export type LifeSlug =
  | "faith"
  | "family"
  | "health"
  | "finance"
  | "work-dcs"
  | "tech-projects"
  | "travel"
  | "legacy";

export interface LifeArea {
  slug: LifeSlug;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
  quickLinks: string[]; // app ids from the catalogue
  tags: string[];
}

export const lifeAreas: LifeArea[] = [
  {
    slug: "faith",
    title: "Faith",
    intro: "Practices, readings, and service rhythms.",
    sections: [
      { heading: "Practices", body: "Daily reflection, prayer blocks, weekly community." },
      { heading: "Focus", body: "Keep space for quiet mornings; align plans with values." },
    ],
    quickLinks: [],
    tags: ["faith", "values"],
  },
  {
    slug: "family",
    title: "Family",
    intro: "Routines and support for the household.",
    sections: [
      { heading: "Evenings", body: "Bedtime checklists and weekly rhythm planning." },
      { heading: "Support", body: "Shared responsibilities and weekly reviews." },
    ],
    quickLinks: [],
    tags: ["family", "rhythm"],
  },
  {
    slug: "health",
    title: "Health",
    intro: "Sleep, movement, recovery.",
    sections: [
      { heading: "Movement", body: "Walks, rides, strength sessions." },
      { heading: "Sleep", body: "Consistent schedule; track improvements." },
    ],
    quickLinks: [],
    tags: ["health", "sleep", "movement"],
  },
  {
    slug: "finance",
    title: "Finance",
    intro: "Money, budgets, and obligations.",
    sections: [{ heading: "Focus", body: "Keep cashflow simple; monthly review." }],
    quickLinks: [],
    tags: ["finance", "money"],
  },
  {
    slug: "work-dcs",
    title: "Work / DCS",
    intro: "Work in Dubbo and related tooling.",
    sections: [
      { heading: "Current", body: "Prep and companion apps; keep broken items visible." },
    ],
    quickLinks: ["dcs-companion", "dcs-prep", "parris-dubbo-mover"],
    tags: ["dubbo", "dcs", "work"],
  },
  {
    slug: "tech-projects",
    title: "Tech & Projects",
    intro: "All dev work and experimental builds.",
    sections: [
      { heading: "Games", body: "Whispering Wilds, Mystery Depths, Simple RPG, Null." },
      { heading: "Apps", body: "OrgScape, Campaign Copilot, others." },
    ],
    quickLinks: [
      "whispering-wilds-v1",
      "whispering-wilds-v2",
      "mystery-depths-gh",
      "simple-rpg-gh",
      "orgscape",
      "campaign-copilot",
    ],
    tags: ["projects", "tech", "games"],
  },
  {
    slug: "travel",
    title: "Travel & Adventure",
    intro: "Past trips (Fiji, Tassie) and planning future adventures.",
    sections: [{ heading: "Planning", body: "Keep essentials and docs handy." }],
    quickLinks: [],
    tags: ["travel"],
  },
  {
    slug: "legacy",
    title: "Legacy",
    intro: "What endures: writing, memories, stewardship.",
    sections: [{ heading: "Focus", body: "Document the important things." }],
    quickLinks: [],
    tags: ["legacy"],
  },
];

export function getLifeArea(slug: string): LifeArea | undefined {
  return lifeAreas.find((area) => area.slug === slug);
}
