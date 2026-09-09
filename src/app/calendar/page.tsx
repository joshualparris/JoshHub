"use client";

import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { isUpcomingEvent, localDateTimeInputToIso, sortEventsByStart } from "@/lib/calendar/time";
import { createEvent, useEvents } from "@/lib/db/events";

export default function CalendarPage() {
  const events = useEvents();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const upcoming = useMemo(
    () => sortEventsByStart((events ?? []).filter((event) => isUpcomingEvent(event))),
    [events]
  );

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !start || !end) {
      setError("Title, start and end are required.");
      return;
    }

    try {
      const startIso = localDateTimeInputToIso(start);
      const endIso = localDateTimeInputToIso(end);
      if (Date.parse(endIso) <= Date.parse(startIso)) {
        setError("End time must be after start time.");
        return;
      }

      await createEvent({
        title: title.trim(),
        startIso,
        endIso,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        tags: [],
      });
      setTitle("");
      setStart("");
      setEnd("");
      setLocation("");
      setNotes("");
    } catch {
      setError("Enter valid start and end times.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Calendar"
        title="Manual events"
        subtitle="Add local events and see upcoming agenda."
      />

      <Card>
        <CardHeader>
          <CardTitle>New event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onAdd}>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
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
            {error && (
              <p className="text-sm text-red-700 dark:text-red-300 md:col-span-2" role="alert">
                {error}
              </p>
            )}
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
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            upcoming.map((ev) => (
              <div
                key={ev.id}
                className="rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground"
              >
                <p className="font-medium">{ev.title}</p>
                <p className="text-muted-foreground">
                  {new Date(ev.startIso).toLocaleString()} → {new Date(ev.endIso).toLocaleString()}
                </p>
                {ev.location && <p className="text-muted-foreground">Location: {ev.location}</p>}
                {ev.notes && <p className="text-muted-foreground">{ev.notes}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
