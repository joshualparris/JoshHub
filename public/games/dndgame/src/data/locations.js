export const LOCATIONS = [
  {
    id: "protector_enclave",
    name: "Protector's Enclave",
    description: "The city center: banners, guards, and the pulse of high command.",
    travel: ["market_square", "hall_of_justice", "dockward", "blacklake"]
  },
  {
    id: "market_square",
    name: "Market Square",
    description: "Merchants shout prices over wagons of salvaged metal and herbs.",
    travel: ["protector_enclave", "crafting_hall"]
  },
  {
    id: "hall_of_justice",
    name: "Hall of Justice",
    description: "Marble halls where oaths, politics, and faith overlap.",
    travel: ["protector_enclave", "graveyard_road"]
  },
  {
    id: "dockward",
    name: "Dockward",
    description: "Salt spray, crooked lanterns, and eyes that never stop watching.",
    travel: ["protector_enclave", "sunken_pier"]
  },
  {
    id: "blacklake",
    name: "Blacklake District",
    description: "Ruined estates and hidden passageways haunted by old ambition.",
    travel: ["protector_enclave", "graveyard_road", "mount_hotenow"]
  },
  {
    id: "crafting_hall",
    name: "Crafting Hall",
    description: "An old smithy repurposed into a workshop for adventurers.",
    travel: ["market_square"]
  },
  {
    id: "graveyard_road",
    name: "Neverdeath Approach",
    description: "Fog and cracked stone mark the road to the city of graves.",
    travel: ["hall_of_justice", "blacklake", "sunken_pier"]
  },
  {
    id: "sunken_pier",
    name: "Sunken Pier",
    description: "Collapsed docks and smuggler caches half swallowed by dark tide.",
    travel: ["dockward", "graveyard_road"]
  },
  {
    id: "mount_hotenow",
    name: "Mount Hotenow Rift",
    description: "Heat fissures and ash storms surround Vexira's ritual ground.",
    travel: ["blacklake"]
  }
];

export const ENCOUNTERS = {
  sunken_pier: {
    id: "sunken_pier_skirmish",
    title: "Smuggler Ambush",
    description: "Cult couriers rush for the boats as you close in.",
    enemy: {
      id: "smuggler_captain",
      name: "Smuggler Captain",
      hp: 28,
      ac: 13,
      attackBonus: 4,
      damage: "1d8+2",
      xp: 70,
      gold: 22,
      loot: ["sigil_tide", "moonleaf"]
    },
    flagReward: "tide_sigil_won"
  },
  graveyard_road: {
    id: "graveyard_road_battle",
    title: "Wight Sentinel",
    description: "A grave-warden stitched with shadow bars your path.",
    enemy: {
      id: "wight_sentinel",
      name: "Wight Sentinel",
      hp: 34,
      ac: 14,
      attackBonus: 5,
      damage: "1d10+2",
      xp: 90,
      gold: 28,
      loot: ["sigil_shadow", "iron_ore"]
    },
    flagReward: "shadow_sigil_won"
  },
  mount_hotenow: {
    id: "hotenow_pretrial",
    title: "Ashbound Vanguard",
    description: "Vexira's elite guard tests your strength at the rift gate.",
    enemy: {
      id: "ashbound_vanguard",
      name: "Ashbound Vanguard",
      hp: 38,
      ac: 15,
      attackBonus: 6,
      damage: "1d10+3",
      xp: 110,
      gold: 35,
      loot: ["sigil_flame", "ember_shard"]
    },
    flagReward: "flame_sigil_won"
  }
};

export const FINAL_BOSS = {
  id: "vexira_boss",
  name: "Vexira the Ashbound",
  hp: 70,
  ac: 16,
  attackBonus: 7,
  damage: "2d8+3",
  xp: 250,
  gold: 120,
  loot: []
};
