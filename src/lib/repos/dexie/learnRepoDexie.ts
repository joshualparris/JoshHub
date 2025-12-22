import { db } from "@/lib/db/dexie";
import { uuid } from "@/lib/db/id";
import type { LearnTopic, LearnResource, LearnNote, LearnSession } from "@/lib/db/schema";

// Simple adapter for Learn tables using Dexie. Keeps calling code small and
// consistent with other repo adapters in the codebase.

export function listTopics(): Promise<LearnTopic[]> {
    return db.learnTopics.orderBy("updatedAt").reverse().toArray();
}

export function getTopic(id: string): Promise<LearnTopic | undefined> {
    return db.learnTopics.get(id);
}

export async function createTopic(partial: Partial<LearnTopic> & Pick<LearnTopic, "name">) {
    const now = Date.now();
    const t: LearnTopic = {
        id: uuid(),
        name: partial.name,
        category: partial.category ?? null,
        tags: partial.tags ?? [],
        status: (partial.status as any) ?? "curious",
        summary: partial.summary ?? "",
        createdAt: now,
        updatedAt: now,
    };
    await db.learnTopics.add(t);
    return t;
}

export async function updateTopic(id: string, patch: Partial<LearnTopic>) {
    patch.updatedAt = Date.now();
    await db.learnTopics.update(id, patch as any);
    return db.learnTopics.get(id);
}

export async function deleteTopic(id: string) {
    await db.learnTopics.delete(id);
}

// Resources
export function listResources(): Promise<LearnResource[]> {
    return db.learnResources.orderBy("updatedAt").reverse().toArray();
}

export async function createResource(partial: Partial<LearnResource> & Pick<LearnResource, "title" | "type">) {
    const now = Date.now();
    const r: LearnResource = {
        id: uuid(),
        title: partial.title,
        type: partial.type,
        url: partial.url,
        author: partial.author,
        status: (partial.status as any) ?? "queue",
        topicIds: partial.topicIds ?? [],
        notes: partial.notes ?? "",
        createdAt: now,
        updatedAt: now,
    };
    await db.learnResources.add(r);
    return r;
}

export async function updateResource(id: string, patch: Partial<LearnResource>) {
    patch.updatedAt = Date.now();
    await db.learnResources.update(id, patch as any);
    return db.learnResources.get(id);
}

export async function deleteResource(id: string) {
    await db.learnResources.delete(id);
}

// Notes & Sessions
export function listNotesForTopic(topicId: string) {
    return db.learnNotes.where("topicId").equals(topicId).reverse().toArray();
}

export function listNotesForResource(resourceId: string) {
    return db.learnNotes.where("resourceId").equals(resourceId).reverse().toArray();
}

export async function addNote(note: Partial<LearnNote> & Pick<LearnNote, "content">) {
    const now = Date.now();
    const n: LearnNote = {
        id: uuid(),
        topicId: note.topicId ?? null,
        resourceId: note.resourceId ?? null,
        content: note.content,
        createdAt: now,
        updatedAt: now,
    };
    await db.learnNotes.add(n);
    return n;
}

export async function addSession(payload: Partial<LearnSession> & Pick<LearnSession, "minutes">) {
    const now = Date.now();
    const s: LearnSession = {
        id: uuid(),
        topicId: payload.topicId ?? null,
        resourceId: payload.resourceId ?? null,
        minutes: payload.minutes,
        reflection: payload.reflection,
        nextStep: payload.nextStep,
        createdAt: now,
    };
    await db.learnSessions.add(s);
    return s;
}

export function listSessionsForTopic(topicId: string) {
    return db.learnSessions.where("topicId").equals(topicId).reverse().toArray();
}

export function listSessions(): Promise<LearnSession[]> {
    return db.learnSessions.orderBy("createdAt").reverse().toArray();
}

// Prompt templates stored as JSON in learnSettings.key === 'promptTemplates'
export async function getPromptTemplates() {
    const row = await db.learnSettings.get("promptTemplates");
    if (!row) return [] as { name: string; template: string }[];
    try {
        return JSON.parse(row.value) as { name: string; template: string }[];
    } catch (e) {
        return [];
    }
}

export async function savePromptTemplates(arr: { name: string; template: string }[]) {
    const now = Date.now();
    await db.learnSettings.put({ key: "promptTemplates", value: JSON.stringify(arr), updatedAt: now });
    return arr;
}

export default {
    listTopics,
    getTopic,
    createTopic,
    updateTopic,
    deleteTopic,
    listResources,
    createResource,
    updateResource,
    deleteResource,
    addNote,
    listNotesForTopic,
    addSession,
    listSessionsForTopic,
    getPromptTemplates,
    savePromptTemplates,
};
