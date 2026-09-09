"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  platformActions,
  type PlatformDecisionCard,
  usePlatformDecisionCards,
} from "@/features/platform";

export function DecisionsList() {
  const decisions = usePlatformDecisionCards();
  const [question, setQuestion] = useState("");

  async function handleAdd() {
    const decisionQuestion = question.trim();
    if (!decisionQuestion) return;

    await platformActions.addDecisionCard({ question: decisionQuestion, status: "open" });
    setQuestion("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Platform"
        title="Decisions"
        subtitle="Capture and decide."
        tone="onDark"
      />

      <Card>
        <CardHeader>
          <CardTitle>New Decision</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Question"
            />
            <Button onClick={handleAdd} disabled={!question.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {decisions.map((decision) => (
          <div
            key={decision.id}
            className="rounded-md border border-border bg-card p-3 text-card-foreground"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{decision.question}</div>
                <div className="text-xs text-muted-foreground">{decision.status}</div>
              </div>
              <div className="flex gap-2">
                <select
                  defaultValue={decision.status}
                  aria-label={`Status for ${decision.question}`}
                  className="h-8 rounded-md border border-border bg-background px-2 text-foreground"
                  onChange={(event) =>
                    platformActions.setDecisionStatus(
                      decision.id,
                      event.target.value as PlatformDecisionCard["status"]
                    )
                  }
                >
                  <option value="open">Open</option>
                  <option value="decided">Decided</option>
                  <option value="parked">Parked</option>
                </select>
                <Button
                  variant="ghost"
                  onClick={() => platformActions.deleteDecisionCard(decision.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
