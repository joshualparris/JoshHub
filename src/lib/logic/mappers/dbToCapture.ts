import type { Note, Task, Bookmark } from "../../db/schema";
import type { CaptureItem } from "../../models/capture";

function toIso(msOrIso: number | string | undefined | null): string {
  if (!msOrIso) return new Date().toISOString();
  if (typeof msOrIso === "number") return new Date(msOrIso).toISOString();
  return msOrIso;
}

export function noteToCapture(n: Note): CaptureItem {
  const area = (n.lifeAreaSlug ?? "inbox") as CaptureItem["area"];
  return {
    id: `note:${n.id}`,
    createdAt: toIso(n.createdAt),
    updatedAt: toIso(n.updatedAt),
    kind: "note",
    area,
    title: n.title || "",
    content: n.body || "",
    tags: n.tags || [],
    status: undefined,
  };
}

export function taskToCapture(t: Task): CaptureItem {
  const area = (t.projectId ?? "inbox") as CaptureItem["area"];
  return {
    id: `task:${t.id}`,
    createdAt: toIso(t.createdAt),
    updatedAt: toIso(t.updatedAt),
    kind: "task",
    area,
    title: t.title || "",
    content: "",
    tags: t.tags || [],
    status: t.status === "done" ? "done" : "open",
    dueDate: t.dueDate ?? undefined,
  };
}

export function bookmarkToCapture(b: Bookmark): CaptureItem {
  return {
    id: `bookmark:${b.id}`,
    createdAt: toIso(b.createdAt),
    updatedAt: toIso(b.createdAt),
    kind: "bookmark",
    area: "inbox",
    title: b.title || b.url || "",
    content: "",
    url: b.url,
    tags: b.tags || [],
  };
}

export function dbRecordToCapture(rec: Note | Task | Bookmark): CaptureItem {
  if ("body" in rec) return noteToCapture(rec);
  if ("status" in rec) return taskToCapture(rec);
  return bookmarkToCapture(rec);
}
