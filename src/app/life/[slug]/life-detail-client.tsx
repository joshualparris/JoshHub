"use client";

import Link from "next/link";
import { ExternalLink, Pin, PinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StatusChip } from "@/components/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { getAppById } from "@/data/apps";
import type { LifeArea } from "@/data/life";
import { loadPinnedLife, togglePinnedLife } from "@/lib/pins";

interface Props {
  area: LifeArea;
}

export function LifeDetailClient({ area }: Props) {
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    loadPinnedLife()
      .then(setPinned)
      .catch(() => setPinned([]));
  }, []);

  const quickApps = useMemo(
    () =>
      area.quickLinks
        .map((id) => getAppById(id))
        .filter((app): app is NonNullable<typeof app> => Boolean(app))
        .slice(0, 6),
    [area.quickLinks]
  );

  const isPinned = pinned.includes(area.slug);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <PageHeader kicker="Life area" title={area.title} subtitle={area.intro} tone="onDark" />
          <Button
            variant="outline"
            onClick={async () => setPinned(await togglePinnedLife(area.slug))}
            aria-label={isPinned ? "Unpin from home" : "Pin to home"}
          >
            {isPinned ? (
              <>
                <PinOff className="mr-2 h-4 w-4" /> Unpin
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" /> Pin to Home
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {area.sections.map((section) => (
            <Card
              key={section.heading}
              className="dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100"
            >
              <CardHeader>
                <CardTitle className="text-lg text-foreground dark:text-slate-50">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="text-card-foreground/85 dark:text-slate-200/90">{section.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <Card className="dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-foreground dark:text-slate-50">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickApps.length === 0 ? (
              <p className="text-sm text-card-foreground/80 dark:text-slate-300">No linked apps yet.</p>
            ) : (
              quickApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="space-y-1">
                    <a
                      href={app.primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {app.name}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-slate-300">
                      <StatusChip status={app.status} />
                      <span>{app.category}</span>
                    </div>
                  </div>
                  <a
                    href={app.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm dark:text-slate-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100">
          <CardHeader>
            <CardTitle className="text-lg text-foreground dark:text-slate-50">All apps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-card-foreground/85 dark:text-slate-200/90">
              Explore more in the catalogue and link them here later.
            </p>
            <Button asChild className="w-full">
              <Link href="/apps">Browse catalogue</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
