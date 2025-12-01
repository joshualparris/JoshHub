import { CaptureItem, makeCapture } from "../models/capture";

export interface CaptureRepo {
  list(): Promise<CaptureItem[]>;
  get(id: string): Promise<CaptureItem | undefined>;
  add(item: Partial<CaptureItem> & Pick<CaptureItem, 'kind' | 'title'>): Promise<CaptureItem>;
  update(id: string, patch: Partial<CaptureItem>): Promise<CaptureItem | undefined>;
  remove(id: string): Promise<void>;
  search(query: string): Promise<CaptureItem[]>;
}

export function createInMemoryCaptureRepo(initial: CaptureItem[] = []): CaptureRepo {
  const store = new Map<string, CaptureItem>(initial.map((i) => [i.id, i]));

  return {
    async list() {
      return Array.from(store.values()).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
    },
    async get(id: string) {
      return store.get(id);
    },
    async add(partial) {
      const item = makeCapture(partial as any);
      store.set(item.id, item);
      return item;
    },
    async update(id: string, patch) {
      const existing = store.get(id);
      if (!existing) return undefined;
      const updated: CaptureItem = { ...existing, ...patch, updatedAt: new Date().toISOString() };
      store.set(id, updated);
      return updated;
    },
    async remove(id: string) {
      store.delete(id);
    },
    async search(query: string) {
      const q = query.trim().toLowerCase();
      return Array.from(store.values()).filter((i) => (i.title + " " + (i.content || "") + " " + (i.tags || []).join(" ")).toLowerCase().includes(q));
    },
  };
}
