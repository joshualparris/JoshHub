"use client";

import { useMemo, useState } from "react";
import { FileDown, FileUp, Folder, NotebookPen, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EVERYTHING_MAP_TOC } from "./toc";
import { buildTree, findNode, filterTreeByQuery } from "./tree";
import type { TocNode } from "./types";
import {
  createMapNote,
  deleteMapNote,
  exportNotes,
  importNotes,
  updateMapNote,
  useAllNotes,
  useNotes,
} from "./db";

interface MapClientProps {
  initialId?: string | null;
}

export function MapClient({ initialId }: MapClientProps) {
  const [query, setQuery] = useState("");
  const tree = useMemo(() => buildTree(EVERYTHING_MAP_TOC), []);
  const filteredTree = useMemo(() => filterTreeByQuery(tree, query), [tree, query]);
  const firstId = tree[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? firstId);
  const selectedNode = useMemo(
    () => (selectedId ? findNode(tree, selectedId) : null),
    [tree, selectedId]
  );

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-neutral-500 dark:text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sections..."
            className="w-full"
          />
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <TocTree nodes={filteredTree} onSelect={setSelectedId} selectedId={selectedId} />
        </div>
      </div>

      <div className="space-y-4">
        {selectedNode ? (
          <SectionDetails node={selectedNode} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select a section</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-600 dark:text-slate-300">
              Choose a section from the tree to view details and notes.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface TocTreeProps {
  nodes: TocNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}

function TocTree({ nodes, selectedId, onSelect, depth = 0 }: TocTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id} className="space-y-1">
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-400 ${
              selectedId === node.id ? "bg-neutral-100 font-semibold dark:bg-slate-800/80" : ""
            }`}
            style={{ paddingLeft: 8 + depth * 12 }}
          >
            <Folder className="h-4 w-4 text-neutral-500 dark:text-slate-400" />
            <span className="text-neutral-900 dark:text-slate-100">{node.title}</span>
            <span className="text-xs text-neutral-500 dark:text-slate-400">{node.id}</span>
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

function SectionDetails({ node }: { node: TocNode }) {
  const notes = useNotes(node.id);
  const allNotes = useAllNotes();
  const [draft, setDraft] = useState({ title: "", body: "", tags: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleSave() {
    const tags = draft.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editingId) {
      await updateMapNote(editingId, { title: draft.title, body: draft.body, tags });
    } else {
      await createMapNote(node.id, { title: draft.title || "Untitled", body: draft.body, tags });
    }
    setDraft({ title: "", body: "", tags: "" });
    setEditingId(null);
  }

  function startEdit(noteId: string) {
    const note = notes?.find((n) => n.id === noteId);
    if (!note) return;
    setEditingId(note.id);
    setDraft({ title: note.title, body: note.body, tags: note.tags.join(", ") });
  }

  async function handleExport() {
    const blob = await exportNotes();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "joshhub-map-notes.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importNotes(file);
      e.target.value = "";
    } catch (err) {
      alert("Import failed. Please check the file format.");
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{node.title}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export notes
              </Button>
              <Button asChild variant="outline" size="sm">
                <label className="flex cursor-pointer items-center">
                  <FileUp className="mr-2 h-4 w-4" />
                  Import
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
          <div className="flex gap-3 text-neutral-600 dark:text-slate-300">
            <span className="rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-slate-700/60">
              ID: {node.id}
            </span>
            {node.page && (
              <span className="rounded-md border border-neutral-200 px-2 py-1 text-xs dark:border-slate-700/60">
                Page {node.page}
              </span>
            )}
          </div>
          <p className="text-neutral-600 dark:text-slate-300">
            Placeholder: add description or related links for this section here.
          </p>
          <Separator className="my-2" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">Add note</h3>
            <Input
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <Textarea
              placeholder="Details (markdown ok)"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={4}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={draft.tags}
              onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Update" : "Add"} note
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setDraft({ title: "", body: "", tags: "" });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-md border border-neutral-200 bg-white p-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-slate-100">{note.title}</p>
                    <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-slate-200">
                      {note.body}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">
                      Updated {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(note.id)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMapNote(note.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-600">No notes yet. Add one above.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-slate-100">
            All notes summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 dark:text-slate-300">
          {allNotes.length} total notes across the map.
        </CardContent>
      </Card>
    </div>
  );
}
