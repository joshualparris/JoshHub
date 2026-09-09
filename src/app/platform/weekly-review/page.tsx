"use client";

import { FormEvent, useState } from "react";
import { Timer, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { platformActions, usePlatformWeeklyReviews } from "@/features/platform";
import { parseCommaSeparatedList } from "@/lib/parsing/comma-list";

export default function WeeklyReviewPage() {
  const reviews = usePlatformWeeklyReviews();
  const [weekStart, setWeekStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [wins, setWins] = useState("");
  const [drained, setDrained] = useState("");
  const [gaveLife, setGaveLife] = useState("");
  const [top3, setTop3] = useState("");
  const [experiment, setExperiment] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await platformActions.addWeeklyReview({
      weekStart,
      wins: wins.trim() || null,
      drains: drained.trim() || null,
      givesLife: gaveLife.trim() || null,
      top3: parseCommaSeparatedList(top3),
      experiment: experiment.trim() || null,
      notes: null,
    });
    setWins("");
    setDrained("");
    setGaveLife("");
    setTop3("");
    setExperiment("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="JoshPlatform"
        title="Weekly review"
        subtitle="What changed, drained, gave life. Top 3 + one experiment."
        tone="onDark"
      />

      <Card id="add">
        <CardHeader>
          <CardTitle>Log a review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Week of</label>
              <Input
                type="date"
                value={weekStart}
                onChange={(event) => setWeekStart(event.target.value)}
                className="md:max-w-xs"
              />
            </div>
            <Textarea
              placeholder="What changed?"
              value={wins}
              onChange={(event) => setWins(event.target.value)}
            />
            <Textarea
              placeholder="What drained me?"
              value={drained}
              onChange={(event) => setDrained(event.target.value)}
            />
            <Textarea
              placeholder="What gave life?"
              value={gaveLife}
              onChange={(event) => setGaveLife(event.target.value)}
            />
            <Input
              placeholder="Top 3 (comma separated)"
              value={top3}
              onChange={(event) => setTop3(event.target.value)}
            />
            <Textarea
              placeholder="1 experiment this week"
              value={experiment}
              onChange={(event) => setExperiment(event.target.value)}
            />
            <Button type="submit">
              <UploadCloud className="mr-2 h-4 w-4" />
              Save review
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Week of {review.weekStart}</span>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-card-foreground">
              {review.wins && <Line label="Changed" text={review.wins} />}
              {review.drains && <Line label="Drained" text={review.drains} />}
              {review.givesLife && <Line label="Gave life" text={review.givesLife} />}
              {review.top3 && review.top3.length > 0 && (
                <Line label="Top 3" text={review.top3.join(" · ")} />
              )}
              {review.experiment && <Line label="Experiment" text={review.experiment} />}
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews yet. Log your first one above.</p>
        )}
      </div>
    </div>
  );
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <p>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}: </span>
      <span>{text}</span>
    </p>
  );
}
