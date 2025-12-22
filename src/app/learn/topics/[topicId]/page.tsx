"use client";
import React, { useState } from "react";
import { useLearnTopic, useLearnResources, useLearnSessions } from "../../../../lib/db/hooks";
import type { LearnResource, LearnSession } from "../../../../lib/db/schema";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../../lib/db/dexie";
import { uuid } from "../../../../lib/db/id";
import StudyPromptButton from "../../../../components/learn/StudyPromptButton";

export default function TopicPage() {
    const params = useParams() as { topicId?: string } | null;
    const topicId = params?.topicId ?? "";
    const topic = useLearnTopic(topicId);
    const resources = (useLearnResources() ?? []) as LearnResource[];
    const sessions = (useLearnSessions() ?? []) as LearnSession[];
    const router = useRouter();
    const [note, setNote] = useState("");

    if (!topic) return <div className="p-6">Topic not found</div>;

    const linkedResources = resources.filter((r) => (r.topicIds || []).includes(topicId));
    const topicSessions = sessions.filter((s) => s.topicId === topicId);

    async function addNote() {
        if (!note.trim()) return;
        await db.learnNotes.add({ id: uuid(), topicId, content: note.trim(), createdAt: Date.now(), updatedAt: Date.now() });
        setNote("");
        router.refresh();
    }

    async function logSession() {
        const minutes = Number(prompt("Minutes"));
        if (!minutes || minutes <= 0) return;
        const reflection = prompt("What did you learn? (optional)") || undefined;
        const nextStep = prompt("Next step? (optional)") || undefined;
        await db.learnSessions.add({ id: uuid(), topicId, minutes, reflection, nextStep, createdAt: Date.now() });
        router.refresh();
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{topic.name}</h1>
                <div className="flex gap-2">
                    <StudyPromptButton topicName={topic.name} />
                    <button className="btn" onClick={logSession}>Log Session</button>
                </div>
            </div>

            <section className="mb-6">
                <h2 className="font-semibold">Summary</h2>
                <p className="mt-2">{topic.summary || "—"}</p>
            </section>

            <section className="mb-6">
                <h2 className="font-semibold">Resources</h2>
                <ul className="mt-2 space-y-2">
                    {linkedResources.map((r: LearnResource) => (
                        <li key={r.id} className="p-2 border rounded"><a href={r.url} target="_blank" rel="noreferrer" className="font-medium">{r.title}</a> <span className="text-sm text-slate-500">{r.type}</span></li>
                    ))}
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="font-semibold">Notes</h2>
                <div className="mt-2">
                    <textarea className="w-full border rounded p-2" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="mt-2">
                        <button className="btn btn-primary" onClick={addNote}>Add Note</button>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="font-semibold">Session History</h2>
                <ul className="mt-2 space-y-2">
                    {topicSessions.map((s: LearnSession) => (
                        <li key={s.id} className="p-2 border rounded">{s.minutes} minutes — {s.reflection}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
