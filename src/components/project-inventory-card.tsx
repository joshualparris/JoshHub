"use client";

import { Copy, Check, AlertTriangle, Info, GitBranch, Globe, Folder } from "lucide-react";
import { useState } from "react";

import { StatusChip } from "@/components/status-chip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CatalogItem, MetadataConfidence } from "@/data/apps";
import { cn } from "@/lib/utils";

interface Props {
  project: CatalogItem;
}

export function ProjectInventoryCard({ project }: Props) {
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    if (project.localPath) {
      navigator.clipboard.writeText(project.localPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const confidenceColors: Record<MetadataConfidence, string> = {
    verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
    inferred: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
    "needs-review": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100",
  };

  return (
    <Card className="bg-card text-foreground">
      <CardHeader>
        <div className="flex itecare2-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex itecare2-center gap-2">
              <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
              <StatusChip status={project.status} />
              {project.sourceOfTruth && (
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                  Source of Truth
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{project.category}</p>
          </div>
          {project.metadataConfidence && (
            <Badge className={cn("text-xs font-medium", confidenceColors[project.metadataConfidence])}>
              {project.metadataConfidence.replace("-", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.notes && (
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {project.notes}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {project.repoUrl && (
              <div className="flex itecare2-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold w-24 shrink-0">Repository:</span>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {project.repoUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {project.liveUrl && (
              <div className="flex itecare2-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold w-24 shrink-0">Live URL:</span>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {project.liveUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {project.localPath && (
              <div className="flex itecare2-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold w-24 shrink-0">Local Path:</span>
                <span className="truncate text-muted-foreground font-mono bg-muted/50 px-1 rounded">
                  {project.localPath}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={copyPath} title="Copy path">
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {project.nextAction && (
              <div className="flex itecare2-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Next Action:</span>
                  <span className="text-muted-foreground">{project.nextAction}</span>
                </div>
              </div>
            )}
            {project.cleanupRecommendation && (
              <div className="flex itecare2-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Recommendation:</span>
                  <span className="text-muted-foreground">{project.cleanupRecommendation}</span>
                </div>
              </div>
            )}
            {project.duplicateOf && (
              <div className="flex itecare2-start gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Duplicate of:</span>
                  <span className="text-muted-foreground">{project.duplicateOf}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="muted" className="text-[10px] uppercase tracking-wider">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
