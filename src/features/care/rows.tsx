import { useState } from "react";
import { Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isoToLocalDateTimeInput, localDateTimeInputToIso } from "@/lib/calendar/time";
import {
  deleteBookmark,
  deleteNote,
  deleteTask,
  updateBookmark,
  updateNote,
  updateTask,
} from "@/lib/db/actions";
import { deleteEvent, updateEvent } from "@/lib/db/events";
import type { Bookmark, CalendarEvent, Note, Task } from "@/lib/db/schema";
import { parseTagList } from "@/lib/logic/tagging";
import { isHttpUrl } from "@/lib/validation/url";

const rowClass = "rounded-md border border-border bg-card p-3 text-card-foreground shadow-sm";

export function ProviderRow({ bookmark }: { bookmark: Bookmark }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [tags, setTags] = useState(bookmark.tags.join(", "));
  const [error, setError] = useState("");

  async function save() {
    const nextUrl = url.trim();
    if (nextUrl && !isHttpUrl(nextUrl)) {
      setError("Enter a complete http:// or https:// URL, or leave it empty.");
      return;
    }
    await updateBookmark(bookmark.id, {
      title: title.trim() || "Untitled provider",
      url: nextUrl,
      tags: parseTagList(tags),
    });
    setError("");
    setEditing(false);
  }

  return (
    <div className={rowClass}>
      {editing ? (
        <EditorActions onSave={save} onCancel={() => setEditing(false)}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Provider name"
          />
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://... (optional)"
          />
          {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
          <TagInput value={tags} onChange={setTags} />
        </EditorActions>
      ) : (
        <RowDisplay
          title={bookmark.title}
          lines={[
            bookmark.url || "No URL saved",
            bookmark.tags.length ? `Tags: ${bookmark.tags.join(", ")}` : "",
          ]}
          onEdit={() => setEditing(true)}
          onDelete={() =>
            deleteWithConfirmation("Delete this provider?", () => deleteBookmark(bookmark.id))
          }
        />
      )}
    </div>
  );
}

export function EventRow({ event }: { event: CalendarEvent }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(isoToLocalDateTimeInput(event.startIso));
  const [end, setEnd] = useState(isoToLocalDateTimeInput(event.endIso));
  const [location, setLocation] = useState(event.location ?? "");
  const [notes, setNotes] = useState(event.notes ?? "");
  const [tags, setTags] = useState(event.tags.join(", "));
  const [error, setError] = useState("");

  async function save() {
    try {
      const startIso = localDateTimeInputToIso(start);
      const endIso = localDateTimeInputToIso(end);
      if (!title.trim()) throw new Error("Add an appointment title.");
      if (Date.parse(endIso) < Date.parse(startIso))
        throw new Error("End time must be after start time.");
      await updateEvent(event.id, {
        title: title.trim(),
        startIso,
        endIso,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        tags: parseTagList(tags),
      });
      setError("");
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the appointment details.");
    }
  }

  return (
    <div className={rowClass}>
      {editing ? (
        <EditorActions onSave={save} onCancel={() => setEditing(false)}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Appointment title"
          />
          <div className="grid gap-2 md:grid-cols-2">
            <Input
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
            <Input
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
          />
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notes"
          />
          <TagInput value={tags} onChange={setTags} />
          {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        </EditorActions>
      ) : (
        <RowDisplay
          title={event.title}
          lines={[
            `${new Date(event.startIso).toLocaleString()} – ${new Date(event.endIso).toLocaleString()}`,
            event.location ?? "",
            event.tags.length ? `Tags: ${event.tags.join(", ")}` : "",
            event.notes ?? "",
          ]}
          onEdit={() => setEditing(true)}
          onDelete={() =>
            deleteWithConfirmation("Delete this appointment?", () => deleteEvent(event.id))
          }
        />
      )}
    </div>
  );
}

export function TaskRow({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [tags, setTags] = useState(task.tags.join(", "));

  async function save() {
    await updateTask(task.id, {
      title: title.trim() || "Untitled goal",
      priority,
      dueDate: dueDate || null,
      tags: parseTagList(tags),
    });
    setEditing(false);
  }

  return (
    <div className={rowClass}>
      {editing ? (
        <EditorActions onSave={save} onCancel={() => setEditing(false)}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Goal"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Task["priority"])}
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <TagInput value={tags} onChange={setTags} />
        </EditorActions>
      ) : (
        <RowDisplay
          title={task.title}
          lines={[
            `Priority: ${task.priority.toUpperCase()}${task.dueDate ? ` • Due ${task.dueDate}` : ""}`,
            task.tags.length ? `Tags: ${task.tags.join(", ")}` : "",
          ]}
          onEdit={() => setEditing(true)}
          onDelete={() =>
            deleteWithConfirmation("Delete this goal/action?", () => deleteTask(task.id))
          }
        />
      )}
    </div>
  );
}

export function NoteRow({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags.join(", "));

  async function save() {
    await updateNote(note.id, {
      title: title.trim() || "Untitled note",
      body,
      tags: parseTagList(tags),
    });
    setEditing(false);
  }

  return (
    <div className={rowClass}>
      {editing ? (
        <EditorActions onSave={save} onCancel={() => setEditing(false)}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
          />
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Details"
          />
          <TagInput value={tags} onChange={setTags} />
        </EditorActions>
      ) : (
        <RowDisplay
          title={note.title}
          lines={[note.body, note.tags.length ? `Tags: ${note.tags.join(", ")}` : ""]}
          onEdit={() => setEditing(true)}
          onDelete={() => deleteWithConfirmation("Delete this note?", () => deleteNote(note.id))}
        />
      )}
    </div>
  );
}

function TagInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="tags, comma separated"
    />
  );
}

function EditorActions({
  children,
  onSave,
  onCancel,
}: {
  children: React.ReactNode;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-2">
      {children}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void onSave()}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function RowDisplay({
  title,
  lines,
  onEdit,
  onDelete,
}: {
  title: string;
  lines: string[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {lines.filter(Boolean).map((line) => (
          <p key={line} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label={`Edit ${title}`}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label={`Delete ${title}`}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function deleteWithConfirmation(message: string, remove: () => Promise<void>) {
  if (confirm(message)) void remove();
}
