"use client";

import { FormEvent, useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
  const chartData = useMemo(
    () =>
      (metrics ?? [])
        .map((m) => ({
          date: m.dateTimeIso,
          value: m.value,
          metricType: m.metricType,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-20),
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
      <PageHeader kicker="Health" title="Metrics" subtitle="Log weight, HRV, and other metrics." />

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
              className="h-10 rounded-md border border-border bg-card px-3 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <CardTitle>Metrics trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data to chart yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tickFormatter={(v) => v.slice(5, 16)} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--foreground)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
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
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            recent.map((m) => (
              <div
                key={m.id}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground"
              >
                <p className="font-medium">
                  {m.metricType} — {m.value} {m.unit}
                </p>
                <p className="text-muted-foreground">{new Date(m.dateTimeIso).toLocaleString()}</p>
                {m.notes && <p className="text-muted-foreground">{m.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
