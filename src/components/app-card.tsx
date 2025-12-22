"use client";

import { ExternalLink, Star } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/data/apps";
import { cn } from "@/lib/utils";
import resolveAppUrl from "@/lib/appUrlResolver";

interface Props {
  app: CatalogItem;
  onOpen?: (app: CatalogItem) => void;
  pinned?: boolean;
  onTogglePinned?: () => void;
  search?: string;
}

export function AppCard({ app, onOpen, pinned = false, onTogglePinned }: Props) {
  return (
    <Card className="bg-card text-foreground">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const url = await resolveAppUrl(app);
                  if (url) {
                    window.open(url, "_blank");
                    onOpen?.(app);
                  } else {
                    // fallback: open first repo or show alert
                    const repo = app.urls.find((u) => /github.com/i.test(u.url));
                    if (repo) window.open(repo.url, "_blank");
                    else alert("No available link found for this app.");
                  }
                }}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm text-left"
              >
                {app.name}
              </button>
              <StatusChip status={app.status} />
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{app.category}</p>
          </div>
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePinned}
              aria-pressed={pinned}
              aria-label={pinned ? "Unpin app" : "Pin app"}
              className="h-8 w-8"
            >
              <Star className={cn("h-4 w-4", pinned && "fill-current")} />
            </Button>
            <button
              onClick={async () => {
                const url = await resolveAppUrl(app);
                if (url) {
                  window.open(url, "_blank");
                  onOpen?.(app);
                } else {
                  const repo = app.urls.find((u) => /github.com/i.test(u.url));
                  if (repo) window.open(repo.url, "_blank");
                  else alert("No available link found for this app.");
                }
              }}
              className="rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open
            </button>
          </div>

        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {app.tags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {app.urls.map((link, i) => (
            <Button
              key={`${link.url ?? ""}::${i}`}
              variant="outline"
              size="sm"
              onClick={async () => {
                // try to open the specific link; prefer absolute links
                if (/^https?:\/\//i.test(link.url)) {
                  window.open(link.url, "_blank");
                  onOpen?.(app);
                  return;
                }
                // root-relative: test and open
                try {
                  const resp = await fetch(link.url, { method: "GET", cache: "no-store" });
                  if (resp.ok) {
                    window.open(link.url, "_blank");
                    onOpen?.(app);
                    return;
                  }
                } catch (error) {
                  console.debug("App link check failed", error);
                }
                alert("This link appears to be missing.");
              }}
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              {link.label}
            </Button>
          ))}
        </div>
        {app.notes && <p className="text-sm text-muted-foreground">{app.notes}</p>}
      </CardContent>
    </Card>
  );
}
