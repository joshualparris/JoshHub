import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { labelText } from "@/components/ui/text";
import type { AppCategory, AppStatus } from "@/data/apps";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  category: AppCategory | "all";
  setCategory: (v: AppCategory | "all") => void;
  status: AppStatus | "all";
  setStatus: (v: AppStatus | "all") => void;
}

export function AppFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
}: Props) {
  const categories = useMemo<AppCategory[]>(
    () => ["Dubbo / DCS", "Games"],
    []
  );
  const statuses = useMemo<AppStatus[]>(() => ["ok", "broken", "wip", "archived"], []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="md:w-1/2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, tag, or note..."
          aria-label="Search apps"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          label="Category"
          value={category}
          onChange={(value) => setCategory(value as AppCategory | "all")}
          options={[{ label: "All", value: "all" }, ...categories.map((c) => ({ label: c, value: c }))]}
        />
        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as AppStatus | "all")}
          options={[{ label: "All", value: "all" }, ...statuses.map((s) => ({ label: s.toUpperCase(), value: s }))]}
        />
      </div>
    </div>
  );
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-slate-200">
      <span className={`${labelText} whitespace-nowrap`}>{label}:</span>
      <select
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
