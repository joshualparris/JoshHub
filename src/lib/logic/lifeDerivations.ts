import { CaptureItem } from "../models/capture";
import { LifeArea } from "../models/life";

export function getAreaCounts(captures: CaptureItem[], area: LifeArea) {
  const items = captures.filter((c) => c.area === area);
  const openTasks = items.filter((c) => c.kind === "task" && c.status !== "done").length;
  const totalCaptures = items.length;
  const recentCaptures = items
    .slice()
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0))
    .slice(0, 5);
  return { openTasks, totalCaptures, recentCaptures } as const;
}
