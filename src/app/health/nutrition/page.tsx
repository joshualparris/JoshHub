"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNutritionLog, useNutrition } from "@/lib/db/health";

export default function NutritionPage() {
  const nutrition = useNutrition();
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");
  const [protein, setProtein] = useState<number | undefined>(undefined);
  const [veg, setVeg] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState("");

  const recent = useMemo(
    () => (nutrition ?? []).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [nutrition]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!date || !summary.trim()) return;
    await createNutritionLog({
      date,
      summary,
      proteinGrams: protein,
      vegServes: veg,
      notes,
    });
    setDate("");
    setSummary("");
    setProtein(undefined);
    setVeg(undefined);
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Health</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Nutrition</h1>
        <p className="text-neutral-600">Log daily food notes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input
              placeholder="Summary (e.g., meals or highlights)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Protein grams"
              value={protein ?? ""}
              onChange={(e) => setProtein(e.target.value ? Number(e.target.value) : undefined)}
            />
            <Input
              type="number"
              placeholder="Veg serves"
              value={veg ?? ""}
              onChange={(e) => setVeg(e.target.value ? Number(e.target.value) : undefined)}
            />
            <Textarea
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
            recent.map((n) => (
              <div
                key={n.id}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-neutral-900">{n.date}</p>
                <p className="text-neutral-700">{n.summary}</p>
                <div className="text-xs text-neutral-600">
                  {n.proteinGrams != null && <span>Protein: {n.proteinGrams}g </span>}
                  {n.vegServes != null && <span>Veg: {n.vegServes} serves </span>}
                </div>
                {n.notes && <p className="text-neutral-600">{n.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
