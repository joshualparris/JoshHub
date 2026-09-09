import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Dumbbell,
  Layers,
  Link as LinkIcon,
  Sparkles,
  Timer,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CatalogItem } from "@/data/apps";
import type { LifeArea } from "@/data/life";
import type { DashboardTimelineItem } from "@/features/dashboard/logic";
import type {
  FamilyRhythm,
  MetricLog,
  MovementLog,
  Note,
  NutritionLog,
} from "@/lib/db/schema";
import type { RecentItem } from "@/lib/recent";

export const EXAMPLE_DATA_NOTE = "Example figures — not from your data";

export interface CommandCenterCard {
  title: string;
  icon: LucideIcon;
  value: string;
  detail: string;
  action: { label: string; href: string };
  accent: string;
  bg: string;
  isExample?: boolean;
}

export interface CarePanel {
  title: string;
  icon: LucideIcon;
  summary: string;
  bullets: string[];
  href: string;
  cta: string;
  isExample?: boolean;
}

function ExampleBadge() {
  return (
    <span
      title={EXAMPLE_DATA_NOTE}
      className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100"
    >
      Example
    </span>
  );
}

function BriefingStat({ label, value, hint, icon: Icon }: { label: string; value: number; hint: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="rounded-full bg-sky-100 p-2 text-sky-600 shadow-sm dark:bg-sky-900/40 dark:text-sky-200">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
          {value}<span className="ml-2 text-xs font-normal text-neutral-500 dark:text-slate-400">{hint}</span>
        </p>
      </div>
    </div>
  );
}

export function DailyBriefing({ todayLabel, openTasks, dueToday, upcomingEvents, notesCount, runsCount, runKm }: { todayLabel: string; openTasks: number; dueToday: number; upcomingEvents: number; notesCount: number; runsCount: number; runKm: string }) {
  const focusAnchors = [
    "Keep Jesus at the centre; lead with curiosity and kindness.",
    "Protect presence with Kristy and the kids before screens.",
    "Move, hydrate, and breathe before diving into work.",
  ];
  return (
    <section className="overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-white via-sky-50 to-emerald-50 p-6 shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-slate-300">Today · {todayLabel}</p>
          <h1 className="text-3xl font-semibold leading-tight text-neutral-900 dark:text-white">Daily briefing</h1>
          <p className="text-sm text-neutral-700 dark:text-slate-300">Steady steps for faith, family, and focused work.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/capture"><ClipboardCheck className="mr-2 h-4 w-4" />Capture</Link></Button>
            <Button variant="outline" asChild><Link href="/tasks"><CheckCircle2 className="mr-2 h-4 w-4" />Today</Link></Button>
            <Button variant="ghost" asChild><Link href="/life"><Layers className="mr-2 h-4 w-4" />Life focus</Link></Button>
          </div>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto lg:grid-cols-4">
          <BriefingStat label="Open tasks" value={openTasks} hint={`${dueToday} today`} icon={CheckCircle2} />
          <BriefingStat label="Upcoming" value={upcomingEvents} hint="events" icon={CalendarClock} />
          <BriefingStat label="Notes" value={notesCount} hint="workspace" icon={BookOpen} />
          <BriefingStat label="Runs (7d)" value={runsCount} hint={`${runKm} km`} icon={Activity} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {focusAnchors.map((anchor) => <FocusAnchor key={anchor} text={anchor} />)}
      </div>
    </section>
  );
}

function FocusAnchor({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="rounded-full bg-amber-100 p-2 text-amber-700 shadow-sm dark:bg-amber-900/40 dark:text-amber-200"><Sparkles className="h-4 w-4" /></div>
      <p className="text-sm text-neutral-700 dark:text-slate-200">{text}</p>
    </div>
  );
}

