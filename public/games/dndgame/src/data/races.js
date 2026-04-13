export const RACES = [
  {
    id: "human",
    name: "Human",
    description: "Adaptable and resilient adventurers from every corner of the coast.",
    traits: "+1 to all abilities",
    bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }
  },
  {
    id: "elf",
    name: "Elf",
    description: "Keen-eyed wanderers with grace and magical intuition.",
    traits: "+2 DEX, +1 INT",
    bonuses: { str: 0, dex: 2, con: 0, int: 1, wis: 0, cha: 0 }
  },
  {
    id: "dwarf",
    name: "Dwarf",
    description: "Stone-tested defenders known for grit and discipline.",
    traits: "+2 CON, +1 WIS",
    bonuses: { str: 0, dex: 0, con: 2, int: 0, wis: 1, cha: 0 }
  },
  {
    id: "halfling",
    name: "Halfling",
    description: "Quick, lucky, and quietly fearless under pressure.",
    traits: "+2 DEX, +1 CHA",
    bonuses: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 1 }
  },
  {
    id: "tiefling",
    name: "Tiefling",
    description: "Clever survivors marked by infernal legacy.",
    traits: "+2 CHA, +1 INT",
    bonuses: { str: 0, dex: 0, con: 0, int: 1, wis: 0, cha: 2 }
  },
  {
    id: "dragonborn",
    name: "Dragonborn",
    description: "Proud warriors carrying draconic presence and force.",
    traits: "+2 STR, +1 CHA",
    bonuses: { str: 2, dex: 0, con: 0, int: 0, wis: 0, cha: 1 }
  }
];
