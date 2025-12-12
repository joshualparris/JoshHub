"use client";

import { useMemo, useState } from "react";

import { AppCard } from "@/components/app-card";
import { AppFilters } from "@/components/app-filters";
import type { CatalogItem, AppCategory, AppStatus } from "@/data/apps";
import { addRecent } from "@/lib/recent";

interface Props {
  items: CatalogItem[];
  initialStatus?: AppStatus | "all";
}

export function AppsDirectory({ items, initialStatus = "all" }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AppCategory | "all">("all");
  const [status, setStatus] = useState<AppStatus | "all">(initialStatus);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.name} ${item.tags.join(" ")} ${item.notes ?? ""}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, category, status]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.name.localeCompare(b.name)),
    [filtered],
  );

  return (
    <div className="space-y-6">
      <AppFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items match that search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((app) => (
            <AppCard key={app.id} app={app} onOpen={addRecent} />
          ))}
        </div>
      )}
    </div>
  );
}
