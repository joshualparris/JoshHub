import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./dexie";
import type { CalendarEvent } from "./schema";
import { uuid } from "./id";

export async function createEvent(input: {
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  notes?: string;
  tags?: string[];
}) {
  const now = Date.now();
  const ev: CalendarEvent = {
    id: uuid(),
    title: input.title,
    startIso: input.startIso,
    endIso: input.endIso,
    location: input.location,
    notes: input.notes,
    tags: input.tags ?? [],
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };
  await db.events.put(ev);
  return ev;
}

export function useEvents() {
  return useLiveQuery(async () => db.events.orderBy("startIso").toArray(), []);
}
