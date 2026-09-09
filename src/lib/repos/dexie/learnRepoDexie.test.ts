import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/lib/db/dexie";
import type { PromptTemplate } from "@/lib/learn/prompt-templates";
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

    try {
      await getPromptTemplates();
      throw new Error("Expected getPromptTemplates to reject corrupt storage");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(CorruptStorageError);
      const corruptError = error as CorruptStorageError;
      expect(corruptError.storageKey).toBe("promptTemplates");
      expect(corruptError.message).toMatch(/not valid prompt-template JSON/i);
      expect(corruptError.cause).toBeInstanceOf(SyntaxError);
    }
  });

  it("fails loudly with CorruptStorageError when persisted value is not an array", async () => {
    await db.learnSettings.put({
      key: "promptTemplates",
      value: JSON.stringify({ unexpected: "object" }),
      updatedAt: Date.now(),
    });

    await expect(getPromptTemplates()).rejects.toThrowError(CorruptStorageError);
  });

  it("fails loudly with CorruptStorageError when items lack required string fields", async () => {
    await db.learnSettings.put({
      key: "promptTemplates",
      value: JSON.stringify([{ name: 123, template: null }]),
      updatedAt: Date.now(),
    });

    await expect(getPromptTemplates()).rejects.toThrowError(CorruptStorageError);
  });

  it("rejects invalid templates before persistence rather than storing bad data", async () => {
    const invalidTemplates = [{ name: "Broken", template: 123 }] as unknown as PromptTemplate[];

    await expect(savePromptTemplates(invalidTemplates)).rejects.toThrow();
    expect(await db.learnSettings.get("promptTemplates")).toBeUndefined();
  });
});
