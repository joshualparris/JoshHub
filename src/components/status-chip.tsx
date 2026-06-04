import { Badge } from "@/components/ui/badge";
import type { AppStatus } from "@/data/apps";

const statusColors: Record<AppStatus, { label: string; className: string }> = {
  ok: { label: "OK", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100" },
  broken: { label: "Broken", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100" },
  wip: { label: "WIP", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100" },
  archived: { label: "Archived", className: "bg-neutral-200 text-neutral-800 dark:bg-slate-800 dark:text-slate-100" },
  active: { label: "Active", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100" },
  maintained: { label: "Maintained", className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-100" },
  paused: { label: "Paused", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-100" },
  complete: { label: "Complete", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100" },
  "archive-candidate": { label: "Archive candidate", className: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100" },
  "duplicate-candidate": { label: "Duplicate candidate", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-100" },
  "needs-review": { label: "Needs review", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-100" },
  unknown: { label: "Unknown", className: "bg-neutral-100 text-neutral-800 dark:bg-slate-800 dark:text-slate-300" },
};

interface Props {
  status: AppStatus;
}

export function StatusChip({ status }: Props) {
  const value = statusColors[status];
  return <Badge className={value.className}>{value.label}</Badge>;
}
