import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/data/apps";

interface Props {
  app: CatalogItem;
  onOpen?: (app: CatalogItem) => void;
}

export function AppCard({ app, onOpen }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <a
                href={app.primaryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => onOpen?.(app)}
                className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
              >
                {app.name}
              </a>
              <StatusChip status={app.status} />
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{app.category}</p>
          </div>
          <Link
            href={app.primaryUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onOpen?.(app)}
            className="rounded-md px-2 py-1 text-sm text-slate-700 transition hover:bg-neutral-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            Open
          </Link>
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
        {app.notes && <p className="text-sm text-slate-600 dark:text-slate-300">{app.notes}</p>}
      </CardContent>
    </Card>
  );
}
