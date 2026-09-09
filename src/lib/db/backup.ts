/**
 * Backup, restore and reset for all locally stored JoshHub data.
 *
 * WHY THIS MODULE EXISTS
 * ----------------------
 * JoshHub is local-first: every note, task, health log and calendar event lives
 * only in this browser's IndexedDB. There is no server copy. That makes the
 * export file the *only* way to move data to another browser or device, and it
 * makes a faulty restore unrecoverable.
 *
 * The previous implementation spread this responsibility across three separate
 * hand-written table lists (one in export, one in import, one in reset) and the
 * three lists disagreed with each other:
 *
 *   - Export silently omitted calendar events, every health log (sleep,
 *     movement, nutrition, metrics), the family rhythm and the whole Learn
 *     module. Those were simply absent from any "backup".
 *   - Restore cleared the Platform tables and then wrote back the empty arrays
 *     it had been handed, so restoring a backup *destroyed* move ops, decision
 *     cards, opportunities and weekly reviews.
 *   - Reset claimed "this cannot be undone" but left health, Learn, events and
 *     family data behind.
 *
 * So the design here is deliberately boring: one registry of tables, and
 * export/restore/reset all derive their behaviour from that one list.
 */

import { db } from "./dexie";

// ---------------------------------------------------------------------------
// 1. What counts as "the user's data"
// ---------------------------------------------------------------------------

/**
 * Every table in the database that holds user data and therefore belongs in a
 * backup. This is the single source of truth for export, restore and reset.
 *
 * `dexie.ts` declares the database schema; this list decides what a "backup"
 * means. If you add a table to the schema, add it here as well —
 * `backup.test.ts` compares this list against the live Dexie schema and fails
 * if the two drift apart, so a forgotten table is caught by the test suite
 * rather than by losing someone's data.
 */
export const BACKUP_TABLES = [
  // Core capture
  "notes",
  "tasks",
  "bookmarks",
  "routines",
  "routineRuns",
  "pins",
  "events",

  // Health logs (entered by hand)
  "sleep",
  "movement",
  "nutrition",
  "metrics",

  // Health data (imported from files / devices)
  "activities",
  "dailyMetrics",
  "healthImports",
  "telemetry",
  "digitalEvents",

  // Family
  "family",

  // Platform planning
  "platformMoveOps",
  "platformDecisionCards",
  "platformOpportunities",
  "platformWeeklyReviews",

  // Learn
  "learnTopics",
  "learnResources",
  "learnNotes",
  "learnSessions",
  "learnSettings",
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

// ---------------------------------------------------------------------------
// 2. The backup file format
// ---------------------------------------------------------------------------

/**
 * Current format version.
 *
 * Version history:
 *   "1" / "2" — table arrays sat at the top level of the file alongside the
 *               metadata, and only a handful of tables were ever written.
 *   "3"       — table arrays live under `data`, keyed by table name, and every
 *               table in BACKUP_TABLES is written.
 *
 * `readBackupFile` still accepts versions 1 and 2 so older exports keep working.
 */
export const BACKUP_FORMAT_VERSION = "3";

/** Rows for a table, keyed by table name. Tables may be absent (see restore). */
export type BackupData = Partial<Record<BackupTableName, unknown[]>>;

export interface BackupFile {
  version: string;
  exportedAt: string;
  data: BackupData;
}

/** How an incoming backup should be applied to the existing database. */
export type RestoreMode = "replace" | "merge";

/** What a restore actually did, so the UI can report it honestly. */
export interface RestoreSummary {
  mode: RestoreMode;
  /** Tables that were present in the file and written. */
  restoredTables: BackupTableName[];
  /** Tables left completely untouched because the file did not contain them. */
  untouchedTables: BackupTableName[];
  /** Total number of rows written across all tables. */
  rowsRestored: number;
}

// ---------------------------------------------------------------------------
// 3. Pure helpers — no database access, so they can be unit tested directly
// ---------------------------------------------------------------------------

const BACKUP_TABLE_SET: ReadonlySet<string> = new Set(BACKUP_TABLES);

export function isBackupTableName(name: string): name is BackupTableName {
  return BACKUP_TABLE_SET.has(name);
}

/**
 * Parse and normalise anything that claims to be a backup file.
 *
 * Returns a file in the current shape regardless of which version was on disk,
 * so the rest of this module only ever deals with one format. Throws if the
 * input is not usable at all — the caller is expected to show that message to
 * the user rather than attempting a partial restore.
 */
export function readBackupFile(raw: unknown): BackupFile {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("This file is not a JoshHub backup.");
  }

  const candidate = raw as Record<string, unknown>;
  const version = typeof candidate.version === "string" ? candidate.version : "unknown";
  const exportedAt = typeof candidate.exportedAt === "string" ? candidate.exportedAt : "";

  // Version 3 keeps table arrays under `data`; versions 1 and 2 put them at the
  // top level next to `version` / `exportedAt`.
  const source =
    typeof candidate.data === "object" && candidate.data !== null
      ? (candidate.data as Record<string, unknown>)
      : candidate;

  const data: BackupData = {};
  for (const [key, value] of Object.entries(source)) {
    // Ignore anything that is not a table we know about (metadata fields, and
    // tables from a future version of the app we cannot meaningfully restore).
    if (!isBackupTableName(key)) continue;
    if (!Array.isArray(value)) continue;
    data[key] = value;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("This backup does not contain any recognisable JoshHub data.");
  }

  return { version, exportedAt, data };
}

