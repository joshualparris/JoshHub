import { afterEach, describe, expect, it } from "vitest";

import {
  isUpcomingEvent,
  isoToLocalDateTimeInput,
  localDateTimeInputToIso,
  normalizeInstant,
  sortEventsByStart,
} from "./time";

const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe("calendar time invariants", () => {
  it("converts datetime-local wall time to a real instant exactly once", () => {
    process.env.TZ = "Australia/Sydney";
    expect(localDateTimeInputToIso("2026-09-09T14:30")).toBe("2026-09-09T04:30:00.000Z");
  });

  it("round-trips an instant through a local datetime input", () => {
    process.env.TZ = "Australia/Sydney";
    const iso = "2026-09-09T04:30:00.000Z";
    expect(localDateTimeInputToIso(isoToLocalDateTimeInput(iso))).toBe(iso);
  });

  it("normalizes legacy local strings and preserves explicit instants", () => {
    process.env.TZ = "Australia/Sydney";
    expect(normalizeInstant("2026-09-09T14:30")).toBe("2026-09-09T04:30:00.000Z");
    expect(normalizeInstant("2026-09-09T04:30:00Z")).toBe("2026-09-09T04:30:00.000Z");
  });

  it("checks upcoming status numerically rather than comparing mixed strings", () => {
    const now = Date.parse("2026-09-09T04:30:00.000Z");
    expect(isUpcomingEvent({ endIso: "2026-09-09T04:31:00.000Z" }, now)).toBe(true);
    expect(isUpcomingEvent({ endIso: "2026-09-09T04:29:00.000Z" }, now)).toBe(false);
  });

  it("sorts without mutating the source array", () => {
    const events = [
      { id: "later", startIso: "2026-09-09T05:00:00.000Z" },
      { id: "earlier", startIso: "2026-09-09T04:00:00.000Z" },
    ];
    const sorted = sortEventsByStart(events);
    expect(sorted.map((event) => event.id)).toEqual(["earlier", "later"]);
    expect(events.map((event) => event.id)).toEqual(["later", "earlier"]);
  });
});
