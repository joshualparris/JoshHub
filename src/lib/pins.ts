import { db } from "./db/dexie";

export async function loadPinnedLife(): Promise<string[]> {
  const pins = await db.pins.toArray();
  return pins.map((p) => p.id);
}

export async function togglePinnedLife(slug: string): Promise<string[]> {
  const pins = await loadPinnedLife();
  if (pins.includes(slug)) {
    await db.pins.delete(slug);
  } else {
    await db.pins.put({ id: slug, createdAt: Date.now() });
  }
  return loadPinnedLife();
}
