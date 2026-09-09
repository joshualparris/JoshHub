import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-neutral-900 text-white border-transparent dark:bg-slate-100 dark:text-slate-900",
    outline: "border border-neutral-300 text-neutral-800 dark:border-slate-600 dark:text-slate-100",
    muted: "bg-neutral-100 text-neutral-700 border-transparent dark:bg-slate-800 dark:text-slate-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
