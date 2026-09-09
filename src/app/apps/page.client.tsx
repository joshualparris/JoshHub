"use client";

import { useMemo, useState } from "react";

import { AppCard } from "@/components/app-card";
import { AppFilters } from "@/components/app-filters";
import type { CatalogItem } from "@/data/apps";
import {
  filterAndRankApps,
  statusFilterFromQuery,
  type AppsCategoryFilter,
  type AppsStatusFilter,
} from "@/features/apps/catalogue";
import { usePinnedApps } from "@/features/apps/hooks/usePinnedApps";
import { addRecent } from "@/lib/recent";

interface Props {
  searchParams?: { status?: string };
  apps: CatalogItem[];
}

function AppsCatalogueHeader() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catalogue</p>
      <h1 className="text-3xl font-semibold text-foreground">Apps & Games</h1>
      <p className="text-muted-foreground">
        Search, filter, and open every app or game from one place.
      </p>
    </div>
  );
}

function AppsGrid({
  apps,
  pinnedIds,
  onTogglePinned,
  onOpen,
}: {
  apps: CatalogItem[];
  pinnedIds: string[];
  onTogglePinned: (id: string) => void;
  onOpen: (app: CatalogItem) => void;
}) {
  if (apps.length === 0) {
    return <p className="text-sm text-muted-foreground">No items match that search.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          pinned={pinnedIds.includes(app.id)}
          onTogglePinned={() => onTogglePinned(app.id)}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

export default function AppsPageClient({ searchParams, apps }: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AppsStatusFilter>(() =>
    statusFilterFromQuery(searchParams?.status)
  );
  const [category, setCategory] = useState<AppsCategoryFilter>("all");
  const [recentError, setRecentError] = useState<string | null>(null);
  const { pinnedIds, togglePinned } = usePinnedApps();
  const filteredApps = useMemo(
    () => filterAndRankApps(apps, { search, status, category, pinnedIds }),
    [apps, category, pinnedIds, search, status]
  );

  function rememberOpenedApp(app: CatalogItem) {
    try {
      addRecent(app);
      setRecentError(null);
    } catch (error) {
      setRecentError(error instanceof Error ? error.message : "Could not update recent history.");
    }
  }

  return (
    <div className="space-y-6">
      <AppsCatalogueHeader />
      <AppFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
      />
      {recentError && <p className="text-sm text-destructive">{recentError}</p>}
      <AppsGrid
        apps={filteredApps}
        pinnedIds={pinnedIds}
        onTogglePinned={togglePinned}
        onOpen={rememberOpenedApp}
      />
    </div>
  );
}
