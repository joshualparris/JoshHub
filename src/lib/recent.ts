import type { CatalogItem } from "@/data/apps";

const STORAGE_KEY = "joshhub-recent";
const MAX_RECENT = 8;

export interface RecentItem {
  id: string;
  name: string;
  primaryUrl: string;
  category: string;
  status: string;
  tags: string[];
  lastOpened: string;
}

export function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentItem[];
  } catch {
    return [];
  }
}

export function addRecent(app: CatalogItem) {
  if (typeof window === "undefined") return;
  const now = new Date().toISOString();
  const existing = loadRecent().filter((item) => item.id !== app.id);
  const next: RecentItem[] = [
    {
      id: app.id,
      name: app.name,
      primaryUrl: app.primaryUrl,
      category: app.category,
      status: app.status,
      tags: app.tags,
      lastOpened: now,
    },
    ...existing,
  ].slice(0, MAX_RECENT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
