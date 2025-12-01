"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, Globe, Loader2 } from "lucide-react";

import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CatalogItem } from "@/data/apps";
import { addRecent } from "@/lib/recent";

interface Props {
  app: CatalogItem;
}

export function AppDetail({ app }: Props) {
  const [embedEnabled, setEmbedEnabled] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(app.primaryUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    addRecent(app);
  }, [app]);

  const tagBadges = useMemo(
    () =>
      app.tags.map((tag) => (
        <Badge key={tag} variant="muted">
          {tag}
        </Badge>
      )),
    [app.tags]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">{app.name}</h1>
          <p className="text-neutral-600">{app.category}</p>
        </div>
        <StatusChip status={app.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {app.urls.map((link) => (
              <Button
                key={link.url}
                variant="outline"
                onClick={() => {
                  addRecent(app);
                  setSelectedUrl(link.url);
                  window.open(link.url, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                addRecent(app);
                window.open(app.primaryUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <Globe className="mr-2 h-4 w-4" />
              Open primary
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">{tagBadges}</div>
          {app.notes && <p className="text-sm text-neutral-700">{app.notes}</p>}
          {app.lastTouched && (
            <p className="text-xs text-neutral-500">Last touched: {app.lastTouched}</p>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmbedEnabled((prev) => !prev)}
            >
              {embedEnabled ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" /> Hide embed
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> Try embed view
                </>
              )}
            </Button>
            <label className="text-sm text-neutral-600">
              (Some sites block iframes; toggle will fall back if blocked)
            </label>
          </div>
        </CardContent>
      </Card>

      {embedEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Embed preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {app.urls.map((link) => (
                <Button
                  key={link.url}
                  variant={selectedUrl === link.url ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setBlocked(false);
                    setSelectedUrl(link.url);
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {isLoading && (
                <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading preview...
                </div>
              )}
              {blocked && (
                <div className="bg-red-50 px-3 py-2 text-sm text-red-700">
                  Embed blocked by the site. Use the open buttons above instead.
                </div>
              )}
              <iframe
                key={selectedUrl}
                src={selectedUrl}
                className="h-[480px] w-full border-0"
                loading="lazy"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setBlocked(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/apps">Back to apps</Link>
        </Button>
      </div>
    </div>
  );
}
