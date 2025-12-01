"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusChip } from "@/components/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apps, type AppStatus } from "@/data/apps";

const statusOrder: AppStatus[] = ["broken", "wip", "ok", "archived"];
const sortOptions = [
  { label: "Status", value: "status" },
  { label: "Last touched", value: "lastTouched" },
  { label: "Name", value: "name" },
];

export default function ProjectsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("status");

  const filtered = useMemo(() => {
    return apps.filter((app) => {
      const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
      const matchesTag = !tagFilter || app.tags.some((t) => t.includes(tagFilter));
      return matchesCategory && matchesTag;
    });
  }, [categoryFilter, tagFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "lastTouched")
        return (b.lastTouched ?? "").localeCompare(a.lastTouched ?? "");
      // default status order
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    });
  }, [filtered, sortBy]);

  const grouped = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        items: sorted.filter((app) => app.status === status),
      })),
    [sorted]
  );

  const categories = Array.from(new Set(apps.map((a) => a.category))).sort();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Projects</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Projects board</h1>
        <p className="text-neutral-600">
          Status by project with next actions and quick open buttons.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Category:
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Tag:
          <input
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="filter tag"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {grouped.map((group) => (
          <Card key={group.status} className="bg-neutral-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusChip status={group.status} />
                <span className="capitalize">{group.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.length === 0 ? (
                <p className="text-sm text-neutral-600">No items.</p>
              ) : (
                group.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium hover:underline">{item.name}</span>
                      <span className="text-xs text-neutral-600">Open</span>
                    </div>
                    <p className="text-xs text-neutral-500">{item.category}</p>
                    {item.nextAction && (
                      <p className="mt-2 text-sm text-neutral-700">
                        <span className="font-medium">Next:</span> {item.nextAction}
                      </p>
                    )}
                    {item.lastTouched && (
                      <p className="text-xs text-neutral-500">Last touched: {item.lastTouched}</p>
                    )}
                  </a>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
