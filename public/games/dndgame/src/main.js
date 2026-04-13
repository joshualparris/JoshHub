import { RACES } from "./data/races.js";
import { CLASSES, BACKGROUNDS } from "./data/classes.js";
import { SPELLS } from "./data/spells.js";
import { ITEMS, SHOP_STOCK } from "./data/itecare2.js";
import { RECIPES } from "./data/recipes.js";
import { NPCS } from "./data/npcs.js";
import { LOCATIONS, ENCOUNTERS, FINAL_BOSS } from "./data/locations.js";
import { QUESTS } from "./data/quests.js";
import { GLOBAL_AMBIENT_ACTIONS, LOCATION_AMBIENCE, SCENE_ART } from "./data/exploration.js";
import { rollDie, rollExpr } from "./core/dice.js";
import { hasSave, saveGame, loadGame } from "./core/storage.js";
import {
  BASE_ABILITIES,
  abilityMod,
  createInitialState,
  addItem,
  removeItem,
  hasItecare2,
  gainXp,
  findInventoryItem
} from "./core/state.js";
import {
  switchScreen,
  renderCharacterCreation,
  appendNarrative,
  clearNarrative,
  renderActions,
  updateHeader,
  renderScenePanel,
  setSidebarTab,
  renderSidebar
} from "./ui/render.js";

const CREATION_POINTS = 8;
const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];

const raceLookup = toLookup(RACES);
const classLookup = toLookup(CLASSES);
const backgroundLookup = toLookup(BACKGROUNDS);
const spellLookup = toLookup(SPELLS);
const questLookup = QUESTS;
const locationLookup = toLookup(LOCATIONS);
const npcLookup = toLookup(NPCS);

const elements = {
  newGameBtn: document.getElementById("new-game-btn"),
  loadBtn: document.getElementById("load-btn"),
  titleHelpBtn: document.getElementById("title-help-btn"),
  charCreation: document.getElementById("char-creation"),
  actions: document.getElementById("actions"),
  saveBtn: document.getElementById("save-btn"),
  restBtn: document.getElementById("rest-btn"),
  helpBtn: document.getElementById("help-btn"),
  toggleSidebarBtn: document.getElementById("toggle-sidebar-btn"),
  sidebar: document.getElementById("sidebar"),
  sidebarTabs: document.getElementById("sidebar-tabs")
};

let state = null;
let creationModel = newCreationModel();

bootstrap();

function bootstrap() {
  bindStaticEvents();
  updateLoadButton();
  switchScreen("title");
}

function bindStaticEvents() {
  elements.newGameBtn.addEventListener("click", () => {
    creationModel = newCreationModel();
    renderCreationScreen();
    switchScreen("creation");
  });

  elements.loadBtn.addEventListener("click", loadSavedGame);
  elements.titleHelpBtn.addEventListener("click", showTitleHelp);

  elements.charCreation.addEventListener("click", (event) => {
    const optionEl = event.target.closest("[data-kind][data-id]");
    if (optionEl) {
      onSelectCreationOption(optionEl.dataset.kind, optionEl.dataset.id);
      return;
    }

    const abilityBtn = event.target.closest("[data-ability][data-delta]");
    if (abilityBtn) {
      adjustAbility(abilityBtn.dataset.ability, Number(abilityBtn.dataset.delta));
      return;
    }

    if (event.target.id === "creation-back-btn") {
      switchScreen("title");
      return;
    }

    if (event.target.id === "creation-start-btn") {
      startNewAdventure();
    }
  });

  elements.charCreation.addEventListener("change", (event) => {
    if (event.target.id === "pc-name") {
      creationModel.selected.name = event.target.value;
      renderCreationScreen();
    }

    if (event.target.id === "pc-notes") {
      creationModel.selected.notes = event.target.value;
    }
  });

  elements.actions.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action-id]");
    if (!button) {
      return;
    }

    safeExecute(() => handleAction(button.dataset.actionId));
  });

  elements.saveBtn.addEventListener("click", () => {
    safeExecute(() => manualSave());
  });

  elements.restBtn.addEventListener("click", () => {
    safeExecute(() => restParty());
  });

  elements.helpBtn.addEventListener("click", () => {
    if (!state) {
      return;
    }
    state.ui.activeSidebarTab = "help";
    setSidebarTab("help");
  });

  elements.toggleSidebarBtn.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.sidebarTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (!tab || !state) {
      return;
    }
    state.ui.activeSidebarTab = tab.dataset.tab;
    setSidebarTab(tab.dataset.tab);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "s" && state) {
      event.preventDefault();
      manualSave();
      return;
    }

    if (event.key === "r" && state && !state.combat) {
      event.preventDefault();
      restParty();
      return;
    }

    if (!state && event.key === "l" && hasSave()) {
      event.preventDefault();
      loadSavedGame();
      return;
    }

    if (state && /^[1-9]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      const actionButtons = Array.from(document.querySelectorAll("#actions button[data-action-id]"));
      if (actionButtons[index] && !actionButtons[index].disabled) {
        event.preventDefault();
        handleAction(actionButtons[index].dataset.actionId);
      }
    }
  });
}

function safeExecute(fn) {
  try {
    fn();
  } catch (error) {
    console.error(error);
    if (state) {
      gameMessage(`System error: ${error.message}`, "failure", true);
      renderGame();
    }
  }
}

