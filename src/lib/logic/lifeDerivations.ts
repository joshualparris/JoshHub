import { CaptureItem } from "../models/capture";
import { LifeArea } from "../models/life";

export function getAreaCounts(captures: CaptureItem[], area: LifeArea) {
  const itecare2 = captures.filter((c) => c.area === area);
  const openTasks = itecare2.filter((c) => c.kind === "task" && c.status !== "done").length;
  const totalCaptures = itecare2.length;
  const recentCaptures = itecare2
    .slice()
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0))
    .slice(0, 5);
  return { openTasks, totalCaptures, recentCaptures } as const;
}
