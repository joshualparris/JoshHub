import { LifeItem, makeLifeItem } from "../models/lifeContent";

export function getStarterPack(): LifeItem[] {
  const now = new Date().toISOString();
  const mk = (partial: Partial<LifeItem> & Pick<LifeItem, 'id' | 'area' | 'type' | 'title'>) =>
    makeLifeItem({ ...partial, createdAt: now, updatedAt: now });

  const items: LifeItem[] = [
    // Faith
    mk({ id: "faith-1", area: "faith", type: "prompt", title: "Daily Abide (10 min)" , body: "2 min gratitude\n5 min Scripture (Psalm + Gospel)\n2 min prayer for family\n1 min obedience step"}),
    mk({ id: "faith-2", area: "faith", type: "resource", title: "Quiet Time Template", body: "Short template for prayer and scripture reading."}),

    // Family
    mk({ id: "family-1", area: "family", type: "checklist", title: "2-minute check-in (morning)", body: "Ask: How are you really?\nOne thing I can do today" }),
    mk({ id: "family-2", area: "family", type: "note", title: "Bedtime stability steps", body: "Calm steps for a predictable bedtime." }),

    // Health
    mk({ id: "health-1", area: "health", type: "checklist", title: "Evening wind-down (post 7pm)", body: "Screens off, light snack, gentle stretch." }),

    // Finance
    mk({ id: "finance-1", area: "finance", type: "resource", title: "Monthly money review (20 min)", body: "Checklist: transactions, budgets, next bills." }),

    // Work
    mk({ id: "work-1", area: "work", type: "note", title: "La Trobe finish / DCS prep", body: "La Trobe ends 2025-12-24. DCS ramp 2026-01-19. Plan next steps." }),

    // Tech
    mk({ id: "tech-1", area: "tech", type: "resource", title: "Apps catalogue", body: "Links to DCS Companion, DCS Prep, Campaign Copilot, games." }),

    // Travel
    mk({ id: "travel-1", area: "travel", type: "note", title: "Fiji trip memory", body: "Short prompts: highlights, gratitude, funniest moment." }),

    // Legacy
    mk({ id: "legacy-1", area: "legacy", type: "prompt", title: "Weekly memoir prompt", body: "Write one short story for the kids." }),

    // Inbox / Play
    mk({ id: "inbox-1", area: "inbox", type: "spark", title: "Play & Creativity: Weekly Play Block", body: "10m pick \n30m create/play \n10m share \n10m save spark note" }),
  ];

  return items;
}
