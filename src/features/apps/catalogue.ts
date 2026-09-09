import type { AppCategory, CatalogItem } from "@/data/apps";
import { APP_STATUS_PRIORITY, parseAppStatus, type AppStatus } from "@/data/app-status";

export type AppsStatusFilter = AppStatus | "all";
export type AppsCategoryFilter = AppCategory | "all";

export function statusFilterFromQuery(value: unknown): AppsStatusFilter {
  return parseAppStatus(value) ?? "all";
}

export function filterAndRankApps(
  apps: CatalogItem[],
  options: {
    search: string;
    status: AppsStatusFilter;
    category: AppsCategoryFilter;
    pinnedIds: string[];
  }
): CatalogItem[] {
  const searchTerm = options.search.trim().toLowerCase();
  const pinnedIds = new Set(options.pinnedIds);

  return apps
    .filter((app) => {
      if (options.category !== "all" && app.category !== options.category) return false;
      if (options.status !== "all" && app.status !== options.status) return false;
      if (!searchTerm) return true;

      const searchableText = [app.name, app.category, app.notes ?? "", ...app.tags]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchTerm);
    })
    .sort((first, second) => {
      const firstPinned = pinnedIds.has(first.id);
      const secondPinned = pinnedIds.has(second.id);
      if (firstPinned !== secondPinned) return firstPinned ? -1 : 1;

      const statusDifference =
        APP_STATUS_PRIORITY[first.status] - APP_STATUS_PRIORITY[second.status];
      if (statusDifference !== 0) return statusDifference;

      return first.name.localeCompare(second.name);
    });
}
