import { Badge } from "@/components/ui/badge";
import type { AppStatus } from "@/data/apps";

const statusColors: Record<AppStatus, { label: string; className: string }> = {
  ok: { label: "OK", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100" },
  broken: { label: "Broken", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100" },
  wip: { label: "WIP", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100" },
  archived: { label: "Archived", className: "bg-neutral-200 text-neutral-800 dark:bg-slate-800 dark:text-slate-100" },
};

interface Props {
  status: AppStatus;
}

export function StatusChip({ status }: Props) {
  const value = statusColors[status];
  return <Badge className={value.className}>{value.label}</Badge>;
}
