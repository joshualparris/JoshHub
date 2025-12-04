"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { createRoutine, logRoutineRun } from "@/lib/db/actions";
import { useRoutines } from "@/lib/db/hooks";
import { seedRoutines } from "@/lib/db/dexie";

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
      <PageHeader kicker="ROUTINES" title="Routines" subtitle="Create and run routines." />

      <Card>
        <CardHeader>
          <CardTitle>New routine</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-3" onSubmit={onAddRoutine}>
            <Input
              placeholder="Routine name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(routines ?? []).map((routine) => (
          <Card key={routine.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Link
                  href={`/routines/${routine.id}`}
                  className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 rounded-sm"
                >
                  {routine.name}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logRoutineRun({ routineId: routine.id, completedCount: routine.items.length })}
                >
                  Run
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground/80">
              {routine.items.length === 0 ? (
                <p className="text-foreground/65">No steps yet.</p>
              ) : (
                routine.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="rounded bg-neutral-100 px-2 py-1 text-xs uppercase text-foreground">
                      {item.type}
                    </span>
                    <span className="text-foreground/80">{item.label}</span>
                    {item.seconds ? (
                      <span className="text-xs text-foreground/65">{item.seconds}s</span>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
        {(routines ?? []).length === 0 && (
          <p className="text-sm text-neutral-600">No routines yet.</p>
        )}
      </div>
    </div>
  );
}
