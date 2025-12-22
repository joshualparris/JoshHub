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
  return useLiveQuery(async () => db.tasks.orderBy("updatedAt").reverse().toArray(), []);
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

export function useRoutineRunsAll() {
  return useLiveQuery(async () => db.routineRuns.toArray(), []);
}

export function useBookmarks() {
  return useLiveQuery(async () => db.bookmarks.orderBy("createdAt").reverse().toArray(), []);
}

export function usePins() {
  return useLiveQuery(async () => db.pins.toArray(), []);
}

// Learn
export function useLearnTopics() {
  return useLiveQuery(async () => db.learnTopics.orderBy("updatedAt").reverse().toArray(), []);
}

export function useLearnTopic(id?: string) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    return db.learnTopics.get(id);
  }, [id]);
}

export function useLearnResources() {
  return useLiveQuery(async () => db.learnResources.orderBy("updatedAt").reverse().toArray(), []);
}

export function useLearnSessions() {
  return useLiveQuery(async () => db.learnSessions.orderBy("createdAt").reverse().toArray(), []);
}

// Health
export function useActivities() {
  return useLiveQuery(async () => db.activities.orderBy("startTimeIso").reverse().toArray(), []);
}

export function useDailyMetrics() {
  return useLiveQuery(async () => db.dailyMetrics.orderBy("date").reverse().toArray(), []);
}

export function useHealthImports() {
  return useLiveQuery(async () => db.healthImports.orderBy("createdAt").reverse().toArray(), []);
}

export function useTelemetry(type?: string) {
  return useLiveQuery(async () => {
    if (type) {
      return db.telemetry.where("type").equals(type).reverse().sortBy("timestampIso");
    }
    return db.telemetry.orderBy("timestampIso").reverse().toArray();
  }, [type]);
}

export function useDigitalEvents(limit = 50) {
  return useLiveQuery(async () => db.digitalEvents.orderBy("timestampIso").reverse().limit(limit).toArray(), [limit]);
}
