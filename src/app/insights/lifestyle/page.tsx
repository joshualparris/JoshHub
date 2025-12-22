"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, BarChart3, Files, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useActivities, useDailyMetrics, useHealthImports } from "@/lib/db/hooks";

type TabKey = "import" | "report" | "raw";

export default function LifestyleReportPage() {
  const [tab, setTab] = useState<TabKey>("import");
  const activities = useActivities();
  const dailyMetrics = useDailyMetrics();
  const imports = useHealthImports();

  const stats = useMemo(() => {
    const totalDistanceM = (activities ?? []).reduce((acc, a) => acc + (a.distanceM ?? 0), 0);
    const runs = (activities ?? []).filter((a) => a.sport === "run");
    const longestRun = runs.reduce((max, a) => Math.max(max, a.distanceM ?? 0), 0);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weekMetrics = (dailyMetrics ?? []).filter(
      (d) => new Date(`${d.date}T00:00:00`).getTime() >= sevenDaysAgo
    );
    const runDistanceWeek = weekMetrics.reduce((acc, d) => acc + (d.runDistanceM ?? 0), 0);
    const runsCountWeek = weekMetrics.reduce((acc, d) => acc + d.runsCount, 0);
    return {
      totalActivities: activities?.length ?? 0,
      totalDistanceKm: totalDistanceM / 1000,
      runsCount: runs.length,
      longestRunKm: longestRun / 1000,
      runsCountWeek,
      runDistanceWeekKm: runDistanceWeek / 1000,
    };
  }, [activities, dailyMetrics]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Insights</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">Lifestyle & Behavioural Report</h1>
        <p className="text-sm text-neutral-600 dark:text-slate-300">
          Mirrors the 2021–2025 analysis. Works fully offline with your imported TCX files.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "import", label: "Import Data", icon: Files },
          { key: "report", label: "Report", icon: BarChart3 },
          { key: "raw", label: "Raw Data", icon: ListChecks },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <Button
              key={item.key}
              variant={active ? "default" : "outline"}
              onClick={() => setTab(item.key as TabKey)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab === "import" && (
        <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Import health telemetry</CardTitle>
            <CardDescription>Start with TCX files. Dexie persists activities + daily metrics locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-700 dark:text-slate-300">
              Use the importer to add your Google Takeout / Garmin / Strava TCX exports. We parse distance, elevation,
              start/end time, infer sport, and update daily metrics for runs and total distance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/health/import">
                  <Activity className="mr-2 h-4 w-4" />
                  Go to importer
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setTab("report")}>
                View report
              </Button>
            </div>
            <Separator />
            <div className="text-sm text-neutral-600 dark:text-slate-300">
              <p className="font-medium text-neutral-900 dark:text-white">Recent imports</p>
              {(imports ?? []).slice(0, 3).map((imp) => (
                <div key={imp.id} className="flex items-center justify-between text-xs text-neutral-600 dark:text-slate-300">
                  <span>{imp.fileName}</span>
                  <span className={imp.status === "success" ? "text-emerald-600 dark:text-emerald-200" : "text-red-600"}>
                    {imp.status}
                  </span>
                </div>
              ))}
              {imports && imports.length === 0 && <p className="text-xs text-neutral-500">No imports yet.</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "report" && (
        <div className="space-y-4">
          <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Executive summary</CardTitle>
              <CardDescription>Local view computed from your imported activities.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <SummaryStat label="Total activities" value={stats.totalActivities} hint={`${stats.totalDistanceKm.toFixed(1)} km`} />
              <SummaryStat label="Runs (all time)" value={stats.runsCount} hint={`Longest ${(stats.longestRunKm || 0).toFixed(2)} km`} />
              <SummaryStat label="Runs (7d)" value={stats.runsCountWeek} hint={`${stats.runDistanceWeekKm.toFixed(2)} km`} />
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Pillars</CardTitle>
              <CardDescription>Mirror of the 2021–2025 analysis, grounded in imported data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-neutral-700 dark:text-slate-200">
              <Section title="Fitness & Movement">
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Distances trending higher in recent imports: {(stats.runDistanceWeekKm || 0).toFixed(2)} km in the last
                    7 days across {stats.runsCountWeek} run(s).
                  </li>
                  <li>
                    Longest imported run: {(stats.longestRunKm || 0).toFixed(2)} km. Add more TCX files to refine pacing trends.
                  </li>
                  <li>Elevation gain tracked when present; hill sessions will surface as data accumulates.</li>
                </ul>
              </Section>
              <Section title="Technical & Deep Work">
                <p>Flow-state correlation will use timestamps from runs; add coding session logs later for tighter links.</p>
              </Section>
              <Section title="Hardware / Environment">
                <p>Telemetry stored locally; supports Samsung/Garmin TCX without cloud calls.</p>
              </Section>
              <Section title="Digital-Physical Correlation">
                <p>
                  Keep importing runs {" > "}10km to strengthen the "primed deep work" window detection once coding events are linked.
                </p>
              </Section>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50/70 shadow-sm dark:border-amber-800/60 dark:bg-amber-900/30">
            <CardHeader className="flex flex-row items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-200" />
              <div>
                <CardTitle>Blind spots</CardTitle>
                <CardDescription>Flags from the behavioural report.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-800 dark:text-amber-50">
              <p>• Post-crunch sedentary dips — add light steps after deep work blocks.</p>
              <p>• Calorie efficiency plateau — vary terrain/routes to keep stimulus high.</p>
              <p>• AI reliance — balance with offline practice reps.</p>
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Flow-state schedule</CardTitle>
              <CardDescription>Suggested daily cadence from the report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              <p>08:00–10:00 · High-intensity run (cooler hours).</p>
              <p>11:00–15:00 · Deep technical work (ride post-run clarity).</p>
              <p>16:00–18:00 · Light movement to prevent post-crunch stiffness.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "raw" && (
        <div className="space-y-4">
          <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Activities</CardTitle>
              <CardDescription>Latest parsed entries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(activities ?? []).slice(0, 10).map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {act.fileName ?? "Activity"} · {act.sport}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-slate-400">
                    {act.startTimeIso ? new Date(act.startTimeIso).toLocaleString() : "No start time"} •
                    {act.distanceM ? ` ${(act.distanceM / 1000).toFixed(2)} km` : " distance n/a"}
                    {act.elevationGainM ? ` • +${Math.round(act.elevationGainM)} m` : ""}
                  </p>
                </div>
              ))}
              {activities && activities.length === 0 && (
                <p className="text-sm text-neutral-600 dark:text-slate-300">Import a TCX file to see raw activity data.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle>Daily metrics</CardTitle>
              <CardDescription>Aggregated runs and distance by day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(dailyMetrics ?? []).slice(0, 10).map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{d.date}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">
                      {d.runsCount} runs • {(d.runDistanceM / 1000).toFixed(2)} km run • {(d.distanceM / 1000).toFixed(2)} km total
                    </p>
                  </div>
                </div>
              ))}
              {dailyMetrics && dailyMetrics.length === 0 && (
                <p className="text-sm text-neutral-600 dark:text-slate-300">No daily metrics yet. Import TCX to populate.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-semibold text-neutral-900 dark:text-white">{value}</p>
      {hint && <p className="text-xs text-neutral-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
      <div className="text-sm text-neutral-700 dark:text-slate-200">{children}</div>
    </div>
  );
}
