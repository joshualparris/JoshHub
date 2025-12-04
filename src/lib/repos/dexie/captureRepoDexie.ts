import { db } from "../../db/dexie";
import type { CaptureRepo } from "../captureRepo";
import type { CaptureItem } from "../../models/capture";
import type { Bookmark, Note, Task } from "../../db/schema";
import { noteToCapture, taskToCapture, bookmarkToCapture } from "../../logic/mappers/dbToCapture";

function mergeAndSort(items: CaptureItem[]) {
  return items.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));
}

function makeId(prefix?: string) {
  const base = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();
  return prefix ? `${prefix}:${base}` : base;
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
    async add(partial: Partial<CaptureItem> & Pick<CaptureItem, "kind" | "title">) {
      // naive: add as a note by default when kind === 'note' or when no url
      const kind = partial.kind;
      if (kind === "bookmark" && partial.url) {
        const id = partial.id ? partial.id.replace(/^bookmark:/, "") : makeId();
        const rec: Bookmark = {
          id,
          title: partial.title,
          url: partial.url,
          tags: partial.tags ?? [],
          createdAt: Date.now(),
        };
        await db.bookmarks.put(rec);
        return bookmarkToCapture(rec);
      }
      if (kind === "task") {
        const id = partial.id ? partial.id.replace(/^task:/, "") : makeId();
        const rec: Task = {
          id,
          title: partial.title,
          status: partial.status ?? "open",
          priority: "med",
          dueDate: partial.dueDate ?? null,
          tags: partial.tags ?? [],
          projectId: partial.area ?? null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.tasks.put(rec);
        return taskToCapture(rec);
      }
      // default to note
      const id = partial.id ? partial.id.replace(/^note:/, "") : makeId();
      const rec: Note = {
        id,
        nodeId: null,
        title: partial.title,
        body: partial.content ?? "",
        tags: partial.tags ?? [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lifeAreaSlug: partial.area ?? null,
      };
      await db.notes.put(rec);
      return noteToCapture(rec);
    },
    async update(id: string, patch: Partial<CaptureItem>) {
      if (id.startsWith("note:")) {
        const key = id.replace(/^note:/, "");
        await db.notes.update(key, { ...patch, updatedAt: Date.now() });
        const rec = await db.notes.get(key);
        return rec ? noteToCapture(rec) : undefined;
      }
      if (id.startsWith("task:")) {
        const key = id.replace(/^task:/, "");
        await db.tasks.update(key, { ...patch, updatedAt: Date.now() });
        const rec = await db.tasks.get(key);
        return rec ? taskToCapture(rec) : undefined;
      }
      if (id.startsWith("bookmark:")) {
        const key = id.replace(/^bookmark:/, "");
        await db.bookmarks.update(key, { ...patch });
        const rec = await db.bookmarks.get(key);
        return rec ? bookmarkToCapture(rec) : undefined;
      }
      return undefined;
    },
    async remove(id: string) {
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
    async search(query: string) {
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
