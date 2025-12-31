"use client";

import { useEffect, useMemo, useState } from "react";
import { Clipboard, Lightbulb, ListRestart, Music2, NotebookPen, Play, Sparkles, Wand2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { createNote } from "@/lib/db/actions";
import { useNotes } from "@/lib/db/hooks";
import { apps } from "@/data/apps";
import RollTableCard from "@/components/roll-table/roll-table";

const dndHooks = [
  "A village forgets its own name every dawn.",
  "A relic hums louder when lies are spoken nearby.",
  "A river runs uphill one night each month.",
  "A festival where everyone swaps voices for a day.",
  "A storm that rains tiny keys of unknown locks.",
  "A beacon that calls creatures from a parallel realm.",
  "A clocktower that strikes thirteen only when danger approaches.",
  "A cursed orchard that grows memories instead of fruit.",
  "A temple whose doors demand a story before opening.",
  "A mirror road that reflects travelers' futures in puddles.",
  "A lighthouse that signals to ships sailing the sky.",
  "A masquerade where masks bond to faces until truth is spoken.",
  "A border patrol of sentient ravens collecting tolls of secrets.",
  "A dungeon that rearranges itself at sunrise.",
  "A village lottery where winners become ghosts for a week.",
  "A crypt where bones rearrange into messages overnight.",
  "A caravan trading in laughter jars and bottled starlight.",
  "A bridge troll offering college scholarships to brave kids.",
  "A pilgrimage trail with stepping stones that float in midair.",
  "A town crier announcing headlines from tomorrow.",
  "A royal hunt for a stag that walks on water.",
  "A forge that tempers emotions into metal.",
  "A fair where wishes are auctioned to the highest bidder.",
  "A well that returns what you throw in, improved.",
  "A battlefield haunted by arguments rather than spirits.",
];
const dndNPCs = [
  "A penitent knight who refuses to touch metal.",
  "A cartographer who maps dreams.",
  "A child who speaks with an absent twin.",
  "A brewer infusing potions into ales.",
  "A courier riding a semi-sentient broom.",
  "A warlock bound to a sarcastic lantern.",
  "A librarian who speaks only in questions.",
  "A bard whose music summons weather patterns.",
  "A druid raising a garden of mechanical birds.",
  "A veteran who made peace with a dragon and won't fight again.",
  "A wizard addicted to low-risk illusions.",
  "A monk refusing gravity as a spiritual discipline.",
  "A necromancer practicing ethical aftercare for ghosts.",
  "A sailor with tide-sense implanted by a merfolk pact.",
  "A alchemist brewing memories as vintage year labels.",
  "A paladin with a code against certainty.",
  "A merchant who cannot lie but always misleads.",
  "A ranger tracking a song across continents.",
  "A noble who hires adventurers to choreograph duels.",
  "A tailor sewing armor from shed snake skins and rumors.",
  "An artificer whose inventions dream of being alive.",
  "A priest who blesses rivalries into friendships.",
  "A stablemaster specializing in unusual mounts.",
  "A scribe who edits prophecies for clarity.",
];
const dndLocations = [
  "A library carved inside a fossilized giant.",
  "A floating market on the back of a turtle.",
  "A chapel that only appears in reflections.",
  "A sunken amphitheater where ghosts debate.",
  "A bridge of rib bones over a magma river.",
  "A lighthouse that shines only underground.",
  "A city built around a sleeping colossus' footprints.",
  "A spiral canyon where echoes tell history.",
  "A glacier harboring a cathedral of blue fire.",
  "A desert shipyard launching dune-sailing caravels.",
  "A cliffside monastery with wind-carved prayer flutes.",
  "A bog riddled with lantern-lit memory trails.",
  "A starfall crater where gravity is whimsical.",
  "A vineyard irrigated by a silver river of moonlight.",
  "A mountain pass guarded by statues that walk at night.",
  "A coral palace emerging at low tide only.",
  "A village straddling the border of two planes.",
  "A clockwork garden pruning time itself.",
  "A forest of giant mushrooms that hum in harmony.",
  "A mine where veins of ore whisper bargains.",
  "A frozen waterfall containing trapped lightning.",
  "A market that rotates through realities every hour.",
  "A cemetery whose epitaphs update daily.",
];
const dndTwists = [
  "The villain is protecting something worse.",
  "The prophecy was mistranslated by one word.",
  "The cure requires forgetting a loved one.",
  "The artifact was meant to be destroyed, not used.",
  "The patron is secretly imprisoned nearby.",
  "The monster is a transformed ally seeking help.",
  "The quest-giver caused the disaster years ago.",
  "The rival party are future versions of the heroes.",
  "The map leads to a person, not a place.",
  "The king is a decoy; the real ruler is the scribe.",
  "The dragon wants to pay you for protection.",
  "The haunted site is alive and afraid.",
  "The sacred relic chooses to be mundane.",
  "The cure spreads by laughter, not potions.",
  "The chosen one refuses the role and it works.",
  "The dungeon is a training ground for pacifists.",
  "The villain is a collective dream.",
  "The war is a simulation to test diplomacy.",
  "The oath binds truth to silence.",
  "The mentor is your descendant.",
];

const storySeeds = [
  "A tiny dragon hides in a backpack on school day.",
  "A bedtime fort becomes a portal to cloud islands.",
  "A lost sock leads to a secret clubhouse of mice.",
  "A flashlight beam reveals invisible drawings on walls.",
  "A snow globe town sends letters asking for help.",
  "A kite learns your favorite song and sings in the wind.",
  "A library card unlocks a door to story characters' tea party.",
  "A garden gnome goes missing and leaves riddles in chalk.",
  "A puddle reflects a different sky with friendly constellations.",
  "A cardboard spaceship actually lands on the moon next door.",
  "A teddy bear becomes mayor of your bedroom while you sleep.",
  "A staircase grows a new step each time you learn a word.",
  "A lunchbox portal swaps snacks with a kid from another world.",
  "A playground slide whispers adventures to brave listeners.",
  "A bicycle bell calls helpful cats in tiny uniforms.",
  "A glow stick shows secret handshakes of squirrels.",
  "A sandcastle keeps growing overnight into a lighthouse.",
  "A raincoat invites clouds to play hide-and-seek.",
  "A math homework monster becomes your best tutor.",
  "A paper crane flock delivers wishes you forgot to make.",
];

export function StudioClient() {
  const notesRaw = useNotes();
  const notes = useMemo(() => notesRaw ?? [], [notesRaw]);
  const quickLaunch = useMemo(() => apps.slice(0, 6), []);
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
        tone="onDark"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DndGenerator />
        <StorySeeds />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GameDevBoard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Recovery Drill Simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-700 dark:text-slate-200">Quick access to the 90‑sec drill practice.</p>
            <div className="mt-3">
              <a href="/apps/drill-sim" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Open Drill Simulator</a>
            </div>
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
        <InspirationPanel />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-500" />
              D&D Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-neutral-700 dark:text-slate-200">Quick links to D&D helpers (local-first).</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href="/apps/initiative-tracker" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700">Initiative Tracker</a>
              <a href="/apps/character-builder" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700">Character Builder</a>
              <a href="/apps/combat-tracker" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700">Combat Tracker</a>
              <a href="/apps/encounter-builder" className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700">Encounter Builder</a>
            </div>
          </CardContent>
        </Card>
        <RollTableCard />
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

function GameDevBoard() {
  const notesRaw = useNotes();
  const notes = useMemo(() => notesRaw ?? [], [notesRaw]);
  const gamedevNotes = useMemo(
    () => notes.filter((n) => n.tags.includes("gamedev") || n.tags.includes("studio")).slice(0, 5),
    [notes]
  );
  const [prompts, setPrompts] = useState<string[]>([]);
  useEffect(() => {
    setPrompts(sampleMany(gameDevPrompts, 5));
  }, []);
  function reroll() {
    setPrompts(sampleMany(gameDevPrompts, 5));
  }
  async function savePack() {
    const body = prompts.map((p, i) => `${i + 1}. ${p}`).join("\n");
    await createNote({ title: "Game dev prompt pack", body, tags: ["studio", "gamedev"] });
  }
  return (
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
        <div className="rounded-md border border-neutral-200/80 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">Suggestions</p>
          <ul className="mt-2 space-y-2 text-sm text-neutral-800 dark:text-slate-100">
            {prompts.map((p) => (
              <li key={p} className="flex items-center justify-between gap-2">
                <span>{p}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await createNote({ title: "Game idea", body: p, tags: ["studio", "gamedev"] });
                    }}
                  >
                    <NotebookPen className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (navigator?.clipboard?.writeText) {
                        try {
                          await navigator.clipboard.writeText(p);
                        } catch (err) {
                          console.warn("Failed to copy suggestion", err);
                        }
                      }
                    }}
                  >
                    <Clipboard className="mr-1 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button onClick={reroll}>
              <Sparkles className="mr-2 h-4 w-4" />
              Reroll suggestions
            </Button>
            <Button variant="outline" onClick={savePack} disabled={prompts.length === 0}>
              <NotebookPen className="mr-2 h-4 w-4" />
              Save pack
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const gameDevPrompts = [
  "Mechanic: rewind three seconds at a resource cost.",
  "Theme: kindness as a competitive advantage.",
  "Boss idea: shapeshifts into your worst habits.",
  "Level gimmick: gravity tilts with music tempo.",
  "Economy: trade secrets, not coins.",
  "Traversal: paint paths that solidify for ten seconds.",
  "Combat twist: apologize to reduce enemy morale.",
  "Puzzle: align shadows to reveal safe routes.",
  "NPC: cartographer who maps emotions.",
  "Quest: escort a song through dangerous silence.",
  "UI: heartbeat-driven color shifts for damage feedback.",
  "Meta: levels remember how you failed and help next time.",
  "Collectible: memories that unlock ability variants.",
  "Camera: diorama tilt that hints at hidden lanes.",
  "Co-op: asymmetrical roles swapping each round.",
  "Stealth: footprints visible only in moonlight.",
  "Roguelite: perks that expire unless shared.",
  "Platformer: jump charges from joyful actions.",
  "Narrative: kindness unlocks secret boss dialogue.",
  "Progression: choose virtues instead of stats.",
  "Crafting: recipes discovered by humming melodies.",
  "Exploration: fog reveals when you slow down.",
  "Encounter: enemies negotiate after the third hit.",
  "Weapon: umbrella that parries rain and bullets.",
  "Resource: courage tracked as a visible aura.",
  "HUD: minimal, diegetic wristband indicators.",
  "Skill: whistle to call environmental helpers.",
  "Movement: wall-run on words painted on walls.",
  "Enemy: mirror version that copies only bad choices.",
  "World: city built inside a moving creature.",
];

function DndGenerator() {
  const [hook, setHook] = useState("");
  const [npc, setNpc] = useState("");
  const [location, setLocation] = useState("");
  const [twist, setTwist] = useState("");
  const [copied, setCopied] = useState(false);

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

  async function copy() {
    const content = `Hook: ${hook}\nNPC: ${npc}\nLocation: ${location}\nTwist: ${twist}`;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  useEffect(() => {
    generate();
  }, []);

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
          <Row label="Hook" value={hook} onReroll={() => setHook(randomOf(dndHooks))} />
          <Row label="NPC" value={npc} onReroll={() => setNpc(randomOf(dndNPCs))} />
          <Row label="Location" value={location} onReroll={() => setLocation(randomOf(dndLocations))} />
          <Row label="Twist" value={twist} onReroll={() => setTwist(randomOf(dndTwists))} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} data-xp-event="dnd:idea:generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <Button variant="outline" onClick={save} disabled={!hook && !npc && !location && !twist} data-xp-event="dnd:idea:save">
            <NotebookPen className="mr-2 h-4 w-4" />
            Save as note
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              // save then copy single-line
              if (!hook && !npc && !location && !twist) return;
              await save();
              const single = `${hook} — ${npc} — ${location} — ${twist}`;
                  if (navigator?.clipboard?.writeText) {
                    try {
                      await navigator.clipboard.writeText(single);
                    } catch (err) {
                      console.error("Failed to copy idea", err);
                    }
                  }
                }}
                disabled={!hook && !npc && !location && !twist}
              >
                <NotebookPen className="mr-2 h-4 w-4" />
                Save & Copy
          </Button>
          <Button variant="secondary" onClick={copy} disabled={!hook && !npc && !location && !twist}>
            <Clipboard className="mr-2 h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const single = `${hook} — ${npc} — ${location} — ${twist}`;
              if (navigator?.clipboard?.writeText) {
                try {
                  await navigator.clipboard.writeText(single);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch (err) {
                  console.error("Failed to copy idea", err);
                }
              }
            }}
            disabled={!hook && !npc && !location && !twist}
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Copy single-line
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

function Row({ label, value, onReroll }: { label: string; value: string; onReroll?: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded border border-neutral-200/80 bg-white/80 p-2 text-sm text-neutral-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
      <div>
        <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">{label}</div>
        <div>{value || "—"}</div>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <Button size="sm" variant="outline" onClick={handleCopy} aria-label={`Copy ${label}`}>
            <Clipboard className="mr-1 h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
        {onReroll && (
          <Button size="sm" variant="ghost" data-xp-event="dnd:idea:reroll" onClick={onReroll}>
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function randomOf(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sampleMany(arr: string[], n: number) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function InspirationPanel() {
  const [points, setPoints] = useState(0);
  const [log, setLog] = useState<{ id: string; action: string; ts: number }[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("joshhub:inspiration");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.points === "number") setPoints(parsed.points);
        if (Array.isArray(parsed.log)) setLog(parsed.log);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("joshhub:inspiration", JSON.stringify({ points, log }));
  }, [points, log]);

  function update(delta: number, label: string) {
    setPoints((prev) => Math.max(0, prev + delta));
    setLog((prev) => [{ id: crypto.randomUUID(), action: label, ts: Date.now() }, ...prev].slice(0, 5));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListRestart className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          Inspiration / Hero Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-neutral-700 dark:text-slate-200">
          Track earned/spent inspiration or hero points across sessions. Stored locally.
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white/70 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">Current</div>
          <div className="text-lg font-semibold text-neutral-900 dark:text-white">{points}</div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => update(1, "Earned inspiration")} data-xp-event="dnd:insp:earn">
              + Earn
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => update(-1, "Spent inspiration")}
              disabled={points === 0}
              data-xp-event="dnd:insp:spend"
            >
              - Spend
            </Button>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-slate-400">Recent</p>
          {log.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-slate-300">No inspiration changes yet.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm text-neutral-800 dark:text-slate-100">
              {log.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between text-xs">
                  <span>{entry.action}</span>
                  <span className="text-neutral-500 dark:text-slate-400">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
