import { useLiveQuery } from "dexie-react-hooks";

import { db } from "./db/dexie";

const APP_PIN_PREFIX = "app:";

function appPinId(id: string) {
  return `${APP_PIN_PREFIX}${id}`;
}

function isAppPin(id: string) {
  return id.startsWith(APP_PIN_PREFIX);
}

export async function loadPinnedLife(): Promise<string[]> {
  const pins = await db.pins.toArray();
  // Legacy life-area pins are intentionally unprefixed. App pins are namespaced
  // so both user-facing pin concepts can share one backed-up table safely.
  return pins.filter((pin) => !isAppPin(pin.id)).map((pin) => pin.id);
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

export function usePinnedAppIds(): string[] {
  const pins = useLiveQuery(() => db.pins.toArray(), []);
  return (pins ?? [])
    .filter((pin) => isAppPin(pin.id))
    .map((pin) => pin.id.slice(APP_PIN_PREFIX.length));
}

export async function togglePinnedApp(id: string): Promise<void> {
  const pinId = appPinId(id);
  if (await db.pins.get(pinId)) {
    await db.pins.delete(pinId);
  } else {
    await db.pins.put({ id: pinId, createdAt: Date.now() });
  }
}

export async function migrateLegacyPinnedApps(ids: string[]): Promise<void> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return;

  await db.pins.bulkPut(
    uniqueIds.map((id) => ({
      id: appPinId(id),
      createdAt: Date.now(),
    }))
  );
}
