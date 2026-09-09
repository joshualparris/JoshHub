import { db } from "../../../db/dexie";
import { PlatformDecisionCard } from "../../../db/schema";
import { uuid } from "../../../db/id";

const STATUS_ORDER: Record<PlatformDecisionCard["status"], number> = {
  open: 1,
  parked: 2,
  decided: 3,
};

export const decisionCardsRepo = {
  async list() {
    const items = await db.platformDecisionCards.toArray();
    return items.sort((a, b) => {
      // 1. Status
      const statusDiff =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      // 2. Due By (nulls last)
      if (a.dueBy && b.dueBy) {
        if (a.dueBy < b.dueBy) return -1;
        if (a.dueBy > b.dueBy) return 1;
      } else if (a.dueBy) {
        return -1;
      } else if (b.dueBy) {
        return 1;
      }

      // 3. CreatedAt (newest first)
      return b.createdAt.localeCompare(a.createdAt);
    });
  },
  async add(
    item: Omit<PlatformDecisionCard, "id" | "createdAt" | "updatedAt">
  ) {
    const id = uuid();
    const now = new Date().toISOString();
    const newItem: PlatformDecisionCard = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.platformDecisionCards.add(newItem);
    return newItem;
  },
  async update(id: string, patch: Partial<PlatformDecisionCard>) {
    const update = { ...patch, updatedAt: new Date().toISOString() };
    await db.platformDecisionCards.update(id, update);
  },
  async delete(id: string) {
    await db.platformDecisionCards.delete(id);
  },
  async setStatus(id: string, status: PlatformDecisionCard["status"]) {
    return this.update(id, { status });
  },
};
