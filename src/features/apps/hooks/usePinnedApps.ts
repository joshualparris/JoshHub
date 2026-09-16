"use client";

import { useEffect } from "react";

import { migrateLegacyPinnedApps, togglePinnedApp, usePinnedAppIds } from "@/lib/pins";

type UsePinnedAppsResult = {
  pinnedIds: string[];
  isPinned: (id: string) => boolean;
  togglePinned: (id: string) => void;
};

const LEGACY_STORAGE_KEY = "joshhub.pinnedApps.v1";

function readLegacyPinnedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function usePinnedApps(): UsePinnedAppsResult {
  const pinnedIds = usePinnedAppIds();

  useEffect(() => {
    // Pinned apps used to live only in localStorage, so they were excluded from
    // backups. Migrate once into the canonical Dexie pins table, then remove the
    // legacy copy only after the database write succeeds.
    const legacyIds = readLegacyPinnedIds();
    if (legacyIds.length === 0) return;

    void migrateLegacyPinnedApps(legacyIds).then(() => {
      try {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // A storage failure must not undo the successful database migration.
      }
    });
  }, []);

  return {
    pinnedIds,
    isPinned: (id) => pinnedIds.includes(id),
    togglePinned: (id) => {
      void togglePinnedApp(id);
    },
  };
}
