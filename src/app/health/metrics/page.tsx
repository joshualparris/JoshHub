"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMetricLog, useMetrics } from "@/lib/db/health";
import type { MetricLog } from "@/lib/db/schema";

export default function MetricsPage() {
  const metrics = useMetrics();
  const [dateTime, setDateTime] = useState("");
  const [metricType, setMetricType] = useState<MetricLog["metricType"]>("weight");
  const [value, setValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");

  const recent = useMemo(
    () => (metrics ?? []).sort((a, b) => b.dateTimeIso.localeCompare(a.dateTimeIso)).slice(0, 10),
    [metrics]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!dateTime || value == null) return;
    await createMetricLog({
      dateTimeIso: dateTime,
      metricType,
      value,
      unit,
      notes,
    });
    setDateTime("");
    setValue(undefined);
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Health</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Metrics</h1>
        <p className="text-neutral-600">Log weight, HRV, and other metrics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
            <select
              value={metricType}
              onChange={(e) => setMetricType(e.target.value as MetricLog["metricType"])}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm"
            >
              <option value="weight">Weight</option>
              <option value="hrv">HRV</option>
              <option value="restingHR">Resting HR</option>
              <option value="bp">Blood pressure</option>
              <option value="other">Other</option>
            </select>
            <Input
              type="number"
              value={value ?? ""}
              onChange={(e) => setValue(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Value"
            />
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
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
                  {m.metricType} — {m.value} {m.unit}
                </p>
                <p className="text-neutral-600">{new Date(m.dateTimeIso).toLocaleString()}</p>
                {m.notes && <p className="text-neutral-600">{m.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
