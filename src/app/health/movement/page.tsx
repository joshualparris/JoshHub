"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMovementLog, useMovement } from "@/lib/db/health";
import type { MovementLog } from "@/lib/db/schema";

export default function MovementPage() {
  const movement = useMovement();
  const [date, setDate] = useState("");
  const [type, setType] = useState<MovementLog["type"]>("walk");
  const [minutes, setMinutes] = useState(30);
  const [intensity, setIntensity] = useState<MovementLog["intensity"]>("med");
  const [notes, setNotes] = useState("");

  const recent = useMemo(
    () => (movement ?? []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [movement]
  );
  const chartData = useMemo(
    () =>
      (movement ?? [])
        .map((m) => ({ date: m.date, minutes: m.minutes }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14),
    [movement]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    await createMovementLog({
      date,
      type,
      minutes,
      intensity,
      notes,
    });
    setDate("");
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Health</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Movement</h1>
        <p className="text-neutral-600">Log sessions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MovementLog["type"])}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="walk">Walk</option>
              <option value="ride">Ride</option>
              <option value="strength">Strength</option>
              <option value="mobility">Mobility</option>
              <option value="other">Other</option>
            </select>
            <Input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value || 0))}
              placeholder="Minutes"
            />
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as MovementLog["intensity"])}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
            <Input
              className="md:col-span-2"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="md:col-span-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement trend (minutes)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length === 0 ? (
            <p className="text-sm text-neutral-600">No data to chart yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#0f172a" />
              </BarChart>
            </ResponsiveContainer>
          )}
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
            recent.map((m) => (
              <div
                key={m.id}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-neutral-900">
                  {m.date} — {m.type} ({m.minutes}m, {m.intensity})
                </p>
                {m.notes && <p className="text-neutral-600">{m.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
