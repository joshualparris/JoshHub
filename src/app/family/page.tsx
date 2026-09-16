"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { saveFamilyRhythm, useFamilyRhythm } from "@/lib/db/family";
import { parseCommaSeparatedList } from "@/lib/parsing/comma-list";

export default function FamilyPage() {
  const rhythm = useFamilyRhythm();
  const [bedtime, setBedtime] = useState("");
  const [dinner, setDinner] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [sylvie, setSylvie] = useState("");
  const [elias, setElias] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!rhythm) return;
    setBedtime(rhythm.bedtime);
    setDinner(rhythm.dinner);
    setResponsibilities(rhythm.responsibilities.join(", "));
    setSylvie(rhythm.sylvieChecklist.join(", "));
    setElias(rhythm.eliasChecklist.join(", "));
  }, [rhythm]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    await saveFamilyRhythm({
      bedtime,
      dinner,
      responsibilities: parseCommaSeparatedList(responsibilities),
      sylvieChecklist: parseCommaSeparatedList(sylvie),
      eliasChecklist: parseCommaSeparatedList(elias),
    });
    setMessage("Saved.");
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Family"
        title="Family rhythm"
        subtitle="Bedtimes, dinner targets, and key responsibilities."
      />

      <Card>
        <CardHeader>
          <CardTitle>Edit rhythm</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSave}>
            <Input
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
              placeholder="Kids bedtime target, e.g. 19:00"
            />
            <Input
              value={dinner}
              onChange={(event) => setDinner(event.target.value)}
              placeholder="Dinner target, e.g. 17:00"
            />
            <Input
              value={responsibilities}
              onChange={(event) => setResponsibilities(event.target.value)}
              placeholder="Responsibilities, e.g. bins, grocery, church"
            />
            <Input
              value={sylvie}
              onChange={(event) => setSylvie(event.target.value)}
              placeholder="Sylvie checklist, e.g. toothbrush, story, water"
            />
            <Input
              value={elias}
              onChange={(event) => setElias(event.target.value)}
              placeholder="Elias checklist, e.g. bath, bottle, bed"
            />
            <div className="flex items-center gap-3">
              <Button type="submit">Save</Button>
              {message && <span className="text-sm text-muted-foreground">{message}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {rhythm === undefined ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            No family rhythm is saved yet. The examples above are placeholders only.
          </CardContent>
        </Card>
      ) : rhythm ? (
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-card-foreground">
            <p>Bedtime: {rhythm.bedtime || "Not set"}</p>
            <p>Dinner: {rhythm.dinner || "Not set"}</p>
            <SavedList label="Responsibilities" items={rhythm.responsibilities} />
            <SavedList label="Sylvie bedtime" items={rhythm.sylvieChecklist} />
            <SavedList label="Elias bedtime" items={rhythm.eliasChecklist} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SavedList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p>{label}:</p>
      {items.length > 0 ? (
        <ul className="list-disc pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Not set</p>
      )}
    </div>
  );
}
