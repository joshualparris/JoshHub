"use client";

import { useMemo, type ReactNode } from "react";
import { CalendarClock, ClipboardPlus, HeartPulse, NotebookPen, Plus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useEvents } from "@/lib/db/events";
import { useTasks } from "@/lib/db/hooks";
import { useBookmarks } from "@/lib/db/hooks";
import { useNotes } from "@/lib/db/hooks";
import { createBookmark, createNote, createTask } from "@/lib/db/actions";
import { createEvent } from "@/lib/db/events";
import type { Bookmark, CalendarEvent, Note, Task } from "@/lib/db/schema";

const lanes = [
  {
    key: "ndis",
    title: "Sylvie NDIS",
    tags: ["ndis"],
    description: "Providers, therapy blocks, and supports.",
  },
  {
    key: "ms",
    title: "Kristy MS",
    tags: ["ms"],
    description: "Care coordination, treatment, and rest rhythms.",
  },
];

export function CareClient() {
  const events = useEvents();
  const tasks = useTasks();
  const bookmarks = useBookmarks();
  const notes = useNotes();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Care systems"
        title="Family care"
        subtitle="Keep Sylvie's NDIS and Kristy's MS care organised in one place, locally."
        tone="onDark"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => (
          <CareLane
            key={lane.key}
            lane={lane}
            events={events ?? []}
            tasks={tasks ?? []}
            bookmarks={bookmarks ?? []}
            notes={notes ?? []}
          />
        ))}
      </div>
    </div>
  );
}

type Lane = (typeof lanes)[number];

function CareLane({
  lane,
  events,
  tasks,
  bookmarks,
  notes,
}: {
  lane: Lane;
  events: CalendarEvent[];
  tasks: Task[];
  bookmarks: Bookmark[];
  notes: Note[];
}) {
  const nextEvent = useMemo(
    () =>
      [...events]
        .filter((ev) => intersects(ev.tags, lane.tags) && ev.endIso >= new Date().toISOString())
        .sort((a, b) => a.startIso.localeCompare(b.startIso))[0],
    [events, lane.tags]
  );

  const nextTask = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "open" && intersects(t.tags, lane.tags))
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || b.updatedAt - a.updatedAt)[0],
    [tasks, lane.tags]
  );

  const providersCount = useMemo(
    () => bookmarks.filter((b) => intersects(b.tags, lane.tags)).length,
    [bookmarks, lane.tags]
  );

  const latestNote = useMemo(
    () =>
      notes
        .filter((n) => intersects(n.tags, lane.tags) || n.lifeAreaSlug === "family" || n.lifeAreaSlug === "health")
        .sort((a, b) => b.updatedAt - a.updatedAt)[0],
    [notes, lane.tags]
  );

  const now = new Date();
  const startIso = now.toISOString();
  const endIso = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  async function handleAddProvider() {
    await createBookmark({
      title: `${lane.title} provider`,
      url: "https://",
      tags: [...lane.tags, "provider"],
    });
  }

  async function handleAddAppointment() {
    await createEvent({
      title: `${lane.title} appointment`,
      startIso,
      endIso,
      tags: lane.tags,
    });
  }

  async function handleAddGoal() {
    await createTask({
      title: `${lane.title} goal`,
      tags: lane.tags,
    });
  }

  async function handleAddNote() {
    await createNote({
      title: `${lane.title} note`,
      tags: lane.tags,
      lifeAreaSlug: "family",
    });
  }

  return (
    <Card className="space-y-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{lane.title}</CardTitle>
            <p className="text-sm text-neutral-600 dark:text-slate-300">{lane.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<CalendarClock className="h-4 w-4" />}
          label="Next appointment"
          value={nextEvent ? nextEvent.title : "None scheduled"}
          detail={
            nextEvent
              ? `${new Date(nextEvent.startIso).toLocaleString()}${nextEvent.location ? ` • ${nextEvent.location}` : ""}`
              : "Add one to keep it visible."
          }
        />
        <InfoRow
          icon={<ClipboardPlus className="h-4 w-4" />}
          label="Next action"
          value={nextTask ? nextTask.title : "No open actions"}
          detail={nextTask?.dueDate ? `Due ${nextTask.dueDate}` : nextTask ? "Open" : "Add a small next step"}
        />
        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="Providers"
          value={`${providersCount} saved`}
          detail="Tagged bookmarks"
        />
        <InfoRow
          icon={<NotebookPen className="h-4 w-4" />}
          label="Latest note"
          value={latestNote ? latestNote.title : "No notes yet"}
          detail={latestNote ? new Date(latestNote.updatedAt).toLocaleString() : "Capture context quickly"}
        />

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={handleAddProvider}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddAppointment}>
            <CalendarClock className="mr-2 h-4 w-4" />
            Add Appointment
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddGoal}>
            <HeartPulse className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddNote}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mt-1 text-sky-600 dark:text-sky-200">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p>
        <p className="font-medium text-neutral-900 dark:text-slate-50">{value}</p>
        {detail && <p className="text-xs text-neutral-500 dark:text-slate-300">{detail}</p>}
      </div>
    </div>
  );
}

function intersects(source: string[] = [], targets: string[] = []) {
  return source.some((tag) => targets.includes(tag));
}