function newCreationModel() {
  return {
    selected: {
      name: "",
      notes: "",
      raceId: RACES[0].id,
      classId: CLASSES[0].id,
      backgroundId: BACKGROUNDS[0].id
    },
    abilities: { ...BASE_ABILITIES }
  };
}

function renderCreationScreen() {
  const selectedRace = raceLookup[creationModel.selected.raceId];
  const selectedClass = classLookup[creationModel.selected.classId];
  const selectedBackground = backgroundLookup[creationModel.selected.backgroundId];
  const pointsRemaining = getCreationPointsRemaining();

  renderCharacterCreation(elements.charCreation, {
    races: RACES,
    classes: CLASSES,
    backgrounds: BACKGROUNDS,
    selected: {
      ...creationModel.selected,
      raceName: selectedRace.name,
      className: selectedClass.name,
      backgroundName: selectedBackground.name
    },
    abilities: creationModel.abilities,
    pointsRemaining,
    canStart: pointsRemaining >= 0
  });
}

function getCreationPointsRemaining() {
  const spent = ABILITY_KEYS.reduce((sum, key) => sum + (creationModel.abilities[key] - 10), 0);
  return CREATION_POINTS - spent;
}

function onSelectCreationOption(kind, id) {
  if (kind === "race") {
    creationModel.selected.raceId = id;
  }

  if (kind === "class") {
    creationModel.selected.classId = id;
  }

  if (kind === "background") {
    creationModel.selected.backgroundId = id;
  }

  renderCreationScreen();
}

function adjustAbility(ability, delta) {
  if (!ABILITY_KEYS.includes(ability) || ![-1, 1].includes(delta)) {
    return;
  }

  const current = creationModel.abilities[ability];
  const candidate = current + delta;
  if (candidate < 8 || candidate > 15) {
    return;
  }

  const currentRemaining = getCreationPointsRemaining();
  if (delta > 0 && currentRemaining <= 0) {
    return;
  }

  creationModel.abilities[ability] = candidate;
  renderCreationScreen();
}

function startNewAdventure() {
  const nameInput = document.getElementById("pc-name");
  const notesInput = document.getElementById("pc-notes");
  if (nameInput) {
    creationModel.selected.name = nameInput.value.trim();
  }
  if (notesInput) {
    creationModel.selected.notes = notesInput.value.trim();
  }

  const classDef = classLookup[creationModel.selected.classId];
  const race = raceLookup[creationModel.selected.raceId];
  const pointsRemaining = getCreationPointsRemaining();
  if (pointsRemaining < 0) {
    return;
  }

  const finalAbilities = applyRaceBonuses(creationModel.abilities, race.bonuses);
  state = createInitialState(
    {
      name: creationModel.selected.name || "Nameless Wanderer",
      notes: creationModel.selected.notes,
      raceId: creationModel.selected.raceId,
      classId: creationModel.selected.classId,
      backgroundId: creationModel.selected.backgroundId,
      abilities: finalAbilities
    },
    classDef
  );

  state.ui.mode = "default";
  state.player.notes = creationModel.selected.notes;
  state.log = [];

  switchScreen("game");
  clearNarrative();
  gameMessage("Chapter I: Ash Over Neverwinter", "chapter", true);
  gameMessage("You arrive in Protector's Enclave as smoke gathers over the city walls.", "prose", true);
  gameMessage("Captain Serra requests an audience.", "system", true);
  renderGame();
}

function loadSavedGame() {
  const result = loadGame();
  if (!result) {
    window.alert("No valid save was found.");
    updateLoadButton();
    return;
  }

  if (result.incompatible) {
    window.alert(`Save version ${result.foundVersion} is incompatible with current version.`);
    return;
  }

  state = normalizeState(result.state);
  switchScreen("game");
  clearNarrative();
  gameMessage("Journey resumed from save data.", "system", true);
  renderGame();
}

function normalizeState(loadedState) {
  const nextState = loadedState;

  if (!nextState.ui) {
    nextState.ui = {};
  }

  if (!nextState.ui.activeSidebarTab) {
    nextState.ui.activeSidebarTab = "character";
  }

  if (!nextState.ui.mode) {
    nextState.ui.mode = "default";
  }

  if (!Array.isArray(nextState.log)) {
    nextState.log = [];
  }

  if (!nextState.world.cooldowns || typeof nextState.world.cooldowns !== "object") {
    nextState.world.cooldowns = {};
  }

  if (!nextState.world.discoveries || typeof nextState.world.discoveries !== "object") {
    nextState.world.discoveries = {};
  }

  if (!nextState.player.status) {
    nextState.player.status = { markDice: null, markTurns: 0, acBoostTurns: 0 };
  }

  if (typeof nextState.player.tempHp !== "number") {
    nextState.player.tempHp = 0;
  }

  return nextState;
}

function manualSave() {
  if (!state) {
    return;
  }
  saveGame(state);
  updateLoadButton();
  gameMessage("Game saved.", "system", true);
  renderGame();
}

function updateLoadButton() {
  elements.loadBtn.style.display = hasSave() ? "inline-block" : "none";
}

