"use client";

import Link from "next/link";
import { ExternalLink, Pin, PinOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StatusChip } from "@/components/status-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAppById } from "@/data/apps";
import type { LifeArea } from "@/data/life";
import { loadPinnedLife, togglePinnedLife } from "@/lib/pins";

interface Props {
  area: LifeArea;
}

export function LifeDetailClient({ area }: Props) {
  const [pinned, setPinned] = useState<string[]>([]);

  useEffect(() => {
    loadPinnedLife().then(setPinned);
  }, []);

  const quickApps = useMemo(
    () =>
      area.quickLinks
        .map((id) => getAppById(id))
        .filter(Boolean)
        .slice(0, 6),
    [area.quickLinks]
  );

  const isPinned = pinned.includes(area.slug);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Life Area</p>
            <h1 className="text-3xl font-semibold text-neutral-900">{area.title}</h1>
            <p className="text-neutral-600">{area.intro}</p>
          </div>
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
            <Card key={section.heading}>
              <CardHeader>
                <CardTitle className="text-lg">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="text-neutral-700">{section.body}</CardContent>
            </Card>
          ))}
        </div>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickApps.length === 0 ? (
              <p className="text-sm text-neutral-600">No linked apps yet.</p>
            ) : (
              quickApps.map((app) => (
                <div
                  key={app!.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
                >
                  <div className="space-y-1">
                    <Link
                      href={`/apps/${app!.id}`}
                      className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {app!.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <StatusChip status={app!.status} />
                      <span>{app!.category}</span>
                    </div>
                  </div>
                  <a
                    href={app!.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All apps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-neutral-700">
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
