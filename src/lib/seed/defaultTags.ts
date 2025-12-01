import { LifeArea } from "../models/life";

export const DEFAULT_TAGS: Record<LifeArea, string[]> = {
  faith: ["devotion", "sermon", "scripture"],
  family: ["kids", "marriage", "chores"],
  health: ["sleep", "movement", "nutrition"],
  finance: ["budget", "bills", "goals"],
  work: ["dcs", "la-trobe", "project"],
  tech: ["game", "tool", "repo"],
  travel: ["trip", "packing", "memories"],
  legacy: ["memoir", "will", "stories"],
  inbox: ["inbox"],
};
