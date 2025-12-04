"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CalendarClock, ClipboardPlus, HeartPulse, NotebookPen, Pencil, Plus, Trash, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { useEvents } from "@/lib/db/events";
import { useTasks } from "@/lib/db/hooks";
import { useBookmarks } from "@/lib/db/hooks";
import { useNotes } from "@/lib/db/hooks";
import {
  createBookmark,
  createNote,
  createTask,
  deleteBookmark,
  deleteNote,
  deleteTask,
  updateBookmark,
  updateNote,
  updateTask,
} from "@/lib/db/actions";
import { createEvent, deleteEvent, updateEvent } from "@/lib/db/events";
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

        <CareSection title="Appointments" items={events.filter((ev) => intersects(ev.tags, lane.tags))} renderItem={(item) => <EventRow key={item.id} event={item} />} empty="No appointments yet." />
        <CareSection title="Goals / Actions" items={tasks.filter((t) => intersects(t.tags, lane.tags))} renderItem={(item) => <TaskRow key={item.id} task={item} />} empty="No goals yet." />
        <CareSection title="Providers" items={bookmarks.filter((b) => intersects(b.tags, lane.tags))} renderItem={(item) => <ProviderRow key={item.id} bookmark={item} />} empty="No providers saved." />
        <CareSection title="Notes" items={notes.filter((n) => intersects(n.tags, lane.tags) || n.lifeAreaSlug === "family" || n.lifeAreaSlug === "health")} renderItem={(item) => <NoteRow key={item.id} note={item} />} empty="No notes yet." />
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
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-white/80 px-3 py-2 text-card-foreground dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mt-1 text-sky-600 dark:text-sky-200">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-card-foreground/70">{label}</p>
        <p className="font-medium text-card-foreground">{value}</p>
        {detail && <p className="text-xs text-card-foreground/70">{detail}</p>}
      </div>
    </div>
  );
}

function intersects(source: string[] = [], targets: string[] = []) {
  return source.some((tag) => targets.includes(tag));
}

type CareSectionProps<T> = {
  title: string;
  items: T[];
  empty: string;
  renderItem: (item: T) => ReactNode;
};

function CareSection<T>({ title, items, empty, renderItem }: CareSectionProps<T>) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200/70 bg-white/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-card-foreground">{title}</p>
        <p className="text-xs text-card-foreground/60">{items.length} item{items.length === 1 ? "" : "s"}</p>
      </div>
      {items.length === 0 ? <p className="text-sm text-card-foreground/70">{empty}</p> : <div className="space-y-2">{items.map(renderItem)}</div>}
    </div>
  );
}

function ProviderRow({ bookmark }: { bookmark: Bookmark }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [tags, setTags] = useState(bookmark.tags.join(", "));

  async function handleSave() {
    await updateBookmark(bookmark.id, { title: title.trim(), url: url.trim(), tags: splitTags(tags) });
    setEditing(false);
  }

  async function handleDelete() {
    if (confirm("Delete this provider?")) {
      await deleteBookmark(bookmark.id);
    }
  }

  return (
    <div className="rounded-md border border-slate-200/70 bg-white/70 p-3 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Provider name" />
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{bookmark.title}</p>
            <p className="text-sm text-card-foreground/70">{bookmark.url}</p>
            {bookmark.tags.length > 0 && <p className="text-xs text-card-foreground/60">Tags: {bookmark.tags.join(", ")}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit provider">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete} aria-label="Delete provider">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(toLocalInput(event.startIso));
  const [end, setEnd] = useState(toLocalInput(event.endIso));
  const [location, setLocation] = useState(event.location ?? "");
  const [notes, setNotes] = useState(event.notes ?? "");
  const [tags, setTags] = useState(event.tags.join(", "));

  async function handleSave() {
    await updateEvent(event.id, {
      title: title.trim(),
      startIso: fromLocalInput(start),
      endIso: fromLocalInput(end),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: splitTags(tags),
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (confirm("Delete this appointment?")) {
      await deleteEvent(event.id);
    }
  }

  return (
    <div className="rounded-md border border-slate-200/70 bg-white/70 p-3 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Appointment title" />
          <div className="grid gap-2 md:grid-cols-2">
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-card-foreground/70">
              {new Date(event.startIso).toLocaleString()} - {new Date(event.endIso).toLocaleString()}
            </p>
            {event.location && <p className="text-sm text-card-foreground/70">{event.location}</p>}
            {event.tags.length > 0 && <p className="text-xs text-card-foreground/60">Tags: {event.tags.join(", ")}</p>}
            {event.notes && <p className="text-sm text-card-foreground/70">{event.notes}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit appointment">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete} aria-label="Delete appointment">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [tags, setTags] = useState(task.tags.join(", "));

  async function handleSave() {
    await updateTask(task.id, {
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      tags: splitTags(tags),
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (confirm("Delete this goal/action?")) {
      await deleteTask(task.id);
    }
  }

  return (
    <div className="rounded-md border border-slate-200/70 bg-white/70 p-3 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal" />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-card-foreground dark:border-slate-800 dark:bg-slate-900"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-card-foreground/70">
              Priority: {task.priority.toUpperCase()} {task.dueDate ? `• Due ${task.dueDate}` : ""}
            </p>
            {task.tags.length > 0 && <p className="text-xs text-card-foreground/60">Tags: {task.tags.join(", ")}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit goal">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete} aria-label="Delete goal">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteRow({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags.join(", "));

  async function handleSave() {
    await updateNote(note.id, {
      title: title.trim(),
      body,
      tags: splitTags(tags),
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (confirm("Delete this note?")) {
      await deleteNote(note.id);
    }
  }

  return (
    <div className="rounded-md border border-slate-200/70 bg-white/70 p-3 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {editing ? (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details" />
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium">{note.title}</p>
            {note.body && <p className="text-sm text-card-foreground/70">{note.body}</p>}
            {note.tags.length > 0 && <p className="text-xs text-card-foreground/60">Tags: {note.tags.join(", ")}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit note">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleDelete} aria-label="Delete note">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
}
