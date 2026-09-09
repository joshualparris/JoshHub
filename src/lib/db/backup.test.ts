/**
 * Tests for backup / restore.
 *
 * These protect behaviour that can destroy data that exists nowhere else:
 * JoshHub stores everything in this browser's IndexedDB, so a backup that
 * quietly omits a table, or a restore that wipes one, is unrecoverable.
 *
 * `fake-indexeddb/auto` installs an in-memory IndexedDB, which lets the
 * round-trip test exercise the real Dexie code path rather than a stand-in.
 */

import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import {
  BACKUP_FORMAT_VERSION,
  BACKUP_TABLES,
  buildBackupFilename,
  clearUserData,
  countRowsInBackup,
  countUserData,
  exportUserData,
  readBackupFile,
  restoreUserData,
  tablesInBackup,
  tablesPreservedByRestore,
  type BackupFile,
} from "./backup";
import { db } from "./dexie";

describe("BACKUP_TABLES registry", () => {
  it("covers every table in the database schema", () => {
    // If this fails, a table was added to dexie.ts without being added to
    // BACKUP_TABLES, which would silently exclude it from every backup.
    const schemaTables = db.tables.map((table) => table.name).sort();
    expect([...BACKUP_TABLES].sort()).toEqual(schemaTables);
  });
});

describe("readBackupFile", () => {
  it("reads the current format, where tables live under `data`", () => {
    const file = readBackupFile({
      version: "3",
      exportedAt: "2026-09-09T00:00:00.000Z",
      data: { notes: [{ id: "n1" }], tasks: [] },
    });

    expect(file.version).toBe("3");
    expect(file.data.notes).toEqual([{ id: "n1" }]);
    expect(tablesInBackup(file)).toEqual(["notes", "tasks"]);
  });

  it("reads legacy version 2 files, where tables sat at the top level", () => {
    const file = readBackupFile({
      version: "2",
      exportedAt: "2026-01-01T00:00:00.000Z",
      notes: [{ id: "n1" }],
      tasks: [{ id: "t1" }],
      pins: [],
    });

    expect(tablesInBackup(file)).toEqual(["notes", "tasks", "pins"]);
  });

  it("ignores keys that are not known tables", () => {
    const file = readBackupFile({
      version: "3",
      exportedAt: "",
      data: { notes: [{ id: "n1" }], somethingFromTheFuture: [{ id: "x" }] },
    });

    expect(tablesInBackup(file)).toEqual(["notes"]);
  });

  it("rejects files that contain no recognisable data", () => {
    expect(() => readBackupFile({ version: "3", exportedAt: "", data: {} })).toThrow();
    expect(() => readBackupFile("not a backup")).toThrow();
    expect(() => readBackupFile(null)).toThrow();
  });
});

describe("tablesPreservedByRestore", () => {
  it("protects every table an old backup cannot repopulate", () => {
    // A version 2 export only ever contained these six tables. Restoring one
    // must not clear health logs, Learn data or Platform planning.
    const legacy = readBackupFile({
      version: "2",
      exportedAt: "",
      notes: [],
      tasks: [],
      bookmarks: [],
      routines: [],
      routineRuns: [],
      pins: [],
    });

    const preserved = tablesPreservedByRestore(legacy);

    expect(preserved).toContain("sleep");
    expect(preserved).toContain("movement");
    expect(preserved).toContain("events");
    expect(preserved).toContain("family");
    expect(preserved).toContain("learnTopics");
    expect(preserved).toContain("platformMoveOps");
    expect(preserved).not.toContain("notes");
  });

  it("protects nothing when the backup covers every table", () => {
    const data = Object.fromEntries(BACKUP_TABLES.map((name) => [name, []]));
    const full = readBackupFile({ version: "3", exportedAt: "", data });

    expect(tablesPreservedByRestore(full)).toEqual([]);
  });
});

describe("countRowsInBackup", () => {
  it("totals rows across all tables", () => {
    const file: BackupFile = {
      version: "3",
      exportedAt: "",
      data: { notes: [{ id: "a" }, { id: "b" }], tasks: [{ id: "c" }] },
    };

    expect(countRowsInBackup(file)).toBe(3);
  });
});

