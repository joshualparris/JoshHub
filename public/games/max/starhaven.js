export function createStarhaven(write, setStatus, onEnd) {
  const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

  class Item {
    constructor(id, name, desc, portable = true) {
      this.id = id; this.name = name; this.desc = desc; this.portable = portable;
    }
  }
  class Room {
    constructor(id, name, desc, x, y, items = [], npcs = []) {
      this.id = id; this.name = name; this.desc = desc; this.x = x; this.y = y;
      this.items = items; this.npcs = npcs; this.passable = true;
    }
  }
  class NPC {
    constructor(id, name, title, room, alibi, truth, lie) {
      this.id = id; this.name = name; this.title = title; this.room = room;
      this.alibi = alibi; this.truth_when_innocent = truth; this.lie_when_guilty = lie;
      this.cooperative = true; this.arrested = false;
    }
  }

  class Game {
    constructor(seed) {
      this.rng = seed ? new Random(seed) : new Random();
      this.time = 60;
      this.rooms = {};
      this.items = {};
      this.npcs = {};
      this.player_room = "atrium";
      this.inv = [];
      this.killer_id = "";
      this.killer_evidence = {};
      this.brigrm = "brig";
      this.cmdrm = "command";
      this.finished = false;
      this._build_world();
      this._seed_case();
      this.look();
    }

    _add_room(id, name, desc, x, y, items, npcs) { this.rooms[id] = new Room(id, name, desc, x, y, items || [], npcs || []); }
    _add_item(id, name, desc, portable = true) { this.items[id] = new Item(id, name, desc, portable); }
    _add_npc(id, name, title, room, alibi, truth, lie) { this.npcs[id] = new NPC(id, name, title, room, alibi, truth, lie); }

    _build_world() {
      this._add_room("atrium", "Grand Atrium", "A vaulted hub of glass and brass. Guests murmur beneath a holographic sun.", 2, 1, ["cuffs"]);
      this._add_room("gala", "Gala Dome", "A crystal hemisphere with a view of the star. Tables abandoned mid-toast.", 2, 0, ["cufflink", "manifest"]);
      this._add_room("labs", "Bio-Labs", "Sterile corridors and nutrient fog. Security panels blink amber.", 1, 0, ["stimulant", "overwritten_log"]);
      this._add_room("hangar", "Shuttle Hangar", "Docked skiffs hum softly. The escape shuttle is locked behind red bars.", 4, 1, ["forged_card"]);
      this._add_room("command", "Command Deck", "Tiered consoles and a captain’s chair. The Master Console awaits.", 3, 0, ["thruster_invoice"]);
      this._add_room("brig", "Security Brig", "Energy bars and cold benches. An arrest field projector hums.", 0, 1);
      this._add_room("gardens", "Starlight Gardens", "Bioluminescent vines wind around art installations.", 1, 2, ["dna_fiber"]);
      this._add_room("suites", "VIP Suites", "Private doors, hush-fields, and the perfume of old money.", 3, 2, ["weapon_garrote"]);
      this._add_room("service", "Service Ducts", "Tight passages. The station’s veins and secrets.", 4, 2, ["maintenance_key"]);
      this._add_room("observ", "Observatory", "A darkened lens toward eternity. One pane bears a smeared print.", 0, 0, ["smeared_print"]);

      this._add_item("cuffs", "Restraint Cuffs", "Security-issue restraints. Required to arrest.");
      this._add_item("weapon_garrote", "Monofilament Garrote", "A deadly, almost invisible wire.");
      this._add_item("forged_card", "Forged Access Card", "Fake credentials to restricted areas.");
      this._add_item("overwritten_log", "Overwritten Maint Log", "Someone scrubbed a schedule entry.");
      this._add_item("cufflink", "Bloodied Cufflink", "A luxury cufflink marred by blood.");
      this._add_item("stimulant", "Stimulant Vial", "Keeps one wired through the night.");
      this._add_item("thruster_invoice", "Thruster Fuel Invoice", "Large purchase to adjust trajectory.");
      this._add_item("manifest", "Shuttle Manifest", "Lists who booked hangar access windows.");
      this._add_item("dna_fiber", "Microscopic Fiber", "Matches a rare weave—if tested.");
      this._add_item("smeared_print", "Smeared Fingerprint", "Partial, odd—like gel gloves were used.");
      this._add_item("maintenance_key", "Maintenance Master Key", "Opens service panels.");
      this._add_item("codes_token", "Master Codes Token", "Decryption seed for trajectory lockout. Found only on the killer.", false);

      this._add_npc("voss", "Dr. Selene Voss", "biotech magnate", "labs",
        "Was calibrating gene arrays in Bio-Labs.",
        "You can ask the lab AI—my access badge logged me in at 23:10.",
        "I never left the gala. Dozens saw me.");
      this._add_npc("rourke", "Admiral Kade Rourke", "retired fleet", "observ",
        "Consulting star charts in the Observatory.",
        "An ensign pinged me there; check the telescope usage logs.",
        "I was in my suite polishing medals; no one saw me.");
      this._add_npc("chen", "Minister Lira Chen", "trade minister", "gala",
        "Negotiating a treaty in the Gala Dome.",
        "Security holo shows me on the dais at 23:40.",
        "Alone in prayer in the gardens; no recordings.");
      this._add_npc("vale", "Orin Vale", "media baron", "suites",
        "Interview prep in the VIP Suites.",
        "My producer ping records prove I stayed in-suite.",
        "I toured the labs with permission—routine stuff.");
      this._add_npc("das", "Prof. Mira Das", "AI ethicist", "atrium",
        "Debating sentience law by the atrium sculpture.",
        "The sculpture’s mic captured the debate; timestamped.",
        "I took a quiet walk in the unmonitored ducts.");
      this._add_npc("pax", "Pax Morita", "chief engineer", "service",
        "Inspecting service ducts after an anomaly.",
        "Maintenance drone #7 tagged me on route S-Delta.",
        "Chatting with donors in the Dome all evening.");
    }

    _seed_case() {
      const suspects = Object.keys(this.npcs);
      this.killer_id = suspects[Math.floor(Math.random() * suspects.length)];
      const evidence_pool = {
        voss: ["dna_fiber", "stimulant", "forged_card"],
        rourke: ["cufflink", "smeared_print", "thruster_invoice"],
        chen: ["manifest", "forged_card", "weapon_garrote"],
        vale: ["cufflink", "manifest", "stimulant"],
        das: ["overwritten_log", "dna_fiber", "smeared_print"],
        pax: ["maintenance_key", "overwritten_log", "thruster_invoice"],
      };
      this.killer_evidence = {};
      for (const sus of suspects) {
        this.killer_evidence[sus] = shuffle(evidence_pool[sus].slice(), this.rng).slice(0, 3);
      }
      const movable = Object.keys(this.items).filter((iid) => this.items[iid].portable && iid !== "codes_token");
      const drop_rooms = Object.keys(this.rooms).filter((rid) => ![this.brigrm, this.cmdrm].includes(rid));
      for (const iid of movable) {
        const placed = Object.values(this.rooms).some((r) => r.items.includes(iid));
        if (!placed) {
          const room = drop_rooms[Math.floor(Math.random() * drop_rooms.length)];
          this.rooms[room].items.push(iid);
        }
      }
    }

    say(text) { write(text); }

    spend(minutes = 1) {
      this.time = Math.max(0, this.time - minutes);
      if (this.time === 0) {
        this.say("\nThe station groans as safeties fail. Starhaven kisses the sun. All goes white.\nYOU LOSE.");
        this.finished = true;
        onEnd();
      }
    }

    room_at_xy(x, y) {
      return Object.values(this.rooms).find((r) => r.x === x && r.y === y && r.passable);
    }
    current_room() { return this.rooms[this.player_room]; }

    look() {
      const r = this.current_room();
      this.say(`\n${r.name}\n${r.desc}`);
      if (r.items.length) this.say("Items here: " + r.items.map((i) => this.items[i].name).join(", "));
      if (r.npcs.length) this.say("You see: " + r.npcs.map((n) => this.npcs[n].name).join(", "));
      const exits = [];
      for (const [d, [dx, dy]] of Object.entries(DIRS)) {
        if (this.room_at_xy(r.x + dx, r.y + dy)) exits.push(d);
      }
      this.say(exits.length ? "Exits: " + exits.join(", ") : "No exits.");
      this.spend(0);
    }

    show_map() {
      const xs = Object.values(this.rooms).map((r) => r.x);
      const ys = Object.values(this.rooms).map((r) => r.y);
      const W = Math.max(...xs) + 1, H = Math.max(...ys) + 1;
      const grid = Array.from({ length: H }, () => Array.from({ length: W }, () => "   "));
      for (const r of Object.values(this.rooms)) {
        const label = r.name.split(" ")[0].slice(0, 3).toUpperCase();
        grid[r.y][r.x] = label;
      }
      const { x, y } = this.current_room();
      grid[y][x] = "[X]";
      this.say("\nSTARHAVEN DECK PLAN:");
      for (let row of grid) this.say(row.join(" "));
      this.spend(0);
    }

    show_time() { this.say(`Time to solar impact: ${this.time} minutes.`); this.spend(0); }
    inv_show() {
      if (this.inv.length) this.say("You carry: " + this.inv.map((i) => this.items[i].name).join(", "));
      else this.say("You carry nothing.");
      this.spend(0);
    }

    move(d) {
      d = d.toLowerCase();
      if (!DIRS[d]) { this.say("Use: go n/e/s/w"); return; }
      const [dx, dy] = DIRS[d];
      const r = this.current_room();
      const target = this.room_at_xy(r.x + dx, r.y + dy);
      if (!target) { this.say("Access denied or bulkhead sealed."); return; }
      this.player_room = target.id;
      this._sync_npcs_in_room();
      this.look();
      this.spend(2);
    }

    _sync_npcs_in_room() {
      for (const rid of Object.keys(this.rooms)) {
        this.rooms[rid].npcs = Object.keys(this.npcs).filter((nid) => this.npcs[nid].room === rid && !this.npcs[nid].arrested);
      }
    }

    take(...args) {
      if (!args.length) { this.say("Take what?"); return; }
      const name = args.join(" ").toLowerCase();
      const r = this.current_room();
      const iid = r.items.find((i) => this.items[i].name.toLowerCase() === name || i === name);
      if (!iid) { this.say("Not here."); return; }
      const it = this.items[iid];
      if (!it.portable) { this.say("It’s fixed in place."); return; }
      r.items = r.items.filter((i) => i !== iid);
      this.inv.push(iid);
      this.say(`You take the ${it.name}.`);
      this.spend(1);
    }

    drop(...args) {
      if (!args.length) { this.say("Drop what?"); return; }
      const name = args.join(" ").toLowerCase();
      const iid = this.inv.find((i) => this.items[i].name.toLowerCase() === name || i === name);
      if (!iid) { this.say("You don’t have that."); return; }
      this.inv = this.inv.filter((i) => i !== iid);
      this.current_room().items.push(iid);
      this.say(`You drop the ${this.items[iid].name}.`);
      this.spend(1);
    }

    inspect(...args) {
      if (!args.length) { this.say("Inspect what?"); return; }
      const name = args.join(" ").toLowerCase();
      const pool = [...this.inv, ...this.current_room().items];
      for (const i of pool) {
        const it = this.items[i];
        if (it.name.toLowerCase() === name || i === name) {
          let detail = it.desc;
          if (this.killer_evidence[this.killer_id].includes(i)) detail += " (This ties uncomfortably close to the killer.)";
          this.say(detail); this.spend(1); return;
        }
      }
      for (const nid of this.current_room().npcs) {
        const n = this.npcs[nid];
        if (n.name.toLowerCase() === name || nid === name) {
          this.say(`${n.name}, ${n.title}. ${n.cooperative ? "Calm" : "Guarded"}.`);
          this.spend(1); return;
        }
      }
      this.say("You find nothing notable.");
    }

    talk(...args) {
      if (!args.length) { this.say("Talk to whom?"); return; }
      const whoName = args.join(" ").toLowerCase();
      const target_id = this.current_room().npcs.find((nid) => {
        const n = this.npcs[nid];
        return n.name.toLowerCase() === whoName || nid === whoName;
      });
      if (!target_id) { this.say("They aren’t here."); return; }
      const n = this.npcs[target_id];
      const guilty = target_id === this.killer_id;
      const line = guilty ? n.lie_when_guilty : n.truth_when_innocent;
      this.say(`${n.name}: "${line}"`);
      if (!guilty && Math.random() < 0.25) n.cooperative = true;
      this.spend(2);
    }

    accuse(...args) {
      if (!args.length) { this.say("Accuse whom?"); return; }
      let who = args.join(" ").toLowerCase();
      if (!this.npcs[who]) {
        const matches = Object.keys(this.npcs).filter((nid) => this.npcs[nid].name.toLowerCase() === who);
        if (!matches.length) { this.say("Not a listed guest."); return; }
        who = matches[0];
      }
      const guilty = who === this.killer_id;
      const tips = this.killer_evidence[this.killer_id];
      this.say(`You lay out your case against ${this.npcs[who].name}.`);
      if (guilty) {
        this.say("They blanch. A vein ticks. The room chills.");
        this.say("Key tells: " + tips.map((e) => this.items[e].name).join(", ") + ".");
      } else {
        this.say("They sneer. Those 'clues' don’t hold up. Doubt creeps in.");
      }
      this.spend(3);
    }

    arrest(...args) {
      if (!args.length) { this.say("Arrest whom?"); return; }
      if (!this.inv.includes("cuffs")) { this.say("You need Restraint Cuffs to arrest."); return; }
      const whoName = args.join(" ").toLowerCase();
      const target_id = this.current_room().npcs.find((nid) => {
        const n = this.npcs[nid];
        return n.name.toLowerCase() === whoName || nid === whoName;
      });
      if (!target_id) { this.say("They aren’t here."); return; }
      const n = this.npcs[target_id];
      if (n.arrested) { this.say("Already restrained."); return; }
      n.arrested = true; n.room = this.brigrm;
      this._sync_npcs_in_room();
      if (target_id === this.killer_id && !this.rooms[this.brigrm].items.includes("codes_token")) {
        this.rooms[this.brigrm].items.push("codes_token");
      }
      this.say(`You restrain ${n.name}. Security drones escort them to the Brig.`);
      this.spend(3);
    }

    use_console() {
      if (this.player_room !== this.cmdrm) { this.say("You must be at the Master Console on the Command Deck."); return; }
      const codes_here = this.rooms[this.brigrm].items.includes("codes_token");
      const killerName = this.npcs[this.killer_id].name;
      if (codes_here) {
        this.say("You splice in the Master Codes Token from the Brig. The lockout shudders…");
        this.say("Trajectory control restored. Starhaven veers away from the sun.");
        this.say(`The killer was ${killerName}. Justice will follow.\nYOU WIN.`);
        this.finished = true; onEnd();
      } else {
        this.say("Console flashes: 'DECRYPTION SEED REQUIRED — (ARREST PERPETRATOR)'.");
        if (Object.values(this.npcs).some((n) => n.arrested)) {
          this.say("Someone is in the Brig… but the console rejects their credentials.");
          this.say("If you grabbed the wrong person, time is running out.");
        }
        this.spend(1);
      }
    }

    handleCommand(cmdline) {
      if (this.finished) return;
      const parts = cmdline.trim().split(/\s+/);
      if (!parts.length) return;
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (cmd === "quit" || cmd === "exit") { this.say("Goodbye."); this.finished = true; onEnd(); return; }
      if (cmd === "help") {
        this.say("Commands: help, look, map, go n/e/s/w, take [item], drop [item], inv, inspect [thing],");
        this.say("          talk [name], accuse [name], arrest [name], use console, time");
        return;
      }
      if (cmd === "look") return this.look();
      if (cmd === "map") return this.show_map();
      if (cmd === "time") return this.show_time();
      if (cmd === "go" || cmd === "move") {
        if (!args.length) { this.say("Go where? n/e/s/w"); return; }
        return this.move(args[0]);
      }
      if (cmd === "take") return this.take(...args);
      if (cmd === "drop") return this.drop(...args);
      if (cmd === "inv" || cmd === "inventory") return this.inv_show();
      if (cmd === "inspect") return this.inspect(...args);
      if (cmd === "talk") return this.talk(...args);
      if (cmd === "accuse") return this.accuse(...args);
      if (cmd === "arrest") return this.arrest(...args);
      if (cmd === "use" && args[0] && args[0].toLowerCase() === "console") return this.use_console();
      this.say("Unrecognized. Try 'help'.");
      if (this.time <= 15 && this.time > 0) this.say(`(Alarms intensify: ${this.time} minutes left.)`);
    }
  }

  class Random {
    constructor(seed = Date.now()) {
      this.seed = seed % 2147483647;
      if (this.seed <= 0) this.seed += 2147483646;
    }
    next() { return this.seed = this.seed * 16807 % 2147483647; }
    random() { return (this.next() - 1) / 2147483646; }
  }
  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((rng ? rng.random() : Math.random()) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  write("Welcome to STARHAVEN. Type 'help' for commands.");
  const game = new Game();
  setStatus("Type commands: help, look, map, go n/e/s/w, take, talk, accuse, arrest, use console...");
  return {
    handleCommand: (cmd) => game.handleCommand(cmd),
  };
}
