import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./dexie";
import { uuid } from "./id";
import type { SleepLog, MovementLog, NutritionLog, MetricLog } from "./schema";

export async function createSleepLog(input: {
  date: string;
  bedtimeIso?: string;
  wakeIso?: string;
  quality?: number;
  durationMinutes?: number;
  notes?: string;
  tags?: string[];
}) {
  const log: SleepLog = {
    id: uuid(),
    date: input.date,
    bedtimeIso: input.bedtimeIso ?? null,
    wakeIso: input.wakeIso ?? null,
    durationMinutes: input.durationMinutes ?? null,
    quality: input.quality ?? null,
    notes: input.notes,
    tags: input.tags ?? [],
    createdAt: Date.now(),
  };
  await db.sleep.put(log);
  return log;
}

export function useSleep() {
  return useLiveQuery(async () => db.sleep.orderBy("date").reverse().toArray(), []);
}

export async function createMovementLog(input: {
  date: string;
  type: MovementLog["type"];
  minutes: number;
  intensity: MovementLog["intensity"];
  notes?: string;
}) {
  const log: MovementLog = {
    id: uuid(),
    date: input.date,
    type: input.type,
    minutes: input.minutes,
    intensity: input.intensity,
    notes: input.notes,
    createdAt: Date.now(),
  };
  await db.movement.put(log);
  return log;
}

export function useMovement() {
  return useLiveQuery(async () => db.movement.orderBy("date").reverse().toArray(), []);
}

export async function createNutritionLog(input: {
  date: string;
  summary: string;
  proteinGrams?: number;
  vegServes?: number;
  satFatGrams?: number;
  notes?: string;
}) {
  const log: NutritionLog = {
    id: uuid(),
    date: input.date,
    summary: input.summary,
    proteinGrams: input.proteinGrams ?? null,
    vegServes: input.vegServes ?? null,
    satFatGrams: input.satFatGrams ?? null,
    notes: input.notes,
    createdAt: Date.now(),
  };
  await db.nutrition.put(log);
  return log;
}

export function useNutrition() {
  return useLiveQuery(async () => db.nutrition.orderBy("date").reverse().toArray(), []);
}

export async function createMetricLog(input: {
  dateTimeIso: string;
  metricType: MetricLog["metricType"];
  value: number;
  unit: string;
  notes?: string;
}) {
  const log: MetricLog = {
    id: uuid(),
    dateTimeIso: input.dateTimeIso,
    metricType: input.metricType,
    value: input.value,
    unit: input.unit,
    notes: input.notes,
    createdAt: Date.now(),
  };
  await db.metrics.put(log);
  return log;
}

export function useMetrics() {
  return useLiveQuery(async () => db.metrics.orderBy("dateTimeIso").reverse().toArray(), []);
}
