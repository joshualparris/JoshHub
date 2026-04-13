export const SPELLS = [
  {
    id: "fire_bolt",
    name: "Fire Bolt",
    type: "cantrip",
    description: "A bolt of flame lances toward one target.",
    damage: "1d10",
    school: "Evocation"
  },
  {
    id: "magic_missile",
    name: "Magic Missile",
    type: "slot",
    description: "Arcane darts strike with guaranteed force.",
    damage: "3d4+3",
    school: "Evocation"
  },
  {
    id: "shield",
    name: "Shield",
    type: "slot",
    description: "Arcane barrier increases your AC until next turn.",
    effect: "ac_boost",
    amount: 3,
    school: "Abjuration"
  },
  {
    id: "sacred_flame",
    name: "Sacred Flame",
    type: "cantrip",
    description: "Radiant fire burns enemies that fail to evade.",
    damage: "1d8",
    school: "Evocation"
  },
  {
    id: "healing_word",
    name: "Healing Word",
    type: "slot",
    description: "A brief prayer restores vitality.",
    effect: "heal",
    amount: "1d4+3",
    school: "Evocation"
  },
  {
    id: "guiding_bolt",
    name: "Guiding Bolt",
    type: "slot",
    description: "Radiant blast with strong single-target damage.",
    damage: "4d6",
    school: "Evocation"
  },
  {
    id: "hunters_mark",
    name: "Hunter's Mark",
    type: "slot",
    description: "Mark prey and deal extra weapon damage.",
    effect: "mark",
    amount: "1d6",
    school: "Divination"
  },
  {
    id: "cure_wounds",
    name: "Cure Wounds",
    type: "slot",
    description: "Touch-based healing magic.",
    effect: "heal",
    amount: "1d8+2",
    school: "Evocation"
  },
  {
    id: "eldritch_blast",
    name: "Eldritch Blast",
    type: "cantrip",
    description: "Reliable pact force at range.",
    damage: "1d10",
    school: "Evocation"
  },
  {
    id: "hex",
    name: "Hex",
    type: "slot",
    description: "Cursed target takes extra damage.",
    effect: "mark",
    amount: "1d6",
    school: "Enchantment"
  },
  {
    id: "armor_of_agathys",
    name: "Armor of Agathys",
    type: "slot",
    description: "Protective ice grants temporary resilience.",
    effect: "temp_hp",
    amount: 6,
    school: "Abjuration"
  }
];
