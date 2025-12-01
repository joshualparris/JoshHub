import { LifeArea, normalizeLifeArea } from "./life";

export type CaptureKind = "note" | "task" | "bookmark" | "prayer" | "idea" | "memory";
export type CaptureStatus = "open" | "done";

export interface CaptureItem {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  kind: CaptureKind;
  area: LifeArea;
  title: string;
  content?: string;
  url?: string;
  tags?: string[];
  status?: CaptureStatus;
  dueDate?: string; // ISO
  pinned?: boolean;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeCapture(partial: Partial<CaptureItem> & Pick<CaptureItem, 'kind' | 'title'>): CaptureItem {
  const id = partial.id ?? makeId();
  const createdAt = partial.createdAt ?? nowIso();
  const updatedAt = partial.updatedAt ?? createdAt;
  const area = (partial.area ? normalizeLifeArea(partial.area) : normalizeLifeArea("inbox")) as LifeArea;
  return {
    id,
    createdAt,
    updatedAt,
    kind: partial.kind,
    area,
    title: partial.title,
    content: partial.content ?? "",
    url: partial.url,
    tags: partial.tags ?? [],
    status: partial.status ?? "open",
    dueDate: partial.dueDate,
    pinned: partial.pinned ?? false,
  };
}
