import { db } from "../../../db/dexie";
import { PlatformMoveOp } from "../../../db/schema";
import { uuid } from "../../../db/id";

const STATUS_ORDER: Record<PlatformMoveOp["status"], number> = {
  doing: 1,
  todo: 2,
  done: 3,
};

export const moveOpsRepo = {
  async list() {
    const items = await db.platformMoveOps.toArray();
    return items.sort((a, b) => {
      // 1. Status
      const statusDiff =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      // 2. Due Date (nulls last)
      if (a.dueDate && b.dueDate) {
        if (a.dueDate < b.dueDate) return -1;
        if (a.dueDate > b.dueDate) return 1;
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      // 3. CreatedAt (newest first)
      return b.createdAt.localeCompare(a.createdAt);
    });
  },
  async add(item: Omit<PlatformMoveOp, "id" | "createdAt" | "updatedAt">) {
    const id = uuid();
    const now = new Date().toISOString();
    const newItem: PlatformMoveOp = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.platformMoveOps.add(newItem);
    return newItem;
  },
  async update(id: string, patch: Partial<PlatformMoveOp>) {
    const update = { ...patch, updatedAt: new Date().toISOString() };
    await db.platformMoveOps.update(id, update);
  },
  async delete(id: string) {
    await db.platformMoveOps.delete(id);
  },
  async setStatus(id: string, status: PlatformMoveOp["status"]) {
    return this.update(id, { status });
  },
};
