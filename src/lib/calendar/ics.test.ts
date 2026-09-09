import { describe, expect, it } from "vitest";

import { icsDateToIso, parseIcsEvents, unfoldIcsLines } from "./ics";

describe("ICS parsing", () => {
  it("unfolds continuation lines before parsing", () => {
    expect(
      unfoldIcsLines("SUMMARY:Long event\r\n title\r\nLOCATION:Hall")
    ).toEqual(["SUMMARY:Long eventtitle", "LOCATION:Hall"]);
  });

  it("parses UTC VEVENT fields and keeps colons inside values", () => {
    const events = parseIcsEvents(
      [
        "BEGIN:VCALENDAR",
        "BEGIN:VEVENT",
        "DTSTART:20260909T043000Z",
        "DTEND:20260909T053000Z",
        "SUMMARY:Check-in",
        "LOCATION:Room 2: West Wing",
        "DESCRIPTION:Bring notes: printed copy",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n")
    );

    expect(events).toEqual([
      {
        title: "Check-in",
        startIso: "2026-09-09T04:30:00.000Z",
        endIso: "2026-09-09T05:30:00.000Z",
        location: "Room 2: West Wing",
        notes: "Bring notes: printed copy",
      },
    ]);
  });

  it("honours TZID instead of treating zoned local time as UTC", () => {
    expect(icsDateToIso("20260909T143000", "Australia/Sydney")).toBe(
      "2026-09-09T04:30:00.000Z"
    );
  });

  it("handles a folded summary in a real VEVENT", () => {
    const [event] = parseIcsEvents(
      [
        "BEGIN:VEVENT",
        "DTSTART;TZID=Australia/Sydney:20260909T143000",
        "DTEND;TZID=Australia/Sydney:20260909T153000",
        "SUMMARY:An appointment with a very long",
        " continuation",
        "END:VEVENT",
      ].join("\r\n")
    );

    expect(event.title).toBe("An appointment with a very longcontinuation");
    expect(event.startIso).toBe("2026-09-09T04:30:00.000Z");
  });
});
