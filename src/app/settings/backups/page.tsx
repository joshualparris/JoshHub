"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useRef, useState, useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportAll, importAll, resetAll } from "@/lib/db/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/lib/db/dexie";

const backupSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  notes: z.array(z.any()).optional(),
  tasks: z.array(z.any()).optional(),
  bookmarks: z.array(z.any()).optional(),
  routines: z.array(z.any()).optional(),
  routineRuns: z.array(z.any()).optional(),
  pins: z.array(z.any()).optional(),
});

export default function BackupsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [counts, setCounts] = useState<string>("");

  async function refreshCounts() {
    const [notes, tasks, bookmarks, routines, runs, pins, events, sleep] = await Promise.all([
      db.notes.count(),
      db.tasks.count(),
      db.bookmarks.count(),
      db.routines.count(),
      db.routineRuns.count(),
      db.pins.count(),
      db.events.count(),
      db.sleep.count(),
    ]);
    setCounts(
      `notes:${notes}, tasks:${tasks}, bookmarks:${bookmarks}, routines:${routines}, runs:${runs}, pins:${pins}, events:${events}, sleep:${sleep}`
    );
  }

  useEffect(() => {
    refreshCounts();
  }, []);

  async function handleExport() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `joshhub-backup-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Exported backup.");
  }

  async function handleImport(file?: File | null) {
    const f = file ?? fileRef.current?.files?.[0];
    if (!f) return;
    const text = await f.text();
    const json = JSON.parse(text);
    const parsed = backupSchema.safeParse(json);
    if (!parsed.success) {
      setMessage("Invalid backup file.");
      return;
    }
    const data = parsed.data;
    await importAll(
      {
        version: data.version,
        exportedAt: data.exportedAt,
        notes: data.notes ?? [],
        tasks: data.tasks ?? [],
        bookmarks: data.bookmarks ?? [],
        routines: data.routines ?? [],
        routineRuns: data.routineRuns ?? [],
        pins: data.pins ?? [],
      },
      "replace"
    );
    setMessage("Imported backup.");
  }

  async function handleReset() {
    if (confirm("Reset all local data? This cannot be undone.")) {
      await resetAll();
      setMessage("Reset complete.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Settings</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Backups</h1>
        <p className="text-neutral-600">Export or import local data stored in IndexedDB.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>Export JSON</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Import JSON
            </Button>
            <input
              type="file"
              accept="application/json"
              ref={fileRef}
              className="hidden"
              onChange={(e) => handleImport(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" onClick={handleReset}>
              Reset data
            </Button>
          </div>
          {message && <p className="text-sm text-neutral-700">{message}</p>}
          <p className="text-xs text-neutral-500">
            Stores notes, tasks, bookmarks, routines, runs, and pins locally in your browser.
          </p>
          {counts && <p className="text-xs text-neutral-600">Data counts: {counts}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
