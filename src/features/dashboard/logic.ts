import type { LifeArea } from "@/data/life";
import { isSameLocalDayISO } from "@/lib/date";
import type {
  CalendarEvent,
  DailyMetrics,
  MetricLog,
  MovementLog,
  Note,
  NutritionLog,
  SleepLog,
  Task,
} from "@/lib/db/schema";

export interface DashboardTimelineItem {
  id: string;
  type: "task" | "event";
  title: string;
  time: number;
  subtitle?: string;
}

export interface ActivityWeekSummary {
  runsCount: number;
  runDistanceM: number;
  distanceM: number;
  steps: number;
}

export function selectRecentNotes(notes: Note[], limit = 3): Note[] {
  return [...notes].sort((first, second) => second.updatedAt - first.updatedAt).slice(0, limit);
}

export function selectOpenTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.status === "open");
}

export function selectTasksDueOn(tasks: Task[], localDateIso: string): Task[] {
  return tasks.filter(
    (task) =>
      task.status === "open" &&
      Boolean(task.dueDate) &&
      isSameLocalDayISO(task.dueDate as string, localDateIso)
  );
}

export function selectUpcomingEvents(
  events: CalendarEvent[],
  nowIso: string,
  limit = 3
): CalendarEvent[] {
  return [...events]
    .filter((event) => event.endIso >= nowIso)
    .sort((first, second) => first.startIso.localeCompare(second.startIso))
    .slice(0, limit);
}

export function buildDashboardTimeline(
  tasks: Task[],
  events: CalendarEvent[],
  limit = 5
): DashboardTimelineItem[] {
  const taskItems: DashboardTimelineItem[] = tasks.map((task) => ({
    id: `task-${task.id}`,
    type: "task",
    title: task.title,
    time: task.dueDate ? new Date(`${task.dueDate}T12:00:00`).getTime() : Number.MAX_SAFE_INTEGER,
    subtitle: task.priority,
  }));
  const eventItems: DashboardTimelineItem[] = events.map((event) => ({
    id: `event-${event.id}`,
    type: "event",
    title: event.title,
    time: new Date(event.startIso).getTime(),
    subtitle: event.location,
  }));

  return [...taskItems, ...eventItems]
    .sort((first, second) => first.time - second.time)
    .slice(0, limit);
}

export function durationMinutes(startIso?: string | null, endIso?: string | null): number | null {
  if (!startIso || !endIso) return null;
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
  const duration = (endMs - startMs) / 60_000;
  return duration > 0 ? duration : null;
}

export function averageRecentSleepMinutes(sleepLogs: SleepLog[], limit = 7): number | null {
  const durations = [...sleepLogs]
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, limit)
    .map((log) => log.durationMinutes ?? durationMinutes(log.bedtimeIso, log.wakeIso))
    .filter((minutes): minutes is number => typeof minutes === "number");

  if (durations.length === 0) return null;
  return Math.round(durations.reduce((total, minutes) => total + minutes, 0) / durations.length);
}

export function summarizeActivityWeek(
  dailyMetrics: DailyMetrics[],
  nowMs: number
): ActivityWeekSummary {
  const sevenDaysAgo = nowMs - 7 * 24 * 60 * 60 * 1000;
  return dailyMetrics
    .filter((daily) => new Date(`${daily.date}T00:00:00`).getTime() >= sevenDaysAgo)
    .reduce<ActivityWeekSummary>(
      (summary, daily) => ({
        runsCount: summary.runsCount + daily.runsCount,
        runDistanceM: summary.runDistanceM + (daily.runDistanceM ?? 0),
        distanceM: summary.distanceM + (daily.distanceM ?? 0),
        steps: summary.steps + (daily.steps ?? 0),
      }),
      { runsCount: 0, runDistanceM: 0, distanceM: 0, steps: 0 }
    );
}

export function selectLatestMovement(logs: MovementLog[]): MovementLog | undefined {
  return [...logs].sort((first, second) => second.date.localeCompare(first.date))[0];
}

export function selectLatestNutrition(logs: NutritionLog[]): NutritionLog | undefined {
  return [...logs].sort((first, second) => second.date.localeCompare(first.date))[0];
}

export function selectLatestMetric(logs: MetricLog[]): MetricLog | undefined {
  return [...logs].sort((first, second) => second.dateTimeIso.localeCompare(first.dateTimeIso))[0];
}

export function selectPinnedAreas(pinnedSlugs: string[], lifeAreas: LifeArea[]): LifeArea[] {
  const bySlug = new Map(lifeAreas.map((area) => [area.slug, area]));
  return pinnedSlugs.flatMap((slug) => {
    const area = bySlug.get(slug);
    return area ? [area] : [];
  });
}
