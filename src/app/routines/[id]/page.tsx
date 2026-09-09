/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { logRoutineRun, updateRoutine } from "@/lib/db/actions";
import { useRoutine, useRoutineRuns } from "@/lib/db/hooks";
import { uuid } from "@/lib/db/id";
import type { RoutineItem } from "@/lib/db/schema";

export default function RoutineRunPage() {
  const params = useParams<{ id: string }>();
  const routineId = params?.id;
  const routine = useRoutine(routineId);
  const runs = useRoutineRuns(routineId);
  const [items, setItems] = useState<RoutineItem[]>([]);

  useEffect(() => {
    if (routine) {
      setItems(routine.items);
    }
  }, [routine]);

  if (routine === undefined) return null;
  if (!routine) return notFound();
  const current = routine;

  async function runRoutine() {
    await logRoutineRun({ routineId: current.id, completedCount: items.length });
  }

  function updateItem(idx: number, updates: Partial<RoutineItem>) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...updates } : item)));
  }

  async function saveItems() {
    await updateRoutine(current.id, { items });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Routine"
        title={current.name}
        rightSlot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveItems}>
              Save steps
            </Button>
            <Button onClick={runRoutine}>Run now</Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
            >
              <Input
                className="min-w-[200px] flex-1"
                value={item.label}
                onChange={(e) => updateItem(idx, { label: e.target.value })}
              />
              <select
                value={item.type}
                onChange={(e) => updateItem(idx, { type: e.target.value as RoutineItem["type"] })}
                className="h-10 rounded-md border border-border bg-card px-2 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="check">Check</option>
                <option value="timer">Timer</option>
              </select>
              <Input
                className="w-24"
                type="number"
                placeholder="sec"
                value={item.seconds ?? ""}
                onChange={(e) => updateItem(idx, { seconds: Number(e.target.value || 0) })}
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setItems((prev) => [...prev, { id: uuid(), label: "New step", type: "check" }])
            }
          >
            Add step
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(runs ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet.</p>
          ) : (
            (runs ?? []).map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground"
              >
                <span>{new Date(run.startedAt).toLocaleString()}</span>
                <span className="text-muted-foreground">{run.completedCount} steps</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
