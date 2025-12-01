import type { Note, Task, Bookmark } from "../../db/schema";
import type { CaptureItem } from "../../models/capture";

function toIso(msOrIso: number | string | undefined | null): string {
  if (!msOrIso) return new Date().toISOString();
  if (typeof msOrIso === "number") return new Date(msOrIso).toISOString();
  return msOrIso;
}

export function noteToCapture(n: Note): CaptureItem {
  return {
    id: `note:${n.id}`,
    createdAt: toIso(n.createdAt),
    updatedAt: toIso(n.updatedAt),
    kind: "note",
    area: (n.lifeAreaSlug as any) || "inbox",
    title: n.title || "",
    content: n.body || "",
    tags: n.tags || [],
    status: undefined,
  } as CaptureItem;
}

export function taskToCapture(t: Task): CaptureItem {
  return {
    id: `task:${t.id}`,
    createdAt: toIso(t.createdAt),
    updatedAt: toIso(t.updatedAt),
    kind: "task",
    area: (t.projectId as any) || "inbox",
    title: t.title || "",
    content: "",
    tags: t.tags || [],
    status: t.status === "done" ? "done" : "open",
    dueDate: t.dueDate ?? undefined,
  } as CaptureItem;
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
  } as CaptureItem;
}

export function dbRecordToCapture(rec: Note | Task | Bookmark): CaptureItem {
  if ((rec as Note).body !== undefined) return noteToCapture(rec as Note);
  if ((rec as Task).status !== undefined) return taskToCapture(rec as Task);
  return bookmarkToCapture(rec as Bookmark);
}
