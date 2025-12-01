import Dexie, { Table } from "dexie";
import type {
  Bookmark,
  CalendarEvent,
  FamilyRhythm,
  MetricLog,
  MovementLog,
  Note,
  NutritionLog,
  Pin,
  Routine,
  RoutineRun,
  SleepLog,
  Task,
} from "./schema";
import { uuid } from "./id";

class JoshHubDB extends Dexie {
  notes!: Table<Note>;
  tasks!: Table<Task>;
  bookmarks!: Table<Bookmark>;
  routines!: Table<Routine>;
  routineRuns!: Table<RoutineRun>;
  pins!: Table<Pin>;
  events!: Table<CalendarEvent>;
  sleep!: Table<SleepLog>;
  movement!: Table<MovementLog>;
  nutrition!: Table<NutritionLog>;
  metrics!: Table<MetricLog>;
  family!: Table<FamilyRhythm>;

  constructor() {
    super("joshhub-db");
    this.version(1).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
    });
    this.version(2).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
    });
    this.version(3).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
    });
  }
}

export const db = new JoshHubDB();

// Seed routines if empty (morning/evening)
export async function seedRoutines() {
  const count = await db.routines.count();
  if (count === 0) {
    const now = Date.now();
    await db.routines.bulkAdd([
      {
        id: uuid(),
        name: "Morning start",
        tags: ["routine"],
        createdAt: now,
        items: [
          { id: uuid(), label: "Water + light", type: "check" },
          { id: uuid(), label: "Plan the day", type: "check" },
          { id: uuid(), label: "Movement 10m", type: "timer", seconds: 600 },
        ],
      },
      {
        id: uuid(),
        name: "Evening wind-down",
        tags: ["routine"],
        createdAt: now,
        items: [
          { id: uuid(), label: "Screens off", type: "check" },
          { id: uuid(), label: "Tidy reset", type: "check" },
          { id: uuid(), label: "Stretch", type: "timer", seconds: 300 },
        ],
      },
    ]);
  }
}
