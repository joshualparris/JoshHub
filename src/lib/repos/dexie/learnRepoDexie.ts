import { z } from "zod";

import { db } from "@/lib/db/dexie";
import { uuid } from "@/lib/db/id";
import type { LearnNote, LearnResource, LearnSession, LearnTopic } from "@/lib/db/schema";

const promptTemplateSchema = z.object({
  name: z.string(),
  template: z.string(),
});
const promptTemplatesSchema = z.array(promptTemplateSchema);

export type PromptTemplate = z.infer<typeof promptTemplateSchema>;

export function parsePromptTemplates(value: unknown): PromptTemplate[] {
  return promptTemplatesSchema.parse(value);
}

export function listTopics(): Promise<LearnTopic[]> {
  return db.learnTopics.orderBy("updatedAt").reverse().toArray();
}

export function getTopic(id: string): Promise<LearnTopic | undefined> {
  return db.learnTopics.get(id);
}

export async function createTopic(partial: Partial<LearnTopic> & Pick<LearnTopic, "name">) {
  const now = Date.now();
  const topic: LearnTopic = {
    id: uuid(),
    name: partial.name,
    category: partial.category ?? null,
    tags: partial.tags ?? [],
    status: partial.status ?? "curious",
    summary: partial.summary ?? "",
    createdAt: now,
    updatedAt: now,
  };
  await db.learnTopics.add(topic);
  return topic;
}

export async function updateTopic(id: string, patch: Partial<LearnTopic>) {
  const updates = { ...patch, updatedAt: Date.now() };
  await db.learnTopics.update(id, updates);
  return db.learnTopics.get(id);
}

export async function deleteTopic(id: string) {
  await db.learnTopics.delete(id);
}

export async function searchTopics(query: string): Promise<LearnTopic[]> {
  const normalizedQuery = query.toLowerCase();
  return db.learnTopics
    .filter(
      (topic) =>
        topic.name.toLowerCase().includes(normalizedQuery) ||
        (topic.summary?.toLowerCase().includes(normalizedQuery) ?? false)
    )
    .toArray();
}

export function listResources(): Promise<LearnResource[]> {
  return db.learnResources.orderBy("updatedAt").reverse().toArray();
}

export async function createResource(
  partial: Partial<LearnResource> & Pick<LearnResource, "title" | "type">
) {
  const now = Date.now();
  const resource: LearnResource = {
    id: uuid(),
    title: partial.title,
    type: partial.type,
    url: partial.url,
    author: partial.author,
    status: partial.status ?? "queue",
    topicIds: partial.topicIds ?? [],
    notes: partial.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  await db.learnResources.add(resource);
  return resource;
}

export async function updateResource(id: string, patch: Partial<LearnResource>) {
  const updates = { ...patch, updatedAt: Date.now() };
  await db.learnResources.update(id, updates);
  return db.learnResources.get(id);
}

export async function deleteResource(id: string) {
  await db.learnResources.delete(id);
}

export function listNotesForTopic(topicId: string) {
  return db.learnNotes.where("topicId").equals(topicId).reverse().toArray();
}

export function listNotesForResource(resourceId: string) {
  return db.learnNotes.where("resourceId").equals(resourceId).reverse().toArray();
}

export async function addNote(noteInput: Partial<LearnNote> & Pick<LearnNote, "content">) {
  const now = Date.now();
  const note: LearnNote = {
    id: uuid(),
    topicId: noteInput.topicId ?? null,
    resourceId: noteInput.resourceId ?? null,
    content: noteInput.content,
    createdAt: now,
    updatedAt: now,
  };
  await db.learnNotes.add(note);
  return note;
}

export async function addSession(
  sessionInput: Partial<LearnSession> & Pick<LearnSession, "minutes">
) {
  const session: LearnSession = {
    id: uuid(),
    topicId: sessionInput.topicId ?? null,
    resourceId: sessionInput.resourceId ?? null,
    minutes: sessionInput.minutes,
    reflection: sessionInput.reflection,
    nextStep: sessionInput.nextStep,
    createdAt: Date.now(),
  };
  await db.learnSessions.add(session);
  return session;
}

export function listSessionsForTopic(topicId: string) {
  return db.learnSessions.where("topicId").equals(topicId).reverse().toArray();
}

export function listSessions(): Promise<LearnSession[]> {
  return db.learnSessions.orderBy("createdAt").reverse().toArray();
}

/** Stored JSON is an externalised persistence boundary, so corrupt settings must be explicit. */
export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  const row = await db.learnSettings.get("promptTemplates");
  if (!row) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.value);
  } catch (error) {
    throw new Error("Stored prompt templates are not valid JSON.", { cause: error });
  }

  try {
    return parsePromptTemplates(parsed);
  } catch (error) {
    throw new Error("Stored prompt templates do not match the expected schema.", { cause: error });
  }
}

export async function savePromptTemplates(input: PromptTemplate[]) {
  const templates = parsePromptTemplates(input);
  await db.learnSettings.put({
    key: "promptTemplates",
    value: JSON.stringify(templates),
    updatedAt: Date.now(),
  });
  return templates;
}