export function QuickLaunch({ apps, onOpen }: { apps: CatalogItem[]; onOpen: (app: CatalogItem) => void }) {
  return (
    <Card className="lg:col-span-2 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader className="flex flex-row items-center justify-between pb-0"><CardTitle>Quick launch</CardTitle><span className="text-xs text-neutral-500 dark:text-slate-400">First six from the catalogue</span></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {apps.map((app) => (
          <a key={app.id} href={app.primaryUrl} target="_blank" rel="noreferrer" onClick={() => onOpen(app)} className="group flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-white to-sky-50 px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
            <div className="flex items-center justify-between gap-2"><div><p className="font-semibold text-neutral-900 dark:text-white">{app.name}</p><p className="text-xs text-neutral-500 dark:text-slate-400">{app.category}</p></div><ArrowUpRight className="h-4 w-4 text-neutral-400" /></div>
            <div className="flex flex-wrap gap-1">{app.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border border-white/80 bg-white/80 px-2 py-0.5 text-[11px] text-neutral-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">{tag}</span>)}</div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

export function BrokenItems({ apps }: { apps: CatalogItem[] }) {
  return (
    <Card className="border-red-100 bg-red-50/80 shadow-md dark:border-red-900/50 dark:bg-red-900/30">
      <CardHeader><CardTitle>Broken / needs attention</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {apps.length === 0 ? <p className="text-sm text-red-800 dark:text-red-100">Everything looks healthy.</p> : apps.map((app) => (
          <div key={app.id} className="rounded-xl border border-red-200 bg-white/90 px-3 py-3 dark:border-red-800/60 dark:bg-red-950/40">
            <a href={app.primaryUrl} target="_blank" rel="noreferrer" className="font-semibold text-red-800 hover:underline dark:text-red-100">{app.name}</a>
            {app.notes && <p className="text-xs text-red-700 dark:text-red-200">{app.notes}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LifeCommandCenter({ cards }: { cards: CommandCenterCard[] }) {
  return (
    <Card className="lg:col-span-3 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle>Life command center</CardTitle><p className="text-sm text-neutral-600 dark:text-slate-300">One place for finances, health, social, and work.</p></div><Timer className="h-5 w-5 text-neutral-500 dark:text-slate-300" /></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return <div key={card.title} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-2 flex items-center gap-2"><div className={`rounded-full p-2 ${card.bg}`}><Icon className={`h-4 w-4 ${card.accent}`} /></div><p className="text-sm font-semibold text-neutral-900 dark:text-white">{card.title}</p>{card.isExample && <ExampleBadge />}</div><p className="text-base font-semibold text-neutral-900 dark:text-white">{card.value}</p><p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">{card.detail}</p>{card.isExample && <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">{EXAMPLE_DATA_NOTE}</p>}<Button asChild variant="ghost" className="mt-2 h-auto px-0 py-0 text-sm"><Link href={card.action.href}>{card.action.label}</Link></Button></div>;
        })}
      </CardContent>
    </Card>
  );
}

export function UpNext({ items }: { items: DashboardTimelineItem[] }) {
  return (
    <Card className="lg:col-span-2 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader><CardTitle>Up next</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-neutral-600 dark:text-slate-300">Clear skies for now.</p> : items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3"><div className="rounded-full bg-sky-100 p-2 text-sky-600 dark:bg-sky-900/40 dark:text-sky-200">{item.type === "task" ? <ClipboardCheck className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}</div><div><p className="font-medium text-neutral-900 dark:text-white">{item.title}</p><p className="text-xs text-neutral-500 dark:text-slate-400">{new Date(item.time).toLocaleString()}{item.subtitle ? ` • ${item.subtitle}` : ""}</p></div></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/70 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"><Icon className="h-4 w-4" /></div><div><p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p><p className="font-semibold text-neutral-900 dark:text-white">{value}</p><p className="text-xs text-neutral-500 dark:text-slate-400">{detail}</p></div></div>;
}

export function HealthSnapshot({ sleepAverageMinutes, distanceM, steps, latestMove, latestNutrition, latestMetric }: { sleepAverageMinutes: number | null; distanceM: number; steps: number; latestMove?: MovementLog; latestNutrition?: NutritionLog; latestMetric?: MetricLog }) {
  const sleepValue = sleepAverageMinutes != null ? `${(sleepAverageMinutes / 60).toFixed(1)} h` : "Log sleep";
  const movementValue = distanceM > 0 ? `${(distanceM / 1000).toFixed(1)} km` : steps > 0 ? `${steps} steps` : "No movement logged";
  const movementDetail = distanceM > 0 ? "Totals from imported activities" : latestMove ? `${latestMove.date} • ${latestMove.type} ${latestMove.minutes}m` : "Import a TCX or log movement to start tracking";
  return (
    <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader><CardTitle>Health snapshot</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <HealthRow label="Sleep (7d avg)" value={sleepValue} detail={sleepAverageMinutes != null ? `${sleepAverageMinutes} minutes across last 7 entries` : "Add a night to start trending"} icon={Activity} />
        <HealthRow label="Movement (7d)" value={movementValue} detail={movementDetail} icon={Dumbbell} />
        <HealthRow label="Nutrition" value={latestNutrition?.summary ?? "Log a meal"} detail={latestNutrition?.date ?? "Capture protein/veg or a simple summary"} icon={UtensilsCrossed} />
        <HealthRow label="Latest metric" value={latestMetric ? `${latestMetric.metricType} ${latestMetric.value} ${latestMetric.unit}` : "No metrics yet"} detail={latestMetric ? new Date(latestMetric.dateTimeIso).toLocaleString() : "Add weight, HRV, or BP to stay aware"} icon={Activity} />
      </CardContent>
    </Card>
  );
}

export function FamilyCarePriorities({ panels }: { panels: CarePanel[] }) {
  return (
    <Card className="lg:col-span-3 border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader><CardTitle>Family & care priorities</CardTitle></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {panels.map((panel) => { const Icon = panel.icon; return <div key={panel.title} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-2 flex items-center gap-2"><Icon className="h-4 w-4 text-neutral-600 dark:text-slate-300" /><p className="font-semibold text-neutral-900 dark:text-white">{panel.title}</p>{panel.isExample && <ExampleBadge />}</div><p className="text-sm text-neutral-700 dark:text-slate-200">{panel.summary}</p>{panel.isExample && <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">{EXAMPLE_DATA_NOTE}</p>}<ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-slate-300">{panel.bullets.map((line) => <li key={line}>• {line}</li>)}</ul><Button asChild variant="outline" className="mt-3 w-full"><Link href={panel.href}>{panel.cta}</Link></Button></div>; })}
      </CardContent>
    </Card>
  );
}

export function RecentNotes({ notes }: { notes: Note[] }) {
  return <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"><CardHeader><CardTitle>Recent notes</CardTitle></CardHeader><CardContent className="space-y-2">{notes.length === 0 ? <p className="text-sm text-neutral-600 dark:text-slate-300">No notes yet.</p> : notes.map((note) => <div key={note.id} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Link href={`/notes/${note.id}`} className="font-medium text-neutral-900 hover:underline dark:text-white">{note.title}</Link><p className="text-xs text-neutral-500 dark:text-slate-400">{new Date(note.updatedAt).toLocaleString()}</p></div>)}</CardContent></Card>;
}

export function PinnedAreas({ areas }: { areas: LifeArea[] }) {
  return <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"><CardHeader><CardTitle>Pinned areas</CardTitle></CardHeader><CardContent className="space-y-2">{areas.length === 0 ? <p className="text-sm text-neutral-600 dark:text-slate-300">No pinned areas. Pin from Life pages.</p> : areas.map((area) => <Link key={area.slug} href={`/life/${area.slug}`} className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><p className="font-medium text-neutral-900 dark:text-white">{area.title}</p><p className="text-xs text-neutral-500 dark:text-slate-400">{area.intro}</p><div className="mt-1 flex flex-wrap gap-1">{area.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full border px-2 py-0.5 text-[11px]">{tag}</span>)}</div></div><Layers className="h-4 w-4 text-neutral-500 dark:text-slate-300" /></Link>)}</CardContent></Card>;
}

