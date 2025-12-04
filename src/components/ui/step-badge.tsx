import { Badge } from "./badge";
import type { RoutineItem } from "@/lib/db/schema";

const typeLabels: Record<RoutineItem["type"], string> = {
  check: "Check",
  timer: "Timer",
};

export function StepBadge({ type }: { type: RoutineItem["type"] }) {
  return (
    <Badge
      variant="muted"
      className="border border-transparent bg-foreground/10 text-foreground dark:bg-slate-100/10 dark:text-slate-50"
    >
      {typeLabels[type] ?? type}
    </Badge>
  );
}
