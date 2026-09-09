const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_LABELS = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA"
};

function optionCard(kind, entry, selectedId) {
  const selectedClass = entry.id === selectedId ? " selected" : "";
  const traits = entry.traits ? `<div class="traits">${entry.traits}</div>` : "";
  return `<button class="cc-option${selectedClass}" data-kind="${kind}" data-id="${entry.id}">
    <div class="name">${entry.name}</div>
    <div class="desc">${entry.description}</div>
    ${traits}
  </button>`;
}

function abilityCell(key, score) {
  const mod = Math.floor((score - 10) / 2);
  const modText = mod >= 0 ? `+${mod}` : `${mod}`;
  return `<div class="cc-ability">
    <div class="label">${ABILITY_LABELS[key]}</div>
    <div class="score">${score}</div>
    <div class="mod">${modText}</div>
    <div class="controls">
      <button class="ctrl-btn" data-ability="${key}" data-delta="-1">-</button>
      <span class="base-score">${score}</span>
      <button class="ctrl-btn" data-ability="${key}" data-delta="1">+</button>
    </div>
  </div>`;
}

function inventoryRows(inventory, itemLookup) {
  if (!inventory.length) {
    return "<div class=\"system\">No items in pack.</div>";
  }

  return inventory
    .map((entry) => {
      const item = itemLookup[entry.itemId];
      const name = item ? item.name : entry.itemId;
      const type = item ? item.type : "misc";
      return `<div class="inv-item"><div class="item-type">${type}</div><div class="item-name common">${name}</div><div class="item-desc">Quantity: ${entry.qty}</div></div>`;
    })
    .join("");
}

export function switchScreen(screen) {
  const title = document.getElementById("title-screen");
  const creation = document.getElementById("char-creation");
  const game = document.getElementById("game-screen");

  title.style.display = screen === "title" ? "flex" : "none";
  creation.style.display = screen === "creation" ? "block" : "none";
  game.style.display = screen === "game" ? "flex" : "none";
}

export function renderCharacterCreation(container, model) {
  const raceCards = model.races
    .map((race) => optionCard("race", race, model.selected.raceId))
    .join("");

  const classCards = model.classes
    .map((classDef) => optionCard("class", classDef, model.selected.classId))
    .join("");

  const backgroundCards = model.backgrounds
    .map((entry) => optionCard("background", entry, model.selected.backgroundId))
    .join("");

  const abilityCells = ABILITY_KEYS
    .map((key) => abilityCell(key, model.abilities[key]))
    .join("");

  container.innerHTML = `
  <div class="cc-container">
    <div class="cc-header">
      <h1>Create Your Adventurer</h1>
      <p>Build a character and enter Neverwinter.</p>
    </div>

    <div class="cc-section">
      <label for="pc-name">Name</label>
      <input type="text" id="pc-name" maxlength="36" placeholder="Your character name" value="${model.selected.name}">
    </div>

    <div class="cc-section">
      <h2>Race</h2>
      <div class="cc-grid">${raceCards}</div>
    </div>

    <div class="cc-section">
      <h2>Class</h2>
      <div class="cc-grid">${classCards}</div>
    </div>

    <div class="cc-section">
      <h2>Background</h2>
      <div class="cc-grid">${backgroundCards}</div>
    </div>

    <div class="cc-section">
      <h2>Abilities</h2>
      <div class="points-display">Points Remaining: <span id="points-remaining">${model.pointsRemaining}</span></div>
      <div class="cc-abilities">${abilityCells}</div>
    </div>

    <div class="cc-section">
      <label for="pc-notes">Backstory Notes</label>
      <textarea id="pc-notes" placeholder="Optional roleplay notes">${model.selected.notes}</textarea>
    </div>

    <div class="cc-preview">
      <h3>Summary</h3>
      <div class="preview-stat"><span>Name</span><span class="val">${model.selected.name || "Unnamed"}</span></div>
      <div class="preview-stat"><span>Race</span><span class="val">${model.selected.raceName}</span></div>
      <div class="preview-stat"><span>Class</span><span class="val">${model.selected.className}</span></div>
      <div class="preview-stat"><span>Background</span><span class="val">${model.selected.backgroundName}</span></div>
    </div>

    <div class="btn-group" style="margin:20px 0 30px;justify-content:center">
      <button class="btn" id="creation-back-btn">Back</button>
      <button class="btn btn-primary" id="creation-start-btn" ${model.canStart ? "" : "disabled"}>Begin Adventure</button>
    </div>
  </div>`;
}

export function appendNarrative(message, type = "prose") {
  const narrative = document.getElementById("narrative");
  const block = document.createElement("div");
  block.className = `entry ${type}`;
  block.textContent = message;
  narrative.appendChild(block);

  const panel = document.getElementById("narrative-panel");
  panel.scrollTop = panel.scrollHeight;
}

export function clearNarrative() {
  const narrative = document.getElementById("narrative");
  narrative.innerHTML = "";
}

export function renderActions(actions) {
  const actionsEl = document.getElementById("actions");
  actionsEl.innerHTML = actions
    .map((action) => {
      const variant = action.variant ? ` ${action.variant}` : "";
      const disabled = action.disabled ? "disabled" : "";
      const title = action.hint ? `title="${action.hint}"` : "";
      return `<button class="btn${variant}" data-action-id="${action.id}" ${title} ${disabled}>${action.label}</button>`;
    })
    .join("");
}

