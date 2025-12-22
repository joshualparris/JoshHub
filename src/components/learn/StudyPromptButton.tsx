"use client";
import React from "react";
// use navigator.clipboard instead of an external dependency

type Props = {
    topicName: string;
    template?: string;
    context?: string;
};

export default function StudyPromptButton({ topicName, template, context }: Props) {
    const tmpl = template ?? "Explain & Apply: {{topic}} -- {{context}}";
    const ctx = context ?? "Australian Christian husband/dad, health + routines focus, wants practical steps and Scripture where relevant.";

    function makePrompt() {
        return tmpl.replace(/{{\s*topic\s*}}/gi, topicName).replace(/{{\s*context\s*}}/gi, ctx);
    }

    async function handleCopy() {
        const p = makePrompt();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(p);
            alert("Prompt copied to clipboard\n\n" + p.slice(0, 200));
        } else {
            // fallback
            alert("Copy your prompt:\n\n" + p);
        }
    }

    return (
        <button onClick={handleCopy} className="text-sm px-3 py-1 border rounded bg-slate-100 dark:bg-slate-700">Copy Study Prompt</button>
    );
}
