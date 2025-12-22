import { db } from "./dexie";
import { uuid } from "./id";
import type {
  PlatformMoveOp,
  PlatformDecisionCard,
  PlatformOpportunity,
  PlatformWeeklyReview,
} from "./schema";

const nowIso = () => new Date().toISOString();

export async function createOpportunity(input: Partial<PlatformOpportunity> & { name: string }) {
  const record: PlatformOpportunity = {
    id: uuid(),
    name: input.name,
    stage: input.stage ?? "seed",
    expectedValuePerMonth: input.expectedValuePerMonth ?? null,
    probability: input.probability ?? null,
    stressScore: input.stressScore ?? null,
    notes: input.notes ?? null,
    tags: input.tags ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.platformOpportunities.put(record);
  return record;
}

export async function updateOpportunity(id: string, updates: Partial<PlatformOpportunity>) {
  await db.platformOpportunities.update(id, { ...updates, updatedAt: nowIso() });
}

export async function deleteOpportunity(id: string) {
  await db.platformOpportunities.delete(id);
}

export async function createDecision(input: Partial<PlatformDecisionCard> & { question: string }) {
  const record: PlatformDecisionCard = {
    id: uuid(),
    question: input.question,
    status: input.status ?? "open",
    dueBy: input.dueBy ?? null,
    decision: input.decision ?? null,
    context: input.context ?? null,
    tags: input.tags ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.platformDecisionCards.put(record);
  return record;
}

export async function updateDecision(id: string, updates: Partial<PlatformDecisionCard>) {
  await db.platformDecisionCards.update(id, { ...updates, updatedAt: nowIso() });
}

export async function deleteDecision(id: string) {
  await db.platformDecisionCards.delete(id);
}

export async function createMoveOpsTask(input: Partial<PlatformMoveOp> & { title: string }) {
  const record: PlatformMoveOp = {
    id: uuid(),
    title: input.title,
    status: input.status ?? "todo",
    dueDate: input.dueDate ?? null,
    notes: input.notes ?? null,
    tags: input.tags ?? null,
    sortOrder: input.sortOrder ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.platformMoveOps.put(record);
  return record;
}

export async function updateMoveOpsTask(id: string, updates: Partial<PlatformMoveOp>) {
  await db.platformMoveOps.update(id, { ...updates, updatedAt: nowIso() });
}

export async function deleteMoveOpsTask(id: string) {
  await db.platformMoveOps.delete(id);
}

export async function createWeeklyReview(input: {
  weekStart: string;
  wins?: string | null;
  drains?: string | null;
  givesLife?: string | null;
  top3?: string[] | null;
  experiment?: string | null;
  notes?: string | null;
}) {
  const record: PlatformWeeklyReview = {
    id: uuid(),
    weekStart: input.weekStart,
    wins: input.wins ?? null,
    drains: input.drains ?? null,
    givesLife: input.givesLife ?? null,
    top3: input.top3 ?? null,
    experiment: input.experiment ?? null,
    notes: input.notes ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await db.platformWeeklyReviews.put(record);
  return record;
}