function showTitleHelp() {
  window.alert(
    "Create a character, travel between districts, gather three sigils, craft the Warded Key, and defeat Vexira. " +
      "You can also smell around, listen, investigate, journal, pray, and take quiet downtime actions in each district. " +
      "Use number keys 1-9 to trigger visible actions, S to save, and R to rest."
  );
}

function renderGame() {
  if (!state) {
    return;
  }

  const location = locationLookup[state.world.locationId];
  const ambience = LOCATION_AMBIENCE[state.world.locationId];
  const scene = SCENE_ART[ambience.sceneId];
  const classDef = classLookup[state.player.classId];
  updateHeader(
    location.name,
    `${state.player.name} | ${classDef.name} L${state.player.level} | HP ${state.player.hp}/${state.player.maxHp}`
  );
  renderScenePanel(location, scene, ambience);

  renderSidebar(state, {
    classLookup,
    raceLookup,
    itemLookup: ITEMS,
    questLookup,
    spellLookup,
    questStageText: getQuestStageTextMap()
  });
  setSidebarTab(state.ui.activeSidebarTab || "character");

  const actions = buildActions();
  renderActions(actions);
}

function buildActions() {
  if (!state) {
    return [];
  }

  if (state.world.ending === "victory") {
    return [
      { id: "ending:return", label: "Return To Title", variant: "" },
      { id: "ending:continue", label: "Continue Exploring", variant: "" }
    ];
  }

  if (state.combat) {
    return buildCombatActions();
  }

  if (state.ui.mode === "shop") {
    return buildShopActions();
  }

  if (state.ui.mode === "craft") {
    return buildCraftActions();
  }

  return buildWorldActions();
}
function buildWorldActions() {
  const location = locationLookup[state.world.locationId];
  const actions = [];

  const npcsHere = NPCS.filter((npc) => npc.locationId === location.id);
  npcsHere.forEach((npc) => {
    actions.push({ id: `talk:${npc.id}`, label: `Talk: ${npc.name}` });
  });

  const encounter = ENCOUNTERS[location.id];
  if (encounter && !state.world.flags[encounter.flagReward]) {
    actions.push({ id: `encounter:${location.id}`, label: `Face Encounter: ${encounter.title}`, variant: " btn-danger" });
  }

  if (location.id === "mount_hotenow" && canChallengeBoss()) {
    actions.push({ id: "boss:start", label: "Confront Vexira", variant: " btn-primary" });
  }

  if (location.id === "mount_hotenow" && !canChallengeBoss() && !state.world.flags.defeatedVexira) {
    const needed = [];
    if (!state.world.flags.forgedWardedKey) {
      needed.push("Warded Key");
    }
    if (!allSigilsRecovered()) {
      needed.push("all three Sigils");
    }

    if (needed.length) {
      actions.push({
        id: "boss:locked",
        label: `Vexira's barrier requires ${needed.join(" and ")}`,
        disabled: true
      });
    }
  }

  if (location.id === "market_square") {
    actions.push({ id: "mode:shop", label: "Open Market", variant: "" });
  }

  if (location.id === "crafting_hall") {
    actions.push({ id: "mode:craft", label: "Use Crafting Bench", variant: "" });
  }

  actions.push(...buildAmbientActions(location.id));
  actions.push({ id: "quest:status", label: "Quest Status", variant: "" });

  location.travel.forEach((destinationId) => {
    const destination = locationLookup[destinationId];
    actions.push({ id: `travel:${destinationId}`, label: `Travel: ${destination.name}` });
  });

  actions.push({ id: "wait:day", label: "Pass Time", variant: "" });
  return actions;
}

function buildAmbientActions(locationId) {
  const ambience = LOCATION_AMBIENCE[locationId];
  if (!ambience) {
    return [];
  }

  const locationActions = ambience.specialActions || [];
  return [...GLOBAL_AMBIENT_ACTIONS, ...locationActions].map((action) => ({
    id: `ambient:${action.id}`,
    label: action.label,
    variant: " btn-quiet",
    hint: action.ability ? `${action.ability.toUpperCase()} check, DC ${action.dc}` : "Ambient interaction"
  }));
}

function findAmbientAction(locationId, actionId) {
  const ambience = LOCATION_AMBIENCE[locationId];
  if (!ambience) {
    return null;
  }

  const locationActions = ambience.specialActions || [];
  return [...GLOBAL_AMBIENT_ACTIONS, ...locationActions].find((action) => action.id === actionId) || null;
}

function performAmbientAction(actionId) {
  const location = locationLookup[state.world.locationId];
  const ambience = LOCATION_AMBIENCE[location.id];
  const action = findAmbientAction(location.id, actionId);

  if (!action || !ambience) {
    return;
  }

  const context = { action, ambience, location };
  const cooldownKey = `daily:${action.id}`;

  if (action.daily && state.world.cooldowns[cooldownKey] === state.world.day) {
    gameMessage(resolveAmbientCopy(action.repeat, context) || "You have already done that today.", "system", true);
    return;
  }

  if (action.ability) {
    const roll = rollDie(20);
    const bonus = getAmbientCheckBonus(action.ability);
    const total = roll + bonus;
    const success = roll !== 1 && (roll === 20 || total >= action.dc);

    gameMessage(
      `${action.label}: ${roll} + ${bonus} = ${total} vs DC ${action.dc}.`,
      "roll-result",
      true
    );
    gameMessage(
      resolveAmbientCopy(success ? action.success : action.failure, context),
      success ? "prose" : "system",
      true
    );

    if (success) {
      applyAmbientEffects(action, context);
    }
    return;
  }

  const text = resolveAmbientCopy(action.use, context);
  if (text) {
    gameMessage(text, "prose", true);
  }

  if (action.daily) {
    state.world.cooldowns[cooldownKey] = state.world.day;
  }

  applyAmbientEffects(action, context);
}

