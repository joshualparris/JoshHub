import { SAVE_VERSION } from "./storage.js";

export const BASE_ABILITIES = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10
};

export function abilityMod(score) {
  return Math.floor((Number(score) - 10) / 2);
}

export function calculateMaxHp(classDef, abilities) {
  const conMod = abilityMod(abilities.con);
  return Math.max(8, classDef.hitDie + conMod);
}

export function createInitialState(character, classDef) {
  const maxHp = calculateMaxHp(classDef, character.abilities);
  const maxSpellSlots = classDef.spellcaster ? classDef.maxSpellSlots : 0;

  return {
    schemaVersion: SAVE_VERSION,
    phase: "game",
    player: {
      name: character.name,
      raceId: character.raceId,
      classId: character.classId,
      backgroundId: character.backgroundId,
      level: 1,
      xp: 0,
      hp: maxHp,
      maxHp,
      ac: classDef.armorClassBase,
      abilities: character.abilities,
      gold: 40,
      inventory: [
        { itemId: "healing_potion", qty: 2 },
        { itemId: "iron_ore", qty: 1 }
      ],
      knownSpells: classDef.startingSpells || [],
      spellSlots: {
        max: maxSpellSlots,
        current: maxSpellSlots
      },
      tempHp: 0,
      status: {
        markDice: null,
        markTurns: 0,
        acBoostTurns: 0
      }
    },
    world: {
      day: 1,
      locationId: "protector_enclave",
      discovered: ["protector_enclave"],
      cooldowns: {},
      discoveries: {},
      flags: {
        acceptedMainQuest: false,
        tide_sigil_won: false,
        shadow_sigil_won: false,
        flame_sigil_won: false,
        forgedWardedKey: false,
        defeatedVexira: false,
        smugglerBriefed: false,
        smugglerCleared: false,
        miriGiftGiven: false,
        sigilsAnnounced: false,
        keyAnnounced: false
      },
      ending: null
    },
    quests: {
      active: [],
      completed: [],
      failed: []
    },
    combat: null,
    ui: {
      activeSidebarTab: "character"
    },
    log: []
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function findInventoryItem(state, itemId) {
  return state.player.inventory.find((entry) => entry.itemId === itemId) || null;
}

export function addItem(state, itemId, qty = 1) {
  if (qty <= 0) {
    return;
  }
  const existing = findInventoryItem(state, itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    state.player.inventory.push({ itemId, qty });
  }
}

export function removeItem(state, itemId, qty = 1) {
  const existing = findInventoryItem(state, itemId);
  if (!existing || existing.qty < qty) {
    return false;
  }

  existing.qty -= qty;
  if (existing.qty <= 0) {
    state.player.inventory = state.player.inventory.filter((entry) => entry.itemId !== itemId);
  }
  return true;
}

export function hasItems(state, requirements) {
  return requirements.every((req) => {
    const entry = findInventoryItem(state, req.itemId);
    return entry && entry.qty >= req.qty;
  });
}

export function gainXp(state, amount) {
  state.player.xp += amount;
  const needed = state.player.level * 120;
  if (state.player.xp >= needed) {
    state.player.level += 1;
    state.player.maxHp += 5;
    state.player.hp = state.player.maxHp;
    return true;
  }
  return false;
}
