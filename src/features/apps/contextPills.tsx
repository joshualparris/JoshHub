"use client";

import { Button } from "@/components/ui/button";

export type AppContext = {
  id: string;
  label: string;
  tags?: string[];
  categories?: string[];
};

interface Props {
  contexts: AppContext[];
  active: string[];
  onToggle: (id: string) => void;
}

export function ContextPills({ contexts, active, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {contexts.map((ctx) => {
        const isActive = active.includes(ctx.id);
        return (
          <Button
            key={ctx.id}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(ctx.id)}
            aria-pressed={isActive}
            className="rounded-full px-3"
          >
            {ctx.label}
          </Button>
        );
      })}
    </div>
  );
}
