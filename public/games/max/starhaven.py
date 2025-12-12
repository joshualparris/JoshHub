# ==============================
# STARHAVEN: A TEXT MURDER MYSTERY (single file)
# ==============================
# Commands (examples):
#   help, look, map, go n/e/s/w, take [item], drop [item], inv, inspect [thing]
#   talk [name], accuse [name], arrest [name], use console, time, save, load, quit
#
# Win: Arrest the real killer, bring them (restrained) to COMMAND DECK, then "use console".
# Lose: Arrest the wrong person, or time hits 0 (station falls into the sun).
#
# Tip: "talk Mira", "inspect cufflink", "take cuffs", "map", "time"
# ==============================

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional
import json, os, random, textwrap

# ------- Utilities -------
def wrap(s: str) -> str: return "\n".join(textwrap.wrap(s, width=88))
def say(s: str = ""): print(wrap(s) if s else "")

# ------- World Data -------
DIRS = {"n": (0, -1), "s": (0, 1), "e": (1, 0), "w": (-1, 0)}

@dataclass
class Item:
    id: str
    name: str
    desc: str
    portable: bool = True

@dataclass
class Room:
    id: str
    name: str
    desc: str
    x: int
    y: int
    items: List[str] = field(default_factory=list)
    npcs: List[str] = field(default_factory=list)
    passable: bool = True

@dataclass
class NPC:
    id: str
    name: str
    title: str
    room: str
    alibi: str
    truth_when_innocent: str
    lie_when_guilty: str
    cooperative: bool = True
    arrested: bool = False

