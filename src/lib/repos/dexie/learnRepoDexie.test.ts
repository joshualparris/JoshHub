import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/dexie";
import { getPromptTemplates, savePromptTemplates, CorruptStorageError } from "./learnRepoDexie";

describe("learnRepoDexie - getPromptTemplates & savePromptTemplates", () => {
  beforeEach(async () => {
    await db.learnSettings.clear();
  });

  it("returns an empty array when promptTemplates has not been configured", async () => {
    const templates = await getPromptTemplates();
    expect(templates).toEqual([]);
  });

  it("round trips valid prompt templates via save and get", async () => {
    const sample = [
      { name: "Summarise", template: "Summarise the following: {{input}}" },
      { name: "Explain", template: "Explain simply: {{input}}" },
    ];

    await savePromptTemplates(sample);
    const loaded = await getPromptTemplates();
    expect(loaded).toEqual(sample);
  });

  it("fails loudly with CorruptStorageError when persisted JSON is malformed", async () => {
    await db.learnSettings.put({
      key: "promptTemplates",
      value: "{ this is invalid json ]",
      updatedAt: Date.now(),
    });

    await expect(getPromptTemplates()).rejects.toThrowError(CorruptStorageError);

    try {
      await getPromptTemplates();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(CorruptStorageError);
      const corruptErr = err as CorruptStorageError;
      expect(corruptErr.storageKey).toBe("promptTemplates");
      expect(corruptErr.message).toMatch(/malformed/i);
    }
  });

  it("fails loudly with CorruptStorageError when persisted value is not an array", async () => {
    await db.learnSettings.put({
      key: "promptTemplates",
      value: JSON.stringify({ unexpected: "object" }),
      updatedAt: Date.now(),
    });

    await expect(getPromptTemplates()).rejects.toThrowError(CorruptStorageError);

    try {
      await getPromptTemplates();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(CorruptStorageError);
      const corruptErr = err as CorruptStorageError;
      expect(corruptErr.storageKey).toBe("promptTemplates");
      expect(corruptErr.message).toMatch(/not an array/i);
    }
  });

  it("fails loudly with CorruptStorageError when items lack required string fields", async () => {
    await db.learnSettings.put({
      key: "promptTemplates",
      value: JSON.stringify([{ name: 123, template: null }]),
      updatedAt: Date.now(),
    });

    await expect(getPromptTemplates()).rejects.toThrowError(CorruptStorageError);

    try {
      await getPromptTemplates();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(CorruptStorageError);
      const corruptErr = err as CorruptStorageError;
      expect(corruptErr.storageKey).toBe("promptTemplates");
      expect(corruptErr.message).toMatch(/template/i);
    }
  });
});
