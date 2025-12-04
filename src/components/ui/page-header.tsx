import type { ReactNode } from "react";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function PageHeader({ kicker, title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        {kicker ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-foreground/70">
            {kicker}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="text-sm text-foreground/70">{subtitle}</p> : null}
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
