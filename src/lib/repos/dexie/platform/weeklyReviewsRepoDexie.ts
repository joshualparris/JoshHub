import { db } from "../../../db/dexie";
import { PlatformWeeklyReview } from "../../../db/schema";
import { uuid } from "../../../db/id";

export const weeklyReviewsRepo = {
  async list() {
    // Sort by weekStart descending (newest weeks first)
    return db.platformWeeklyReviews.orderBy("weekStart").reverse().toArray();
  },
  async add(
    item: Omit<PlatformWeeklyReview, "id" | "createdAt" | "updatedAt">
  ) {
    const id = uuid();
    const now = new Date().toISOString();
    const newItem: PlatformWeeklyReview = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.platformWeeklyReviews.add(newItem);
    return newItem;
  },
  async update(id: string, patch: Partial<PlatformWeeklyReview>) {
    const update = { ...patch, updatedAt: new Date().toISOString() };
    await db.platformWeeklyReviews.update(id, update);
  },
  async delete(id: string) {
    await db.platformWeeklyReviews.delete(id);
  },
};
