// ================ DARK MODE ================
function updateDarkModeFromPref() {
  let dark = localStorage.getItem('orgscape-dark') === '1';
  document.body.classList.toggle('dark', dark);
  document.getElementById('darkmode-toggle').textContent = dark ? '☀️' : '🌙';
}
document.addEventListener('DOMContentLoaded', () => {
  updateDarkModeFromPref();
  document.getElementById('darkmode-toggle').onclick = () => {
    const newdark = !(document.body.classList.contains('dark'));
    if(newdark) localStorage.setItem('orgscape-dark', '1');
    else localStorage.setItem('orgscape-dark', '0');
    updateDarkModeFromPref();
  };
});
// ============================================================

/* --- all original game code up to and including startGame, createFloor, etc. unchanged --- */

// BELOW CHANGES:

// 1. More biomes, more icons:
game.floorTypes = [
  {name: 'Bureaucratic Labyrinth', desc:'Meandering cubicles and buzzing printers.', biome:'cubicle', icon:'░'},
  {name: 'Server Catacombs', desc:'Cold rooms full of blinking lights and mysterious cables.', biome:'server', icon:'💾'},
  {name: 'Rooftop Gardens', desc:'Quiet rest spots among strange plants and urban birds.', biome:'garden', icon:'🌷'},
  {name: 'Sub-basement', desc:'Looming pipes, ancient archives. Smells like old toner.', biome:'basement', icon:'⛓️'},
  {name: 'Open Plan Anomaly', desc:'Wide deskless weird echoes.', biome:'weird', icon:'🌀'},
  {name: 'Wellness Suite', desc:'Aromatherapy mist and aggressive mindfulness reps.', biome:'wellness', icon:'🧘'},
  {name: 'Stationery Vaults', desc:'Unfathomably deep rows of pens, post-its, paper.', biome:'vault', icon:'🗄️'},
];

// 2. More NPCs, relics, events can be added (see original code for structure) -- sample added later --

// 3. Floor map: more whimsical visual icons
function renderMap() {
  let mapStr = "";
  let b = game.floor;
  for (let y = 0; y < game.floorHeight; y++) {
    for (let x = 0; x < game.floorWidth; x++) {
      let p = game.player;
      const cell = b.grid[y][x];
      if (p.x === x && p.y === y) mapStr += "👤";
      else if (cell.npc) mapStr += "🧑";
      else if (cell.event) mapStr += "✨";
      else if (cell.items && cell.items.length) mapStr += "📂";
      else mapStr += b.icon || "□";
    }
    mapStr += "\n";
  }
  document.getElementById('floor-map').textContent = `Level ${game.floor.num}: ${game.floor.name}\n${mapStr}`;
}

// 4. Interactive event system
game.eventState = null;
function doSearch() {
  if(game.eventState) {
    logMsg("<i>Finish the current incident before exploring further!</i>");
    return;
  }
  let cell = getPlayerCell();
  if((cell.items && cell.items.length) || cell.event || cell.npc) {
    if(cell.items && cell.items.length) {
      let found = cell.items.pop();
      logMsg(`<b>You rummage and find:</b> ${found}`);
      game.player.inventory.push(found);
      updateInventory();
    }
    if(cell.event) {
      triggerEvent(cell.event,cell);
      // cell.event cleared after handling event
    }
    if(cell.npc) {
      logMsg(`<i>${cell.npc.name} is here. (<b>talk ${cell.npc.name.split(" ")[0].toLowerCase()}</b>)</i>`);
      if(!game.player.orgChart.includes(cell.npc.name))
        game.player.orgChart.push(cell.npc.name);
      updateOrgChart();
    }
  } else {
    logMsg("You find: a lot of bland carpet. Nothing interesting here.");
  }
}
function logEventChoices(ev,cell) {
  let ec = document.getElementById("event-choices");
  ec.innerHTML = '';
  ev.options.forEach(opt => {
    let btn = document.createElement('button');
    btn.textContent = opt.cmd.toUpperCase();
    btn.onclick = () => {
      resolveEvent(ev,opt,cell);
    }
    ec.appendChild(btn);
  });
}
function triggerEvent(ev,cell) {
  logMsg(`<b>OFFICE INCIDENT:</b><br>${ev.desc}`);
  logEventChoices(ev,cell);
  game.eventState = {ev, cell};
  // block other input!
}
function resolveEvent(ev,opt,cell) {
  let ec = document.getElementById("event-choices");
  ec.innerHTML = '';
  logMsg(`<b>Choice:</b> ${opt.cmd.toUpperCase()}<br>${opt.txt}`);
  if(opt.faction) Object.entries(opt.faction).forEach(([k,v]) => {
    game.player.reputation[k] = clamp((game.player.reputation[k]||0)+v, 0, 5);
  });
  if(opt.effect==="relic"){
    let relic = getRandom(game.relics);
    logMsg(`You gain a relic: <b>${relic.name}</b>! (${relic.desc})`);
    game.player.inventory.push(relic.name);
    updateInventory();
  }
  updateReputations();
  cell.event = null; // clear the event now
  game.eventState = null;
}

// 5. Allow commands for event choices
document.getElementById('command-form').onsubmit = function(e){
  e.preventDefault();
  let cmd = document.getElementById('command-input').value.trim();
  document.getElementById('command-input').value = '';
  if(game.eventState) {
    // Accept text command for interactive event
    let ev = game.eventState.ev;
    let cell = game.eventState.cell;
    let opt = ev.options.find(o => o.cmd===cmd.toLowerCase());
    if(opt) return resolveEvent(ev,opt,cell);
    logMsg("<i>Choose a valid event option (or click).</i>");
    return;
  }
  handleCommand(cmd);
};

// 6. Online echoes – save and fetch
async function saveOrgEcho() {
  // Demo (pseudo):
  // Use service like JSONBin.io, Gist, etc.
  // Here, for demo, just use localStorage so echoes persist for you.
  let code = game.player.id;
  localStorage.setItem(`orgscape-echo-${code}`, makeIncidentReport());
}
async function loadOrgEcho(code) {
  // Demo: read from localStorage, but in "real", would fetch by code.
  let s = localStorage.getItem(`orgscape-echo-${code}`);
  if(s) logMsg(`<i>Echo from Org Run ${code}:</i><br><pre>${s}</pre>`);
}

// Optionally load echoes for friend's run:
async function checkForEcho(){
  let url = new URL(window.location.href);
  let code = url.searchParams.get('orgcode');
  if(code) await loadOrgEcho(code);
}

// Call on start
window.onload = async function() {
  startGame();
  await checkForEcho();
}

// When losing (gameover), save echo:
function checkEndings() {
  if(game.player.energy <= 0) {
    logMsg(`<span style="color:red;"><b>You're burned out! You wake up at Level 0, your head buzzing.</b></span>`);
    game.player.energy = 10;
    game.player.sanity--;
    game.player.x = 2; game.player.y = 2;
    createFloor();
    renderAll();
    saveOrgEcho();
    return;
  }
  if(game.player.sanity <= 0) {
    logMsg(`<span style="color:red;"><b>Your grip on office reality slips. The world reboots.</b></span>`);
    saveOrgEcho();
    startGame();
    return;
  }
}

// To share org echo: just copy your URL to a friend with the query ?orgcode=YOURCODE

// --- (Rest of your original game code unchanged...)