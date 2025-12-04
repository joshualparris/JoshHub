"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Dumbbell,
  HeartPulse,
  Layers,
  Link as LinkIcon,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

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
import { isSameLocalDayISO, todayLocalISO } from "@/lib/date";

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

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-AU", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date()),
    []
  );

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
  const openTasks = useMemo(() => (tasks ?? []).filter((t) => t.status === "open"), [tasks]);
  const taskToday = useMemo(() => {
    const todayIso = todayLocalISO();
    return (tasks ?? []).filter((t) => t.status === "open" && t.dueDate && isSameLocalDayISO(t.dueDate, todayIso));
  }, [tasks]);

  const nextEvents = useMemo(
    () =>
      (events ?? [])
        .filter((e) => e.endIso >= new Date().toISOString())
        .sort((a, b) => a.startIso.localeCompare(b.startIso))
        .slice(0, 3),
    [events]
  );

  const nextTimeline = useMemo(() => {
    const items: {
      id: string;
      type: "task" | "event";
      title: string;
      time: number;
      subtitle?: string;
    }[] = [];

    taskToday.forEach((t) => {
      const date = t.dueDate ? new Date(`${t.dueDate}T12:00:00`) : new Date();
      items.push({
        id: `task-${t.id}`,
        type: "task",
        title: t.title,
        time: date.getTime(),
        subtitle: t.priority,
      });
    });

    nextEvents.forEach((ev) => {
      items.push({
        id: `event-${ev.id}`,
        type: "event",
        title: ev.title,
        time: new Date(ev.startIso).getTime(),
        subtitle: ev.location,
      });
    });

    return items.sort((a, b) => a.time - b.time).slice(0, 5);
  }, [taskToday, nextEvents]);

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

  const movementWeekMinutes = useMemo(() => {
    const now = new Date().getTime();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return (movement ?? [])
      .filter((m) => new Date(m.date).getTime() >= sevenDaysAgo)
      .reduce((total, m) => total + m.minutes, 0);
  }, [movement]);

  const focusAnchors = [
    "Keep Jesus at the centre; lead with curiosity and kindness.",
    "Protect presence with Kristy and the kids before screens.",
    "Move, hydrate, and breathe before diving into work.",
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-white via-sky-50 to-emerald-50 p-6 shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-slate-300">
              Today · {todayLabel}
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-neutral-900 dark:text-white">
              Daily briefing
            </h1>
            <p className="text-sm text-neutral-700 dark:text-slate-300">
              Steady steps for faith, family, and focused work.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/capture">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Capture
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tasks">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Today
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/life">
                  <Layers className="mr-2 h-4 w-4" />
                  Life focus
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Open tasks",
                value: openTasks.length,
                hint: `${taskToday.length} today`,
                icon: CheckCircle2,
              },
              { label: "Upcoming", value: nextEvents.length, hint: "events", icon: CalendarClock },
              { label: "Notes", value: notes?.length ?? 0, hint: "workspace", icon: BookOpen },
              { label: "Runs (7d)", value: runsThisWeek, hint: "routines", icon: Activity },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="rounded-full bg-sky-100 p-2 text-sky-600 shadow-sm dark:bg-sky-900/40 dark:text-sky-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {stat.value}
                      <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-slate-400">
                        {stat.hint}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {focusAnchors.map((anchor) => (
            <div
              key={anchor}
              className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="rounded-full bg-amber-100 p-2 text-amber-700 shadow-sm dark:bg-amber-900/40 dark:text-amber-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm text-neutral-700 dark:text-slate-200">{anchor}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle>Quick launch</CardTitle>
            <span className="text-xs text-neutral-500 dark:text-slate-400">
              First six from the catalogue
            </span>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickLaunch.map((item) => (
              <a
                key={item.id}
                href={item.primaryUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => addRecent(item)}
                className="group flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-white to-sky-50 px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:from-slate-900 dark:to-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">{item.category}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-400 transition group-hover:text-neutral-700 dark:text-slate-400 dark:group-hover:text-white" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-red-50/80 shadow-md dark:border-red-900/50 dark:bg-red-900/30">
          <CardHeader>
            <CardTitle>Broken / needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {broken.length === 0 ? (
              <p className="text-sm text-red-800 dark:text-red-100">Everything looks healthy.</p>
            ) : (
              broken.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-red-200 bg-white/90 px-3 py-3 dark:border-red-800/60 dark:bg-red-950/40"
                >
                  <div className="space-y-1">
                    <a
                      href={item.primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 rounded-sm dark:text-red-100"
                    >
                      {item.name}
                    </a>
                    {item.notes && <p className="text-xs text-red-700 dark:text-red-200">{item.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Up next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextTimeline.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-slate-300">Clear skies for now.</p>
            ) : (
              nextTimeline.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-sky-100 p-2 text-sky-600 shadow-sm dark:bg-sky-900/40 dark:text-sky-200">
                      {item.type === "task" ? (
                        <ClipboardCheck className="h-4 w-4" />
                      ) : (
                        <CalendarClock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-slate-400">
                        {new Date(item.time).toLocaleString()}
                        {item.subtitle ? ` • ${item.subtitle}` : ""}
                      </p>
                    </div>
                  </div>
                  {item.type === "event" && item.subtitle && (
                    <span className="text-xs text-neutral-500 dark:text-slate-400">{item.subtitle}</span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Health snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Sleep (7d avg)",
                value: sleepAvg != null ? `${(sleepAvg / 60).toFixed(1)} h` : "Log sleep",
                detail: sleepAvg != null ? `${sleepAvg} minutes across last 7 entries` : "Add a night to start trending",
                icon: HeartPulse,
              },
              {
                label: "Movement (7d)",
                value: movementWeekMinutes > 0 ? `${movementWeekMinutes} min` : "No movement logged",
                detail: latestMove ? `${latestMove.date} • ${latestMove.type} ${latestMove.minutes}m` : "Move and log to track momentum",
                icon: Dumbbell,
              },
              {
                label: "Nutrition",
                value: latestNutrition ? latestNutrition.summary : "Log a meal",
                detail: latestNutrition ? latestNutrition.date : "Capture protein/veg or a simple summary",
                icon: UtensilsCrossed,
              },
              {
                label: "Latest metric",
                value: latestMetric ? `${latestMetric.metricType} ${latestMetric.value} ${latestMetric.unit}` : "No metrics yet",
                detail: latestMetric ? new Date(latestMetric.dateTimeIso).toLocaleString() : "Add weight, HRV, or BP to stay aware",
                icon: Activity,
              },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.label}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200/70 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">
                      {row.label}
                    </p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{row.value}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">{row.detail}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Recent notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotes.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-slate-300">No notes yet.</p>
            ) : (
              recentNotes.map((n) => (
                <div
                  key={n.id}
                  className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <Link
                    href={`/notes/${n.id}`}
                    className="font-medium text-neutral-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm dark:text-white"
                  >
                    {n.title}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-slate-400">
                    {new Date(n.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Pinned areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinnedAreas.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-slate-300">
                No pinned areas. Pin from Life pages.
              </p>
            ) : (
              pinnedAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/life/${area.slug}`}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{area.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">{area.intro}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {area.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Layers className="h-4 w-4 text-neutral-500 dark:text-slate-300" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Systems & shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-700 dark:text-slate-300">
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
            <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">
                Family rhythm
              </p>
              {rhythm ? (
                <div className="space-y-1 text-xs text-neutral-700 dark:text-slate-200">
                  <p>Dinner {rhythm.dinner} · Bedtime {rhythm.bedtime}</p>
                  <p>{rhythm.responsibilities.join(", ") || "Responsibilities tbc"}</p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-slate-400">Set rhythm in Family.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-slate-300">No recently opened items.</p>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">{item.category}</p>
                  </div>
                  <a
                    href={item.primaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm dark:text-slate-200"
                  >
                    Open
                  </a>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle>Focus cues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
            <p className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              Keep the list short: ship one work thing, love one family moment, and rest one beat.
            </p>
            <p className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              Pinned areas: {pinnedAreas.length > 0 ? pinnedAreas.map((a) => a.title).join(", ") : "none yet"}.
            </p>
            <p className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              Broken items stay visible above so you can clear friction fast.
            </p>
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
