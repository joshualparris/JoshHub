import { db } from "../../../db/dexie";
import { PlatformOpportunity } from "../../../db/schema";
import { uuid } from "../../../db/id";

const STAGE_ORDER: Record<PlatformOpportunity["stage"], number> = {
  committed: 1,
  validated: 2,
  experiment: 3,
  shaped: 4,
  seed: 5,
  parked: 6,
};

export const opportunitiesRepo = {
  async list() {
    const items = await db.platformOpportunities.toArray();
    return items.sort((a, b) => {
      // 1. Stage
      const stageDiff =
        (STAGE_ORDER[a.stage] ?? 99) - (STAGE_ORDER[b.stage] ?? 99);
      if (stageDiff !== 0) return stageDiff;

      // 2. Expected Value (high to low)
      const valA = a.expectedValuePerMonth ?? 0;
      const valB = b.expectedValuePerMonth ?? 0;
      if (valA !== valB) return valB - valA;

      // 3. CreatedAt (newest first)
      return b.createdAt.localeCompare(a.createdAt);
    });
  },
  async add(item: Omit<PlatformOpportunity, "id" | "createdAt" | "updatedAt">) {
    const id = uuid();
    const now = new Date().toISOString();
    const newItem: PlatformOpportunity = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.platformOpportunities.add(newItem);
    return newItem;
  },
  async update(id: string, patch: Partial<PlatformOpportunity>) {
    const update = { ...patch, updatedAt: new Date().toISOString() };
    await db.platformOpportunities.update(id, update);
  },
  async delete(id: string) {
    await db.platformOpportunities.delete(id);
  },
  async setStage(id: string, stage: PlatformOpportunity["stage"]) {
    return this.update(id, { stage });
  },
};
