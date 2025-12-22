"use client";

import { FormEvent, useMemo, useState } from "react";
import { Timer, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlatformWeeklyReviews } from "@/features/platform";
import { createWeeklyReview } from "@/lib/db/platform";

export default function WeeklyReviewPage() {
  const reviews = usePlatformWeeklyReviews();
  const [weekStart, setWeekStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [whatChanged, setWhatChanged] = useState("");
  const [drained, setDrained] = useState("");
  const [gaveLife, setGaveLife] = useState("");
  const [top3, setTop3] = useState("");
  const [experiment, setExperiment] = useState("");

  const sorted = useMemo(() => (reviews ?? []).sort((a, b) => b.weekStart.localeCompare(a.weekStart)), [reviews]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createWeeklyReview({
      weekStart,
      whatChanged: whatChanged.trim() || null,
      drained: drained.trim() || null,
      gaveLife: gaveLife.trim() || null,
      top3: top3
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      experiment: experiment.trim() || null,
    });
    setWhatChanged("");
    setDrained("");
    setGaveLife("");
    setTop3("");
    setExperiment("");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">JoshPlatform</p>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-white">Weekly review</h1>
        <p className="text-sm text-neutral-600 dark:text-slate-300">What changed, drained, gave life. Top 3 + one experiment.</p>
      </header>

      <Card id="add" className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle>Log a review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="flex flex-col gap-2 md:flex-row md:itecare2-center">
              <label className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">Week of</label>
              <Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="md:max-w-xs" />
            </div>
            <Textarea placeholder="What changed?" value={whatChanged} onChange={(e) => setWhatChanged(e.target.value)} />
            <Textarea placeholder="What drained me?" value={drained} onChange={(e) => setDrained(e.target.value)} />
            <Textarea placeholder="What gave life?" value={gaveLife} onChange={(e) => setGaveLife(e.target.value)} />
            <Input
              placeholder="Top 3 (comma separated)"
              value={top3}
              onChange={(e) => setTop3(e.target.value)}
            />
            <Textarea placeholder="1 experiment this week" value={experiment} onChange={(e) => setExperiment(e.target.value)} />
            <Button type="submit">
              <UploadCloud className="mr-2 h-4 w-4" />
              Save review
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((rev) => (
          <Card key={rev.id} className="border-white/80 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base flex itecare2-center justify-between">
                <span>Week of {rev.weekStart}</span>
                <Timer className="h-4 w-4 text-neutral-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              {rev.whatChanged && <Line label="Changed" text={rev.whatChanged} />}
              {rev.drained && <Line label="Drained" text={rev.drained} />}
              {rev.gaveLife && <Line label="Gave life" text={rev.gaveLife} />}
              {rev.top3 && rev.top3.length > 0 && <Line label="Top 3" text={rev.top3.join(" · ")} />}
              {rev.experiment && <Line label="Experiment" text={rev.experiment} />}
            </CardContent>
          </Card>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-neutral-600 dark:text-slate-300">No reviews yet. Log your first one above.</p>
        )}
      </div>
    </div>
  );
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <p>
      <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}: </span>
      <span>{text}</span>
    </p>
  );
}
