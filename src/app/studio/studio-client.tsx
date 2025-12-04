"use client";

import { useMemo, useState } from "react";
import { Lightbulb, ListRestart, Music2, NotebookPen, Play, Sparkles, Wand2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { createNote } from "@/lib/db/actions";
import { useNotes } from "@/lib/db/hooks";
import { apps } from "@/data/apps";

const dndHooks = [
  "A village forgets its own name every dawn.",
  "A relic hums louder when lies are spoken nearby.",
  "A river runs uphill one night each month.",
];
const dndNPCs = [
  "A penitent knight who refuses to touch metal.",
  "A cartographer who maps dreams.",
  "A child who speaks with an absent twin.",
];
const dndLocations = [
  "A library carved inside a fossilized giant.",
  "A floating market on the back of a turtle.",
  "A chapel that only appears in reflections.",
];
const dndTwists = [
  "The villain is protecting something worse.",
  "The prophecy was mistranslated by one word.",
  "The cure requires forgetting a loved one.",
];

const storySeeds = [
  "A tiny dragon hides in a backpack on school day.",
  "A bedtime fort becomes a portal to cloud islands.",
  "A lost sock leads to a secret clubhouse of mice.",
  "A flashlight beam reveals invisible drawings on walls.",
];

export function StudioClient() {
  const notes = useNotes() ?? [];
  const quickLaunch = useMemo(() => apps.slice(0, 6), []);
  const gamedevNotes = useMemo(
    () => notes.filter((n) => n.tags.includes("gamedev") || n.tags.includes("studio")).slice(0, 5),
    [notes]
  );
  const joyNotes = useMemo(
    () => notes.filter((n) => n.tags.includes("joy")).slice(0, 5),
    [notes]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Studio"
        title="JoshHub Studio"
        subtitle="A playful corner for D&D, stories, and logging quick wins — all saved locally."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DndGenerator />
        <StorySeeds />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Game-dev Board
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => createNote({ title: "New game idea", tags: ["studio", "gamedev"] })}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              New idea
            </Button>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              {gamedevNotes.length === 0 ? (
                <li className="text-neutral-500 dark:text-slate-400">No game ideas yet.</li>
              ) : (
                gamedevNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-md border border-neutral-200/80 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <p className="font-medium text-neutral-900 dark:text-slate-50">{note.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-emerald-500" />
              Joy Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => createNote({ title: "Joy win", tags: ["studio", "joy"] })}
            >
              <Play className="mr-2 h-4 w-4" />
              Log a win
            </Button>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-slate-200">
              {joyNotes.length === 0 ? (
                <li className="text-neutral-500 dark:text-slate-400">No joy logs yet.</li>
              ) : (
                joyNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-md border border-neutral-200/80 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <p className="font-medium text-neutral-900 dark:text-slate-50">{note.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">
                      {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListRestart className="h-5 w-5 text-sky-500" />
            Quick launches
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {quickLaunch.map((item) => (
            <a
              key={item.id}
              href={item.primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
            >
              <p className="font-semibold text-neutral-900 transition group-hover:text-sky-700 dark:text-slate-50 dark:group-hover:text-sky-200">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-slate-400">{item.category}</p>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DndGenerator() {
  const [hook, setHook] = useState("");
  const [npc, setNpc] = useState("");
  const [location, setLocation] = useState("");
  const [twist, setTwist] = useState("");

  function generate() {
    setHook(randomOf(dndHooks));
    setNpc(randomOf(dndNPCs));
    setLocation(randomOf(dndLocations));
    setTwist(randomOf(dndTwists));
  }

  async function save() {
    const content = `Hook: ${hook}\nNPC: ${npc}\nLocation: ${location}\nTwist: ${twist}`;
    await createNote({ title: "D&D idea", body: content, tags: ["studio", "dnd"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          D&D Idea Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 rounded-md border border-neutral-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <Row label="Hook" value={hook} />
          <Row label="NPC" value={npc} />
          <Row label="Location" value={location} />
          <Row label="Twist" value={twist} />
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <Button variant="outline" onClick={save} disabled={!hook && !npc && !location && !twist}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Save as note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StorySeeds() {
  const [seed, setSeed] = useState("");

  function generate() {
    setSeed(randomOf(storySeeds));
  }

  async function save() {
    await createNote({ title: "Story seed", body: seed, tags: ["studio", "story"] });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-500" />
          Story Seeds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-neutral-200 bg-white/80 p-3 text-sm text-neutral-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
          {seed || "Generate a bedtime seed"}
        </div>
        <div className="flex gap-2">
          <Button onClick={generate}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate seed
          </Button>
          <Button variant="outline" onClick={save} disabled={!seed}>
            <NotebookPen className="mr-2 h-4 w-4" />
            Save as note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</p>
      <p className="text-sm text-neutral-800 dark:text-slate-100">{value || "—"}</p>
    </div>
  );
}

function randomOf(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
