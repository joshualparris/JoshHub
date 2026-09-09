import { CalendarClock, ClipboardPlus, HeartPulse, NotebookPen, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createBookmark,
  createNote,
  createTask,
} from "@/lib/db/actions";
import { createEvent } from "@/lib/db/events";
import type { Bookmark, CalendarEvent, Note, Task } from "@/lib/db/schema";
import { CareSection } from "./care-section";
import { InfoRow } from "./info-row";
import {
  countCareProviders,
  intersectsTags,
  selectLatestCareNote,
  selectNextCareEvent,
  selectNextCareTask,
  type CareLane,
} from "./logic";
import { EventRow, NoteRow, ProviderRow, TaskRow } from "./rows";

export function CareLanePanel({
  lane,
  events,
  tasks,
  bookmarks,
  notes,
}: {
  lane: CareLane;
  events: CalendarEvent[];
  tasks: Task[];
  bookmarks: Bookmark[];
  notes: Note[];
}) {
  const nextEvent = selectNextCareEvent(events, lane.tags);
  const nextTask = selectNextCareTask(tasks, lane.tags);
  const latestNote = selectLatestCareNote(notes, lane.tags);
  const providersCount = countCareProviders(bookmarks, lane.tags);

  async function addProvider() {
    await createBookmark({
      title: `${lane.title} provider — edit details`,
      url: "",
      tags: [...lane.tags, "provider"],
    });
  }

  async function addAppointment() {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    await createEvent({
      title: `${lane.title} appointment — edit details`,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      tags: lane.tags,
    });
  }

  async function addGoal() {
    await createTask({ title: `${lane.title} goal — edit details`, tags: lane.tags });
  }

  async function addNote() {
    await createNote({
      title: `${lane.title} note — edit details`,
      tags: lane.tags,
      lifeAreaSlug: "family",
    });
  }

  const laneEvents = events.filter((event) => intersectsTags(event.tags, lane.tags));
  const laneTasks = tasks.filter((task) => intersectsTags(task.tags, lane.tags));
  const laneBookmarks = bookmarks.filter((bookmark) => intersectsTags(bookmark.tags, lane.tags));
  const laneNotes = notes.filter(
    (note) =>
      intersectsTags(note.tags, lane.tags) ||
      note.lifeAreaSlug === "family" ||
      note.lifeAreaSlug === "health"
  );

  return (
    <Card className="space-y-3">
      <CardHeader>
        <CardTitle>{lane.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{lane.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoRow
          icon={<CalendarClock className="h-4 w-4" />}
          label="Next appointment"
          value={nextEvent?.title ?? "None scheduled"}
          detail={nextEvent ? new Date(nextEvent.startIso).toLocaleString() : "Add an appointment when needed."}
        />
        <InfoRow
          icon={<ClipboardPlus className="h-4 w-4" />}
          label="Next action"
          value={nextTask?.title ?? "No open actions"}
          detail={nextTask?.dueDate ? `Due ${nextTask.dueDate}` : nextTask ? "Open" : "Add a small next step."}
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
          value={latestNote?.title ?? "No notes yet"}
          detail={latestNote ? new Date(latestNote.updatedAt).toLocaleString() : "Capture context quickly."}
        />

        <div className="flex flex-wrap gap-2 pt-1">
          <ActionButton label="Add Provider" icon={<Plus className="mr-2 h-4 w-4" />} onClick={addProvider} />
          <ActionButton label="Add Appointment" icon={<CalendarClock className="mr-2 h-4 w-4" />} onClick={addAppointment} />
          <ActionButton label="Add Goal" icon={<HeartPulse className="mr-2 h-4 w-4" />} onClick={addGoal} />
          <ActionButton label="Add Note" icon={<NotebookPen className="mr-2 h-4 w-4" />} onClick={addNote} />
        </div>

        <CareSection title="Appointments" items={laneEvents} renderItem={(item) => <EventRow key={item.id} event={item} />} empty="No appointments yet." />
        <CareSection title="Goals / Actions" items={laneTasks} renderItem={(item) => <TaskRow key={item.id} task={item} />} empty="No goals yet." />
        <CareSection title="Providers" items={laneBookmarks} renderItem={(item) => <ProviderRow key={item.id} bookmark={item} />} empty="No providers saved." />
        <CareSection title="Notes" items={laneNotes} renderItem={(item) => <NoteRow key={item.id} note={item} />} empty="No notes yet." />
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => Promise<void> }) {
  return (
    <Button size="sm" variant="outline" onClick={() => void onClick()}>
      {icon}
      {label}
    </Button>
  );
}
