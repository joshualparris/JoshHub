import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "./dexie";
import { isSameImportedActivity, recordActivity, setDailySteps } from "./health";
import type { Activity } from "./schema";

describe("health activity roll-ups", () => {
  beforeEach(async () => {
    await db.activities.clear();
    await db.dailyMetrics.clear();
  });

  it("recognises the same imported source record", () => {
    const stored = {
      id: "activity-1",
      source: "tcx",
      fileName: "morning.tcx",
      sport: "run",
      startTimeIso: "2026-09-09T06:00:00.000Z",
      endTimeIso: "2026-09-09T06:30:00.000Z",
      createdAt: 1,
    } as Activity;

    expect(
      isSameImportedActivity(stored, {
        source: "tcx",
        fileName: "morning.tcx",
        sport: "run",
        startTimeIso: stored.startTimeIso,
        endTimeIso: stored.endTimeIso,
      })
    ).toBe(true);
  });

  it("does not double-count an activity when the same file is imported twice", async () => {
    const input = {
      source: "tcx" as const,
      fileName: "morning.tcx",
      sport: "run" as const,
      startTimeIso: "2026-09-09T06:00:00.000Z",
      endTimeIso: "2026-09-09T06:30:00.000Z",
      distanceM: 5000,
    };

    const first = await recordActivity(input);
    const second = await recordActivity(input);
    const daily = await db.dailyMetrics.get("2026-09-09");

    expect(second.id).toBe(first.id);
    expect(await db.activities.count()).toBe(1);
    expect(daily).toMatchObject({ runsCount: 1, runDistanceM: 5000, distanceM: 5000 });
  });

  it("rebuilds totals from stored activities while preserving independent step data", async () => {
    await setDailySteps("2026-09-09", 12345, 1);
    await recordActivity({
      source: "tcx",
      fileName: "walk.tcx",
      sport: "walk",
      startTimeIso: "2026-09-09T01:00:00.000Z",
      endTimeIso: "2026-09-09T01:20:00.000Z",
      distanceM: 1800,
    });
    await recordActivity({
      source: "tcx",
      fileName: "run.tcx",
      sport: "run",
      startTimeIso: "2026-09-09T06:00:00.000Z",
      endTimeIso: "2026-09-09T06:30:00.000Z",
      distanceM: 5000,
    });

    expect(await db.dailyMetrics.get("2026-09-09")).toMatchObject({
      runsCount: 1,
      runDistanceM: 5000,
      distanceM: 6800,
      steps: 12345,
    });
  });
});
