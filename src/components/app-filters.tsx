"use client";

import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import type { AppCategory, AppStatus } from "@/data/apps";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  category: AppCategory | "all";
  onCategoryChange: (v: AppCategory | "all") => void;
  status: AppStatus | "all";
  onStatusChange: (v: AppStatus | "all") => void;
}

export function AppFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
}: Props) {
  const categories = useMemo<AppCategory[]>(
    () => [
      "Apps",
      "Dubbo / DCS",
      "Games",
      "Finance",
      "Planning",
      "Family & Home",
      "Health & Wellness",
      "Research & Docs",
      "Services",
      "Writing & Content",
    ],
    []
  );
  const statuses = useMemo<AppStatus[]>(() => ["ok", "broken", "wip", "archived"], []);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="md:w-1/2">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, tag, or note..."
          aria-label="Search apps and games"
          className="bg-card text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Select
          label="Category"
          value={category}
          onChange={(value) => onCategoryChange(value as AppCategory | "all")}
          options={[{ label: "All", value: "all" }, ...categories.map((c) => ({ label: c, value: c }))]}
        />
        <Select
          label="Status"
          value={status}
          onChange={(value) => onStatusChange(value as AppStatus | "all")}
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
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">{label}:</span>
      <select
        className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
