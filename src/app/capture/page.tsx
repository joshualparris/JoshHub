/* Capture inbox: quick add note/task/bookmark and show recent captures */
"use client";

import { FormEvent, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { createBookmark, createNote, createTask } from "@/lib/db/actions";
import { useBookmarks, useNotes, useTasks } from "@/lib/db/hooks";

export default function CapturePage() {
  const notes = useNotes();
  const tasks = useTasks();
  const bookmarks = useBookmarks();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const recent = useMemo(() => {
    const combined: { type: string; title: string; createdAt: number }[] = [];
    (notes ?? []).forEach((n) => combined.push({ type: "Note", title: n.title, createdAt: n.createdAt }));
    (tasks ?? []).forEach((t) => combined.push({ type: "Task", title: t.title, createdAt: t.createdAt }));
    (bookmarks ?? []).forEach((b) =>
      combined.push({ type: "Bookmark", title: b.title || b.url, createdAt: b.createdAt })
    );
    return combined.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  }, [notes, tasks, bookmarks]);

  async function onAddNote(e: FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      setSavingNote(true);
      await createNote({ title: noteTitle.trim(), body: noteBody.trim(), tags: [] });
      setNoteTitle("");
      setNoteBody("");
    } finally {
      setSavingNote(false);
    }
  }

  async function onAddTask(e: FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      setSavingTask(true);
      await createTask({ title: taskTitle.trim() });
      setTaskTitle("");
    } finally {
      setSavingTask(false);
    }
  }

  async function onAddBookmark(e: FormEvent) {
    e.preventDefault();
    if (!bookmarkUrl.trim()) return;
    try {
      setSavingBookmark(true);
      await createBookmark({ title: bookmarkTitle || bookmarkUrl, url: bookmarkUrl.trim(), tags: [] });
      setBookmarkTitle("");
      setBookmarkUrl("");
    } finally {
      setSavingBookmark(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="Capture" title="Inbox" subtitle="Fast drop for notes, tasks, and bookmarks." />
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
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <Textarea
                placeholder="Body (optional)"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={savingNote}>
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
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={savingTask}>
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
                onChange={(e) => setBookmarkTitle(e.target.value)}
              />
              <Input
                placeholder="https://..."
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
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
            <p className="text-sm text-neutral-600">No captured items yet.</p>
          ) : (
            recent.map((item, idx) => (
              <div
                key={`${item.type}-${item.createdAt}-${idx}`}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2"
              >
                <div>
                  <p className="font-medium text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.type}</p>
                </div>
                <p className="text-xs text-neutral-500">
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
