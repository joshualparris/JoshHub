"use client";
import React, { useState } from "react";
import { uuid } from "../../lib/db/id";
import { db } from "../../lib/db/dexie";
import type { LearnTopic } from "../../lib/db/schema";

export default function ImportTopicsModal({ onClose }: { onClose?: () => void }) {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);

    // simple normalizer (not used currently but kept for future de-dupe improvements)
    // function normalize(s: string) {
    //     return s.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();
    // }

    async function handleImport() {
        try {
            const lines: string[] = text.split(/\r?\n/).map((l: string) => l.replace(/\u00a0/g, " "));
            let currentCategory = "Unsorted";
            const toAdd: LearnTopic[] = [];
            for (let i = 0; i < lines.length; i++) {
                const raw = lines[i];
                const line = raw.trim();
                if (!line) continue;
                const isTopic = /^[-*\u2022\t]/.test(raw) || raw.startsWith(" ");
                if (!isTopic) {
                    currentCategory = line;
                    continue;
                }
                const topicName = line.replace(/^[-*\u2022\s]+/, "").trim();
                const exists = await db.learnTopics.where("name").equals(topicName).first();
                // simple de-dupe by exact name (case-sensitive) fallback
                if (exists) continue;
                const t: LearnTopic = {
                    id: uuid(),
                    name: topicName,
                    category: currentCategory,
                    tags: [],
                    status: "curious",
                    summary: "",
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                toAdd.push(t);
            }
            if (toAdd.length > 0) {
                await db.learnTopics.bulkAdd(toAdd);
            }
            onClose?.();
        } catch (e: unknown) {
            const msg = (e as Error)?.message ?? String(e);
            setError(String(msg));
        }
    }

    return (
        <div className="p-4 border rounded bg-white dark:bg-slate-900">
            <h3 className="font-semibold mb-2">Import Topics</h3>
            <textarea className="w-full border p-2 mb-2" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
            {error ? <div className="text-red-600">{error}</div> : null}
            <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={handleImport}>Import</button>
                <button className="btn" onClick={() => onClose?.()}>Cancel</button>
            </div>
        </div>
    );
}
