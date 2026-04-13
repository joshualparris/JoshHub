const { createApp } = Vue;

window.app = createApp({
  data() {
    return {
      player: {
        name: "Adventurer",
        level: 1,
        str: 14,
        dex: 12,
        con: 13,
        int: 13,
        wis: 11,
        cha: 12,
        hp: 11,
        maxHp: 11,
      },
      inventory: ["Worn cloak", "Traveler's rations", "Rusty dagger"],
      gameLog: [
        {
          type: "narrative",
          text: "You arrive in Neverwinter as the city settles into twilight.",
        },
      ],
      currentLocationId: null,
      currentDialogue: { npcId: null, nodeId: null },
      userInput: "",
    };
  },
  computed: {
    strMod() {
      return Math.floor((this.player.str - 10) / 2);
    },
    dexMod() {
      return Math.floor((this.player.dex - 10) / 2);
    },
    conMod() {
      return Math.floor((this.player.con - 10) / 2);
    },
    intMod() {
      return Math.floor((this.player.int - 10) / 2);
    },
    wisMod() {
      return Math.floor((this.player.wis - 10) / 2);
    },
    chaMod() {
      return Math.floor((this.player.cha - 10) / 2);
    },
    armorClass() {
      return 10 + this.dexMod;
    },
    locations() {
      return this.$locations || window.LOCATIONS || [];
    },
    npcs() {
      return this.$npcs || window.NPCS || [];
    },
    lore() {
      return this.$lore || window.LORE || {};
    },
    currentLocation() {
      return this.locations.find((l) => l.id === this.currentLocationId) || this.locations[0] || null;
    },
    npcsInLocation() {
      if (!this.currentLocation) return [];
      return this.npcs.filter((n) => this.currentLocation.npcs.includes(n.id));
    },
    currentNPC() {
      if (!this.currentDialogue.npcId) return null;
      return this.npcs.find((n) => n.id === this.currentDialogue.npcId) || null;
    },
    currentNode() {
      if (!this.currentNPC || !this.currentDialogue.nodeId) return null;
      return this.currentNPC.dialogueTree[this.currentDialogue.nodeId] || null;
    },
    dialogueResponses() {
      return this.currentNode && this.currentNode.responses ? this.currentNode.responses : [];
    },
  },
  methods: {
    append(type, text) {
      this.gameLog.unshift({ type: type, text: text });
    },
    describeLocation() {
      if (!this.currentLocation) return;
      this.append("narrative", this.currentLocation.description);
      this.append("info", `Ambience: ${this.currentLocation.ambience}`);
      var loreForLoc = this.lore[this.currentLocation.id];
      if (loreForLoc && loreForLoc.length) {
        var pick = loreForLoc[Math.floor(Math.random() * loreForLoc.length)];
        this.append("lore", `Lore -- ${pick.title}: ${pick.text}`);
      }
    },
    travel(locationId) {
      var loc = this.locations.find((l) => l.id === locationId);
      if (!loc) return;
      this.currentLocationId = loc.id;
      this.currentDialogue = { npcId: null, nodeId: null };
      this.append("narrative", `You travel to ${loc.name}.`);
      this.describeLocation();
    },
    startDialogue(npcId) {
      var npc = this.npcs.find((n) => n.id === npcId);
      if (!npc) return;
      this.currentDialogue = { npcId: npc.id, nodeId: "start" };
      this.append("narrative", `${npc.name} (${npc.role}) turns to you.`);
      this.append("narrative", npc.dialogueTree.start.text);
    },
    chooseResponse(index) {
      if (!this.currentNode || !this.currentNPC) return;
      var resp = this.currentNode.responses[index];
      if (!resp) return;
      this.append("info", `You: ${resp.text}`);

      if (resp.item_required) {
        var hasItem = this.inventory.indexOf(resp.item_required) !== -1;
        if (!hasItem) {
          this.append("info", `You need ${resp.item_required} to proceed.`);
          return;
        }
      }

      if (resp.skill_check) {
        var result = window.skillCheck(resp.skill_check.skill, resp.skill_check.dc, this.player);
        var rollText = `${resp.skill_check.skill.toUpperCase()} check: d20 (${result.roll}) + ${result.mod} = ${result.total} vs DC ${result.dc}`;
        this.append(result.success ? "info" : "combat", rollText);
        var nextNode = result.success ? resp.nextNode : resp.failNode;
        if (!nextNode) {
          this.endDialogue();
          return;
        }
        this.moveDialogue(nextNode);
        return;
      }

      if (resp.nextNode) {
        this.moveDialogue(resp.nextNode);
      } else {
        this.endDialogue();
      }
    },
    moveDialogue(nodeId) {
      if (!this.currentNPC) return;
      var node = this.currentNPC.dialogueTree[nodeId];
      if (!node) {
        this.endDialogue();
        return;
      }
      this.currentDialogue.nodeId = nodeId;
      if (node.text) {
        this.append("narrative", node.text);
      }
      if (!node.responses || !node.responses.length) {
        this.append("info", "The conversation ends.");
      }
    },
    endDialogue() {
      this.currentDialogue = { npcId: null, nodeId: null };
      this.append("info", "Dialogue ended.");
    },
    showInventory() {
      this.append("info", `Inventory: ${this.inventory.join(", ")}`);
    },
    submitCommand() {
      var input = (this.userInput || "").trim();
      if (!input) return;
      this.userInput = "";
      this.append("info", `> ${input}`);

      var parts = input.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var rest = parts.slice(1).join(" ");

      if (cmd === "help") {
        this.append("info", "Commands: move <location>, look, talk <npc>, choose <number>, inventory");
        return;
      }

      if (cmd === "move") {
        if (!rest) {
          this.append("info", "Move where?");
          return;
        }
        var loc = this.locations.find(
          (l) => l.name.toLowerCase() === rest.toLowerCase() || l.id.toLowerCase() === rest.toLowerCase()
        );
        if (!loc) {
          this.append("info", "Unknown location.");
          return;
        }
        this.travel(loc.id);
        return;
      }

      if (cmd === "look") {
        this.describeLocation();
        return;
      }

      if (cmd === "talk") {
        if (!rest) {
          if (this.npcsInLocation.length) {
            this.startDialogue(this.npcsInLocation[0].id);
          } else {
            this.append("info", "No one is nearby.");
          }
          return;
        }
        var npc = this.npcs.find(
          (n) => n.name.toLowerCase() === rest.toLowerCase() || n.id.toLowerCase() === rest.toLowerCase()
        );
        if (!npc) {
          this.append("info", "No such NPC.");
          return;
        }
        this.startDialogue(npc.id);
        return;
      }

      if (cmd === "choose") {
        var idx = parseInt(parts[1], 10);
        if (isNaN(idx) || idx < 1) {
          this.append("info", "Choose which option? Example: choose 1");
          return;
        }
        this.chooseResponse(idx - 1);
        return;
      }

      if (cmd === "inventory") {
        this.showInventory();
        return;
      }

      this.append("info", "Unknown command. Type help.");
    },
  },
  mounted() {
    if (!this.currentLocationId && this.locations.length) {
      this.currentLocationId = this.locations[0].id;
    }
    if (this.currentLocation) {
      this.describeLocation();
    }
  },
});

