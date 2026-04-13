export const ITEMS = {
  iron_ore: { id: "iron_ore", name: "Iron Ore", type: "material", value: 8 },
  moonleaf: { id: "moonleaf", name: "Moonleaf", type: "material", value: 10 },
  ember_shard: { id: "ember_shard", name: "Ember Shard", type: "material", value: 14 },
  sigil_tide: { id: "sigil_tide", name: "Tidal Sigil", type: "quest", value: 0 },
  sigil_shadow: { id: "sigil_shadow", name: "Shadow Sigil", type: "quest", value: 0 },
  sigil_flame: { id: "sigil_flame", name: "Flame Sigil", type: "quest", value: 0 },
  warded_key: { id: "warded_key", name: "Warded Key", type: "quest", value: 0 },
  healing_potion: { id: "healing_potion", name: "Healing Potion", type: "consumable", value: 18, heal: "2d4+2" },
  revival_salt: { id: "revival_salt", name: "Revival Salt", type: "consumable", value: 30, revive: true },
  steel_dagger: { id: "steel_dagger", name: "Steel Dagger", type: "weapon", value: 20 },
  arcane_focus: { id: "arcane_focus", name: "Arcane Focus", type: "gear", value: 25 }
};

export const SHOP_STOCK = [
  { itemId: "healing_potion", cost: 18 },
  { itemId: "revival_salt", cost: 30 },
  { itemId: "iron_ore", cost: 8 },
  { itemId: "moonleaf", cost: 10 },
  { itemId: "ember_shard", cost: 14 }
];
