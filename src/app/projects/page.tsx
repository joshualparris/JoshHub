"use client";

import { useMemo, useState } from "react";

import { StatusChip } from "@/components/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { labelText, metaText, mutedText } from "@/components/ui/text";
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
      <PageHeader
        kicker="Projects"
        title="Projects board"
        subtitle="Status by project with next actions and quick open buttons."
      />

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-slate-200">
          <span className={labelText}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-slate-200">
          <span className={labelText}>Tag:</span>
          <input
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="filter tag"
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-400"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-slate-200">
          <span className={labelText}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
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
          <Card key={group.status} className="bg-neutral-50 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusChip status={group.status} />
                <span className="capitalize">{group.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.length === 0 ? (
                <p className={`${mutedText}`}>No items.</p>
              ) : (
                group.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md border border-neutral-200 bg-white p-3 text-slate-950 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium hover:underline">{item.name}</span>
                      <span className={`${metaText} dark:text-slate-200`}>Open</span>
                    </div>
                    <p className={metaText}>{item.category}</p>
                    {item.nextAction && (
                      <p className={`mt-2 ${mutedText}`}>
                        <span className="font-medium">Next:</span> {item.nextAction}
                      </p>
                    )}
                    {item.lastTouched && (
                      <p className={metaText}>Last touched: {item.lastTouched}</p>
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