function resolveAmbientCopy(copy, context) {
  if (!copy) {
    return "";
  }

  return typeof copy === "function" ? copy(context) : copy;
}

function getAmbientCheckBonus(ability) {
  return abilityMod(state.player.abilities[ability]) + 2;
}

function applyAmbientEffects(action, context) {
  if (action.reward) {
    grantAmbientReward(action.reward, `ambient:${context.location.id}:${action.id}`);
  }

  if (action.id === "perception_sweep") {
    grantAmbientReward(context.ambience.perceptionReward, `perception:${context.location.id}`);
    return;
  }

  if (action.id === "investigate_area") {
    grantAmbientReward(context.ambience.investigationReward, `investigation:${context.location.id}`);
    return;
  }

  if (action.id === "sit_and_watch") {
    const restored = healPlayer(2);
    if (restored > 0) {
      gameMessage(`You recover ${restored} HP while you let the district breathe around you.`, "success", true);
    }
    return;
  }

  if (action.id === "drink_water") {
    const restored = healPlayer(1);
    if (restored > 0) {
      gameMessage(`The water settles you. Recover ${restored} HP.`, "success", true);
    }
    return;
  }

  if (action.id === "offer_prayer" || action.id === "light_a_candle") {
    if (restoreSpellSlot(1) > 0) {
      gameMessage("Your focus returns. Recover 1 spell slot.", "success", true);
      return;
    }

    const restored = healPlayer(action.id === "light_a_candle" ? 2 : 1);
    if (restored > 0) {
      gameMessage(`The moment of reflection restores ${restored} HP.`, "success", true);
    } else {
      gameMessage("You do not mend physically, but the pause leaves you steadier.", "system", true);
    }
    return;
  }

  if (action.id === "sample_street_broth") {
    const restored = healPlayer(2);
    if (restored > 0) {
      gameMessage("The broth puts warmth back into you. Recover 2 HP.", "success", true);
    }
    state.world.cooldowns["daily:sample_street_broth"] = state.world.day;
    return;
  }

  if (action.id === "steady_your_nerves") {
    const restored = healPlayer(1);
    if (restored > 0) {
      gameMessage("The breathing exercise restores 1 HP.", "success", true);
    }
    state.world.cooldowns["daily:steady_your_nerves"] = state.world.day;
    return;
  }

  if (action.id === "write_journal") {
    gameMessage(`Journal note: ${getMainQuestStageText()}`, "system", true);
    if (state.quests.active.includes("smuggler_chain")) {
      gameMessage(`Journal note: ${getSmugglerQuestText()}`, "system", true);
    }
  }
}

function grantAmbientReward(reward, rewardKey) {
  if (!reward || state.world.discoveries[rewardKey]) {
    return;
  }

  if (reward.gold) {
    state.player.gold += reward.gold;
  }

  if (reward.itemId) {
    addItem(state, reward.itemId, reward.qty || 1);
  }

  if (reward.heal) {
    healPlayer(reward.heal);
  }

  if (reward.spellSlot) {
    restoreSpellSlot(reward.spellSlot);
  }

  if (reward.text) {
    gameMessage(reward.text, reward.itemId || reward.gold ? "loot" : "success", true);
  }

  state.world.discoveries[rewardKey] = true;
}

function healPlayer(amount) {
  const before = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + amount);
  return state.player.hp - before;
}

function restoreSpellSlot(amount) {
  if (state.player.spellSlots.max <= 0 || state.player.spellSlots.current >= state.player.spellSlots.max) {
    return 0;
  }

  const before = state.player.spellSlots.current;
  state.player.spellSlots.current = Math.min(state.player.spellSlots.max, state.player.spellSlots.current + amount);
  return state.player.spellSlots.current - before;
}

function buildShopActions() {
  const stockButtons = SHOP_STOCK.map((entry) => {
    const item = ITEMS[entry.itemId];
    const afford = state.player.gold >= entry.cost;
    return {
      id: `shop:buy:${entry.itemId}`,
      label: `Buy ${item.name} (${entry.cost}g)`,
      disabled: !afford
    };
  });

  return [
    ...stockButtons,
    { id: "shop:exit", label: "Leave Market" }
  ];
}

function buildCraftActions() {
  const craftButtons = RECIPES.map((recipe) => {
    const canCraft = hasItecare2(state, recipe.requires);
    return {
      id: `craft:make:${recipe.id}`,
      label: `${canCraft ? "Craft" : "Need Materials"}: ${recipe.name}`,
      disabled: !canCraft,
      variant: canCraft ? " btn-primary" : ""
    };
  });

  return [
    ...craftButtons,
    { id: "craft:exit", label: "Leave Crafting Bench" }
  ];
}

