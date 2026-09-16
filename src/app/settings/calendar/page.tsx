"use client";

import { useState } from "react";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { parseIcsEvents } from "@/lib/calendar/ics";
import { createEvent } from "@/lib/db/events";

const icsSchema = z.object({
  lines: z.array(z.string()),
});

export default function CalendarSettingsPage() {
  const [message, setMessage] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result?.toString() ?? "";
        const lines = text.split(/\r?\n/);
        const parsed = icsSchema.safeParse({ lines });
        if (!parsed.success) {
          setMessage("Invalid ICS file.");
          return;
        }
        const events = parseIcsEvents(text);
        if (!events.length) {
          setMessage("No events found in ICS.");
          return;
        }
        await Promise.all(
          events.map((ev) =>
            createEvent({
              title: ev.title,
              startIso: ev.startIso,
              endIso: ev.endIso,
              location: ev.location,
              notes: ev.notes,
              tags: ["ics-import"],
            })
          )
        );
        setMessage(`Imported ${events.length} events into local calendar.`);
      } catch {
        setMessage("Failed to read ICS.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Settings"
        title="Calendar import"
        subtitle="Import an .ics export into your local calendar (stored in your browser)."
      />

      <Card>
        <CardHeader>
          <CardTitle>ICS import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept=".ics,text/calendar"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="text-sm text-card-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-card-foreground"
          />
          {message && <p className="text-sm text-card-foreground">{message}</p>}
          <p className="text-xs text-muted-foreground">
            Events are added to the local calendar; no external sync or upload.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
