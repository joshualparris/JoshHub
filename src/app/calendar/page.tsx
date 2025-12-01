"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, useEvents } from "@/lib/db/events";

export default function CalendarPage() {
  const events = useEvents();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const upcoming = useMemo(
    () =>
      (events ?? [])
        .filter((e) => e.endIso >= new Date().toISOString())
        .sort((a, b) => a.startIso.localeCompare(b.startIso)),
    [events]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!title || !start || !end) return;
    await createEvent({
      title,
      startIso: start,
      endIso: end,
      location,
      notes,
      tags: [],
    });
    setTitle("");
    setStart("");
    setEnd("");
    setLocation("");
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Calendar</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Manual events</h1>
        <p className="text-neutral-600">Add local events and see upcoming agenda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Textarea
              className="md:col-span-2"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="md:col-span-2">
              <Button type="submit">Add event</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-600">No upcoming events.</p>
          ) : (
            upcoming.map((ev) => (
              <div
                key={ev.id}
                className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium text-neutral-900">{ev.title}</p>
                <p className="text-neutral-600">
                  {new Date(ev.startIso).toLocaleString()} →{" "}
                  {new Date(ev.endIso).toLocaleString()}
                </p>
                {ev.location && <p className="text-neutral-600">Location: {ev.location}</p>}
                {ev.notes && <p className="text-neutral-600">{ev.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
