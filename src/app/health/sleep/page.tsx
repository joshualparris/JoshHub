"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSleepLog, useSleep } from "@/lib/db/health";

export default function SleepPage() {
  const sleeps = useSleep();
  const [date, setDate] = useState("");
  const [bed, setBed] = useState("");
  const [wake, setWake] = useState("");
  const [quality, setQuality] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const recent = useMemo(
    () => (sleeps ?? []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [sleeps]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    await createSleepLog({
      date,
      bedtimeIso: bed || undefined,
      wakeIso: wake || undefined,
      quality,
      notes,
      tags: [],
    });
    setDate("");
    setBed("");
    setWake("");
    setQuality(undefined);
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Health</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Sleep</h1>
        <p className="text-neutral-600">Log sleep and quality.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input
              type="datetime-local"
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              placeholder="Bedtime"
            />
            <Input
              type="datetime-local"
              value={wake}
              onChange={(e) => setWake(e.target.value)}
              placeholder="Wake time"
            />
            <Input
              type="number"
              placeholder="Quality 1-5"
              value={quality ?? ""}
              onChange={(e) => setQuality(e.target.value ? Number(e.target.value) : undefined)}
            />
            <Textarea
              className="md:col-span-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
            />
            <div className="md:col-span-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-600">No entries yet.</p>
          ) : (
            recent.map((s) => (
              <div
                key={s.id}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-neutral-900">{s.date}</p>
                <p className="text-neutral-600">
                  Bed: {s.bedtimeIso || "-"} | Wake: {s.wakeIso || "-"}
                </p>
                {s.quality && <p className="text-neutral-600">Quality: {s.quality}/5</p>}
                {s.notes && <p className="text-neutral-600">{s.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
