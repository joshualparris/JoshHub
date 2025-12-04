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
    return items.filter((item) => {
      const haystack = `${item.name} ${item.tags.join(" ")} ${item.notes ?? ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = status === "all" || item.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, category, status]);

  return (
    <div className="space-y-6">
      <AppFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        status={status}
        setStatus={setStatus}
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-slate-200">No items match that search.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} onOpen={addRecent} />
          ))}
        </div>
      )}
    </div>
  );
}
