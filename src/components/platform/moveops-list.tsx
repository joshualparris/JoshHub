"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type { PlatformMoveOp } from "@/features/platform";
import { platformActions, usePlatformMoveOps } from "@/features/platform";

export default function MoveOpsList() {
    const items = usePlatformMoveOps();
    const [title, setTitle] = useState("");

    async function handleAdd() {
        if (!title.trim()) return;
        // platformActions.addMoveOp expects an item without id/createdAt/updatedAt
        await platformActions.addMoveOp({
            title: title.trim(),
            status: "todo",
        });
        setTitle("");
    }

    return (
        <div className="space-y-6">
            <PageHeader kicker="Platform" title="Move Ops" subtitle="Short actionable moves." tone="onDark" />

            <Card>
                <CardHeader>
                    <CardTitle>New Move</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                        <Button onClick={handleAdd}>Add</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3">
                {items.map((it) => (
                    <div key={it.id} className="rounded-md border bg-white p-3 dark:bg-slate-900/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{it.title}</div>
                                {it.dueDate && <div className="text-xs text-muted-foreground">Due {it.dueDate}</div>}
                            </div>
                            <div className="flex gap-2">
                                <select
                                    defaultValue={it.status}
                                    className="h-8 rounded-md border px-2"
                                    onChange={(e) => platformActions.setMoveOpStatus(it.id, e.target.value as PlatformMoveOp['status'])}
                                >
                                    <option value="todo">Todo</option>
                                    <option value="doing">Doing</option>
                                    <option value="done">Done</option>
                                </select>
                                <Button variant="ghost" onClick={() => platformActions.deleteMoveOp(it.id)}>Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