describe("buildBackupFilename", () => {
  it("avoids colons so the name is safe on any filesystem", () => {
    expect(buildBackupFilename("2026-09-09T12:30:00.000Z")).toBe(
      "joshhub-backup-2026-09-09T12-30-00.000Z.json"
    );
  });
});

describe("export / restore round trip", () => {
  beforeEach(async () => {
    await clearUserData();
  });

  /** Writes one recognisable row into several different kinds of table. */
  async function seedSampleData() {
    await db.notes.put({
      id: "note-1",
      title: "Bedtime routine",
      body: "Steps that work",
      tags: ["family"],
      createdAt: 1,
      updatedAt: 2,
    });
    await db.sleep.put({
      id: "sleep-1",
      date: "2026-09-01",
      durationMinutes: 430,
      tags: [],
      createdAt: 1,
    });
    await db.platformMoveOps.put({
      id: "move-1",
      title: "Book removalist",
      status: "todo",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await db.learnTopics.put({
      id: "topic-1",
      name: "Fruits of the Spirit",
      tags: ["faith"],
      status: "curious",
      createdAt: 1,
      updatedAt: 1,
    });
    // dailyMetrics is keyed by `date` and learnSettings by `key`, so these two
    // also prove the round trip does not assume every table uses `id`.
    await db.dailyMetrics.put({
      date: "2026-09-01",
      runsCount: 1,
      runDistanceM: 5000,
      distanceM: 5000,
      updatedAt: 1,
    });
    await db.learnSettings.put({ key: "promptTemplates", value: "[]", updatedAt: 1 });
  }

  it("exports every table in the registry", async () => {
    const file = await exportUserData();

    expect(file.version).toBe(BACKUP_FORMAT_VERSION);
    expect(tablesInBackup(file)).toEqual([...BACKUP_TABLES]);
  });

  it("survives export, wipe and restore unchanged", async () => {
    await seedSampleData();
    const before = await countUserData();

    const file = await exportUserData();
    await clearUserData();

    // Everything really is gone before we restore.
    const emptied = await countUserData();
    expect(Object.values(emptied).every((count) => count === 0)).toBe(true);

    await restoreUserData(file, "replace");

    expect(await countUserData()).toEqual(before);
    expect(await db.notes.get("note-1")).toMatchObject({ title: "Bedtime routine" });
    expect(await db.sleep.get("sleep-1")).toMatchObject({ durationMinutes: 430 });
    expect(await db.platformMoveOps.get("move-1")).toMatchObject({ title: "Book removalist" });
    expect(await db.dailyMetrics.get("2026-09-01")).toMatchObject({ runDistanceM: 5000 });
    expect(await db.learnSettings.get("promptTemplates")).toMatchObject({ value: "[]" });
  });

  it("does not delete data that an older backup cannot restore", async () => {
    await seedSampleData();

    // The exact shape that used to destroy Platform, health and Learn data.
    const legacy = readBackupFile({
      version: "2",
      exportedAt: "",
      notes: [{ id: "note-from-backup", title: "Restored", body: "", tags: [], createdAt: 1, updatedAt: 1 }],
      tasks: [],
      bookmarks: [],
      routines: [],
      routineRuns: [],
      pins: [],
    });

    const summary = await restoreUserData(legacy, "replace");

    // The tables the file described were replaced...
    expect(await db.notes.get("note-from-backup")).toBeTruthy();
    expect(await db.notes.get("note-1")).toBeUndefined();

    // ...and everything it said nothing about was left alone.
    expect(await db.sleep.get("sleep-1")).toBeTruthy();
    expect(await db.platformMoveOps.get("move-1")).toBeTruthy();
    expect(await db.learnTopics.get("topic-1")).toBeTruthy();
    expect(summary.untouchedTables).toContain("platformMoveOps");
  });

  it("merges without clearing when asked to", async () => {
    await seedSampleData();

    const file = readBackupFile({
      version: "3",
      exportedAt: "",
      data: {
        notes: [{ id: "note-2", title: "Added", body: "", tags: [], createdAt: 1, updatedAt: 1 }],
      },
    });

    await restoreUserData(file, "merge");

    expect(await db.notes.get("note-1")).toBeTruthy();
    expect(await db.notes.get("note-2")).toBeTruthy();
  });
});
