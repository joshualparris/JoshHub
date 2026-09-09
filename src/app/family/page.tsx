"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { saveFamilyRhythm, useFamilyRhythm } from "@/lib/db/family";

export default function FamilyPage() {
  const rhythm = useFamilyRhythm();
  const [bedtime, setBedtime] = useState("19:00");
  const [dinner, setDinner] = useState("17:00");
  const [responsibilities, setResponsibilities] = useState<string>("bins,grocery,church");
  const [sylvie, setSylvie] = useState("toothbrush,story,water");
  const [elias, setElias] = useState("bath,bottle,bed");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (rhythm) {
      setBedtime(rhythm.bedtime);
      setDinner(rhythm.dinner);
      setResponsibilities(rhythm.responsibilities.join(","));
      setSylvie(rhythm.sylvieChecklist.join(","));
      setElias(rhythm.eliasChecklist.join(","));
    }
  }, [rhythm]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const resp = responsibilities
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const sylvieItems = sylvie
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const eliasItems = elias
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    await saveFamilyRhythm({
      bedtime,
      dinner,
      responsibilities: resp,
      sylvieChecklist: sylvieItems,
      eliasChecklist: eliasItems,
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
              onChange={(e) => setBedtime(e.target.value)}
              placeholder="Kids bedtime target (e.g., 19:00)"
            />
            <Input
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              placeholder="Dinner target (e.g., 17:00)"
            />
            <Input
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Responsibilities (comma separated)"
            />
            <Input
              value={sylvie}
              onChange={(e) => setSylvie(e.target.value)}
              placeholder="Sylvie bedtime checklist (comma separated)"
            />
            <Input
              value={elias}
              onChange={(e) => setElias(e.target.value)}
              placeholder="Elias bedtime checklist (comma separated)"
            />
            <div className="flex items-center gap-3">
              <Button type="submit">Save</Button>
              {message && <span className="text-sm text-muted-foreground">{message}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {rhythm && (
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-card-foreground">
            <p>Bedtime: {rhythm.bedtime}</p>
            <p>Dinner: {rhythm.dinner}</p>
            <div>
              <p>Responsibilities:</p>
              <ul className="list-disc pl-5">
                {rhythm.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p>Sylvie bedtime:</p>
              <ul className="list-disc pl-5">
                {rhythm.sylvieChecklist.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p>Elias bedtime:</p>
              <ul className="list-disc pl-5">
                {rhythm.eliasChecklist.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
