import { LifeArea } from "./life";

export type LifeItemType = "prompt" | "principle" | "checklist" | "resource" | "spark" | "note";

export interface LifeItem {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  area: LifeArea;
  type: LifeItemType;
  title: string;
  body?: string; // markdown
  tags?: string[];
  pinned?: boolean;
  archived?: boolean;
}

export function makeLifeItem(partial: Partial<LifeItem> & Pick<LifeItem, 'id' | 'area' | 'type' | 'title'>): LifeItem {
  const now = new Date().toISOString();
  return {
    id: partial.id,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? (partial.createdAt ?? now),
    area: partial.area,
    type: partial.type,
    title: partial.title,
    body: partial.body ?? "",
    tags: partial.tags ?? [],
    pinned: partial.pinned ?? false,
    archived: partial.archived ?? false,
  };
}