/** Table names the file actually carries, in the canonical registry order. */
export function tablesInBackup(file: BackupFile): BackupTableName[] {
  return BACKUP_TABLES.filter((name) => Array.isArray(file.data[name]));
}

/**
 * Tables a restore must NOT touch, because the file says nothing about them.
 *
 * This is the heart of the data-loss fix. A "replace" restore is only allowed
 * to clear tables the backup can actually repopulate. Restoring an old version
 * 1/2 export — which only ever contained six tables — must therefore leave
 * health logs, Learn data and Platform planning exactly as they are instead of
 * deleting them and writing nothing back.
 */
export function tablesPreservedByRestore(file: BackupFile): BackupTableName[] {
  const present = new Set(tablesInBackup(file));
  return BACKUP_TABLES.filter((name) => !present.has(name));
}

/** Total rows across every table in a backup file. */
export function countRowsInBackup(file: BackupFile): number {
  return tablesInBackup(file).reduce((total, name) => total + (file.data[name]?.length ?? 0), 0);
}

/** Filename used when a backup is downloaded. */
export function buildBackupFilename(exportedAt: string): string {
  // Colons are legal in ISO timestamps but awkward in filenames on some systems.
  const stamp = exportedAt.replace(/:/g, "-");
  return `joshhub-backup-${stamp}.json`;
}

// ---------------------------------------------------------------------------
// 4. Database operations
// ---------------------------------------------------------------------------

/**
 * Dexie exposes tables by name at runtime. Every name in BACKUP_TABLES is
 * declared in the schema in `dexie.ts`, which the drift test enforces, so this
 * lookup is always valid.
 */
function tableByName(name: BackupTableName) {
  return db.table(name);
}

/** Read every registered table into a backup file. */
export async function exportUserData(): Promise<BackupFile> {
  const data: BackupData = {};

  await Promise.all(
    BACKUP_TABLES.map(async (name) => {
      data[name] = await tableByName(name).toArray();
    })
  );

  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/**
 * Write a backup file back into the database.
 *
 * "replace" clears each table the file contains before writing it, so the
 * result matches the backup exactly. "merge" writes rows on top of what is
 * already there, overwriting by primary key.
 *
 * In both modes, tables absent from the file are left untouched — see
 * `tablesPreservedByRestore` for why.
 */
export async function restoreUserData(
  file: BackupFile,
  mode: RestoreMode = "replace"
): Promise<RestoreSummary> {
  const restoredTables = tablesInBackup(file);
  const tables = restoredTables.map(tableByName);

  // One transaction so a failure part-way through cannot leave the database
  // holding half of an old backup and half of the current data.
  await db.transaction("rw", tables, async () => {
    for (const name of restoredTables) {
      const rows = file.data[name] ?? [];
      const table = tableByName(name);

      if (mode === "replace") {
        await table.clear();
      }

      // bulkPut rather than bulkAdd: every table uses an inline primary key
      // (`id`, or `date`/`key` for dailyMetrics and learnSettings), and put
      // overwrites instead of throwing when a row already exists. That makes
      // both restore modes safe to run twice.
      if (rows.length > 0) {
        await table.bulkPut(rows);
      }
    }
  });

  return {
    mode,
    restoredTables,
    untouchedTables: tablesPreservedByRestore(file),
    rowsRestored: countRowsInBackup(file),
  };
}

/**
 * Delete all user data. Unlike the previous reset, this really does clear every
 * registered table, which is what the confirmation prompt promises.
 */
export async function clearUserData(): Promise<void> {
  const tables = BACKUP_TABLES.map(tableByName);
  await db.transaction("rw", tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
  });
}

/** Row count per table, used to show the user what is stored right now. */
export async function countUserData(): Promise<Record<BackupTableName, number>> {
  const counts = {} as Record<BackupTableName, number>;

  await Promise.all(
    BACKUP_TABLES.map(async (name) => {
      counts[name] = await tableByName(name).count();
    })
  );

  return counts;
}
