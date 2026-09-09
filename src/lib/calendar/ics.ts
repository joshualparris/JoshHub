export interface ParsedIcsEvent {
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  notes?: string;
}

interface IcsProperty {
  name: string;
  params: Record<string, string>;
  value: string;
}

interface IcsDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  utc: boolean;
}

/** RFC 5545 folds long properties by continuing on a line beginning with WSP. */
export function unfoldIcsLines(icsText: string) {
  return icsText.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function parseProperty(line: string): IcsProperty | null {
  const separator = line.indexOf(":");
  if (separator < 0) return null;

  const header = line.slice(0, separator);
  const value = line.slice(separator + 1);
  const [rawName, ...rawParams] = header.split(";");
  const params: Record<string, string> = {};

  for (const rawParam of rawParams) {
    const equals = rawParam.indexOf("=");
    if (equals > 0) {
      params[rawParam.slice(0, equals).toUpperCase()] = rawParam.slice(equals + 1);
    }
  }

  return { name: rawName.toUpperCase(), params, value };
}

function parseParts(value: string): IcsDateParts | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] ?? 0),
    minute: Number(match[5] ?? 0),
    second: Number(match[6] ?? 0),
    utc: match[7] === "Z",
  };
}

function zonedLocalToUtcIso(parts: IcsDateParts, timeZone: string) {
  const targetAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  let candidate = targetAsUtc;

  // Iterate because the zone offset can differ across DST boundaries. Intl is
  // available in supported browsers and avoids a second date/time implementation.
  for (let i = 0; i < 3; i += 1) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const values = Object.fromEntries(
      formatter
        .formatToParts(new Date(candidate))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );
    const representedAsUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second
    );
    const correction = targetAsUtc - representedAsUtc;
    if (correction === 0) break;
    candidate += correction;
  }

  return new Date(candidate).toISOString();
}

export function icsDateToIso(value: string, timeZone?: string) {
  const parts = parseParts(value);
  if (!parts) {
    throw new Error(`Unsupported ICS date/time: ${value}`);
  }

  if (parts.utc) {
    return new Date(
      Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    ).toISOString();
  }

  if (timeZone) {
    return zonedLocalToUtcIso(parts, timeZone);
  }

  // A floating ICS time means local wall-clock time. Date-only events are also
  // anchored at local midnight so they display on the intended local date.
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  ).toISOString();
}

export function parseIcsEvents(icsText: string): ParsedIcsEvent[] {
  const events: ParsedIcsEvent[] = [];
  let current: Record<string, IcsProperty> | null = null;

  for (const line of unfoldIcsLines(icsText)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      const summary = current?.SUMMARY;
      const start = current?.DTSTART;
      const end = current?.DTEND;
      if (summary && start && end) {
        events.push({
          title: summary.value,
          startIso: icsDateToIso(start.value, start.params.TZID),
          endIso: icsDateToIso(end.value, end.params.TZID),
          location: current?.LOCATION?.value,
          notes: current?.DESCRIPTION?.value,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const property = parseProperty(line);
    if (property) current[property.name] = property;
  }

  return events;
}
