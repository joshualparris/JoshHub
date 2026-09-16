"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  platformActions,
  type PlatformOpportunity,
  usePlatformOpportunities,
} from "@/features/platform";

export function OpportunitiesList() {
  const opportunities = usePlatformOpportunities();
  const [name, setName] = useState("");

  async function handleAdd() {
    const opportunityName = name.trim();
    if (!opportunityName) return;

    await platformActions.addOpportunity({ name: opportunityName, stage: "seed" });
    setName("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Platform"
        title="Opportunities"
        subtitle="Track opportunity stages."
        tone="onDark"
      />

      <Card>
        <CardHeader>
          <CardTitle>New Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
            />
            <Button onClick={handleAdd} disabled={!name.trim()}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="rounded-md border border-border bg-card p-3 text-card-foreground"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{opportunity.name}</div>
                <div className="text-xs text-muted-foreground">{opportunity.stage}</div>
              </div>
              <div className="flex gap-2">
                <select
                  defaultValue={opportunity.stage}
                  aria-label={`Stage for ${opportunity.name}`}
                  className="h-8 rounded-md border border-border bg-background px-2 text-foreground"
                  onChange={(event) =>
                    platformActions.setOpportunityStage(
                      opportunity.id,
                      event.target.value as PlatformOpportunity["stage"]
                    )
                  }
                >
                  <option value="seed">Seed</option>
                  <option value="shaped">Shaped</option>
                  <option value="experiment">Experiment</option>
                  <option value="validated">Validated</option>
                  <option value="committed">Committed</option>
                  <option value="parked">Parked</option>
                </select>
                <Button
                  variant="ghost"
                  onClick={() => platformActions.deleteOpportunity(opportunity.id)}
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
