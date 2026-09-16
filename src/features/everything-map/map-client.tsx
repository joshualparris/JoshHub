"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Folder, NotebookPen, Plus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { parseTagList } from "@/lib/logic/tagging";
import { createMapNote, deleteMapNote, updateMapNote, useAllNotes, useNotes } from "./db";
import { EVERYTHING_MAP_TOC } from "./toc";
import { buildTree, filterTreeByQuery, findNode } from "./tree";
import type { TocNode } from "./types";

interface MapClientProps {
  initialId?: string | null;
}

interface TocTreeProps {
  nodes: TocNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}

interface NoteDraft {
  title: string;
  body: string;
  tags: string;
}

const EMPTY_DRAFT: NoteDraft = { title: "", body: "", tags: "" };

export function MapClient({ initialId }: MapClientProps) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => buildTree(EVERYTHING_MAP_TOC), []);
  const filteredTree = useMemo(() => filterTreeByQuery(tree, query), [tree, query]);
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? tree[0]?.id ?? null);
  const selectedNode = useMemo(
    () => (selectedId ? findNode(tree, selectedId) : null),
    [selectedId, tree]
  );

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      <MapNavigation
        query={query}
        onQueryChange={setQuery}
        nodes={filteredTree}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      {selectedNode ? <SectionDetails node={selectedNode} /> : <EmptySelection />}
    </div>
  );
}

function MapNavigation({
  query,
  onQueryChange,
  nodes,
  selectedId,
  onSelect,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  nodes: TocNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search sections..."
        aria-label="Search map sections"
      />
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <TocTree nodes={nodes} onSelect={onSelect} selectedId={selectedId} />
      </div>
    </div>
  );
}

function TocTree({ nodes, selectedId, onSelect, depth = 0 }: TocTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id} className="space-y-1">
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selectedId === node.id ? "bg-muted font-semibold" : ""
            }`}
            style={{ paddingLeft: 8 + depth * 12 }}
          >
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span>{node.title}</span>
            <span className="text-xs text-muted-foreground">{node.id}</span>
          </button>
          {node.children.length > 0 && (
            <TocTree
              nodes={node.children}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function EmptySelection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a section</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Choose a section from the tree to view details and notes.
      </CardContent>
    </Card>
  );
}

function SectionDetails({ node }: { node: TocNode }) {
  const notes = useNotes(node.id);
  const allNotes = useAllNotes();
  const [draft, setDraft] = useState<NoteDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function saveNote() {
    const tags = parseTagList(draft.tags);
    const title = draft.title.trim() || "Untitled";

    if (editingId) {
      await updateMapNote(editingId, { title, body: draft.body, tags });
    } else {
      await createMapNote(node.id, { title, body: draft.body, tags });
    }

    setDraft(EMPTY_DRAFT);
    setEditingId(null);
  }

  function editNote(noteId: string) {
    const note = notes.find((candidate) => candidate.id === noteId);
    if (!note) return;

    setEditingId(note.id);
    setDraft({ title: note.title, body: note.body, tags: note.tags.join(", ") });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }

  return (
    <div className="space-y-4">
      <SectionCard node={node} />
      <NoteEditor
        draft={draft}
        editing={editingId !== null}
        onDraftChange={setDraft}
        onSave={saveNote}
        onCancel={cancelEdit}
      />
      <NotesCard notes={notes} onEdit={editNote} />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All notes summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {allNotes.length} total notes across the map.
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({ node }: { node: TocNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{node.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2 text-muted-foreground">
          <span className="rounded-md border border-border px-2 py-1 text-xs">ID: {node.id}</span>
          {node.page && (
            <span className="rounded-md border border-border px-2 py-1 text-xs">
              Page {node.page}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Add notes below for details, decisions, or links related to this section.
        </p>
        <Separator />
        <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Map notes use JoshHub&apos;s main backup system. Manage exports, restores, and resets
            from{" "}
            <Link href="/settings/backups" className="underline">
              Backups
            </Link>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function NoteEditor({
  draft,
  editing,
  onDraftChange,
  onSave,
  onCancel,
}: {
  draft: NoteDraft;
  editing: boolean;
  onDraftChange: (draft: NoteDraft) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{editing ? "Edit note" : "Add note"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input
          placeholder="Title"
          value={draft.title}
          onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
        />
        <Textarea
          placeholder="Details (markdown ok)"
          value={draft.body}
          onChange={(event) => onDraftChange({ ...draft, body: event.target.value })}
          rows={4}
        />
        <Input
          placeholder="Tags (comma separated)"
          value={draft.tags}
          onChange={(event) => onDraftChange({ ...draft, tags: event.target.value })}
        />
        <div className="flex gap-2">
          <Button onClick={() => void onSave()}>
            <Plus className="mr-2 h-4 w-4" />
            {editing ? "Update" : "Add"} note
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NotesCard({
  notes,
  onEdit,
}: {
  notes: ReturnType<typeof useNotes>;
  onEdit: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet. Add one above.</p>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              className="rounded-md border border-border bg-card p-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium">{note.title}</p>
                  <p className="whitespace-pre-wrap text-sm">{note.body}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(note.id)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm("Delete this note?")) void deleteMapNote(note.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