export function updateHeader(locationName, brief) {
  document.getElementById("location-name").textContent = locationName;
  document.getElementById("char-brief").textContent = brief;
}

export function renderScenePanel(location, scene, ambience) {
  const imageEl = document.getElementById("scene-image");
  const kickerEl = document.getElementById("scene-kicker");
  const titleEl = document.getElementById("scene-title");
  const captionEl = document.getElementById("scene-caption");
  const tagsEl = document.getElementById("scene-tags");

  imageEl.src = scene.image;
  imageEl.alt = `${location.name} scene art`;
  kickerEl.textContent = location.name;
  titleEl.textContent = scene.title;
  captionEl.textContent = `${scene.caption} The district feels like ${ambience.atmosphere}.`;
  tagsEl.innerHTML = ambience.tags.map((tag) => `<span class="scene-tag">${tag}</span>`).join("");
}

export function setSidebarTab(tabId) {
  const tabEls = Array.from(document.querySelectorAll(".sidebar-tab"));
  const panelEls = Array.from(document.querySelectorAll(".sidebar-panel"));

  tabEls.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });

  panelEls.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabId}`);
  });
}

export function renderSidebar(state, context) {
  const player = state.player;
  const hpPercent = Math.max(0, Math.round((player.hp / Math.max(1, player.maxHp)) * 100));
  const classDef = context.classLookup[player.classId];
  const race = context.raceLookup[player.raceId];

  document.getElementById("panel-character").innerHTML = `
    <div class="cs-name">${player.name}</div>
    <div class="cs-info">${race.name} ${classDef.name} | Level ${player.level}</div>
    <div class="cs-hp">
      <div class="hp-bar">
        <div class="hp-fill" style="width:${hpPercent}%;background:${hpPercent > 35 ? "var(--green)" : "var(--red)"}"></div>
      </div>
      <div style="font-size:.9em;color:var(--text-dim);margin-top:6px">HP ${player.hp}/${player.maxHp} | AC ${player.ac} | Gold ${player.gold}</div>
    </div>
    <div class="preview-stat"><span>STR</span><span class="val">${player.abilities.str}</span></div>
    <div class="preview-stat"><span>DEX</span><span class="val">${player.abilities.dex}</span></div>
    <div class="preview-stat"><span>CON</span><span class="val">${player.abilities.con}</span></div>
    <div class="preview-stat"><span>INT</span><span class="val">${player.abilities.int}</span></div>
    <div class="preview-stat"><span>WIS</span><span class="val">${player.abilities.wis}</span></div>
    <div class="preview-stat"><span>CHA</span><span class="val">${player.abilities.cha}</span></div>
  `;

  document.getElementById("panel-inventory").innerHTML = inventoryRows(player.inventory, context.itemLookup);

  const activeQuestRows = state.quests.active.length
    ? state.quests.active
        .map((questId) => {
          const quest = context.questLookup[questId];
          const stageText = context.questStageText && context.questStageText[questId]
            ? context.questStageText[questId]
            : quest.summary;
          return `<div class="quest-entry active"><div class="quest-name">${quest.name}</div><div class="quest-desc">${quest.summary}</div><div class="quest-stage">${stageText}</div></div>`;
        })
        .join("")
    : "<div class=\"system\">No active quests.</div>";

  const completedRows = state.quests.completed.length
    ? `<div style="margin-top:12px;color:var(--green)">Completed quests: ${state.quests.completed.length}</div>`
    : "";

  document.getElementById("panel-quests").innerHTML = `${activeQuestRows}${completedRows}`;

  const spellRows = player.knownSpells.length
    ? player.knownSpells
        .map((spellId) => {
          const spell = context.spellLookup[spellId];
          if (!spell) {
            return "";
          }
          const meta = spell.damage ? `Damage ${spell.damage}` : spell.effect ? `Effect ${spell.effect}` : "Utility";
          return `<div class="spell-entry"><div class="spell-name">${spell.name}</div><div class="spell-school">${spell.school}</div><div class="spell-desc">${spell.description}</div><div class="spell-meta">${meta}</div></div>`;
        })
        .join("")
    : "<div class=\"system\">No spells prepared.</div>";

  document.getElementById("panel-spells").innerHTML = `
    <div style="margin-bottom:8px;color:var(--gold)">Spell Slots: ${player.spellSlots.current}/${player.spellSlots.max}</div>
    ${spellRows}
  `;

  const logRows = state.log.length
    ? state.log.slice(-25).reverse().map((line) => `<div class="log-entry">${line}</div>`).join("")
    : "<div class=\"system\">Log is empty.</div>";
  document.getElementById("panel-log").innerHTML = logRows;

  document.getElementById("panel-help").innerHTML = `
    <div class="system">Core loop: travel, talk, fight, craft, and finish the main quest.</div>
    <div class="system">Each district now has ambient actions like smelling around, listening, perception checks, investigation, journaling, prayer, and quiet downtime.</div>
    <div class="system">You can save at any time from the header.</div>
    <div class="system">If you fall in battle, you recover at the temple with penalties.</div>
    <div class="system">Craft a Warded Key before challenging Vexira.</div>
  `;
}