function buildCombatActions() {
  const actions = [
    { id: "combat:attack", label: "Weapon Attack", variant: " btn-primary" }
  ];

  state.player.knownSpells.forEach((spellId) => {
    const spell = spellLookup[spellId];
    if (!spell) {
      return;
    }

    const needsSlot = spell.type === "slot";
    const disabled = needsSlot && state.player.spellSlots.current <= 0;
    actions.push({
      id: `combat:spell:${spellId}`,
      label: `Cast ${spell.name}`,
      disabled
    });
  });

  const hasPotion = Boolean(findInventoryItem(state, "healing_potion"));
  actions.push({ id: "combat:potion", label: "Drink Healing Potion", disabled: !hasPotion });
  actions.push({ id: "combat:flee", label: "Attempt Flee", variant: " btn-danger" });

  return actions;
}

function handleAction(actionId) {
  if (!state) {
    return;
  }

  if (state.world.ending === "victory") {
    if (actionId === "ending:return") {
      switchScreen("title");
      state = null;
      return;
    }

    if (actionId === "ending:continue") {
      state.world.ending = null;
      gameMessage("You continue patrolling the Sword Coast.", "system", true);
      renderGame();
      return;
    }
  }

  if (state.combat) {
    handleCombatAction(actionId);
    renderGame();
    return;
  }

  if (actionId === "mode:shop") {
    state.ui.mode = "shop";
    gameMessage("Brom grins and opens his ledger.", "dialogue", true);
    renderGame();
    return;
  }

  if (actionId === "mode:craft") {
    state.ui.mode = "craft";
    gameMessage("Miri points to the forge and herb bench.", "dialogue", true);
    renderGame();
    return;
  }

  if (actionId.startsWith("shop:")) {
    handleShopAction(actionId);
    renderGame();
    return;
  }

  if (actionId.startsWith("craft:")) {
    handleCraftAction(actionId);
    renderGame();
    return;
  }

  if (actionId.startsWith("ambient:")) {
    performAmbientAction(actionId.replace("ambient:", ""));
    renderGame();
    return;
  }

  if (actionId.startsWith("travel:")) {
    travelTo(actionId.replace("travel:", ""));
    renderGame();
    return;
  }

  if (actionId.startsWith("talk:")) {
    talkToNpc(actionId.replace("talk:", ""));
    renderGame();
    return;
  }

  if (actionId.startsWith("encounter:")) {
    beginEncounter(actionId.replace("encounter:", ""));
    renderGame();
    return;
  }

  if (actionId === "boss:start") {
    beginBossFight();
    renderGame();
    return;
  }

  if (actionId === "quest:status") {
    gameMessage(getMainQuestStageText(), "system", true);
    if (state.quests.active.includes("smuggler_chain")) {
      gameMessage(getSmugglerQuestText(), "system", true);
    }
    renderGame();
    return;
  }

  if (actionId === "wait:day") {
    state.world.day += 1;
    gameMessage("You spend several cautious hours scouting the district.", "system", true);
    renderGame();
  }
}

function handleShopAction(actionId) {
  if (actionId === "shop:exit") {
    state.ui.mode = "default";
    gameMessage("You leave the market stalls.", "system", true);
    return;
  }

  const itemId = actionId.replace("shop:buy:", "");
  const stock = SHOP_STOCK.find((entry) => entry.itemId === itemId);
  if (!stock) {
    return;
  }

  if (state.player.gold < stock.cost) {
    gameMessage("Not enough gold.", "failure", true);
    return;
  }

  state.player.gold -= stock.cost;
  addItem(state, itemId, 1);
  gameMessage(`Purchased ${ITEMS[itemId].name}.`, "loot", true);
}

function handleCraftAction(actionId) {
  if (actionId === "craft:exit") {
    state.ui.mode = "default";
    gameMessage("You step away from the crafting bench.", "system", true);
    return;
  }

  const recipeId = actionId.replace("craft:make:", "");
  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  if (!recipe) {
    return;
  }

  if (!hasItecare2(state, recipe.requires)) {
    gameMessage("Missing ingredients.", "failure", true);
    return;
  }

  recipe.requires.forEach((req) => {
    removeItem(state, req.itemId, req.qty);
  });

  addItem(state, recipe.resultItemId, recipe.resultQty);
  if (recipe.resultItemId === "warded_key") {
    state.world.flags.forgedWardedKey = true;
    gameMessage("The Warded Key hucare2 with layered sigil magic.", "success", true);
  } else {
    gameMessage(`Crafted ${ITEMS[recipe.resultItemId].name}.`, "success", true);
  }
}

