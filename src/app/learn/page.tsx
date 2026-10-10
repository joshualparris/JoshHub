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

            <a href="/learn/repair-cafe-simulator" className="mb-6 block rounded-2xl border-2 border-emerald-500/30 bg-emerald-950 p-6 text-white shadow-lg transition hover:border-amber-300">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Featured · New live-event learning game</p>
                <strong className="mt-2 block text-2xl">Run Your Own Repair Café</strong>
                <p className="mt-2 text-sm text-emerald-100">Five stages · interactive venue plan · confirmed volunteer roster · safety gates · seven live incidents · reflection and media.</p>
                <span className="mt-3 block font-semibold text-amber-200 underline">Open the event simulation →</span>
            </a>

            <a href="/learn/dead-laptop-detective" className="mb-6 block rounded-2xl border-2 border-cyan-500/40 bg-slate-950 p-6 text-white shadow-lg transition hover:border-cyan-300">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Featured · New interactive simulation</p>
                <strong className="mt-2 block text-2xl">The Dead Laptop Detective</strong>
                <p className="mt-2 text-sm text-slate-200">8 missions · virtual circuit board · simulated multimeter · 3 evidence-gated cases · videos, pictures and audio.</p>
                <span className="mt-3 block font-semibold text-cyan-200 underline">Enter the repair laboratory →</span>
            </a>

            <a href="https://github.com/joshualparris/JoshHub/blob/main/docs/learning-lab/JOSHHUB-TEN-UNIQUE-COURSES-ROADMAP.html" target="_blank" rel="noreferrer" className="mb-5 block text-sm underline">Explore the ten unique course experiences planned for JoshHub ↗</a>

            <a href="/learn/dubbo-business-field-guide" className="mb-6 block rounded-xl border p-5">
                <strong className="text-lg">Inside Dubbo’s technology and repair businesses</strong>
                <p className="mt-2">15 locations · 67 sources · 6 lessons. Explore workplace evidence, public role maps and opportunities for your projects.</p>
                <span className="mt-2 block underline">Open the learning module →</span>
            </a>

            <a href="/learn/dubbo-ewaste-outreach" className="mb-6 block rounded-xl border p-5">
                <strong className="text-lg">New e-waste sourcing opportunities in Dubbo</strong>
                <p className="mt-2">27 uncontacted prospects · verified contact routes · 3 short lessons. Learn to assess device ownership, risk and useful outreach.</p>
                <span className="mt-2 block underline">Open the follow-on learning module →</span>
            </a>

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
