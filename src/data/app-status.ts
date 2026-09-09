import { z } from "zod";

export const APP_STATUS_VALUES = [
  "active",
  "maintained",
  "ok",
  "wip",
  "paused",
  "complete",
  "broken",
  "archived",
  "needs-review",
  "archive-candidate",
  "duplicate-candidate",
  "unknown",
] as const;

export const appStatusSchema = z.enum(APP_STATUS_VALUES);
export type AppStatus = z.infer<typeof appStatusSchema>;

export const APP_STATUS_PRIORITY: Record<AppStatus, number> = Object.fromEntries(
  APP_STATUS_VALUES.map((status, index) => [status, index])
) as Record<AppStatus, number>;

export function parseAppStatus(value: unknown): AppStatus | null {
  const parsed = appStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