function travelTo(destinationId) {
  const location = locationLookup[state.world.locationId];
  if (!location.travel.includes(destinationId)) {
    gameMessage("That route is unavailable from here.", "failure", true);
    return;
  }

  state.world.locationId = destinationId;
  state.ui.mode = "default";

  if (!state.world.discovered.includes(destinationId)) {
    state.world.discovered.push(destinationId);
  }

  const destination = locationLookup[destinationId];
  gameMessage(`You travel to ${destination.name}.`, "prose", true);
  gameMessage(destination.description, "system", true);
}
function talkToNpc(npcId) {
  const npc = npcLookup[npcId];
  if (!npc) {
    return;
  }

  gameMessage(`${npc.name}: ${npc.greeting}`, "dialogue", true);

  switch (npcId) {
    case "serra":
      if (!state.world.flags.acceptedMainQuest) {
        state.world.flags.acceptedMainQuest = true;
        activateQuest("main_quest");
        gameMessage(
          "Serra assigns you to recover three ward sigils before Vexira ignites the rift.",
          "system",
          true
        );
      } else if (state.world.flags.defeatedVexira) {
        gameMessage("Serra salutes: Neverwinter holds because you stood your ground.", "dialogue", true);
      } else {
        gameMessage(getMainQuestStageText(), "system", true);
      }
      break;

    case "tormund":
      if (!state.world.flags.smugglerBriefed) {
        state.world.flags.smugglerBriefed = true;
        activateQuest("smuggler_chain");
        gameMessage("Tormund marks a smuggler cache at Sunken Pier.", "system", true);
      } else {
        gameMessage(getSmugglerQuestText(), "system", true);
      }
      break;

    case "whisper":
    case "kael":
      if (state.quests.active.includes("smuggler_chain") && state.world.flags.smugglerCleared) {
        completeQuest("smuggler_chain");
        state.player.gold += 35;
        addItem(state, "healing_potion", 1);
        gameMessage("Your intel payment arrives: 35 gold and one potion.", "loot", true);
      }
      break;

    case "miri":
      if (!state.world.flags.miriGiftGiven) {
        state.world.flags.miriGiftGiven = true;
        addItem(state, "moonleaf", 1);
        gameMessage("Miri slips you fresh moonleaf for the road.", "loot", true);
      } else {
        gameMessage("Miri: If you have the sigils and materials, forge the Warded Key here.", "dialogue", true);
      }
      break;

    case "elira": {
      const healAmount = 4;
      const before = state.player.hp;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
      const restored = state.player.hp - before;
      if (restored > 0) {
        gameMessage(`Elira offers a blessing and restores ${restored} HP.`, "success", true);
      }
      break;
    }

    case "neverember":
      if (!state.world.flags.acceptedMainQuest) {
        gameMessage("Neverember: Serra will brief you. The city cannot wait.", "dialogue", true);
      } else {
        gameMessage("Neverember: Act quickly. Vexira's ritual grows stronger by the day.", "dialogue", true);
      }
      break;

    case "vexira":
      gameMessage("Vexira: Bring your key and your courage. Both will burn.", "dialogue", true);
      break;

    default:
      break;
  }
}

function beginEncounter(locationId) {
  const encounter = ENCOUNTERS[locationId];
  if (!encounter) {
    gameMessage("No encounter is available here.", "system", true);
    return;
  }

  if (state.world.flags[encounter.flagReward]) {
    gameMessage("This district has already been secured.", "system", true);
    return;
  }

  startCombat(encounter.enemy, {
    title: encounter.title,
    description: encounter.description,
    flagReward: encounter.flagReward,
    encounterId: encounter.id,
    isBoss: false
  });
}

function beginBossFight() {
  if (!canChallengeBoss()) {
    gameMessage("You are not ready to breach Vexira's barrier.", "failure", true);
    return;
  }

  startCombat(FINAL_BOSS, {
    title: "Final Battle",
    description: "Vexira tears open the ash storm and advances.",
    flagReward: null,
    encounterId: "vexira_boss",
    isBoss: true
  });
}

function canChallengeBoss() {
  return allSigilsRecovered() && state.world.flags.forgedWardedKey && !state.world.flags.defeatedVexira;
}

function allSigilsRecovered() {
  return state.world.flags.tide_sigil_won && state.world.flags.shadow_sigil_won && state.world.flags.flame_sigil_won;
}

function startCombat(enemyTemplate, meta) {
  state.ui.mode = "default";
  state.combat = {
    enemy: {
      ...enemyTemplate,
      maxHp: enemyTemplate.hp,
      hp: enemyTemplate.hp
    },
    meta
  };

  gameMessage(`${meta.title}: ${meta.description}`, "combat-care2g", true);
}

function handleCombatAction(actionId) {
  if (!state.combat) {
    return;
  }

  if (actionId === "combat:attack") {
    playerWeaponAttack();
    return;
  }

  if (actionId === "combat:potion") {
    useHealingPotion();
    return;
  }

  if (actionId === "combat:flee") {
    attemptFlee();
    return;
  }

  if (actionId.startsWith("combat:spell:")) {
    castSpell(actionId.replace("combat:spell:", ""));
  }
}

function playerWeaponAttack() {
  const classDef = classLookup[state.player.classId];
  const enemy = state.combat.enemy;

  const attackRoll = rollDie(20);
  const attackBonus = abilityMod(state.player.abilities[classDef.primaryAbility]) + 2;
  const totalAttack = attackRoll + attackBonus;

  if (attackRoll === 1 || totalAttack < enemy.ac) {
    gameMessage(`Attack roll ${attackRoll} + ${attackBonus} = ${totalAttack}. Miss.`, "roll-result", true);
    enemyTurn();
    return;
  }

  let damage = rollExpr(classDef.weaponDamage).total;
  if (attackRoll === 20) {
    damage += rollExpr(classDef.weaponDamage).total;
  }

  damage += consumeMarkDamage();

  enemy.hp = Math.max(0, enemy.hp - damage);
  gameMessage(`Attack roll ${attackRoll} + ${attackBonus} = ${totalAttack}. Hit for ${damage}.`, "roll-result", true);

  if (enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }

  enemyTurn();
}

