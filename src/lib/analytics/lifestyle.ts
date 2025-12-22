import type { Activity, DailyMetrics, DigitalEvent } from "@/lib/db/schema";

export type LifestyleMetrics = {
  totalRuns: number;
  longestRunKm: number;
  runDistanceWeekKm: number;
  runsCountWeek: number;
  monthlySteps: Record<string, number>;
  speedDistanceCorrelation?: number | null;
  flowStateWindows: { date: string; events: number }[];
  blindSpots: string[];
};

export function computeLifestyleMetrics(
  activities: Activity[],
  dailyMetrics: DailyMetrics[],
  digitalEvents: DigitalEvent[]
): LifestyleMetrics {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const runs = activities.filter((a) => a.sport === "run");
  const longestRun = runs.reduce((max, a) => Math.max(max, a.distanceM ?? 0), 0);

  const weekMetrics = dailyMetrics.filter((d) => new Date(`${d.date}T00:00:00`).getTime() >= sevenDaysAgo);
  const runDistanceWeek = weekMetrics.reduce((acc, d) => acc + (d.runDistanceM ?? 0), 0);
  const runsCountWeek = weekMetrics.reduce((acc, d) => acc + d.runsCount, 0);

  const monthlySteps: Record<string, number> = {};
  dailyMetrics.forEach((d) => {
    if (d.steps != null) {
      const month = d.date.slice(0, 7);
      monthlySteps[month] = (monthlySteps[month] ?? 0) + d.steps;
    }
  });

  const corr = computeSpeedDistanceCorrelation(activities);
  const flowStateWindows = computeFlowStateWindows(runs, digitalEvents);
  const blindSpots = computeBlindSpots(dailyMetrics, digitalEvents);

  return {
    totalRuns: runs.length,
    longestRunKm: longestRun / 1000,
    runDistanceWeekKm: runDistanceWeek / 1000,
    runsCountWeek,
    monthlySteps,
    speedDistanceCorrelation: corr,
    flowStateWindows,
    blindSpots,
  };
}

export function buildReportMarkdown(metrics: LifestyleMetrics) {
  const lines: string[] = [];
  lines.push("# Lifestyle & Behavioural Report (local)");
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(
    `Runs: ${metrics.totalRuns}, Longest: ${metrics.longestRunKm.toFixed(2)} km, Runs (7d): ${metrics.runsCountWeek} (${metrics.runDistanceWeekKm.toFixed(2)} km)`
  );
  if (metrics.speedDistanceCorrelation != null) {
    lines.push(`Speed vs distance correlation: ${metrics.speedDistanceCorrelation.toFixed(2)}`);
  }
  lines.push("");
  lines.push("## Blind Spots");
  if (metrics.blindSpots.length === 0) {
    lines.push("- Not enough data yet.");
  } else {
    metrics.blindSpots.forEach((b) => lines.push(`- ${b}`));
  }
  lines.push("");
  lines.push("## Flow-State Windows");
  metrics.flowStateWindows.slice(0, 5).forEach((w) => lines.push(`- ${w.date}: ${w.events} digital events post-run`));
  lines.push("");
  lines.push("## Monthly Steps");
  Object.entries(metrics.monthlySteps)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([month, steps]) => lines.push(`- ${month}: ${steps} steps`));
  return lines.join("\n");
}

function computeSpeedDistanceCorrelation(activities: Activity[]) {
  const points = activities
    .filter((a) => typeof a.avgSpeedMps === "number" && typeof a.distanceM === "number")
    .map((a) => [a.avgSpeedMps as number, (a.distanceM as number) / 1000]);
  if (points.length < 4) return null;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mx = mean(xs);
  const my = mean(ys);
  const numerator = xs.reduce((sum, x, i) => sum + (x - mx) * (ys[i] - my), 0);
  const denomX = Math.sqrt(xs.reduce((sum, x) => sum + (x - mx) ** 2, 0));
  const denomY = Math.sqrt(ys.reduce((sum, y) => sum + (y - my) ** 2, 0));
  if (denomX === 0 || denomY === 0) return null;
  return numerator / (denomX * denomY);
}

function computeFlowStateWindows(runs: Activity[], digitalEvents: DigitalEvent[]) {
  const windows: { date: string; events: number }[] = [];
  runs
    .filter((r) => (r.distanceM ?? 0) >= 10000 && r.endTimeIso)
    .forEach((run) => {
      const end = new Date(run.endTimeIso as string).getTime();
      const windowEnd = end + 4 * 60 * 60 * 1000;
      const count = digitalEvents.filter((ev) => {
        if (!ev.timestampIso) return false;
        const t = new Date(ev.timestampIso).getTime();
        return t >= end && t <= windowEnd;
      }).length;
      const date = (run.startTimeIso ?? "").slice(0, 10);
      windows.push({ date, events: count });
    });
  return windows;
}

function computeBlindSpots(dailyMetrics: DailyMetrics[], digitalEvents: DigitalEvent[]) {
  const blindSpots: string[] = [];
  const stepsByDay: Record<string, number> = {};
  dailyMetrics.forEach((d) => {
    stepsByDay[d.date] = d.steps ?? 0;
  });

  // Sedentary trap: days with low steps but many digital events
  Object.entries(stepsByDay).forEach(([date, steps]) => {
    const eventsThatDay = digitalEvents.filter((ev) => ev.timestampIso?.startsWith(date));
    if (steps < 2000 && eventsThatDay.length >= 20) {
      blindSpots.push(`Sedentary trap on ${date}: ${steps} steps with ${eventsThatDay.length} digital events`);
    }
  });

  return blindSpots;
}
