import type { Table } from "dexie";
import { db } from "../../db/dexie";
import type { LifeContentRepo } from "../lifeContentRepo";
import type { LifeItem } from "../../models/lifeContent";

// Some repos may not have a lifeContent table yet. In that case we fallback to
// an in-memory store so the adapter is safe and non-destructive. Codex should
// implement a real table later and remove the fallback.

export function createLifeContentRepoDexie(): LifeContentRepo {
  const hasTable = (db as { lifeContent?: Table<LifeItem, string> }).lifeContent !== undefined;
  if (!hasTable) {
    const store = new Map<string, LifeItem>();
    return {
      async list(area) {
        const all = Array.from(store.values());
        return area ? all.filter((i) => i.area === area) : all;
      },
      async get(id) {
        return store.get(id);
      },
      async add(item) {
        store.set(item.id, item);
        return item;
      },
      async update(id, patch) {
        const existing = store.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
        store.set(id, updated);
        return updated;
      },
      async remove(id) {
        store.delete(id);
      },
    };
  }

  // If a table exists, wire the CRUD operations to Dexie. Table shape must be
  // adapted by Codex if needed.
  const table = (db as { lifeContent?: Table<LifeItem, string> }).lifeContent;
  if (!table) {
    throw new Error("lifeContent table not found in Dexie schema");
  }

  return {
    async list(area) {
      const rows = await table.toArray();
      const items: LifeItem[] = rows.map((r) => ({ ...r }));
      return area ? items.filter((i) => i.area === area) : items;
    },
    async get(id) {
      const r = await table.get(id);
      return r ? ({ ...r } as LifeItem) : undefined;
    },
    async add(item) {
      await table.add(item);
      return item;
    },
    async update(id, patch) {
      await table.update(id, patch);
      const r = await table.get(id);
      return r ? ({ ...r } as LifeItem) : undefined;
    },
    async remove(id) {
      await table.delete(id);
    },
  };
}

export default createLifeContentRepoDexie;
