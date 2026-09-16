import { useLiveQuery } from "dexie-react-hooks";

import { normalizeCalendarEvent, normalizeInstant, sortEventsByStart } from "@/lib/calendar/time";

import { db } from "./dexie";
import { uuid } from "./id";
import type { CalendarEvent } from "./schema";

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
    // Persistence owns the invariant: event times are stored as real ISO instants,
    // never raw datetime-local wall-clock strings.
    startIso: normalizeInstant(input.startIso),
    endIso: normalizeInstant(input.endIso),
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

export async function updateEvent(id: string, updates: Partial<CalendarEvent>) {
  const normalized: Partial<CalendarEvent> = {
    ...updates,
    updatedAt: Date.now(),
  };
  if (updates.startIso !== undefined) {
    normalized.startIso = normalizeInstant(updates.startIso);
  }
  if (updates.endIso !== undefined) {
    normalized.endIso = normalizeInstant(updates.endIso);
  }
  await db.events.update(id, normalized);
  return db.events.get(id);
}

export async function deleteEvent(id: string) {
  await db.events.delete(id);
}

export function useEvents() {
  return useLiveQuery(async () => {
    const events = await db.events.toArray();
    // Normalize old rows on read so legacy datetime-local strings remain usable
    // while all newly written rows follow the stricter persistence invariant.
    return sortEventsByStart(events.map(normalizeCalendarEvent));
  }, []);
}
