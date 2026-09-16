import type { CalendarEvent } from "@/lib/db/schema";

/** Convert a browser datetime-local value into a real UTC instant. */
export function localDateTimeInputToIso(value: string) {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) {
    throw new Error(`Invalid local date/time: ${value}`);
  }
  return instant.toISOString();
}

/** Convert a stored instant to the wall-clock shape expected by datetime-local. */
export function isoToLocalDateTimeInput(value: string) {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "";
  const local = new Date(instant.getTime() - instant.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/**
 * JoshHub historically stored some datetime-local strings without an offset.
 * Interpret those as local wall-clock values, while preserving true ISO instants.
 */
export function normalizeInstant(value: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Date/time cannot be empty");

  const instant = new Date(trimmed);
  if (Number.isNaN(instant.getTime())) {
    throw new Error(`Invalid date/time: ${value}`);
  }
  return instant.toISOString();
}

export function normalizeCalendarEvent(event: CalendarEvent): CalendarEvent {
  try {
    return {
      ...event,
      startIso: normalizeInstant(event.startIso),
      endIso: normalizeInstant(event.endIso),
    };
  } catch {
    // Preserve malformed legacy rows rather than making them disappear from the
    // database. Validation can surface them separately; reads must stay safe.
    return event;
  }
}

export function eventEndsAtMillis(event: Pick<CalendarEvent, "endIso">) {
  return new Date(event.endIso).getTime();
}

export function eventStartsAtMillis(event: Pick<CalendarEvent, "startIso">) {
  return new Date(event.startIso).getTime();
}

export function isUpcomingEvent(event: Pick<CalendarEvent, "endIso">, nowMillis = Date.now()) {
  const endMillis = eventEndsAtMillis(event);
  return Number.isFinite(endMillis) && endMillis >= nowMillis;
}

export function sortEventsByStart<T extends Pick<CalendarEvent, "startIso">>(events: T[]) {
  return [...events].sort((a, b) => eventStartsAtMillis(a) - eventStartsAtMillis(b));
}