function castSpell(spellId) {
  const spell = spellLookup[spellId];
  if (!spell) {
    return;
  }

  if (spell.type === "slot") {
    if (state.player.spellSlots.current <= 0) {
      gameMessage("No spell slots available.", "failure", true);
      return;
    }
    state.player.spellSlots.current -= 1;
  }

  const enemy = state.combat.enemy;

  if (spell.damage) {
    let damage = 0;
    if (spell.id === "sacred_flame") {
      const saveRoll = rollDie(20) + 2;
      if (saveRoll < 13) {
        damage = rollExpr(spell.damage).total;
      }
      gameMessage(`Sacred Flame save check: ${saveRoll}.`, "roll-result", true);
    } else {
      damage = rollExpr(spell.damage).total;
    }

    damage += consumeMarkDamage();

    if (damage > 0) {
      enemy.hp = Math.max(0, enemy.hp - damage);
      gameMessage(`${spell.name} deals ${damage} damage.`, "success", true);
    } else {
      gameMessage(`${spell.name} fails to connect.`, "failure", true);
    }
  }

  if (spell.effect === "heal") {
    const heal = rollExpr(spell.amount).total;
    const before = state.player.hp;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    gameMessage(`${spell.name} restores ${state.player.hp - before} HP.`, "success", true);
  }

  if (spell.effect === "ac_boost") {
    state.player.status.acBoostTurns = 1;
    gameMessage("Arcane shield surrounds you until the next enemy turn.", "success", true);
  }

  if (spell.effect === "temp_hp") {
    state.player.tempHp = Math.max(state.player.tempHp, spell.amount);
    gameMessage(`You gain ${spell.amount} temporary HP.`, "success", true);
  }

  if (spell.effect === "mark") {
    state.player.status.markDice = spell.amount;
    state.player.status.markTurns = 3;
    gameMessage("Target is marked for extra damage on your next hits.", "success", true);
  }

  if (enemy.hp <= 0) {
    resolveCombatVictory();
    return;
  }

  enemyTurn();
}
function consumeMarkDamage() {
  if (!state.player.status.markDice || state.player.status.markTurns <= 0) {
    return 0;
  }

  state.player.status.markTurns -= 1;
  const bonus = rollExpr(state.player.status.markDice).total;
  if (state.player.status.markTurns <= 0) {
    state.player.status.markDice = null;
  }

  gameMessage(`Mark effect adds ${bonus} damage.`, "roll-result", true);
  return bonus;
}

function useHealingPotion() {
  const item = findInventoryItem(state, "healing_potion");
  if (!item || item.qty <= 0) {
    gameMessage("No healing potion available.", "failure", true);
    return;
  }

  removeItem(state, "healing_potion", 1);
  const heal = rollExpr(ITEMS.healing_potion.heal).total;
  const before = state.player.hp;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
  gameMessage(`You drink a potion and recover ${state.player.hp - before} HP.`, "success", true);

  enemyTurn();
}

function attemptFlee() {
  const check = rollDie(20) + abilityMod(state.player.abilities.dex);
  if (check >= 13) {
    state.combat = null;
    gameMessage(`Escape check ${check}: success. You break away from combat.`, "system", true);
    return;
  }

  gameMessage(`Escape check ${check}: failed.`, "failure", true);
  enemyTurn();
}

function enemyTurn() {
  if (!state.combat) {
    return;
  }

  const enemy = state.combat.enemy;
  const defensiveBoost = state.player.status.acBoostTurns > 0 ? 3 : 0;
  const ac = state.player.ac + defensiveBoost;

  const roll = rollDie(20);
  const total = roll + enemy.attackBonus;
  if (roll === 1 || total < ac) {
    gameMessage(`${enemy.name} attack ${roll} + ${enemy.attackBonus} = ${total}. Miss.`, "roll-result", true);
  } else {
    const damage = rollExpr(enemy.damage).total;
    applyDamageToPlayer(damage);
    gameMessage(`${enemy.name} hits for ${damage} damage.`, "combat-care2g", true);
  }

  if (state.player.status.acBoostTurns > 0) {
    state.player.status.acBoostTurns -= 1;
  }

  if (state.player.hp <= 0) {
    handlePlayerDefeat();
  }
}

function applyDamageToPlayer(damage) {
  let remaining = damage;

  if (state.player.tempHp > 0) {
    const absorbed = Math.min(state.player.tempHp, remaining);
    state.player.tempHp -= absorbed;
    remaining -= absorbed;
  }

  if (remaining > 0) {
    state.player.hp = Math.max(0, state.player.hp - remaining);
  }
}

function handlePlayerDefeat() {
  if (removeItem(state, "revival_salt", 1)) {
    state.player.hp = Math.max(1, Math.floor(state.player.maxHp / 3));
    state.combat = null;
    gameMessage("Revival Salt drags you back from death's edge.", "success", true);
    return;
  }

  state.combat = null;
  const lostGold = Math.min(15, state.player.gold);
  state.player.gold -= lostGold;
  state.player.hp = Math.max(1, Math.floor(state.player.maxHp / 2));
  state.player.spellSlots.current = Math.min(1, state.player.spellSlots.max);
  state.world.locationId = "hall_of_justice";
  state.world.day += 1;

  gameMessage(
    `You collapse and awaken in the Hall of Justice infirmary. Penalty: -${lostGold} gold and one lost day.`,
    "failure",
    true
  );
}

