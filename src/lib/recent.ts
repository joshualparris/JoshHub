import { z } from "zod";

import type { CatalogItem } from "@/data/apps";

const STORAGE_KEY = "joshhub-recent";
const MAX_RECENT = 8;

const recentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryUrl: z.string(),
  category: z.string(),
  status: z.string(),
  tags: z.array(z.string()),
  lastOpened: z.string().datetime(),
});
const recentItemsSchema = z.array(recentItemSchema);

export type RecentItem = z.infer<typeof recentItemSchema>;

export function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error("Recent-history storage contains invalid JSON.", { cause: error });
  }

  const result = recentItemsSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Recent-history storage has an invalid shape: ${result.error.message}`);
  }
  return result.data;
}

export function addRecent(app: CatalogItem) {
  if (typeof window === "undefined") return;
  const existing = loadRecent().filter((recentItem) => recentItem.id !== app.id);
  const next: RecentItem[] = [
    {
      id: app.id,
      name: app.name,
      primaryUrl: app.primaryUrl,
      category: app.category,
      status: app.status,
      tags: app.tags,
      lastOpened: new Date().toISOString(),
    },
    ...existing,
  ].slice(0, MAX_RECENT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
