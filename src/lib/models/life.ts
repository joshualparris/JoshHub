export const LIFE_AREAS = [
  "faith",
  "family",
  "health",
  "finance",
  "work",
  "tech",
  "travel",
  "legacy",
  "inbox",
] as const;

export type LifeArea = typeof LIFE_AREAS[number];

export function isLifeArea(s: string | undefined | null): s is LifeArea {
  if (!s) return false;
  return (LIFE_AREAS as readonly string[]).includes(s as string);
}

export function normalizeLifeArea(str?: string | null): LifeArea {
  if (!str) return "inbox";
  const s = str.trim().toLowerCase();
  if (isLifeArea(s)) return s;
  // conservative synonyms
  const map: Record<string, LifeArea> = {
    dcs: "work",
    dubbo: "work",
    games: "tech",
    play: "inbox",
    creative: "tech",
    lab: "tech",
    home: "family",
  };
  if (map[s]) return map[s];
  return "inbox";
}
