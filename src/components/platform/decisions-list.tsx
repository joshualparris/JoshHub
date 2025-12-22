"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { PlatformDecisionCard } from "@/features/platform";
import { platformActions, usePlatformDecisionCards } from "@/features/platform";

export default function DecisionsList() {
    const items = usePlatformDecisionCards();
    const [question, setQuestion] = useState("");

    async function handleAdd() {
        if (!question.trim()) return;
        await platformActions.addDecisionCard({
            question: question.trim(),
            status: "open",
        });
        setQuestion("");
    }

    return (
        <div className="space-y-6">
            <PageHeader kicker="Platform" title="Decisions" subtitle="Capture and decide." tone="onDark" />

            <Card>
                <CardHeader>
                    <CardTitle>New Decision</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" />
                        <Button onClick={handleAdd}>Add</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3">
                {items.map((it) => (
                    <div key={it.id} className="rounded-md border bg-white p-3 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{it.question}</div>
                                <div className="text-xs text-muted-foreground">{it.status}</div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    defaultValue={it.status}
                                    className="h-8 rounded-md border px-2"
                                    onChange={(e) => platformActions.setDecisionStatus(it.id, e.target.value as PlatformDecisionCard['status'])}
                                >
                                    <option value="open">Open</option>
                                    <option value="decided">Decided</option>
                                    <option value="parked">Parked</option>
                                </select>
                                <Button variant="ghost" onClick={() => platformActions.deleteDecisionCard(it.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
