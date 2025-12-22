"use client";
import React, { useEffect, useState } from "react";
import * as learnRepo from "@/lib/repos/dexie/learnRepoDexie";

export default function PromptTemplatesEditor({ onClose }: { onClose: () => void }) {
    const [text, setText] = useState("[]");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function parseTemplates(input: string) {
        const parsed: unknown = JSON.parse(input);
        if (!Array.isArray(parsed)) {
            throw new Error("Expected an array of templates");
        }

        return parsed.map((t) => {
            if (typeof t !== "object" || t === null) {
                throw new Error("Each template must be an object");
            }
            const maybe = t as { name?: unknown; template?: unknown };
            if (typeof maybe.name !== "string" || typeof maybe.template !== "string") {
                throw new Error("Each template needs string fields: name, template");
            }
            return { name: maybe.name, template: maybe.template };
        });
    }

    useEffect(() => {
        let mounted = true;
        learnRepo.getPromptTemplates().then((arr) => {
            if (!mounted) return;
            setText(JSON.stringify(arr, null, 2));
        }).catch(() => {
            if (!mounted) return;
            setText("[]");
        });
        return () => { mounted = false; };
    }, []);

    async function save() {
        setError(null);
        try {
            const parsed = parseTemplates(text);
            setSaving(true);
            await learnRepo.savePromptTemplates(parsed);
            setSaving(false);
            onClose();
        } catch (e: unknown) {
            setSaving(false);
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl bg-white rounded shadow p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Prompt Templates</h3>
                    <div className="flex gap-2">
                        <button className="btn" onClick={onClose} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={save} disabled={saving}>Save</button>
                    </div>
                </div>

                <textarea
                    className="w-full h-96 border rounded p-2 font-mono text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
            </div>
        </div>
    );
}
