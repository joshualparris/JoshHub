"use client";

import { useState } from "react";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent, parseIcsEvents } from "@/lib/db/events";

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
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Settings</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Calendar import</h1>
        <p className="text-neutral-600">
          Import an .ics export into your local calendar (stored in your browser).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ICS import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept=".ics,text/calendar"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {message && <p className="text-sm text-neutral-700">{message}</p>}
          <p className="text-xs text-neutral-500">
            Events are added to the local calendar; no external sync or upload.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
