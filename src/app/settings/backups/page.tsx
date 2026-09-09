"use client";

/**
 * Backups screen.
 *
 * This component is deliberately thin: it collects a click or a file and hands
 * the work to `@/lib/db/backup`, which owns everything about what a backup is.
 * Keeping the rules in one module is what stops export, restore and reset from
 * drifting apart, which is how the previous version came to lose data.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BACKUP_TABLES,
  buildBackupFilename,
  clearUserData,
  countUserData,
  exportUserData,
  readBackupFile,
  restoreUserData,
  type BackupTableName,
} from "@/lib/db/backup";

type StoredCounts = Record<BackupTableName, number>;

export default function BackupsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");
  const [counts, setCounts] = useState<StoredCounts | null>(null);

  const refreshCounts = useCallback(async () => {
    setCounts(await countUserData());
  }, []);

  useEffect(() => {
    refreshCounts().catch(() => setStatus("Could not read local data."));
  }, [refreshCounts]);

  async function handleExport() {
    const file = await exportUserData();
    downloadJson(file, buildBackupFilename(file.exportedAt));
    setStatus(`Exported ${describeTotal(file.data)} across ${BACKUP_TABLES.length} tables.`);
  }

  async function handleImport(selected: File | null) {
    if (!selected) return;

    try {
      const file = readBackupFile(JSON.parse(await selected.text()));
      const summary = await restoreUserData(file, "replace");
      await refreshCounts();

      // Say plainly which tables were left alone, so restoring an older backup
      // never looks like it silently dropped the data it does not cover.
      const preserved =
        summary.untouchedTables.length > 0
          ? ` ${summary.untouchedTables.length} table(s) not included in this backup were left unchanged.`
          : "";
      setStatus(
        `Restored ${summary.rowsRestored} row(s) into ${summary.restoredTables.length} table(s).${preserved}`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not read that backup file.");
    } finally {
      // Allow the same file to be picked again after a failed attempt.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleReset() {
    if (!confirm("Delete all JoshHub data stored in this browser? This cannot be undone.")) return;
    await clearUserData();
    await refreshCounts();
    setStatus("All local data deleted.");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Settings</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">Backups</h1>
        <p className="text-neutral-600 dark:text-slate-300">
          JoshHub keeps everything in this browser only. Export a backup before changing browsers,
          clearing site data, or moving to a new device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}>Export JSON</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </Button>
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
            />
            <Button variant="outline" onClick={handleReset}>
              Delete all data
            </Button>
          </div>

          {status && <p className="text-sm text-neutral-700 dark:text-slate-200">{status}</p>}

          <p className="text-xs text-neutral-500 dark:text-slate-400">
            A backup includes every table listed below: notes, tasks, bookmarks, routines, calendar
            events, all health logs, family rhythm, Platform planning and Learn.
          </p>
        </CardContent>
      </Card>

      <StoredDataCard counts={counts} />

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

/** Shows what is currently stored, so an export can be sanity-checked at a glance. */
function StoredDataCard({ counts }: { counts: StoredCounts | null }) {
  if (!counts) return null;

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const populated = BACKUP_TABLES.filter((name) => counts[name] > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stored data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-neutral-700 dark:text-slate-200">
          {total} row(s) across {populated.length} of {BACKUP_TABLES.length} tables.
        </p>
        {populated.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-slate-400">Nothing stored yet.</p>
        ) : (
          <ul className="grid gap-1 text-xs text-neutral-600 dark:text-slate-300 sm:grid-cols-2 md:grid-cols-3">
            {populated.map((name) => (
              <li
                key={name}
                className="flex justify-between gap-2 rounded border border-neutral-200 px-2 py-1 dark:border-slate-800"
              >
                <span>{name}</span>
                <span className="font-medium">{counts[name]}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function describeTotal(data: Partial<Record<BackupTableName, unknown[]>>): string {
  const rows = Object.values(data).reduce((sum, list) => sum + (list?.length ?? 0), 0);
  return `${rows} row(s)`;
}

/** Triggers a browser download for a JSON payload. */
function downloadJson(payload: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
