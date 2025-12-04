import Link from "next/link";
import { BookmarkPlus, BookmarkX } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LifeArea } from "@/data/life";

interface Props {
  area: LifeArea;
  pinned?: boolean;
  onTogglePin?: (slug: string) => void;
  showPin?: boolean;
}

export function LifeCard({ area, pinned, onTogglePin, showPin = false }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>
            <Link
              href={`/life/${area.slug}`}
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
            >
              {area.title}
            </Link>
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">{area.intro}</p>
        </div>
        {showPin && onTogglePin && (
          <button
            type="button"
            onClick={() => onTogglePin(area.slug)}
            aria-label={pinned ? "Unpin" : "Pin"}
            className="rounded-full p-2 text-slate-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {pinned ? <BookmarkX className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
          </button>
        )}
      </CardHeader>
      <CardContent className="text-sm text-slate-700 dark:text-slate-300">
        {area.sections.slice(0, 1).map((section) => (
          <p key={section.heading}>{section.body}</p>
        ))}
      </CardContent>
    </Card>
  );
}
