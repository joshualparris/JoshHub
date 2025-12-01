import { db } from "../../db/dexie";
import type { CaptureRepo } from "../captureRepo";
import type { CaptureItem } from "../../models/capture";
import { noteToCapture, taskToCapture, bookmarkToCapture } from "../../logic/mappers/dbToCapture";

function mergeAndSort(items: CaptureItem[]) {
  return items.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));
}

export function createCaptureRepoDexie(): CaptureRepo {
  return {
    async list() {
      const [notes, tasks, bookmarks] = await Promise.all([db.notes.toArray(), db.tasks.toArray(), db.bookmarks.toArray()]);
      const mapped = [
        ...notes.map((n) => noteToCapture(n)),
        ...tasks.map((t) => taskToCapture(t)),
        ...bookmarks.map((b) => bookmarkToCapture(b)),
      ];
      return mergeAndSort(mapped);
    },
    async get(id: string) {
      if (id.startsWith("note:")) {
        const rec = await db.notes.get(id.replace(/^note:/, ""));
        return rec ? noteToCapture(rec) : undefined;
      }
      if (id.startsWith("task:")) {
        const rec = await db.tasks.get(id.replace(/^task:/, ""));
        return rec ? taskToCapture(rec) : undefined;
      }
      if (id.startsWith("bookmark:")) {
        const rec = await db.bookmarks.get(id.replace(/^bookmark:/, ""));
        return rec ? bookmarkToCapture(rec) : undefined;
      }
      // fallback: search all tables by id
      const n = await db.notes.get(id);
      if (n) return noteToCapture(n);
      const t = await db.tasks.get(id);
      if (t) return taskToCapture(t);
      const b = await db.bookmarks.get(id);
      if (b) return bookmarkToCapture(b);
      return undefined;
    },
    async add(partial) {
      // naive: add as a note by default when kind === 'note' or when no url
      const kind = partial.kind;
      if (kind === "bookmark" && partial.url) {
        const id = partial.id ? partial.id.replace(/^bookmark:/, "") : undefined;
        const rec = { id, title: partial.title, url: partial.url, tags: partial.tags ?? [], createdAt: Date.now() };
        const newId = await db.bookmarks.add(rec as any);
        const saved = await db.bookmarks.get(newId as any);
        return bookmarkToCapture(saved as any);
      }
      if (kind === "task") {
        const rec = { id: partial.id ? partial.id.replace(/^task:/, "") : undefined, title: partial.title, status: (partial.status as any) ?? "open", priority: "med", dueDate: partial.dueDate ?? null, tags: partial.tags ?? [], projectId: partial.area ?? null, createdAt: Date.now(), updatedAt: Date.now() };
        const newId = await db.tasks.add(rec as any);
        const saved = await db.tasks.get(newId as any);
        return taskToCapture(saved as any);
      }
      // default to note
      const rec = { id: partial.id ? partial.id.replace(/^note:/, "") : undefined, nodeId: null, title: partial.title, body: partial.content ?? "", tags: partial.tags ?? [], createdAt: Date.now(), updatedAt: Date.now(), lifeAreaSlug: partial.area ?? null };
      const newId = await db.notes.add(rec as any);
      const saved = await db.notes.get(newId as any);
      return noteToCapture(saved as any);
    },
    async update(id, patch) {
      if (id.startsWith("note:")) {
        const key = id.replace(/^note:/, "");
        await db.notes.update(key, { ...patch, updatedAt: Date.now() } as any);
        const rec = await db.notes.get(key);
        return rec ? noteToCapture(rec) : undefined;
      }
      if (id.startsWith("task:")) {
        const key = id.replace(/^task:/, "");
        await db.tasks.update(key, { ...patch, updatedAt: Date.now() } as any);
        const rec = await db.tasks.get(key);
        return rec ? taskToCapture(rec) : undefined;
      }
      if (id.startsWith("bookmark:")) {
        const key = id.replace(/^bookmark:/, "");
        await db.bookmarks.update(key, { ...patch } as any);
        const rec = await db.bookmarks.get(key);
        return rec ? bookmarkToCapture(rec) : undefined;
      }
      return undefined;
    },
    async remove(id) {
      if (id.startsWith("note:")) {
        await db.notes.delete(id.replace(/^note:/, ""));
        return;
      }
      if (id.startsWith("task:")) {
        await db.tasks.delete(id.replace(/^task:/, ""));
        return;
      }
      if (id.startsWith("bookmark:")) {
        await db.bookmarks.delete(id.replace(/^bookmark:/, ""));
        return;
      }
      // fallback: try all
      await db.notes.delete(id).catch(() => {});
      await db.tasks.delete(id).catch(() => {});
      await db.bookmarks.delete(id).catch(() => {});
    },
    async search(query) {
      const q = query.trim().toLowerCase();
      const [notes, tasks, bookmarks] = await Promise.all([db.notes.toArray(), db.tasks.toArray(), db.bookmarks.toArray()]);
      const mapped = [
        ...notes.map((n) => noteToCapture(n)),
        ...tasks.map((t) => taskToCapture(t)),
        ...bookmarks.map((b) => bookmarkToCapture(b)),
      ];
      return mapped.filter((i) => {
        const hay = (i.title + " " + (i.content ?? "") + " " + (i.url ?? "") + " " + (i.tags ?? []).join(" ")).toLowerCase();
        return hay.includes(q);
      });
    },
  };
}

export default createCaptureRepoDexie;
