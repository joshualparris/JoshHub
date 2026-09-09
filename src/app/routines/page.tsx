"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { metaText } from "@/components/ui/text";
import { StepBadge } from "@/components/ui/step-badge";
import { createRoutine, deleteRoutine, logRoutineRun, updateRoutine } from "@/lib/db/actions";
import { seedRoutines } from "@/lib/db/dexie";
import { useRoutines } from "@/lib/db/hooks";
import type { Routine, RoutineItem } from "@/lib/db/schema";

export default function RoutinesPage() {
  const routines = useRoutines();
  const [name, setName] = useState("");

  useEffect(() => {
    seedRoutines();
  }, []);

  async function onAddRoutine(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createRoutine({ name: name.trim(), items: [], tags: [] });
    setName("");
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="ROUTINES" title="Routines" subtitle="Create and run routines." tone="onDark" />

      <Card>
        <CardHeader>
          <CardTitle>New routine</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3" onSubmit={onAddRoutine}>
            <Input placeholder="Routine name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(routines ?? []).map((routine) => (
          <RoutineCard key={`${routine.id}-${routine.name}-${routine.items.length}`} routine={routine} />
        ))}
        {(routines ?? []).length === 0 && <p className="text-sm text-neutral-600">No routines yet.</p>}
      </div>
    </div>
  );
}

function RoutineCard({ routine }: { routine: Routine }) {
  const [name, setName] = useState(routine.name);
  const [items, setItems] = useState<RoutineItem[]>(routine.items);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<{ completed: number; durationMs: number } | null>(null);

  const ordered = useMemo(
    () =>
      items.map((item) =>
        item.type === "check" || item.type === "timer" ? item : { ...item, type: "check" as const }
      ),
    [items]
  );

  function updateItem(id: string, partial: Partial<RoutineItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  }

  function moveItem(id: string, dir: "up" | "down") {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index < 0) return prev;
      const swapWith = dir === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const copy = [...prev];
      const [current] = copy.splice(index, 1);
      copy.splice(swapWith, 0, current);
      return copy;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleAddStep() {
    const newItem: RoutineItem = {
      id: crypto.randomUUID(),
      label: "New step",
      type: "check",
      seconds: undefined,
    };
    setItems((prev) => [...prev, newItem]);
  }

  async function handleSave() {
    setSaving(true);
    await updateRoutine(routine.id, { name: name.trim() || "Routine", items });
    setSaving(false);
  }

  function startRun() {
    if (ordered.length === 0) return;
    setRunning(true);
    setPaused(false);
    setFinishedSummary(null);
    setCompleted({});
    setCurrentStep(0);
    setStartedAt(Date.now());
    setRemaining(ordered[0]?.type === "timer" ? ordered[0]?.seconds ?? null : null);
  }

  function handleCompleteStep(id: string) {
    const nextCompleted = { ...completed, [id]: true };
    setCompleted(nextCompleted);
    const nextIndex = currentStep + 1;
    if (nextIndex >= ordered.length) {
      const doneCount = Object.values(nextCompleted).filter(Boolean).length;
      logRoutineRun({ routineId: routine.id, completedCount: doneCount }).catch(() => {});
      setRunning(false);
      setPaused(false);
      if (startedAt) {
        setFinishedSummary({ completed: doneCount, durationMs: Date.now() - startedAt });
      }
      setStartedAt(null);
      setRemaining(null);
    } else {
      setCurrentStep(nextIndex);
      setRemaining(ordered[nextIndex]?.type === "timer" ? ordered[nextIndex]?.seconds ?? null : null);
    }
  }

  function stopRun() {
    const doneCount = Object.values(completed).filter(Boolean).length;
    if (doneCount > 0) {
      logRoutineRun({ routineId: routine.id, completedCount: doneCount }).catch(() => {});
    }
    setRunning(false);
    setPaused(false);
    if (startedAt) {
      setFinishedSummary({ completed: doneCount, durationMs: Date.now() - startedAt });
    }
    setStartedAt(null);
    setRemaining(null);
  }

  useEffect(() => {
    if (!running || paused) return;
    const step = ordered[currentStep];
    if (!step) {
      stopRun();
      return;
    }
    if (step.type !== "timer" || !step.seconds) return;
    if (remaining === null) {
      setRemaining(step.seconds);
      return;
    }
    if (remaining <= 0) {
      handleCompleteStep(step.id);
      return;
    }
    const timer = setTimeout(() => setRemaining((prev) => (prev ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining, currentStep, ordered]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={running ? stopRun : startRun}
              >
                {running ? "Stop" : "Run"}
              </Button>
              {running ? (
                <Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)}>
                  {paused ? "Resume" : "Pause"}
                </Button>
              ) : null}
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (confirm("Delete this routine?")) {
                    deleteRoutine(routine.id);
                  }
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
              >
                Delete
              </Button>
              <Link
                href={`/routines/${routine.id}`}
                className="rounded-sm text-sm font-medium text-sky-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-sky-200"
              >
                Open
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {ordered.length === 0 ? (
          <p className="text-card-foreground/70">No steps yet.</p>
        ) : (
          ordered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateItem(item.id, {
                      type: e.target.value as RoutineItem["type"],
                      seconds: e.target.value === "timer" ? item.seconds ?? 60 : undefined,
                    })
                  }
                  className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-visible:ring-slate-400"
                >
                  <option value="check">Check</option>
                  <option value="timer">Timer</option>
                </select>
                <Input
                  className="flex-1 min-w-[140px]"
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                />
                {item.type === "timer" ? (
                  <Input
                    type="number"
                    className="w-24"
                    value={item.seconds ?? 0}
                    onChange={(e) => updateItem(item.id, { seconds: Number(e.target.value) || 0 })}
                  />
                ) : null}
                <div className={`flex items-center gap-2 ${metaText}`}>
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, "up")}
                    className="text-xs underline-offset-2 hover:underline"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, "down")}
                    className="text-xs underline-offset-2 hover:underline"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-600 underline-offset-2 hover:underline dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleAddStep}>
            Add step
          </Button>
          <p className={metaText}>Steps use routine-local order; save to persist edits.</p>
        </div>
      </CardContent>
      {running && ordered.length > 0 ? (
        <div className="border-t border-neutral-200 px-4 py-3 text-sm dark:border-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium text-slate-900 dark:text-slate-50">
              Running: {ordered[currentStep]?.label ?? "Finished"}
            </p>
            {remaining !== null && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                {remaining}s
              </span>
            )}
          </div>
          <div className="space-y-1">
            {ordered.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center justify-between rounded-md px-2 py-1 ${
                  idx === currentStep ? "bg-slate-100 dark:bg-slate-800/70" : ""
                }`}
              >
                <div className="flex items-center gap-3 text-sm text-slate-800 dark:text-slate-100">
                  <StepBadge type={step.type} />
                  <input
                    type="checkbox"
                    checked={completed[step.id] ?? false}
                    onChange={() => handleCompleteStep(step.id)}
                    className="h-4 w-4 rounded border border-neutral-300 dark:border-slate-700"
                  />
                  <span>{step.label}</span>
                </div>
                {step.seconds ? (
                  <span className="text-xs text-slate-600 dark:text-slate-300">{step.seconds}s</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {finishedSummary ? (
        <div className="border-t border-neutral-200 px-4 py-3 text-sm text-slate-800 dark:border-slate-800 dark:text-slate-100">
          <p className="font-medium">Run summary</p>
          <p className="text-sm text-muted-foreground">
            Completed {finishedSummary.completed} steps in {(finishedSummary.durationMs / 1000).toFixed(0)}s.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
