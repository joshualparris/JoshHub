"use client";

import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const icsSchema = z.object({
  lines: z.array(z.string()),
});

export default function CalendarSettingsPage() {
  const [message, setMessage] = useState("");

  function handleFile(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result?.toString() ?? "";
        const lines = text.split(/\r?\n/);
        // Minimal validation; real parsing would map VEVENT blocks into our local events table.
        const parsed = icsSchema.safeParse({ lines });
        if (!parsed.success) {
          setMessage("Invalid ICS file.");
          return;
        }
        setMessage("ICS import stub: parsed file, conversion to local events not implemented yet.");
      } catch (e) {
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
          Manually add events at /calendar. ICS import is stubbed here; paste a file to parse and we can wire conversion next.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ICS import (stub)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept=".ics,text/calendar"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {message && <p className="text-sm text-neutral-700">{message}</p>}
          <p className="text-xs text-neutral-500">
            For now, this only validates the file. We can map events into the local calendar on the next pass.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
