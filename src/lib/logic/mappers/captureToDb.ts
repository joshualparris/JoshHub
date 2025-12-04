import type { CaptureItem } from "../../models/capture";

// Minimal capture->db mappers. These are suggestions; exact target tables/fields
// depend on Dexie schema and should be adapted by Codex when wiring.

export function captureToNote(item: CaptureItem) {
  return {
    id: item.id.replace(/^note:/, ""),
    title: item.title,
    body: item.content ?? "",
    tags: item.tags ?? [],
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt).getTime(),
    lifeAreaSlug: item.area,
  };
}

export function captureToTask(item: CaptureItem) {
  return {
    id: item.id.replace(/^task:/, ""),
    title: item.title,
    status: item.status ?? "open",
    priority: "med",
    dueDate: item.dueDate ?? null,
    tags: item.tags ?? [],
    projectId: item.area === "inbox" ? null : item.area,
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt).getTime(),
  };
}

export function captureToBookmark(item: CaptureItem) {
  return {
    id: item.id.replace(/^bookmark:/, ""),
    title: item.title,
    url: item.url ?? "",
    tags: item.tags ?? [],
    createdAt: new Date(item.createdAt).getTime(),
  };
}
