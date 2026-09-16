import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db } from "@/lib/db/dexie";
import { uuid } from "@/lib/db/id";
import type { Note } from "@/lib/db/schema";

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

  // Dexie live-query arrays are shared values; copy before sorting so one view
  // cannot reorder the cached result another subscriber is rendering.
  return useMemo(() => [...(notes ?? [])].sort((a, b) => b.updatedAt - a.updatedAt), [notes]);
}

export function useAllNotes() {
  return useLiveQuery(() => db.notes.toArray(), []) ?? [];
}