function resolveCombatVictory() {
  if (!state.combat) {
    return;
  }

  const enemy = state.combat.enemy;
  const meta = state.combat.meta;

  state.player.gold += enemy.gold;
  gameMessage(`Victory over ${enemy.name}.`, "success", true);
  gameMessage(`Looted ${enemy.gold} gold.`, "loot", true);

  enemy.loot.forEach((itemId) => {
    addItem(state, itemId, 1);
    const item = ITEMS[itemId];
    if (item) {
      gameMessage(`Loot: ${item.name}.`, "loot", true);
    }
  });

  const leveledUp = gainXp(state, enemy.xp);
  gameMessage(`XP gained: ${enemy.xp}.`, "xp-gain", true);
  if (leveledUp) {
    gameMessage(`Level up! You are now level ${state.player.level}.`, "success", true);
    state.player.spellSlots.current = state.player.spellSlots.max;
  }

  if (meta.flagReward) {
    state.world.flags[meta.flagReward] = true;
  }

  if (meta.encounterId === "sunken_pier_skirmish" && state.world.flags.smugglerBriefed) {
    state.world.flags.smugglerCleared = true;
  }

  if (meta.isBoss) {
    state.world.flags.defeatedVexira = true;
    state.world.ending = "victory";
    completeQuest("main_quest");
    gameMessage("Chapter Complete: Vexira falls and the rift stabilizes.", "chapter", true);
    gameMessage("You have secured a full victory path from start to ending.", "success", true);
  }

  state.combat = null;
  checkQuestMilestones();
}

function checkQuestMilestones() {
  if (allSigilsRecovered() && !state.world.flags.sigilsAnnounced) {
    state.world.flags.sigilsAnnounced = true;
    gameMessage("All three sigils are recovered. Forge the Warded Key in the Crafting Hall.", "system", true);
  }

  if (state.world.flags.forgedWardedKey && !state.world.flags.keyAnnounced) {
    state.world.flags.keyAnnounced = true;
    gameMessage("Warded Key forged. Travel to Mount Hotenow and challenge Vexira.", "system", true);
  }
}

function restParty() {
  if (!state || state.combat) {
    return;
  }

  const restCost = 8;
  if (state.player.gold < restCost) {
    gameMessage(`Rest costs ${restCost} gold. You do not have enough.`, "failure", true);
    renderGame();
    return;
  }

  state.player.gold -= restCost;
  state.player.hp = state.player.maxHp;
  state.player.tempHp = 0;
  state.player.spellSlots.current = state.player.spellSlots.max;
  state.world.day += 1;

  gameMessage(`You complete a long rest. -${restCost} gold.`, "success", true);
  renderGame();
}

function activateQuest(questId) {
  if (state.quests.completed.includes(questId)) {
    return;
  }

  if (!state.quests.active.includes(questId)) {
    state.quests.active.push(questId);
  }
}

function completeQuest(questId) {
  state.quests.active = state.quests.active.filter((id) => id !== questId);
  if (!state.quests.completed.includes(questId)) {
    state.quests.completed.push(questId);
  }
}

function getQuestStageTextMap() {
  const map = {};
  if (state.quests.active.includes("main_quest")) {
    map.main_quest = getMainQuestStageText();
  }

  if (state.quests.active.includes("smuggler_chain")) {
    map.smuggler_chain = getSmugglerQuestText();
  }

  return map;
}

function getMainQuestStageText() {
  if (!state.world.flags.acceptedMainQuest) {
    return "Speak with Captain Serra in Protector's Enclave.";
  }

  if (!allSigilsRecovered()) {
    const missing = [];
    if (!state.world.flags.tide_sigil_won) {
      missing.push("Tidal Sigil");
    }
    if (!state.world.flags.shadow_sigil_won) {
      missing.push("Shadow Sigil");
    }
    if (!state.world.flags.flame_sigil_won) {
      missing.push("Flame Sigil");
    }
    return `Recover remaining sigils: ${missing.join(", ")}.`;
  }

  if (!state.world.flags.forgedWardedKey) {
    return "Craft the Warded Key in the Crafting Hall.";
  }

  if (!state.world.flags.defeatedVexira) {
    return "Travel to Mount Hotenow and defeat Vexira.";
  }

  return "Return to Protector's Enclave and report success.";
}

function getSmugglerQuestText() {
  if (!state.world.flags.smugglerBriefed) {
    return "Speak with Tormund in Blacklake.";
  }

  if (!state.world.flags.smugglerCleared) {
    return "Defeat the smuggler cell at Sunken Pier.";
  }

  return "Collect your reward from Whisper or Kael.";
}

function gameMessage(text, type, includeInLog) {
  appendNarrative(text, type);
  if (includeInLog && state) {
    state.log.push(`[Day ${state.world.day}] ${text}`);
    if (state.log.length > 300) {
      state.log = state.log.slice(-300);
    }
  }
}

function applyRaceBonuses(baseAbilities, bonuses) {
  const result = { ...baseAbilities };
  Object.keys(bonuses).forEach((key) => {
    result[key] += bonuses[key];
  });
  return result;
}

function toLookup(list) {
  return list.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}
