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

// Very lightweight ICS parser for VEVENT blocks; supports DTSTART/DTEND/SUMMARY/LOCATION
export function parseIcsEvents(icsText: string) {
  const lines = icsText.split(/\r?\n/);
  const events: { title: string; startIso: string; endIso: string; location?: string; notes?: string }[] = [];
  let current: Record<string, string> | null = null;
  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
    } else if (line.startsWith("END:VEVENT")) {
      if (current?.summary && current?.dtstart && current?.dtend) {
        events.push({
          title: current.summary,
          startIso: toIso(current.dtstart),
          endIso: toIso(current.dtend),
          location: current.location,
          notes: current.description,
        });
      }
      current = null;
    } else if (current) {
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.split(";")[0].toLowerCase();
      const value = rest.join(":");
      if (key === "summary") current.summary = value;
      if (key === "location") current.location = value;
      if (key === "description") current.description = value;
      if (key === "dtstart") current.dtstart = value;
      if (key === "dtend") current.dtend = value;
    }
  }
  return events;
}

function toIso(value: string) {
  // Handle YYYYMMDD or YYYYMMDDTHHmmssZ
  if (/^\d{8}$/.test(value)) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return `${y}-${m}-${d}T00:00:00Z`;
  }
  if (/^\d{8}T\d{6}Z?$/.test(value)) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    const hh = value.slice(9, 11);
    const mm = value.slice(11, 13);
    const ss = value.slice(13, 15);
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
  }
  return value;
}
