"use client";
import React, { useState, useEffect } from "react";
import { useLearnTopics } from "../../lib/db/hooks";
import TopicCard from "../../components/learn/TopicCard";
import ImportTopicsModal from "../../components/learn/ImportTopicsModal";
import PromptTemplatesEditor from "../../components/learn/PromptTemplatesEditor";
import type { LearnTopic } from "../../lib/db/schema";
import { seedLearnData } from "../../lib/db/dexie";
import * as learnRepo from "../../lib/repos/dexie/learnRepoDexie";

export default function LearnPage() {
    const topics = (useLearnTopics() ?? []) as LearnTopic[];
    const [showImport, setShowImport] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [q, setQ] = useState("");

    useEffect(() => {
        seedLearnData().catch(() => { });
    }, []);

    const filtered: LearnTopic[] = q
        ? topics.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || (t.tags || []).some((x) => x.includes(q.toLowerCase())))
        : topics;

    async function addTopic() {
        const name = prompt("New topic name")?.trim();
        if (!name) return;
        await learnRepo.createTopic({ name });
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Learn</h1>
                <div className="flex gap-2">
                    <button className="btn" onClick={() => setShowImport(true)}>Import Topics</button>
                    <button className="btn" onClick={() => setShowTemplates(true)}>Edit Templates</button>
                    <button className="btn btn-primary" onClick={addTopic}>Add Topic</button>
                </div>
            </div>

            <div className="mb-4">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics or tags" className="w-full border rounded p-2" />
            </div>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filtered.map((t: LearnTopic) => (
                    <TopicCard key={t.id} topic={t} />
                ))}
            </section>

            {showImport ? (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl">
                        <ImportTopicsModal onClose={() => setShowImport(false)} />
                    </div>
                </div>
            ) : null}

            {showTemplates ? (
                <PromptTemplatesEditor onClose={() => setShowTemplates(false)} />
            ) : null}
        </div>
    );
}
