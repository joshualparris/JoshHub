import { describe, expect, it } from "vitest";

import type { CalendarEvent, DailyMetrics, SleepLog, Task } from "@/lib/db/schema";

import {
  averageRecentSleepMinutes,
  buildDashboardTimeline,
  selectTasksDueOn,
  selectUpcomingEvents,
  summarizeActivityWeek,
} from "./logic";

describe("dashboard logic", () => {
  it("selects only open tasks due on the requested local day", () => {
    const tasks = [
      { id: "a", title: "A", status: "open", priority: "med", dueDate: "2026-09-09", tags: [], createdAt: 1, updatedAt: 1 },
      { id: "b", title: "B", status: "done", priority: "med", dueDate: "2026-09-09", tags: [], createdAt: 1, updatedAt: 1 },
      { id: "c", title: "C", status: "open", priority: "med", dueDate: "2026-09-10", tags: [], createdAt: 1, updatedAt: 1 },
    ] satisfies Task[];
    expect(selectTasksDueOn(tasks, "2026-09-09").map((task) => task.id)).toEqual(["a"]);
  });

  it("orders upcoming events without mutating the live-query array", () => {
    const events = [
      event("later", "2026-09-09T12:00:00.000Z", "2026-09-09T13:00:00.000Z"),
      event("past", "2026-09-09T08:00:00.000Z", "2026-09-09T08:30:00.000Z"),
      event("next", "2026-09-09T11:00:00.000Z", "2026-09-09T11:30:00.000Z"),
    ];
    const originalOrder = events.map((entry) => entry.id);
    expect(selectUpcomingEvents(events, "2026-09-09T09:00:00.000Z").map((entry) => entry.id)).toEqual([
      "next",
      "later",
    ]);
    expect(events.map((entry) => entry.id)).toEqual(originalOrder);
  });

  it("builds one chronological task/event timeline", () => {
    const tasks = [
      { id: "task", title: "Task", status: "open", priority: "high", dueDate: "2026-09-09", tags: [], createdAt: 1, updatedAt: 1 },
    ] satisfies Task[];
    const events = [event("event", "2026-09-09T09:00:00.000Z", "2026-09-09T10:00:00.000Z")];
    expect(buildDashboardTimeline(tasks, events).map((entry) => entry.id)).toEqual(["event-event", "task-task"]);
  });

  it("averages explicit and derived sleep durations", () => {
    const sleep = [
      { id: "a", date: "2026-09-09", durationMinutes: 480, tags: [], createdAt: 1 },
      {
        id: "b",
        date: "2026-09-08",
        bedtimeIso: "2026-09-08T12:00:00.000Z",
        wakeIso: "2026-09-08T20:00:00.000Z",
        tags: [],
        createdAt: 1,
      },
    ] satisfies SleepLog[];
    expect(averageRecentSleepMinutes(sleep)).toBe(480);
  });

  it("summarises only activity in the last seven days", () => {
    const metrics = [
      { date: "2026-09-09", runsCount: 1, runDistanceM: 5000, distanceM: 6000, steps: 1000, updatedAt: 1 },
      { date: "2026-08-20", runsCount: 9, runDistanceM: 999, distanceM: 999, steps: 999, updatedAt: 1 },
    ] satisfies DailyMetrics[];
    expect(summarizeActivityWeek(metrics, new Date("2026-09-09T12:00:00+10:00").getTime())).toEqual({
      runsCount: 1,
      runDistanceM: 5000,
      distanceM: 6000,
      steps: 1000,
    });
  });
});

function event(id: string, startIso: string, endIso: string): CalendarEvent {
  return {
    id,
    title: id,
    startIso,
    endIso,
    tags: [],
    source: "manual",
    createdAt: 1,
    updatedAt: 1,
  };
}
