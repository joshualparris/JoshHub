"use client";
import React, { useState } from "react";
import { useLearnResources } from "../../../../lib/db/hooks";
import { db } from "../../../../lib/db/dexie";
import { uuid } from "../../../../lib/db/id";
import { useRouter } from "next/navigation";
import type { LearnResource } from "../../../../lib/db/schema";

export default function ResourcePage({ params }: { params: { resourceId: string } }) {
    const { resourceId } = params;
    const resources = (useLearnResources() ?? []) as LearnResource[];
    const resource = resources.find((r) => r.id === resourceId);
    const [note, setNote] = useState("");
    const router = useRouter();

    if (!resource) return <div className="p-6">Resource not found</div>;

    async function addNote() {
        if (!note.trim()) return;
        await db.learnNotes.add({ id: uuid(), resourceId, content: note.trim(), createdAt: Date.now(), updatedAt: Date.now() });
        setNote("");
        router.refresh();
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{resource.title}</h1>
            <p className="text-sm text-slate-500">{resource.type} {resource.author ? `— ${resource.author}` : ""}</p>
            {resource.url ? <p className="mt-2"><a href={resource.url} target="_blank" rel="noreferrer" className="text-blue-600">Open resource</a></p> : null}

            <section className="mt-6">
                <h2 className="font-semibold">Notes / Highlights</h2>
                <textarea className="w-full border rounded p-2 mt-2" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="mt-2"><button className="btn btn-primary" onClick={addNote}>Add Note</button></div>
            </section>
        </div>
    );
}
