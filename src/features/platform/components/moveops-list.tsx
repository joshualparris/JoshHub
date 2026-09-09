"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { platformActions, type PlatformMoveOp, usePlatformMoveOps } from "@/features/platform";

export function MoveOpsList() {
  const moveOps = usePlatformMoveOps();
  const [title, setTitle] = useState("");

  async function handleAdd() {
    const moveTitle = title.trim();
    if (!moveTitle) return;

    await platformActions.addMoveOp({ title: moveTitle, status: "todo" });
    setTitle("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Platform"
        title="Move Ops"
        subtitle="Short actionable moves."
        tone="onDark"
      />

      <Card>
        <CardHeader>
          <CardTitle>New Move</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
            />
            <Button onClick={handleAdd} disabled={!title.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {moveOps.map((moveOp) => (
          <div
            key={moveOp.id}
            className="rounded-md border border-border bg-card p-3 text-card-foreground"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{moveOp.title}</div>
                {moveOp.dueDate && (
                  <div className="text-xs text-muted-foreground">Due {moveOp.dueDate}</div>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  defaultValue={moveOp.status}
                  aria-label={`Status for ${moveOp.title}`}
                  className="h-8 rounded-md border border-border bg-background px-2 text-foreground"
                  onChange={(event) =>
                    platformActions.setMoveOpStatus(
                      moveOp.id,
                      event.target.value as PlatformMoveOp["status"]
                    )
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="doing">Doing</option>
                  <option value="done">Done</option>
                </select>
                <Button variant="ghost" onClick={() => platformActions.deleteMoveOp(moveOp.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
