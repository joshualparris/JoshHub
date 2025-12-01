"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/lib/db/actions";
import { useNotes } from "@/lib/db/hooks";
import type { Note } from "@/lib/db/schema";

export default function NotesPage() {
  const notes = useNotes();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (notes ?? [])
      .filter((n) => {
        const matchesSearch = `${n.title} ${n.body}`.toLowerCase().includes(q);
        const matchesTag = !tag || n.tags.some((t) => t.includes(tag));
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, search, tag]);

  async function onAddNote(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createNote({ title: newTitle.trim(), body: newBody.trim(), tags: tag ? [tag] : [] });
    setNewTitle("");
    setNewBody("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Notes</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Notes</h1>
        <p className="text-neutral-600">Search, filter, and edit notes.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="md:w-1/2"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search notes"
        />
        <Input
          placeholder="Tag filter"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          aria-label="Filter by tag"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New note</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onAddNote}>
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Body (markdown ok)"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm text-neutral-600">No notes found.</p>}
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link
            href={`/notes/${note.id}`}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
          >
            {note.title || "Untitled"}
          </Link>
          <span className="text-xs text-neutral-500">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-neutral-700 line-clamp-3">{note.body || "No content yet."}</p>
        <div className="flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700"
            >
              {t}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
