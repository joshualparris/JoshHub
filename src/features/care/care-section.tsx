import type { ReactNode } from "react";

export type CareSectionProps<T> = {
  title: string;
  items: T[];
  empty: string;
  renderItem: (item: T) => ReactNode;
};

export function CareSection<T>({ title, items, empty, renderItem }: CareSectionProps<T>) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-card-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">{items.map(renderItem)}</div>
      )}
    </div>
  );
}
