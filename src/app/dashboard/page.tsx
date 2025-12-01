"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ClipboardCheck, Clock, Compass, Layers, Link as LinkIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apps } from "@/data/apps";
import { lifeAreas, type LifeArea } from "@/data/life";
import { addRecent, loadRecent } from "@/lib/recent";
import { loadPinnedLife } from "@/lib/pins";
import { useNotes, useTasks, useRoutineRunsAll } from "@/lib/db/hooks";
import { useEvents } from "@/lib/db/events";
import { useSleep, useMovement, useNutrition, useMetrics } from "@/lib/db/health";
import { useFamilyRhythm } from "@/lib/db/family";

export default function DashboardPage() {
  const notes = useNotes();
  const tasks = useTasks();
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent] = useState(loadRecent());
  const events = useEvents();
  const sleep = useSleep();
  const movement = useMovement();
  const nutrition = useNutrition();
  const metrics = useMetrics();
  const rhythm = useFamilyRhythm();
  const routineRuns = useRoutineRunsAll();

  useEffect(() => {
    loadPinnedLife().then(setPinned);
  }, []);

  const broken = apps.filter((a) => a.status === "broken");
  const quickLaunch = apps.slice(0, 6);
  const pinnedAreas = useMemo<LifeArea[]>(
    () => pinned.map((slug) => lifeAreas.find((a) => a.slug === slug)).filter(Boolean) as LifeArea[],
    [pinned]
  );
  const recentNotes = useMemo(
    () => (notes ?? []).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [notes]
  );
  const taskToday = useMemo(
    () =>
      (tasks ?? []).filter((t) => {
        if (!t.dueDate) return false;
        const today = new Date().toISOString().slice(0, 10);
        return t.dueDate === today;
      }),
    [tasks]
  );

  const nextEvents = useMemo(
    () =>
      (events ?? [])
        .filter((e) => e.endIso >= new Date().toISOString())
        .sort((a, b) => a.startIso.localeCompare(b.startIso))
        .slice(0, 3),
    [events]
  );

  const sleepAvg = useMemo(() => {
    const last = (sleep ?? []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    if (last.length === 0) return null;
    const durations = last
      .map((s) => s.durationMinutes ?? durationFromTimes(s.bedtimeIso, s.wakeIso))
      .filter((n): n is number => typeof n === "number");
    if (durations.length === 0) return null;
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg);
  }, [sleep]);
  const runsThisWeek = useMemo(() => {
    const now = new Date().getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return (routineRuns ?? []).filter((r) => r.startedAt >= sevenDaysAgo).length;
  }, [routineRuns]);
  const latestMove = useMemo(
    () => (movement ?? []).sort((a, b) => b.date.localeCompare(a.date))[0],
    [movement]
  );
  const latestNutrition = useMemo(
    () => (nutrition ?? []).sort((a, b) => b.date.localeCompare(a.date))[0],
    [nutrition]
  );
  const latestMetric = useMemo(
    () => (metrics ?? []).sort((a, b) => b.dateTimeIso.localeCompare(a.dateTimeIso))[0],
    [metrics]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-neutral-200 bg-gradient-to-r from-white via-neutral-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Dashboard</p>
            <h1 className="text-3xl font-semibold leading-tight text-neutral-900">
              Today at a glance
            </h1>
            <p className="mt-2 text-neutral-600">
              Quick launch, tasks, notes, and pinned areas.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/capture">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Capture
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tasks">
                <Clock className="mr-2 h-4 w-4" />
                Tasks
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick launch</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickLaunch.map((item) => (
              <a
                key={item.id}
                href={item.primaryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => addRecent(item)}
                className="group flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
              >
                <div>
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.category}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-500 transition group-hover:text-neutral-800" />
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Broken / needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {broken.length === 0 ? (
              <p className="text-sm text-neutral-600">Everything looks healthy.</p>
            ) : (
              broken.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-3 py-2"
                >
                  <div>
                    <a
                      href={item.primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 rounded-sm"
                    >
                      {item.name}
                    </a>
                    {item.notes && <p className="text-xs text-red-700">{item.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasks today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {taskToday.length === 0 ? (
              <p className="text-sm text-neutral-600">Nothing due today.</p>
            ) : (
              taskToday.map((t) => (
                <div key={t.id} className="rounded-md border border-neutral-200 bg-white px-3 py-2">
                  <p className="font-medium text-neutral-900">{t.title}</p>
                  <p className="text-xs text-neutral-500">{t.priority}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextEvents.length === 0 ? (
              <p className="text-sm text-neutral-600">No upcoming events.</p>
            ) : (
              nextEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
                >
                  <p className="font-medium text-neutral-900">{ev.title}</p>
                  <p className="text-neutral-600">
                    {new Date(ev.startIso).toLocaleString()}
                  </p>
                  {ev.location && <p className="text-neutral-600">{ev.location}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotes.length === 0 ? (
              <p className="text-sm text-neutral-600">No notes yet.</p>
            ) : (
              recentNotes.map((n) => (
                <div key={n.id} className="rounded-md border border-neutral-200 bg-white px-3 py-2">
                  <Link
                    href={`/notes/${n.id}`}
                    className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                  >
                    {n.title}
                  </Link>
                  <p className="text-xs text-neutral-500">
                    {new Date(n.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pinned areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinnedAreas.length === 0 ? (
              <p className="text-sm text-neutral-600">No pinned areas. Pin from Life pages.</p>
            ) : (
              pinnedAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/life/${area.slug}`}
                  className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{area.title}</p>
                    <p className="text-xs text-neutral-500">{area.intro}</p>
                  </div>
                  <Layers className="h-4 w-4 text-neutral-500" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-neutral-600">No recently opened items.</p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.category}</p>
                  </div>
                  <a
                    href={item.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                  >
                    Open
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-700">
            <Button asChild className="w-full">
              <Link href="/apps">
                <Compass className="mr-2 h-4 w-4" />
                Browse apps
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/capture">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Capture inbox
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/backups">
                <LinkIcon className="mr-2 h-4 w-4" />
                Backups
              </Link>
            </Button>
            {sleepAvg != null && (
              <p className="text-xs text-neutral-600">Sleep avg (last 7): {sleepAvg} min</p>
            )}
            {latestMove && (
              <p className="text-xs text-neutral-600">
                Last movement: {latestMove.date} — {latestMove.type} ({latestMove.minutes}m)
              </p>
            )}
            {latestNutrition && (
              <p className="text-xs text-neutral-600">
                Last nutrition: {latestNutrition.date} — {latestNutrition.summary}
              </p>
            )}
            {latestMetric && (
              <p className="text-xs text-neutral-600">
                Last metric: {latestMetric.metricType} {latestMetric.value} {latestMetric.unit}
              </p>
            )}
            <p className="text-xs text-neutral-600">Routine runs (7d): {runsThisWeek}</p>
            {rhythm && (
              <div className="text-xs text-neutral-600 space-y-1">
                <p>Family rhythm: dinner {rhythm.dinner}, bedtime {rhythm.bedtime}</p>
                <p>Responsibilities: {rhythm.responsibilities.join(", ") || "n/a"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function durationFromTimes(start?: string | null, end?: string | null) {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  const diff = (e - s) / 60000;
  return diff > 0 ? diff : null;
}
