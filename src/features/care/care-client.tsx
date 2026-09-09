"use client";

import { PageHeader } from "@/components/ui/page-header";
import { useBookmarks, useNotes, useTasks } from "@/lib/db/hooks";
import { useEvents } from "@/lib/db/events";
import { CARE_LANES } from "./logic";
import { CareLanePanel } from "./care-lane";

export function CareClient() {
  const events = useEvents();
  const tasks = useTasks();
  const bookmarks = useBookmarks();
  const notes = useNotes();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Care systems"
        title="Family care"
        subtitle="Keep care appointments, providers, goals, and notes organised in one place."
        tone="onDark"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CARE_LANES.map((lane) => (
          <CareLanePanel
            key={lane.key}
            lane={lane}
            events={events ?? []}
            tasks={tasks ?? []}
            bookmarks={bookmarks ?? []}
            notes={notes ?? []}
          />
        ))}
      </div>
    </div>
  );
}
