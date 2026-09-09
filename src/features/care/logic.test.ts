import { describe, expect, it } from "vitest";

import type { CalendarEvent, Task } from "@/lib/db/schema";
import { selectNextCareEvent, selectNextCareTask } from "./logic";

function event(id: string, startIso: string, endIso: string, tags = ["care1"]): CalendarEvent {
  return {
    id,
    title: id,
    startIso,
    endIso,
    tags,
    source: "manual",
    createdAt: 1,
    updatedAt: 1,
  };
}

function task(id: string, dueDate: string | null, updatedAt: number): Task {
  return {
    id,
    title: id,
    status: "open",
    priority: "med",
    dueDate,
    tags: ["care1"],
    createdAt: 1,
    updatedAt,
  };
}

describe("care selectors", () => {
  it("selects the next matching event using real instants", () => {
    const now = Date.parse("2026-09-09T04:30:00.000Z");
    const result = selectNextCareEvent(
      [
        event("past", "2026-09-09T03:00:00.000Z", "2026-09-09T04:00:00.000Z"),
        event("later", "2026-09-09T06:00:00.000Z", "2026-09-09T07:00:00.000Z"),
        event("next", "2026-09-09T05:00:00.000Z", "2026-09-09T05:30:00.000Z"),
      ],
      ["care1"],
      now
    );

    expect(result?.id).toBe("next");
  });

  it("prioritises dated care tasks, then the most recently updated undated task", () => {
    expect(
      selectNextCareTask(
        [task("undated-new", null, 9), task("dated", "2026-09-10", 1), task("undated-old", null, 2)],
        ["care1"]
      )?.id
    ).toBe("dated");
  });
});
