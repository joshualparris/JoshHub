"use client";

import { FormEvent, useMemo, useState } from "react";

import { lifeAreas } from "@/data/life";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { createBookmark, createNote, createTask } from "@/lib/db/actions";
import { useBookmarks, useNotes, useTasks } from "@/lib/db/hooks";
import { parseTagList } from "@/lib/logic/tagging";
import { isHttpUrl } from "@/lib/validation/url";

export default function CapturePage() {
  const notes = useNotes();
  const tasks = useTasks();
  const bookmarks = useBookmarks();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteTags, setNoteTags] = useState("");
  const [noteArea, setNoteArea] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTags, setTaskTags] = useState("");
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [bookmarkTags, setBookmarkTags] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  const recent = useMemo(() => {
    const captures: { type: string; title: string; createdAt: number }[] = [];
    for (const note of notes ?? []) {
      captures.push({ type: "Note", title: note.title, createdAt: note.createdAt });
    }
    for (const task of tasks ?? []) {
      captures.push({ type: "Task", title: task.title, createdAt: task.createdAt });
    }
    for (const bookmark of bookmarks ?? []) {
      captures.push({
        type: "Bookmark",
        title: bookmark.title || bookmark.url,
        createdAt: bookmark.createdAt,
      });
    }
    return captures.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  }, [notes, tasks, bookmarks]);

  async function onAddNote(event: FormEvent) {
    event.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      setSavingNote(true);
      await createNote({
        title: noteTitle.trim(),
        body: noteBody.trim(),
        tags: parseTagList(noteTags),
        lifeAreaSlug: noteArea || null,
      });
      setNoteTitle("");
      setNoteBody("");
      setNoteTags("");
    } finally {
      setSavingNote(false);
    }
  }

  async function onAddTask(event: FormEvent) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      setSavingTask(true);
      await createTask({ title: taskTitle.trim(), tags: parseTagList(taskTags) });
      setTaskTitle("");
      setTaskTags("");
    } finally {
      setSavingTask(false);
    }
  }

  async function onAddBookmark(event: FormEvent) {
    event.preventDefault();
    const url = bookmarkUrl.trim();
    if (!isHttpUrl(url)) {
      setBookmarkError("Enter a complete http:// or https:// URL.");
      return;
    }

    try {
      setSavingBookmark(true);
      setBookmarkError("");
      await createBookmark({
        title: bookmarkTitle.trim() || url,
        url,
        tags: parseTagList(bookmarkTags),
      });
      setBookmarkTitle("");
      setBookmarkUrl("");
      setBookmarkTags("");
    } finally {
      setSavingBookmark(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Capture"
        title="Inbox"
        subtitle="Fast drop for notes, tasks, and bookmarks."
        tone="onDark"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick note</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onAddNote}>
              <Input
                placeholder="Title"
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
              />
              <Textarea
                placeholder="Body (optional)"
                value={noteBody}
                onChange={(event) => setNoteBody(event.target.value)}
              />
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="Tags (comma separated)"
                  value={noteTags}
                  onChange={(event) => setNoteTags(event.target.value)}
                />
                <select
                  value={noteArea}
                  onChange={(event) => setNoteArea(event.target.value)}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Area (optional)</option>
                  {lifeAreas.map((area) => (
                    <option key={area.slug} value={area.slug}>
                      {area.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={savingNote || !noteTitle.trim()}>
                {savingNote ? "Saving..." : "Save note"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick task</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onAddTask}>
              <Input
                placeholder="Task title"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />
              <Input
                placeholder="Tags (comma separated)"
                value={taskTags}
                onChange={(event) => setTaskTags(event.target.value)}
              />
              <Button type="submit" className="w-full" disabled={savingTask || !taskTitle.trim()}>
                {savingTask ? "Saving..." : "Add task"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick bookmark</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onAddBookmark}>
              <Input
                placeholder="Title"
                value={bookmarkTitle}
                onChange={(event) => setBookmarkTitle(event.target.value)}
              />
              <Input
                placeholder="https://..."
                value={bookmarkUrl}
                onChange={(event) => {
                  setBookmarkUrl(event.target.value);
                  if (bookmarkError) setBookmarkError("");
                }}
                aria-invalid={bookmarkError ? true : undefined}
              />
              {bookmarkError && (
                <p className="text-sm text-red-600 dark:text-red-300">{bookmarkError}</p>
              )}
              <Input
                placeholder="Tags (comma separated)"
                value={bookmarkTags}
                onChange={(event) => setBookmarkTags(event.target.value)}
              />
              <Button type="submit" className="w-full" disabled={savingBookmark}>
                {savingBookmark ? "Saving..." : "Save link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent captures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No captured items yet.</p>
          ) : (
            recent.map((item) => (
              <div
                key={`${item.type}-${item.createdAt}`}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-card-foreground"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
