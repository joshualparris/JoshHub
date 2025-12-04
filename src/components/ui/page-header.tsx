import type { ReactNode } from "react";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  tone?: "default" | "onDark";
}

export function PageHeader({ kicker, title, subtitle, rightSlot, tone = "default" }: PageHeaderProps) {
  const isOnDark = tone === "onDark";
  const kickerClass = isOnDark ? "text-slate-300/80" : "text-foreground/70";
  const titleClass = isOnDark ? "text-slate-50" : "text-foreground";
  const subtitleClass = isOnDark ? "text-slate-200/80" : "text-foreground/70";

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        {kicker ? (
          <p className={`text-xs font-medium uppercase tracking-[0.2em] ${kickerClass}`}>
            {kicker}
          </p>
        ) : null}
        <h1 className={`text-3xl font-semibold tracking-tight ${titleClass}`}>{title}</h1>
        {subtitle ? <p className={`text-sm ${subtitleClass}`}>{subtitle}</p> : null}
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