export function SystemsShortcuts({ rhythm }: { rhythm?: FamilyRhythm }) {
  return <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"><CardHeader><CardTitle>Systems & shortcuts</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Button asChild className="w-full"><Link href="/apps"><Compass className="mr-2 h-4 w-4" />Browse apps</Link></Button><Button asChild variant="outline" className="w-full"><Link href="/capture"><ClipboardCheck className="mr-2 h-4 w-4" />Capture inbox</Link></Button><Button asChild variant="outline" className="w-full"><Link href="/settings/backups"><LinkIcon className="mr-2 h-4 w-4" />Backups</Link></Button><div className="rounded-2xl border p-3"><p className="text-xs uppercase text-muted-foreground">Family rhythm</p>{rhythm ? <div className="text-xs"><p>Dinner {rhythm.dinner} · Bedtime {rhythm.bedtime}</p><p>{rhythm.responsibilities.join(", ") || "Responsibilities tbc"}</p></div> : <p className="text-xs text-muted-foreground">Set rhythm in Family.</p>}</div></CardContent></Card>;
}

export function RecentActivity({ items, error }: { items: RecentItem[]; error?: string | null }) {
  return <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"><CardHeader><CardTitle>Recent activity</CardTitle></CardHeader><CardContent className="space-y-2">{error && <p className="text-sm text-destructive">{error}</p>}{items.length === 0 ? <p className="text-sm text-neutral-600 dark:text-slate-300">No recently opened items.</p> : items.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl border px-3 py-2"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.category}</p></div><a href={item.primaryUrl} target="_blank" rel="noreferrer" className="text-sm hover:underline">Open</a></div>)}</CardContent></Card>;
}

export function FocusCues({ pinnedAreas }: { pinnedAreas: LifeArea[] }) {
  return <Card className="border-white/70 bg-white/90 shadow-md dark:border-slate-800 dark:bg-slate-900/80"><CardHeader><CardTitle>Focus cues</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="rounded-2xl border px-3 py-2">Keep the list short: ship one work thing, love one family moment, and rest one beat.</p><p className="rounded-2xl border px-3 py-2">Pinned areas: {pinnedAreas.length > 0 ? pinnedAreas.map((area) => area.title).join(", ") : "none yet"}.</p><p className="rounded-2xl border px-3 py-2">Broken items stay visible above so you can clear friction fast.</p></CardContent></Card>;
}
