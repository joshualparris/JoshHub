"use client";

import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/data/apps";
import { cn } from "@/lib/utils";

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
              <a
                href={app.primaryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => onOpen?.(app)}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {app.name}
              </a>
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
            <Link
              href={app.primaryUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => onOpen?.(app)}
              className="rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open
            </Link>
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
          {app.urls.map((link) => (
            <Button
              key={link.url}
              variant="outline"
              size="sm"
              asChild
              onClick={() => onOpen?.(app)}
            >
              <a href={link.url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                {link.label}
              </a>
            </Button>
          ))}
        </div>
        {app.notes && <p className="text-sm text-muted-foreground">{app.notes}</p>}
      </CardContent>
    </Card>
  );
}
