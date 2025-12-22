"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { PlatformOpportunity } from "@/features/platform";
import { platformActions, usePlatformOpportunities } from "@/features/platform";

export default function OpportunitiesList() {
    const items = usePlatformOpportunities();
    const [name, setName] = useState("");

    async function handleAdd() {
        if (!name.trim()) return;
        await platformActions.addOpportunity({
            name: name.trim(),
            stage: "seed",
        });
        setName("");
    }

    return (
        <div className="space-y-6">
            <PageHeader kicker="Platform" title="Opportunities" subtitle="Track opportunity stages." tone="onDark" />

            <Card>
                <CardHeader>
                    <CardTitle>New Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                        <Button onClick={handleAdd}>Add</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3">
                {items.map((it) => (
                    <div key={it.id} className="rounded-md border bg-white p-3 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{it.name}</div>
                                <div className="text-xs text-muted-foreground">{it.stage}</div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    defaultValue={it.stage}
                                    className="h-8 rounded-md border px-2"
                                    onChange={(e) => platformActions.setOpportunityStage(it.id, e.target.value as PlatformOpportunity['stage'])}
                                >
                                    <option value="seed">Seed</option>
                                    <option value="shaped">Shaped</option>
                                    <option value="experiment">Experiment</option>
                                    <option value="validated">Validated</option>
                                    <option value="committed">Committed</option>
                                    <option value="parked">Parked</option>
                                </select>
                                <Button variant="ghost" onClick={() => platformActions.deleteOpportunity(it.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
