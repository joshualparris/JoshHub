import { db } from "./dexie";
import { uuid } from "./id";
import type {
  Bookmark,
  Note,
  Routine,
  RoutineRun,
  Task,
  TaskPriority,
  TaskStatus,
} from "./schema";

export async function createNote(partial: Partial<Note> & { title: string }) {
  const now = Date.now();
  const note: Note = {
    id: partial.id ?? uuid(),
    nodeId: partial.nodeId,
    lifeAreaSlug: partial.lifeAreaSlug ?? null,
    title: partial.title,
    body: partial.body ?? "",
    tags: partial.tags ?? [],
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    archivedAt: partial.archivedAt ?? null,
  };
  await db.notes.put(note);
  return note;
}

export async function updateNote(id: string, updates: Partial<Note>) {
  const now = Date.now();
  await db.notes.update(id, { ...updates, updatedAt: now });
}

export async function deleteNote(id: string) {
  await db.notes.delete(id);
}

export async function createTask(input: {
  title: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  projectId?: string | null;
}) {
  const now = Date.now();
  const task: Task = {
    id: uuid(),
    title: input.title,
    status: "open",
    priority: input.priority ?? "med",
    dueDate: input.dueDate ?? null,
    tags: input.tags ?? [],
    projectId: input.projectId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.tasks.put(task);
  return task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  await db.tasks.update(id, { ...updates, updatedAt: Date.now() });
}

export async function toggleTaskStatus(id: string, status: TaskStatus) {
  await db.tasks.update(id, { status, updatedAt: Date.now() });
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id);
}

export async function createBookmark(input: { title: string; url: string; tags?: string[] }) {
  const now = Date.now();
  const bookmark: Bookmark = {
    id: uuid(),
    title: input.title,
    url: input.url,
    tags: input.tags ?? [],
    createdAt: now,
  };
  await db.bookmarks.put(bookmark);
  return bookmark;
}

export async function updateBookmark(id: string, updates: Partial<Bookmark>) {
  await db.bookmarks.update(id, updates);
  return db.bookmarks.get(id);
}

export async function deleteBookmark(id: string) {
  await db.bookmarks.delete(id);
}

export async function createRoutine(input: { name: string; items: Routine["items"]; tags?: string[] }) {
  const now = Date.now();
  const routine: Routine = {
    id: uuid(),
    name: input.name,
    items: input.items,
    tags: input.tags ?? [],
    createdAt: now,
  };
  await db.routines.put(routine);
  return routine;
}

export async function updateRoutine(id: string, updates: Partial<Routine>) {
  await db.routines.update(id, updates);
}

export async function deleteRoutine(id: string) {
  await db.routines.delete(id);
}

export async function logRoutineRun(input: { routineId: string; completedCount: number }) {
  const run: RoutineRun = {
    id: uuid(),
    routineId: input.routineId,
    startedAt: Date.now(),
    finishedAt: Date.now(),
    completedCount: input.completedCount,
  };
  await db.routineRuns.put(run);
  return run;
}

export async function addPin(slug: string) {
  await db.pins.put({ id: slug, createdAt: Date.now() });
}

export async function removePin(slug: string) {
  await db.pins.delete(slug);
}

// Backup, restore and reset live in ./backup.ts. They used to be here, but
// keeping them alongside the per-record actions meant the list of tables to
// back up was maintained separately from the list to restore and the list to
// clear, and the three fell out of step. ./backup.ts derives all three from a
// single registry instead.
