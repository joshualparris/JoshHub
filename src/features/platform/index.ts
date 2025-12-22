import { useLiveQuery } from "dexie-react-hooks";
import { moveOpsRepo } from "../../lib/repos/dexie/platform/moveOpsRepoDexie";
import { decisionCardsRepo } from "../../lib/repos/dexie/platform/decisionCardsRepoDexie";
import { opportunitiesRepo } from "../../lib/repos/dexie/platform/opportunitiesRepoDexie";
import { weeklyReviewsRepo } from "../../lib/repos/dexie/platform/weeklyReviewsRepoDexie";
import { seedPlatformData } from "../../lib/repos/dexie/platform/seed";
import {
  PlatformMoveOp,
  PlatformDecisionCard,
  PlatformOpportunity,
  PlatformWeeklyReview,
} from "../../lib/db/schema";

export type {
  PlatformMoveOp,
  PlatformDecisionCard,
  PlatformOpportunity,
  PlatformWeeklyReview,
} from "../../lib/db/schema";

export function usePlatformMoveOps() {
  return useLiveQuery(() => moveOpsRepo.list(), []) ?? [];
}

export function usePlatformDecisionCards() {
  return useLiveQuery(() => decisionCardsRepo.list(), []) ?? [];
}

export function usePlatformOpportunities() {
  return useLiveQuery(() => opportunitiesRepo.list(), []) ?? [];
}

export function usePlatformWeeklyReviews() {
  return useLiveQuery(() => weeklyReviewsRepo.list(), []) ?? [];
}

export const platformActions = {
  // MoveOps
  addMoveOp: (
    item: Omit<PlatformMoveOp, "id" | "createdAt" | "updatedAt">
  ) => moveOpsRepo.add(item),
  updateMoveOp: (id: string, patch: Partial<PlatformMoveOp>) =>
    moveOpsRepo.update(id, patch),
  deleteMoveOp: (id: string) => moveOpsRepo.delete(id),
  setMoveOpStatus: (id: string, status: PlatformMoveOp["status"]) =>
    moveOpsRepo.setStatus(id, status),

  // Decision Cards
  addDecisionCard: (
    item: Omit<PlatformDecisionCard, "id" | "createdAt" | "updatedAt">
  ) => decisionCardsRepo.add(item),
  updateDecisionCard: (id: string, patch: Partial<PlatformDecisionCard>) =>
    decisionCardsRepo.update(id, patch),
  deleteDecisionCard: (id: string) => decisionCardsRepo.delete(id),
  setDecisionStatus: (id: string, status: PlatformDecisionCard["status"]) =>
    decisionCardsRepo.setStatus(id, status),

  // Opportunities
  addOpportunity: (
    item: Omit<PlatformOpportunity, "id" | "createdAt" | "updatedAt">
  ) => opportunitiesRepo.add(item),
  updateOpportunity: (id: string, patch: Partial<PlatformOpportunity>) =>
    opportunitiesRepo.update(id, patch),
  deleteOpportunity: (id: string) => opportunitiesRepo.delete(id),
  setOpportunityStage: (id: string, stage: PlatformOpportunity["stage"]) =>
    opportunitiesRepo.setStage(id, stage),

  // Weekly Reviews
  addWeeklyReview: (
    item: Omit<PlatformWeeklyReview, "id" | "createdAt" | "updatedAt">
  ) => weeklyReviewsRepo.add(item),
  updateWeeklyReview: (id: string, patch: Partial<PlatformWeeklyReview>) =>
    weeklyReviewsRepo.update(id, patch),
  deleteWeeklyReview: (id: string) => weeklyReviewsRepo.delete(id),
};
