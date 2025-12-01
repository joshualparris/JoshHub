import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import type { Note } from "@/lib/db/schema";
import { db } from "@/lib/db/dexie";
import { uuid } from "@/lib/db/id";

export type MapNoteInput = {
  title: string;
  body: string;
  tags?: string[];
};

export async function createMapNote(nodeId: string, input: MapNoteInput) {
  const now = Date.now();
  const note: Note = {
    id: uuid(),
    nodeId,
    title: input.title,
    body: input.body,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.add(note);
  return note;
}

export async function updateMapNote(id: string, patch: Partial<MapNoteInput>) {
  const existing = await db.notes.get(id);
  if (!existing) return;
  await db.notes.update(id, {
    ...patch,
    tags: patch.tags ?? existing.tags,
    updatedAt: Date.now(),
  });
}

export async function deleteMapNote(id: string) {
  await db.notes.delete(id);
}

export function useNotes(nodeId: string) {
  const notes = useLiveQuery(
    () => db.notes.where("nodeId").equals(nodeId).reverse().sortBy("updatedAt"),
    [nodeId]
  );
  return useMemo(
    () => (notes ?? []).sort((a, b) => b.updatedAt - a.updatedAt),
    [notes]
  );
}

export function useAllNotes() {
  const notes = useLiveQuery(() => db.notes.toArray(), []);
  return notes ?? [];
}

export async function exportNotes() {
  const notes = await db.notes.toArray();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  return blob;
}

type ImportPayload = {
  version: number;
  exportedAt: string;
  notes: Note[];
};

export async function importNotes(file: File) {
  const text = await file.text();
  const data = JSON.parse(text) as ImportPayload;
  if (!data.notes || !Array.isArray(data.notes)) {
    throw new Error("Invalid file shape");
  }
  const cleaned = data.notes.map((n) => ({
    ...n,
    id: n.id ?? uuid(),
    createdAt: n.createdAt ?? Date.now(),
    updatedAt: n.updatedAt ?? Date.now(),
  }));
  await db.notes.bulkPut(cleaned);
  return cleaned.length;
}
