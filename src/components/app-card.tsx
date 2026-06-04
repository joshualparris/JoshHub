"use client";

import { ExternalLink, Star, GitBranch, Copy, Check, Globe, Info } from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    if (app.localPath) {
      navigator.clipboard.writeText(app.localPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpen = async () => {
    const url = await resolveAppUrl(app);
    if (url) {
      window.open(url, "_blank");
      onOpen?.(app);
    }
  };

  const openableUrlExists = Boolean(
    app.liveUrl ||
      app.primaryUrl ||
      app.urls.some(
        (url) =>
          url.type !== "repo" &&
          !/repo/i.test(url.label) &&
          (url.url.startsWith("/") || /^https?:\/\//i.test(url.url))
      )
  );
  const isLocalOnly = app.availability === "local" || (!app.liveUrl && !app.primaryUrl && app.localPath);
  const needsReview = app.status === "needs-review" || app.metadataConfidence === "needs-review";

  return (
    <Card className="bg-card text-foreground flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleOpen}
                disabled={!app.liveUrl && !app.primaryUrl}
                className={cn(
                  "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm text-left font-bold",
                  (!app.liveUrl && !app.primaryUrl) && "cursor-default hover:no-underline"
                )}
              >
                {app.name}
              </button>
              <StatusChip status={app.status} />
              {isLocalOnly && (
                <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 text-[10px] uppercase tracking-wider">
                  Local Only
                </Badge>
              )}
              {needsReview && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 text-[10px] uppercase tracking-wider">
                  Link Needs Review
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{app.category}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePinned}
              aria-pressed={pinned}
              aria-label={pinned ? "Unpin app" : "Pin app"}
              className="h-8 w-8"
            >
              <Star className={cn("h-4 w-4", pinned && "fill-current text-amber-500")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-1.5">
          {app.tags.map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px] py-0 px-1.5 h-5 uppercase tracking-wider font-medium">
              {tag}
            </Badge>
          ))}
        </div>

        {app.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic border-l-2 border-muted pl-2">
            {app.notes}
          </p>
        )}

        <div className="mt-auto pt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {openableUrlExists && (
              <Button size="sm" className="gap-2 h-8" onClick={handleOpen}>
                <Globe className="h-3.5 w-3.5" />
                Open App
              </Button>
            )}
            
            {app.repoUrl && (
              <Button variant="outline" size="sm" className="gap-2 h-8" onClick={() => window.open(app.repoUrl, "_blank")}>
                <GitBranch className="h-3.5 w-3.5" />
                GitHub
              </Button>
            )}

            {app.localPath && (
              <Button variant="outline" size="sm" className="gap-2 h-8" onClick={copyPath}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                Path
              </Button>
            )}

            {!app.liveUrl && !app.primaryUrl && !app.repoUrl && !app.localPath && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 py-1 px-2 bg-muted/50 rounded-md">
                <Info className="h-3.5 w-3.5" />
                No links available
              </div>
            )}
          </div>

          {/* Alternate links if available */}
          {app.alternateLinks && app.alternateLinks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {app.alternateLinks.map((link, i) => (
                <button
                  key={`${link.url}-${i}`}
                  onClick={() => window.open(link.url, "_blank")}
                  className="text-[10px] text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