class Game:
    def __init__(self, seed: Optional[int] = None):
        self.rng = random.Random(seed)
        self.time = 60  # minutes until stellar impact
        self.rooms: Dict[str, Room] = {}
        self.items: Dict[str, Item] = {}
        self.npcs: Dict[str, NPC] = {}
        self.player_room = "atrium"
        self.inv: List[str] = []
        self.killer_id: str = ""
        self.killer_evidence: Dict[str, List[str]] = {}  # npc_id -> list of item_ids
        self.brigrm = "brig"
        self.cmdrm = "command"
        self._build_world()
        self._seed_case()

    # ----- World Setup -----
    def _add_room(self, id, name, desc, x, y, items=None, npcs=None):
        self.rooms[id] = Room(id, name, desc, x, y, items or [], npcs or [])

    def _add_item(self, id, name, desc, portable=True):
        self.items[id] = Item(id, name, desc, portable)

    def _add_npc(self, id, name, title, room, alibi, truth, lie):
        self.npcs[id] = NPC(id, name, title, room, alibi, truth, lie)

    def _build_world(self):
        # Map (5x3): y=0..2, x=0..4
        self._add_room("atrium", "Grand Atrium",
            "A vaulted hub of glass and brass. Guests murmur beneath a holographic sun.",
            2, 1, items=["cuffs"])
        self._add_room("gala", "Gala Dome",
            "A crystal hemisphere with a view of the star. Tables abandoned mid-toast.", 2, 0,
            items=["cufflink", "manifest"])
        self._add_room("labs", "Bio-Labs",
            "Sterile corridors and nutrient fog. Security panels blink amber.", 1, 0,
            items=["stimulant", "overwritten_log"])
        self._add_room("hangar", "Shuttle Hangar",
            "Docked skiffs hum softly. The escape shuttle is locked behind red bars.", 4, 1,
            items=["forged_card"])
        self._add_room("command", "Command Deck",
            "Tiered consoles and a captain’s chair. The Master Console awaits.", 3, 0,
            items=["thruster_invoice"])
        self._add_room("brig", "Security Brig",
            "Energy bars and cold benches. An arrest field projector hums.", 0, 1)
        self._add_room("gardens", "Starlight Gardens",
            "Bioluminescent vines wind around art installations.", 1, 2,
            items=["dna_fiber"])
        self._add_room("suites", "VIP Suites",
            "Private doors, hush-fields, and the perfume of old money.", 3, 2,
            items=["weapon_garrote"])
        self._add_room("service", "Service Ducts",
            "Tight passages. The station’s veins and secrets.", 4, 2,
            items=["maintenance_key"])
        self._add_room("observ", "Observatory",
            "A darkened lens toward eternity. One pane bears a smeared print.", 0, 0,
            items=["smeared_print"])

        # Items
        self._add_item("cuffs", "Restraint Cuffs", "Security-issue restraints. Required to arrest.")
        self._add_item("weapon_garrote", "Monofilament Garrote", "A deadly, almost invisible wire.")
        self._add_item("forged_card", "Forged Access Card", "Fake credentials to restricted areas.")
        self._add_item("overwritten_log", "Overwritten Maint Log", "Someone scrubbed a schedule entry.")
        self._add_item("cufflink", "Bloodied Cufflink", "A luxury cufflink marred by blood.")
        self._add_item("stimulant", "Stimulant Vial", "Keeps one wired through the night.")
        self._add_item("thruster_invoice", "Thruster Fuel Invoice", "Large purchase to adjust trajectory.")
        self._add_item("manifest", "Shuttle Manifest", "Lists who booked hangar access windows.")
        self._add_item("dna_fiber", "Microscopic Fiber", "Matches a rare weave—if tested.")
        self._add_item("smeared_print", "Smeared Fingerprint", "Partial, odd—like gel gloves were used.")
        self._add_item("maintenance_key", "Maintenance Master Key", "Opens service panels.")
        self._add_item("codes_token", "Master Codes Token",
                        "Decryption seed for trajectory lockout. Found only on the killer.", portable=False)

        # Suspects
        self._add_npc("voss", "Dr. Selene Voss", "biotech magnate", "labs",
                      "Was calibrating gene arrays in Bio-Labs.",
                      "You can ask the lab AI—my access badge logged me in at 23:10.",
                      "I never left the gala. Dozens saw me.")
        self._add_npc("rourke", "Admiral Kade Rourke", "retired fleet", "observ",
                      "Consulting star charts in the Observatory.",
                      "An ensign pinged me there; check the telescope usage logs.",
                      "I was in my suite polishing medals; no one saw me.")
        self._add_npc("chen", "Minister Lira Chen", "trade minister", "gala",
                      "Negotiating a treaty in the Gala Dome.",
                      "Security holo shows me on the dais at 23:40.",
                      "Alone in prayer in the gardens; no recordings.")
        self._add_npc("vale", "Orin Vale", "media baron", "suites",
                      "Interview prep in the VIP Suites.",
                      "My producer ping records prove I stayed in-suite.",
                      "I toured the labs with permission—routine stuff.")
        self._add_npc("das", "Prof. Mira Das", "AI ethicist", "atrium",
                      "Debating sentience law by the atrium sculpture.",
                      "The sculpture’s mic captured the debate; timestamped.",
                      "I took a quiet walk in the unmonitored ducts.")
        self._add_npc("pax", "Pax Morita", "chief engineer", "service",
                      "Inspecting service ducts after an anomaly.",
                      "Maintenance drone #7 tagged me on route S-Delta.",
                      "Chatting with donors in the Dome all evening.")

    def _seed_case(self):
        suspects = list(self.npcs.keys())
        self.killer_id = self.rng.choice(suspects)
        # Assign signature evidence sets (lightly thematic)
        evidence_pool = {
            "voss": ["dna_fiber", "stimulant", "forged_card"],
            "rourke": ["cufflink", "smeared_print", "thruster_invoice"],
            "chen": ["manifest", "forged_card", "weapon_garrote"],
            "vale": ["cufflink", "manifest", "stimulant"],
            "das": ["overwritten_log", "dna_fiber", "smeared_print"],
            "pax": ["maintenance_key", "overwritten_log", "thruster_invoice"],
        }
        self.killer_evidence = {sus: self.rng.sample(evidence_pool[sus], 3) for sus in suspects}

        # Scatter items somewhat plausibly
        movable = [iid for iid, it in self.items.items() if it.portable and iid != "codes_token"]
        drop_rooms = [rid for rid in self.rooms if rid not in (self.brigrm, self.cmdrm)]
        for iid in movable:
            placed = any(iid in r.items for r in self.rooms.values())
            if not placed:
                self.rooms[self.rng.choice(drop_rooms)].items.append(iid)

    # ----- Core Loop Helpers -----
    def room_at_xy(self, x, y) -> Optional[Room]:
        for r in self.rooms.values():
            if r.x == x and r.y == y and r.passable:
                return r
        return None

    def current_room(self) -> Room: return self.rooms[self.player_room]

    def spend(self, minutes: int = 1):
        self.time = max(0, self.time - minutes)
        if self.time == 0:
            say("\nThe station groans as safeties fail. Starhaven kisses the sun. All goes white.")
            raise SystemExit

    # ----- I/O -----
    def look(self):
        r = self.current_room()
        say(f"\n{r.name}\n{r.desc}")
        if r.items:
            say("Items here: " + ", ".join(self.items[i].name for i in r.items))
        if r.npcs:
            say("You see: " + ", ".join(self.npcs[n].name for n in r.npcs))
        exits = []
        for d, (dx, dy) in DIRS.items():
            if self.room_at_xy(self.current_room().x + dx, self.current_room().y + dy):
                exits.append(d)
        say("Exits: " + ", ".join(exits) if exits else "No exits.")
        self.spend(0)

    def show_map(self):
        xs = [r.x for r in self.rooms.values()]; ys = [r.y for r in self.rooms.values()]
        W, H = max(xs) + 1, max(ys) + 1
        grid = [["   "] * W for _ in range(H)]
        for r in self.rooms.values():
            label = r.name.split()[0][:3].upper()
            grid[r.y][r.x] = label
        px, py = self.current_room().x, self.current_room().y
        grid[py][px] = "[X]"
        say("\nSTARHAVEN DECK PLAN:")
        for y in range(H):
            say(" ".join(grid[y]))
        self.spend(0)

    def show_time(self):
        say(f"Time to solar impact: {self.time} minutes.")
        self.spend(0)

    def inv_show(self):
        if self.inv:
            say("You carry: " + ", ".join(self.items[i].name for i in self.inv))
        else:
            say("You carry nothing.")
        self.spend(0)

    # ----- Actions -----
    def move(self, d: str):
        d = d.lower()
        if d not in DIRS:
            say("Use: go n/e/s/w")
            return
        dx, dy = DIRS[d]
        r = self.current_room()
        target = self.room_at_xy(r.x + dx, r.y + dy)
        if not target:
            say("Access denied or bulkhead sealed.")
            return
        self.player_room = target.id
        self._sync_npcs_in_room()
        self.look()
        self.spend(2)

    def _sync_npcs_in_room(self):
        for rid in self.rooms:
            self.rooms[rid].npcs = [nid for nid, n in self.npcs.items() if n.room == rid and not n.arrested]

    def take(self, *args):
        if not args:
            say("Take what?")
            return
        name = " ".join(args).lower()
        r = self.current_room()
        iid = None
        for i in r.items:
            if self.items[i].name.lower() == name or i == name:
                iid = i; break
        if not iid:
            say("Not here.")
            return
        it = self.items[iid]
        if not it.portable:
            say("It’s fixed in place.")
            return
        r.items.remove(iid)
        self.inv.append(iid)
        say(f"You take the {it.name}.")
        self.spend(1)

    def drop(self, *args):
        if not args:
            say("Drop what?")
            return
        name = " ".join(args).lower()
        iid = None
        for i in self.inv:
            if self.items[i].name.lower() == name or i == name:
                iid = i; break
        if not iid:
            say("You don’t have that.")
            return
        self.inv.remove(iid)
        self.current_room().items.append(iid)
        say(f"You drop the {self.items[iid].name}.")
        self.spend(1)

    def inspect(self, *args):
        if not args:
            say("Inspect what?")
            return
        name = " ".join(args).lower()
        pool = list(self.inv) + list(self.current_room().items)
        for i in pool:
            it = self.items[i]
            if it.name.lower() == name or i == name:
                detail = it.desc
                if i in self.killer_evidence[self.killer_id]:
                    detail += " (Something about this ties uncomfortably close to the killer.)"
                say(detail)
                self.spend(1)
                return
        for nid in self.current_room().npcs:
            n = self.npcs[nid]
            if n.name.lower() == name or nid == name:
                say(f"{n.name}, {n.title}. {'Calm' if n.cooperative else 'Guarded'}.")
                self.spend(1)
                return
        say("You find nothing notable.")

    def talk(self, *args):
        if not args:
            say("Talk to whom?")
            return
        who = " ".join(args).lower()
        target_id = None
        for nid in self.current_room().npcs:
            n = self.npcs[nid]
            if n.name.lower() == who or nid == who:
                target_id = nid; break
        if not target_id:
            say("They aren’t here.")
            return
        n = self.npcs[target_id]
        guilty = (target_id == self.killer_id)
        line = n.lie_when_guilty if guilty else n.truth_when_innocent
        say(f"{n.name}: \"{line}\"")
        if not guilty and self.rng.random() < 0.25:
            n.cooperative = True
        self.spend(2)

    def accuse(self, *args):
        if not args:
            say("Accuse whom?")
            return
        who = " ".join(args).lower()
        if who not in [nid for nid in self.npcs]:
            matches = [nid for nid, n in self.npcs.items() if n.name.lower() == who]
            if not matches:
                say("Not a listed guest.")
                return
            who = matches[0]
        guilty = (who == self.killer_id)
        tips = self.killer_evidence[self.killer_id]
        say(f"You lay out your case against {self.npcs[who].name}.")
        if guilty:
            say("They blanch. A vein ticks. The room chills.")
            say(f"Key tells: {', '.join(self.items[e].name for e in tips)}.")
        else:
            say("They sneer. Those 'clues' don’t hold up. Doubt creeps in.")
        self.spend(3)

    def arrest(self, *args):
        if not args:
            say("Arrest whom?")
            return
        if "cuffs" not in self.inv:
            say("You need Restraint Cuffs to arrest.")
            return
        target_id = None
        for nid in self.current_room().npcs:
            n = self.npcs[nid]
            if n.name.lower() == " ".join(args).lower() or nid == " ".join(args).lower():
                target_id = nid; break
        if not target_id:
            say("They aren’t here.")
            return
        n = self.npcs[target_id]
        if n.arrested:
            say("Already restrained.")
            return
        n.arrested = True
        n.room = self.brigrm
        self._sync_npcs_in_room()
        if target_id == self.killer_id and "codes_token" not in self.rooms[self.brigrm].items:
            self.rooms[self.brigrm].items.append("codes_token")
        say(f"You restrain {n.name}. Security drones escort them to the Brig.")
        self.spend(3)

    def use_console(self):
        if self.player_room != self.cmdrm:
            say("You must be at the Master Console on the Command Deck.")
            return
        killer = self.killer_id
        kname = self.npcs[killer].name
        codes_here = "codes_token" in self.rooms[self.brigrm].items
        if codes_here:
            say("You splice in the Master Codes Token from the Brig. The lockout shudders…")
            say("Trajectory control restored. Starhaven veers away from the sun.")
            say(f"The killer was {kname}. Justice will follow.")
            say("\nYOU WIN.")
            raise SystemExit
        else:
            say("Console flashes: 'DECRYPTION SEED REQUIRED — (ARREST PERPETRATOR)'.")
            if any(n.arrested for n in self.npcs.values()):
                say("Someone is in the Brig… but the console rejects their credentials.")
                say("If you grabbed the wrong person, time is running out.")
            self.spend(1)

    # ----- Persistence -----
    def save(self, fn="starhaven_save.json"):
        data = dict(
            time=self.time,
            player_room=self.player_room,
            inv=self.inv,
            rooms={rid: dict(items=r.items, npcs=r.npcs) for rid, r in self.rooms.items()},
            npcs={nid: dict(room=n.room, arrested=n.arrested, coop=n.cooperative) for nid, n in self.npcs.items()},
            killer=self.killer_id,
            killer_evidence=self.killer_evidence,
        )
        with open(fn, "w") as f:
            json.dump(data, f)
        say("Saved.")

    def load(self, fn="starhaven_save.json"):
        if not os.path.exists(fn):
            say("No save found.")
            return
        with open(fn) as f:
            data = json.load(f)
        self.time = data["time"]; self.player_room = data["player_room"]; self.inv = data["inv"]
        for rid, stuff in data["rooms"].items():
            self.rooms[rid].items = stuff["items"]; self.rooms[rid].npcs = stuff["npcs"]
        for nid, stuff in data["npcs"].items():
            self.npcs[nid].room = stuff["room"]; self.npcs[nid].arrested = stuff["arrested"]; self.npcs[nid].cooperative = stuff["coop"]
        self.killer_id = data["killer"]; self.killer_evidence = data["killer_evidence"]
        say("Loaded.")

    # ----- Parser -----
    def run(self):
        say("Welcome to STARHAVEN. Type 'help' for commands.")
        self.look()
        while True:
            try:
                cmdline = input("> ").strip()
            except (EOFError, KeyboardInterrupt):
                say("\nGoodbye."); break
            if not cmdline:
                continue
            parts = cmdline.split()
            cmd, args = parts[0].lower(), parts[1:]

            if cmd in ("quit", "exit"):
                say("Goodbye."); break
            elif cmd == "help":
                say("Commands: help, look, map, go n/e/s/w, take [item], drop [item], inv, inspect [thing],")
                say("          talk [name], accuse [name], arrest [name], use console, time, save, load, quit")
            elif cmd == "look":
                self.look()
            elif cmd == "map":
                self.show_map()
            elif cmd == "time":
                self.show_time()
            elif cmd in ("go", "move"):
                if not args:
                    say("Go where? n/e/s/w"); continue
                self.move(args[0])
            elif cmd == "take":
                self.take(*args)
            elif cmd == "drop":
                self.drop(*args)
            elif cmd in ("inv", "inventory"):
                self.inv_show()
            elif cmd == "inspect":
                self.inspect(*args)
            elif cmd == "talk":
                self.talk(*args)
            elif cmd == "accuse":
                self.accuse(*args)
            elif cmd == "arrest":
                self.arrest(*args)
            elif cmd == "use" and args and args[0].lower() == "console":
                self.use_console()
            elif cmd == "save":
                self.save()
            elif cmd == "load":
                self.load()
            else:
                say("Unrecognized. Try 'help'.")
            if self.time <= 15 and self.time > 0:
                say(f"(Alarms intensify: {self.time} minutes left.)")

# ----- Run -----
if __name__ == "__main__":
    # Set a seed for reproducible killer/evidence by uncommenting:
    # game = Game(seed=42)
    game = Game()
    game.run()
