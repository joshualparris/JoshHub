import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./dexie";

export function useNotes(nodeId?: string) {
  return useLiveQuery(async () => {
    const list = nodeId
      ? await db.notes.where("nodeId").equals(nodeId).reverse().sortBy("updatedAt")
      : await db.notes.orderBy("updatedAt").reverse().toArray();
    return list;
  }, [nodeId]);
}

export function useNote(id?: string) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    return db.notes.get(id);
  }, [id]);
}

export function useTasks() {
  return useLiveQuery(async () => {
    return db.tasks.orderBy("updatedAt").reverse().toArray();
  }, []);
}

export function useRoutines() {
  return useLiveQuery(async () => db.routines.toArray(), []);
}

export function useRoutine(id?: string) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    return db.routines.get(id);
  }, [id]);
}

export function useRoutineRuns(routineId?: string) {
  return useLiveQuery(async () => {
    if (!routineId) return [];
    return db.routineRuns.where("routineId").equals(routineId).reverse().toArray();
  }, [routineId]);
}

export function useBookmarks() {
  return useLiveQuery(async () => db.bookmarks.orderBy("createdAt").reverse().toArray(), []);
}

export function usePins() {
  return useLiveQuery(async () => db.pins.toArray(), []);
}
