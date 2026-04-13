export const CLASSES = [
  {
    id: "fighter",
    name: "Fighter",
    description: "Weapons specialist built for sustained frontline combat.",
    hitDie: 10,
    armorClassBase: 16,
    weaponDamage: "1d8+3",
    primaryAbility: "str",
    spellcaster: false,
    startingSpells: []
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "Precise striker that relies on agility and timing.",
    hitDie: 8,
    armorClassBase: 15,
    weaponDamage: "1d6+4",
    primaryAbility: "dex",
    spellcaster: false,
    startingSpells: []
  },
  {
    id: "cleric",
    name: "Cleric",
    description: "Holy battlemage with healing and radiant power.",
    hitDie: 8,
    armorClassBase: 15,
    weaponDamage: "1d6+2",
    primaryAbility: "wis",
    spellcaster: true,
    maxSpellSlots: 2,
    startingSpells: ["sacred_flame", "healing_word", "guiding_bolt"]
  },
  {
    id: "wizard",
    name: "Wizard",
    description: "Arcane scholar with strong utility and burst damage.",
    hitDie: 6,
    armorClassBase: 13,
    weaponDamage: "1d4+1",
    primaryAbility: "int",
    spellcaster: true,
    maxSpellSlots: 3,
    startingSpells: ["fire_bolt", "magic_missile", "shield"]
  },
  {
    id: "ranger",
    name: "Ranger",
    description: "Hunter and scout skilled in ranged pressure.",
    hitDie: 10,
    armorClassBase: 15,
    weaponDamage: "1d8+2",
    primaryAbility: "dex",
    spellcaster: true,
    maxSpellSlots: 2,
    startingSpells: ["hunters_mark", "cure_wounds"]
  },
  {
    id: "warlock",
    name: "Warlock",
    description: "Pact-bound caster with reliable eldritch offense.",
    hitDie: 8,
    armorClassBase: 14,
    weaponDamage: "1d6+2",
    primaryAbility: "cha",
    spellcaster: true,
    maxSpellSlots: 2,
    startingSpells: ["eldritch_blast", "hex", "armor_of_agathys"]
  }
];

export const BACKGROUNDS = [
  { id: "soldier", name: "Soldier", description: "Veteran of border skirmishes and siege lines." },
  { id: "acolyte", name: "Acolyte", description: "Temple-trained pilgrim of lore and ritual." },
  { id: "criminal", name: "Criminal", description: "Streetwise operator with undercity contacts." },
  { id: "sage", name: "Sage", description: "Researcher devoted to forgotten records." },
  { id: "outlander", name: "Outlander", description: "Wilderness survivor from frontier lands." },
  { id: "noble", name: "Noble", description: "Court-bred voice with political leverage." }
];
