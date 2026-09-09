"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import type { AppStatus } from "@/data/apps";
import type { RecentItem } from "@/lib/recent";
import { loadRecent } from "@/lib/recent";

export function RecentList() {
  const [items] = useState<RecentItem[]>(() => loadRecent());

  if (!items.length) {
    return <p className="text-sm text-neutral-600">No recently opened items yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2"
        >
          <div className="space-y-1">
            <a
              href={item.primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
            >
              {item.name}
            </a>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <StatusChip status={item.status as AppStatus} />
              <span>{item.category}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock className="h-4 w-4" />
              <span>{new Date(item.lastOpened).toLocaleString()}</span>
            </div>
          </div>
          <a
            href={item.primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
          >
            Open
          </a>
        </div>
      ))}
    </div>
  );
}
