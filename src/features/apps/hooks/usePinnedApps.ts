"use client";

import { useEffect, useState } from "react";

type UsePinnedAppsResult = {
  pinnedIds: string[];
  isPinned: (id: string) => boolean;
  togglePinned: (id: string) => void;
};

const STORAGE_KEY = "joshhub.pinnedApps.v1";

export function usePinnedApps(): UsePinnedAppsResult {
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedIds));
    } catch {
      // ignore quota / private mode errors
    }
  }, [pinnedIds]);

  const isPinned = (id: string) => pinnedIds.includes(id);

  const togglePinned = (id: string) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return { pinnedIds, isPinned, togglePinned };
}
