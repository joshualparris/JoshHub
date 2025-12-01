import { db } from "./dexie";
import { uuid } from "./id";
import type { Bookmark, Note, Routine, RoutineRun, Task, TaskStatus, TaskPriority } from "./schema";

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

export type BackupPayload = {
  version: string;
  exportedAt: string;
  notes: Note[];
  tasks: Task[];
  bookmarks: Bookmark[];
  routines: Routine[];
  routineRuns: RoutineRun[];
  pins: { id: string; createdAt: number }[];
};

export async function exportAll(): Promise<BackupPayload> {
  const [notes, tasks, bookmarks, routines, routineRuns, pins] = await Promise.all([
    db.notes.toArray(),
    db.tasks.toArray(),
    db.bookmarks.toArray(),
    db.routines.toArray(),
    db.routineRuns.toArray(),
    db.pins.toArray(),
  ]);
  return {
    version: "1",
    exportedAt: new Date().toISOString(),
    notes,
    tasks,
    bookmarks,
    routines,
    routineRuns,
    pins,
  };
}

export async function importAll(payload: BackupPayload, mode: "replace" | "merge" = "replace") {
  const { notes = [], tasks = [], bookmarks = [], routines = [], routineRuns = [], pins = [] } =
    payload ?? {};
  if (mode === "replace") {
    await db.transaction("rw", [db.notes, db.tasks, db.bookmarks, db.routines, db.routineRuns, db.pins], async () => {
      await Promise.all([
        db.notes.clear(),
        db.tasks.clear(),
        db.bookmarks.clear(),
        db.routines.clear(),
        db.routineRuns.clear(),
        db.pins.clear(),
      ]);
      await db.notes.bulkAdd(notes);
      await db.tasks.bulkAdd(tasks);
      await db.bookmarks.bulkAdd(bookmarks);
      await db.routines.bulkAdd(routines);
      await db.routineRuns.bulkAdd(routineRuns);
      await db.pins.bulkAdd(pins);
    });
  } else {
    await db.notes.bulkPut(notes);
    await db.tasks.bulkPut(tasks);
    await db.bookmarks.bulkPut(bookmarks);
    await db.routines.bulkPut(routines);
    await db.routineRuns.bulkPut(routineRuns);
    await db.pins.bulkPut(pins);
  }
}

export async function resetAll() {
  await db.transaction(
    "rw",
    [db.notes, db.tasks, db.bookmarks, db.routines, db.routineRuns, db.pins],
    async () => {
      await Promise.all([
        db.notes.clear(),
        db.tasks.clear(),
        db.bookmarks.clear(),
        db.routines.clear(),
        db.routineRuns.clear(),
        db.pins.clear(),
      ]);
    }
  );
}
