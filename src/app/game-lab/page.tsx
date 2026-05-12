import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, FolderGit2, ListChecks } from "lucide-react";

import { gameLabProjects, type GameLabHealthState } from "@/data/game-lab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const healthLabels: Record<GameLabHealthState, string> = {
  healthy: "Healthy",
  pending: "Pending",
  blocked: "Blocked",
};

const healthStyles: Record<GameLabHealthState, string> = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  blocked: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100",
};

export default function GameLabPage() {
  const sortedProjects = [...gameLabProjects].sort((a, b) => a.priority - b.priority);
  const sprintFocus = sortedProjects[0];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="muted">Game Lab</Badge>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Game project command centre
          </h1>
          <p className="text-neutral-700 dark:text-slate-200">
            Track the active game and TTRPG projects, their test links, repo/folder references,
            next actions, and build/playtest health in one place.
          </p>
        </div>
      </section>

      <Card className="border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardDescription>Priority sprint</CardDescription>
              <CardTitle>{sprintFocus.name}</CardTitle>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-medium ${healthStyles[sprintFocus.health.state]}`}>
              {healthLabels[sprintFocus.health.state]}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-700 dark:text-slate-200">{sprintFocus.role}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <InfoBlock icon={<ListChecks className="h-4 w-4" />} label="Next action" value={sprintFocus.nextAction} />
            <InfoBlock icon={<Activity className="h-4 w-4" />} label="Health" value={sprintFocus.health.note} />
          </div>
          <ProjectLinks project={sprintFocus} />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {sortedProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge variant="outline">Priority {project.priority}</Badge>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.role}</CardDescription>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${healthStyles[project.health.state]}`}>
                  {healthLabels[project.health.state]}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <InfoRow label="Owner" value={project.owner} />
                <InfoRow label="Status" value={project.status} />
                <InfoRow label="Next" value={project.nextAction} />
                <InfoRow label="Done when" value={project.definitionOfDone} />
                <InfoRow label="Health" value={project.health.note} />
              </div>
              <ProjectLinks project={project} />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

type ProjectLinkProps = {
  project: (typeof gameLabProjects)[number];
};

function ProjectLinks({ project }: ProjectLinkProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {project.liveUrl ? (
        <Button asChild size="sm">
          <Link href={project.liveUrl} target="_blank" rel="noreferrer">
            Playtest <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : null}
      {project.repoUrl ? (
        <Button asChild size="sm" variant="outline">
          <Link href={project.repoUrl} target="_blank" rel="noreferrer">
            Repo <FolderGit2 className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      ) : null}
      {project.localPath ? (
        <span className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {project.localPath}
        </span>
      ) : null}
    </div>
  );
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-1 flex items-center gap-2 font-medium text-neutral-900 dark:text-white">
        {icon}
        {label}
      </div>
      <p className="text-neutral-700 dark:text-slate-200">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-neutral-900 dark:text-white">{label}: </span>
      <span className="text-neutral-700 dark:text-slate-200">{value}</span>
    </div>
  );
}
