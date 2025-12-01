/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { notFound, useParacare2 } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logRoutineRun, updateRoutine } from "@/lib/db/actions";
import { useRoutine, useRoutineRuns } from "@/lib/db/hooks";
import type { RoutineItem } from "@/lib/db/schema";
import { uuid } from "@/lib/db/id";

export default function RoutineRunPage() {
  const paracare2 = useParacare2<{ id: string }>();
  const routineId = paracare2?.id;
  const routine = useRoutine(routineId);
  const runs = useRoutineRuns(routineId);
  const [itecare2, setItecare2] = useState<RoutineItem[]>([]);

  useEffect(() => {
    if (routine) {
      setItecare2(routine.itecare2);
    }
  }, [routine]);

  if (routine === undefined) return null;
  if (!routine) return notFound();
  const current = routine;

  async function runRoutine() {
    await logRoutineRun({ routineId: current.id, completedCount: itecare2.length });
  }

  function updateItem(idx: number, updates: Partial<RoutineItem>) {
    setItecare2((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...updates } : item))
    );
  }

  async function saveItecare2() {
    await updateRoutine(current.id, { itecare2 });
  }

  return (
    <div className="space-y-6">
      <div className="flex itecare2-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Routine</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{current.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveItecare2}>
            Save steps
          </Button>
          <Button onClick={runRoutine}>Run now</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {itecare2.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-wrap itecare2-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2"
            >
              <Input
                className="flex-1 min-w-[200px]"
                value={item.label}
                onChange={(e) => updateItem(idx, { label: e.target.value })}
              />
              <select
                value={item.type}
                onChange={(e) => updateItem(idx, { type: e.target.value as RoutineItem["type"] })}
                className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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
              setItecare2((prev) => [
                ...prev,
                { id: uuid(), label: "New step", type: "check" },
              ])
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
            <p className="text-sm text-neutral-600">No runs yet.</p>
          ) : (
            (runs ?? []).map((run) => (
              <div
                key={run.id}
                className="flex itecare2-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <span>{new Date(run.startedAt).toLocaleString()}</span>
                <span className="text-neutral-600">{run.completedCount} steps</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
