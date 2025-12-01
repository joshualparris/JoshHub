import { LifeItem } from "../models/lifeContent";

export interface LifeContentRepo {
  list(area?: string): Promise<LifeItem[]>;
  get(id: string): Promise<LifeItem | undefined>;
  add(item: LifeItem): Promise<LifeItem>;
  update(id: string, patch: Partial<LifeItem>): Promise<LifeItem | undefined>;
  remove(id: string): Promise<void>;
}

export function createInMemoryLifeContentRepo(initial: LifeItem[] = []): LifeContentRepo {
  const store = new Map<string, LifeItem>(initial.map((i) => [i.id, i]));

  return {
    async list(area) {
      const all = Array.from(store.values());
      if (!area) return all.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
      return all.filter((i) => i.area === area).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    },
    async get(id: string) {
      return store.get(id);
    },
    async add(item: LifeItem) {
      store.set(item.id, item);
      return item;
    },
    async update(id: string, patch: Partial<LifeItem>) {
      const existing = store.get(id);
      if (!existing) return undefined;
      const updated: LifeItem = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      store.set(id, updated);
      return updated;
    },
    async remove(id: string) {
      store.delete(id);
    },
  };
}
