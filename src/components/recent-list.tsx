"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import type { RecentItem } from "@/lib/recent";
import { loadRecent } from "@/lib/recent";

export function RecentList() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    // Browser storage is intentionally read after hydration. Reading it in the
    // state initializer gives the server and browser different first renders.
    setItems(loadRecent());
  }, []);

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No recently opened items yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-card-foreground"
        >
          <div className="space-y-1">
            <a
              href={item.primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {item.name}
            </a>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StatusChip status={item.status} />
              <span>{item.category}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{new Date(item.lastOpened).toLocaleString()}</span>
            </div>
          </div>
          <a
            href={item.primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm text-sm text-card-foreground/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Open
          </a>
        </div>
      ))}
    </div>
  );
}
