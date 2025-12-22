/*
ORGSCAPE: The Infinite Office
Made by joshuaparrisdadlan-stack, 2024-2025

Fun, quirky browser-based text roguelike.
*/

const game = {
  log: [],
  floor: null, // current floor/grid
  eventState: null,
  cmdHistory: [],
  cmdIndex: 0,
  player: {
    x: 2,
    y: 2,
    floorLevel: 0,
    energy: 10,
    sanity: 10,
    reputation: {
      Students: 2,
      Staff: 2,
      Admin: 2,
      Facilities: 2,
      'Quiet Ones': 0
    },
    inventory: [],
    tasks: [],
    orgChart: [],
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    runEchoes: []
  },
  floorTypes: [
    { name: 'Bureaucratic Labyrinth', desc: 'Meandering cubicles and buzzing printers.', biome: 'cubicle', icon: '░' },
    { name: 'Server Catacombs', desc: 'Cold rooms full of blinking lights and mysterious cables.', biome: 'server', icon: '💾' },
    { name: 'Rooftop Gardens', desc: 'Quiet rest stops among strange plants and urban birds.', biome: 'garden', icon: '🌷' },
    { name: 'Sub-basement', desc: 'Looming pipes, ancient archives. Smells like old toner.', biome: 'basement', icon: '⛓️' },
    { name: 'Open Plan Anomaly', desc: 'Wide deskless spaces with echoes.', biome: 'weird', icon: '🌀' },
    { name: 'Wellness Suite', desc: 'Aromatherapy mist and aggressive mindfulness reps.', biome: 'wellness', icon: '🧘' },
    { name: 'Stationery Vaults', desc: 'Unfathomably deep rows of pens, post-its, paper.', biome: 'vault', icon: '🗄️' }
  ],
  directions: {
    north: { x: 0, y: -1, arrow: '↑' },
    south: { x: 0, y: 1, arrow: '↓' },
    east:  { x: 1, y: 0, arrow: '→' },
    west:  { x: -1, y: 0, arrow: '←' }
  },
  npcs: [
    { name: 'Admin Debbie', role: 'Admin', desc: 'Her desk is a paper-fortress. Eyes like spreadsheets.', faction: 'Admin' },
    { name: 'IT Gremlin', role: 'Tech', desc: 'Small, fast, erratic. Smells faintly of ozone.', faction: 'Facilities' },
    { name: 'Overwhelmed Coordinator', role: 'Coordinator', desc: 'Carries seven lanyards and a haunted look.', faction: 'Staff' },
    { name: 'Night Cleaner', role: 'Cleaner', desc: 'You mostly hear the squeak of their cart.', faction: 'Facilities' },
    { name: 'Rogue Printer Tech', role: 'Printer Tech', desc: 'Fixes printers with a rubber chicken.', faction: 'Admin' },
    { name: 'Student Rep', role: 'Rep', desc: 'Trying to unionise a student snack club.', faction: 'Students' }
  ],
  relics: [
    { name: "Mug of Unbreakable Focus", desc: "+1 max Sanity", bonus: "sanity" },
    { name: "Magic Stapler", desc: "Never jams. Sometimes removes staples *preemptively*.", bonus: "event" },
    { name: "Infinite Highlighter", desc: "Can draw attention or hide info as required.", bonus: "event" },
    { name: "Master Lanyard", desc: "Opens any door. Once.", bonus: "unlock" },
    { name: "Desk Plant of Resilience", desc: "Whispers motivational quotes at 3am.", bonus: "sanity" }
  ],
  events: [
    // Base event templates - these will be used for procedural generation
    {
      desc: "A critical email arrives at 4:58pm. Do you: RESPOND, FORWARD, IGNORE, ARCHIVE?",
      options: [
        {cmd:"respond", txt:"You reply promptly. Staff are impressed, but Students wanted help.", faction: {Staff:1,Students:-1}},
        {cmd:"forward", txt:"You forward it to… someone. Admin caught you stalling.", faction: {Admin:-1,Staff:0}},
        {cmd:"ignore", txt:"You ignore and hope for the best. The Quiet Ones mark your name.", faction: {'Quiet Ones':1}},
        {cmd:"archive", txt:"You archive bravely. Staff think you're flaky. Facilities smile.", faction:{Staff:-1,Facilities:1}}
      ],
      template: 'email',
      contexts: ['any']
    },
    {
      desc: "The printer jams! Options: REPAIR, KICK, CALL-IT, SACRIFICE-FORM.",
      options: [
        {cmd:"repair", txt:"You tinker and (somehow) fix it. Facilities up, Admin resentful.", faction:{Facilities:1,Admin:-1}},
        {cmd:"kick", txt:"You kick it to life. IT Gremlin approves. Your foot throbs.", faction:{Facilities:1}},
        {cmd:"call-it", txt:"You call IT. They take forever, but Admin likes your diligence.", faction:{Admin:1}},
        {cmd:"sacrifice-form", txt:"You sacrifice a sacred Form-27A. Printer appeased, but at what cost?", faction:{'Quiet Ones':1,Admin:-1}}
      ],
      template: 'printer',
      contexts: ['cubicle', 'server']
    },
    {
      desc: "You find the breakroom fridge has become… non-Euclidean. Options: INVESTIGATE, CLOSE, TAKE-MUG.",
      options: [
        {cmd:"investigate", txt:"You return older and wiser. Sanity -1 but gain item.", effect:"relic"},
        {cmd:"close", txt:"You shut the door and walk away. Calm, but opportunity missed.", faction:{Staff:1}},
        {cmd:"take-mug", txt:"You retrieve a mug of dubious provenance. Coffee refilled!"}
      ],
      template: 'fridge',
      contexts: ['wellness', 'cubicle']
    }
  ],
  
  // Event templates for procedural generation
  eventTemplates: {
    email: {
      subjects: ['urgent request', 'budget approval', 'meeting cancellation', 'policy update', 'complaint', 'praise'],
      times: ['4:58pm', '9:03am', '2:15pm', '11:47am', '5:01pm'],
      factions: ['Staff', 'Admin', 'Students', 'Facilities']
    },
    meeting: {
      types: ['standup', 'review', 'planning', 'emergency', 'social'],
      outcomes: ['productive', 'pointless', 'tense', 'inspiring']
    },
    equipment: {
      items: ['printer', 'scanner', 'coffee machine', 'projector', 'whiteboard'],
      states: ['jams', 'breaks', 'disappears', 'multiplies', 'speaks']
    },
    person: {
      roles: ['colleague', 'manager', 'intern', 'visitor', 'executive'],
      actions: ['asks for help', 'gives task', 'shares gossip', 'needs favor', 'offers item']
    },
    anomaly: {
      types: ['non-Euclidean', 'time-dilated', 'self-replicating', 'sentient', 'inverted'],
      locations: ['fridge', 'elevator', 'copy room', 'supply closet', 'parking lot']
    }
  },
  
  // Procedurally generated events (stored per floor)
  generatedEvents: {},
  floorWidth: 5,
  floorHeight: 5
};

// ===== UTILITY FUNCTIONS ======
function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(val,min,max){return Math.max(min,Math.min(max,val));}

// ===== DARK MODE =====
function updateDarkModeFromPref() {
  let dark = localStorage.getItem('orgscape-dark') === '1';
  document.body.classList.toggle('dark', dark);
  let btn = document.getElementById('darkmode-toggle');
  if (btn) btn.textContent = dark ? '☀️' : '🌙';
}
document.addEventListener('DOMContentLoaded', () => {
  updateDarkModeFromPref();
  let btn = document.getElementById('darkmode-toggle');
  if (btn) {
    btn.onclick = () => {
      const newdark = !(document.body.classList.contains('dark'));
      localStorage.setItem('orgscape-dark', newdark ? '1' : '0');
      updateDarkModeFromPref();
    };
  }
});

// ====== GAME INITIALIZATION =======
function startGame() {
  game.player = Object.assign(game.player, {
    x: 2,
    y: 2,
    floorLevel: 0,
    energy: 10,
    sanity: 10,
    inventory: [],
    tasks: [],
    orgChart: [],
    runEchoes: []
  });
  logClear();
  logMsg(`You blink awake at your desk. Somewhere in the Infinite Office.<br><em>Org Code:</em> <b>${game.player.id}</b>`);
  createFloor();
  renderAll();
  logMsg("Type <b>help</b> for available commands.");
}
window.onload = function() {
  startGame();
  updateDarkModeFromPref();
};

// ===== PROCEDURAL EVENT GENERATION ======
function generateEvent(context = {}) {
  const biome = context.biome || game.floor?.grid?.[game.player.y]?.[game.player.x]?.type || 'cubicle';
  const reputation = game.player.reputation || {};
  const inventory = game.player.inventory || [];
  const energy = game.player.energy || 10;
  const sanity = game.player.sanity || 10;
  const floorLevel = game.player.floorLevel || 0;
  
  // Determine event type based on context
  let eventType = 'email'; // default
  const rand = Math.random();
  
  if (biome === 'server' || biome === 'basement') {
    eventType = rand < 0.4 ? 'equipment' : rand < 0.7 ? 'anomaly' : 'person';
  } else if (biome === 'wellness' || biome === 'garden') {
    eventType = rand < 0.5 ? 'person' : rand < 0.8 ? 'meeting' : 'anomaly';
  } else if (biome === 'vault') {
    eventType = rand < 0.6 ? 'equipment' : 'anomaly';
  } else {
    eventType = rand < 0.3 ? 'email' : rand < 0.6 ? 'meeting' : rand < 0.8 ? 'person' : 'equipment';
  }
  
  // Generate event based on type
  const templates = game.eventTemplates;
  let event = null;
  
  switch(eventType) {
    case 'email': {
      const subject = getRandom(templates.email.subjects);
      const time = getRandom(templates.email.times);
      const faction = getRandom(templates.email.factions);
      event = {
        desc: `A ${subject} email arrives at ${time}. Do you: RESPOND, FORWARD, IGNORE, ARCHIVE?`,
        options: [
          {cmd:"respond", txt:`You reply promptly. ${faction} are impressed.`, faction: {[faction]:1}},
          {cmd:"forward", txt:"You forward it. Someone notices your delegation.", faction: {Admin:-1}},
          {cmd:"ignore", txt:"You ignore it. The Quiet Ones take note.", faction: {'Quiet Ones':1}},
          {cmd:"archive", txt:"You archive it. Efficient, but some feel ignored.", faction:{Staff:-1}}
        ],
        template: 'email',
        generated: true
      };
      break;
    }
    
    case 'meeting': {
      const meetingType = getRandom(templates.meeting.types);
      const outcome = getRandom(templates.meeting.outcomes);
      event = {
        desc: `A ${meetingType} meeting is called. Do you: ATTEND, SKIP, SEND-PROXY, RESCHEDULE?`,
        options: [
          {cmd:"attend", txt:`You attend. The meeting is ${outcome}.`, faction: {Staff:1}, effect: energy > 5 ? 'energy:-1' : null},
          {cmd:"skip", txt:"You skip. Freedom, but reputation takes a hit.", faction: {Staff:-1, Admin:-1}},
          {cmd:"send-proxy", txt:"You send a proxy. Clever, but impersonal.", faction: {Staff:0}},
          {cmd:"reschedule", txt:"You reschedule. Organized, but some are annoyed.", faction: {Admin:-1, Staff:1}}
        ],
        template: 'meeting',
        generated: true
      };
      break;
    }
    
    case 'equipment': {
      const item = getRandom(templates.equipment.items);
      const state = getRandom(templates.equipment.states);
      event = {
        desc: `The ${item} ${state}! Do you: FIX, REPORT, IGNORE, IMPROVISE?`,
        options: [
          {cmd:"fix", txt:`You attempt to fix the ${item}. Success varies.`, faction: {Facilities:1}, effect: energy > 3 ? 'energy:-2' : null},
          {cmd:"report", txt:"You report it. Proper procedure, but slow.", faction: {Admin:1}},
          {cmd:"ignore", txt:"You ignore it. Someone else will handle it... right?", faction: {Facilities:-1}},
          {cmd:"improvise", txt:"You improvise a solution. Creative, but risky.", faction: {Facilities:1, Admin:-1}}
        ],
        template: 'equipment',
        generated: true
      };
      break;
    }
    
    case 'person': {
      const role = getRandom(templates.person.roles);
      const action = getRandom(templates.person.actions);
      event = {
        desc: `A ${role} ${action}. Do you: HELP, DEFER, REFUSE, NEGOTIATE?`,
        options: [
          {cmd:"help", txt:`You help the ${role}. Good karma.`, faction: {Staff:1}, effect: energy > 2 ? 'energy:-1' : null},
          {cmd:"defer", txt:"You defer to someone else. Safe, but unhelpful.", faction: {Staff:-1}},
          {cmd:"refuse", txt:"You refuse. Harsh, but honest.", faction: {Staff:-2}},
          {cmd:"negotiate", txt:"You negotiate terms. Professional.", faction: {Staff:1, Admin:1}}
        ],
        template: 'person',
        generated: true
      };
      break;
    }
    
    case 'anomaly': {
      const anomalyType = getRandom(templates.anomaly.types);
      const location = getRandom(templates.anomaly.locations);
      event = {
        desc: `The ${location} has become ${anomalyType}. Do you: INVESTIGATE, AVOID, DOCUMENT, INTERACT?`,
        options: [
          {cmd:"investigate", txt:`You investigate the ${anomalyType} ${location}. You gain insight... and an item.`, effect:"relic", faction: {'Quiet Ones':1}},
          {cmd:"avoid", txt:"You avoid it. Safe, but mysterious.", faction: {Staff:1}},
          {cmd:"document", txt:"You document it. Scientific approach.", faction: {Admin:1}},
          {cmd:"interact", txt:"You interact with it. Bold, but unpredictable.", effect: Math.random() < 0.5 ? 'sanity:-1' : 'relic', faction: {Facilities:1}}
        ],
        template: 'anomaly',
        generated: true
      };
      break;
    }
  }
  
  // Modify event based on player state
  if (sanity < 5) {
    // Low sanity = more surreal events
    event.desc = "⚠️ " + event.desc + " (Everything feels... off.)";
  }
  
  if (energy < 3) {
    // Low energy = events cost more
    event.options.forEach(opt => {
      if (opt.effect && opt.effect.includes('energy')) {
        const cost = parseInt(opt.effect.split(':')[1]) || 1;
        opt.effect = `energy:-${cost + 1}`;
      }
    });
  }
  
  // Floor level affects difficulty
  if (floorLevel > 2) {
    event.options.forEach(opt => {
      if (opt.faction) {
        Object.keys(opt.faction).forEach(f => {
          opt.faction[f] = Math.floor(opt.faction[f] * 1.5);
        });
      }
    });
  }
  
  return event;
}

// ===== FLOOR GENERATION ======
function createFloor() {
  let type = getRandom(game.floorTypes);
  let floor = [];
  
  // Generate procedural events for this floor
  const floorKey = `floor_${game.player.floorLevel}`;
  if (!game.generatedEvents[floorKey]) {
    game.generatedEvents[floorKey] = [];
    // Generate 3-5 unique events for this floor
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      game.generatedEvents[floorKey].push(generateEvent({ biome: type.biome }));
    }
  }
  
  const availableEvents = [...game.events.filter(e => !e.generated), ...game.generatedEvents[floorKey]];
  
  for (let y = 0; y < game.floorHeight; y++) {
    let row = [];
    for (let x = 0; x < game.floorWidth; x++) {
      let cell = {
        x, y,
        type: type.biome,
        seen: false,
        visits: 0,
        items: Math.random() < 0.3 ? [getRandom([
          "Old Keycard", "Blank Form", "Broken Mouse", "Crumpled Memo", getRandom(game.relics).name
        ])] : [],
        npc: Math.random()<0.18 ? getRandom(game.npcs): null,
        event: null
      };
      row.push(cell);
    }
    floor.push(row);
  }
  
  // Place events procedurally (1-3 per floor)
  const numEvents = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numEvents; i++) {
    let ex = Math.floor(Math.random()*game.floorWidth);
    let ey = Math.floor(Math.random()*game.floorHeight);
    // Don't place on player start
    if (ex !== 2 || ey !== 2) {
      floor[ey][ex].event = getRandom(availableEvents);
    }
  }
  
  // Place player in centre
  floor[2][2].seen = true;
  game.floor = {
    num: game.player.floorLevel,
    name: type.name,
    desc: type.desc,
    grid: floor
  };
  renderMap();
}

// ===== RENDERING ======
function renderMap() {
  const mapEl = document.getElementById('floor-map');
  const legendEl = document.getElementById('map-legend');
  if(!mapEl) return;
  // Title
  const title = `Level ${game.floor.num}: ${game.floor.name}`;
  // Grid
  const grid = document.createElement('div');
  grid.className = 'map-grid';
  grid.style.gridTemplateColumns = `repeat(${game.floorWidth}, 22px)`;
  for (let y = 0; y < game.floorHeight; y++) {
    for (let x = 0; x < game.floorWidth; x++) {
      const p = game.player;
      const cell = game.floor.grid[y][x];
      const span = document.createElement('span');
      span.className = `map-cell type-${cell.type}` +
        (cell.items && cell.items.length ? ' has-item' : '') +
        (cell.event ? ' has-event' : '') +
        (cell.npc ? ' has-npc' : '') +
        (p.x===x && p.y===y ? ' player' : '');
      let icon = '□';
      if (cell.items && cell.items.length) icon = '📂';
      if (cell.event) icon = '✨';
      if (cell.npc) icon = '🧑';
      if (p.x===x && p.y===y) icon = '👤';
      span.textContent = icon;
      span.title = `${cell.type}${cell.npc ? ' | ' + cell.npc.name : ''}${cell.event ? ' | incident' : ''}${(cell.items && cell.items.length) ? ' | item(s)' : ''}`;
      grid.appendChild(span);
    }
  }
  mapEl.innerHTML = '';
  const titleEl = document.createElement('span');
  titleEl.className = 'map-title';
  titleEl.textContent = title;
  mapEl.appendChild(titleEl);
  mapEl.appendChild(grid);
  if(legendEl){
    legendEl.innerHTML = `
      <span class="lg"><span class="swatch"></span> Empty</span>
      <span class="lg">📂 Item</span>
      <span class="lg">✨ Incident</span>
      <span class="lg">🧑 NPC</span>
      <span class="lg">👤 You</span>
    `;
  }
}
function renderAll() {
  renderMap();
  updateInventory();
  updateTasks();
  updateOrgChart();
  updateReputations();
}
function updateInventory() {
  let ilist = document.getElementById('inventory-list');
  ilist.innerHTML = '';
  if (!game.player.inventory.length) ilist.innerHTML = '<li><em>Empty</em></li>';
  game.player.inventory.forEach(i=> {
    ilist.innerHTML += `<li>${i}</li>`;
  });
}
function showInventory() {
  updateInventory();
  if (!game.player.inventory.length) {
    logMsg("<b>Inventory:</b> (empty)");
    return;
  }
  logMsg("<b>Inventory:</b>");
  game.player.inventory.forEach(i => logMsg(`- ${i}`));
}
function updateTasks() {
  let tlist = document.getElementById('tasks-list');
  tlist.innerHTML = '';
  if (!game.player.tasks.length) tlist.innerHTML = '<li><em>None</em></li>';
  game.player.tasks.forEach(t=> {
    tlist.innerHTML += `<li>${t}</li>`;
  });
}
function showTasks() {
  updateTasks();
  if (!game.player.tasks.length) { logMsg("<b>Tasks:</b> (none)"); return; }
  logMsg("<b>Tasks:</b>");
  game.player.tasks.forEach(t => logMsg(`- ${t}`));
}
function updateOrgChart() {
  let olist = document.getElementById('orgchart-list');
  olist.innerHTML = '';
  if (!game.player.orgChart.length) olist.innerHTML = '<li><em>No contacts</em></li>';
  game.player.orgChart.forEach(n=> {
    olist.innerHTML += `<li>${n}</li>`;
  });
}
function showOrgChart() {
  updateOrgChart();
  if (!game.player.orgChart.length) { logMsg("<b>Org Chart:</b> (no contacts)"); return; }
  logMsg("<b>Org Chart:</b>");
  game.player.orgChart.forEach(n => logMsg(`- ${n}`));
}
function updateReputations() {
  let repbox = document.getElementById('reputation-bars');
  repbox.innerHTML = '';
  Object.entries(game.player.reputation).forEach(([f, v]) => {
    let pct = clamp((v+2)/5,0,1);
    repbox.innerHTML += `
      <div class="reputation-bar-bg" style="position:relative;">
        <span class="reputation-bar-label">${f}</span>
        <div class="reputation-bar-fill" style="width:${Math.floor(pct*100)}%"></div>
      </div>
    `;
  });
}

// ========= GAME LOG ===========
function logMsg(html) {
  game.log.push(html);
  let gamelog = document.getElementById('gamelog');
  gamelog.innerHTML += `<div>${html}</div>`;
  gamelog.scrollTop = gamelog.scrollHeight;
}
function logClear() {
  document.getElementById('gamelog').innerHTML = "";
  game.log = [];
}

// ========= COMMAND HANDLER =========
document.getElementById('command-form').onsubmit = function(e){
  e.preventDefault();
  let cmd = document.getElementById('command-input').value.trim();
  document.getElementById('command-input').value = '';
  if(cmd) logMsg(`<span class="cmd">&gt; ${cmd}</span>`);
  if(cmd) {
    // Push into history, avoid immediate duplicate
    const last = game.cmdHistory[game.cmdHistory.length-1];
    if (last !== cmd) game.cmdHistory.push(cmd);
    game.cmdIndex = game.cmdHistory.length;
  }
  if(game.eventState) {
    let ev = game.eventState.ev;
    let cell = game.eventState.cell;
    let opt = ev.options.find(o => o.cmd===cmd.toLowerCase());
    if(opt) return resolveEvent(ev,opt,cell);
    logMsg("<i>Choose a valid event option (or click).</i>");
    return;
  }
  handleCommand(cmd);
};
// Command history with ArrowUp/ArrowDown
(function initHistoryNav(){
  const input = document.getElementById('command-input');
  if(!input) return;
  input.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowUp') {
      if(game.cmdHistory.length === 0) return;
      e.preventDefault();
      game.cmdIndex = Math.max(0, game.cmdIndex - 1);
      input.value = game.cmdHistory[game.cmdIndex] || '';
      // Move cursor to end
      setTimeout(()=>input.setSelectionRange(input.value.length, input.value.length));
    } else if(e.key === 'ArrowDown') {
      if(game.cmdHistory.length === 0) return;
      e.preventDefault();
      game.cmdIndex = Math.min(game.cmdHistory.length, game.cmdIndex + 1);
      input.value = game.cmdHistory[game.cmdIndex] || '';
      setTimeout(()=>input.setSelectionRange(input.value.length, input.value.length));
    }
  });
})();
function handleCommand(cmdStr) {
  if (!cmdStr) return;
  let [rawCmd, ...args] = cmdStr.toLowerCase().split(/\s+/);
  const command = rawCmd;
  const arg = args.join(" ");

  // Fuzzy: allow bare direction like "n"/"north"/"no"/"east", or "go n", "walk west"
  const dirAliases = {
    n: 'north', no: 'north', nor: 'north', north:'north', u:'north', up:'north',
    s: 'south', so: 'south', sou: 'south', south:'south', d:'south', down:'south',
    e: 'east', ea:'east', eas:'east', east:'east', r:'east', right:'east',
    w: 'west', we:'west', wes:'west', west:'west', l:'west', left:'west'
  };
  const moveVerbs = new Set(['move','go','walk']);
  if (dirAliases[command]) {
    return doMove(dirAliases[command]);
  }
  if (moveVerbs.has(command) && dirAliases[arg]) {
    return doMove(dirAliases[arg]);
  }

  // Fuzzy utility aliases
  if(['look','l','examine','search'].includes(command)) { doSearch(); return; }
  if(['inv','i','inventory'].includes(command)) { showInventory(); return; }
  if(['tasks','todo','t'].includes(command)) { showTasks(); return; }
  if(['status','stats'].includes(command)) { showStatus(); return; }
  if(['rest','wait','pause'].includes(command)) { doRest(); return; }

  // Show help
  if(["help","?"].includes(command)) {
    logMsg(`<b>Commands:</b> move north/south/east/west, search, talk &lt;name&gt;, file, scan, hack, confront, deflect, appease, escalate, delegate, ride lift, take stairs, rest, status, inventory, tasks, orgchart, help`);
    return;
  } 
  // Movement
  if(command === "move" && game.directions[arg]) {
    doMove(arg);
    return;
  }
  // Search environment
  if(command === "search") {
    doSearch();
    return;
  }
  // Talk to NPC
  if(command === "talk") {
    doTalk(arg);
    return;
  }
  // Take item(s)
  if(command === "take" || command === "pickup" || command === "grab") {
    doTake(arg);
    return;
  }
  // Confront/Conflict office style
  if(["confront","deflect","appease","escalate","delegate"].includes(command)) {
    doOfficeCombat(command);
    return;
  }
  if(command === "file") { doFile(); return; }
  if(command === "scan") { doScan(); return; }
  if(command === "hack") { doHack(); return; }
  if(command === "ride" && arg==="lift") { changeFloor(1); return; }
  if(command === "take" && arg==="stairs") { changeFloor(-1); return; }
  if(command === "rest") { doRest(); return; }
  if(command==="status") { showStatus(); return; }
  if(command==="inventory") { updateInventory(); return;}
  if(command==="tasks") { updateTasks(); return;}
  if(command==="orgchart"){ updateOrgChart(); return;}
  logMsg(`<span style="color:#757;">Unrecognised command.</span> (<b>help</b> for commands)`);
}

// ===== EXPLORATION =========
function doMove(dir) {
  let d = game.directions[dir];
  let p = game.player;
  let nx = p.x + d.x, ny = p.y + d.y;
  if(nx<0||ny<0||nx>=game.floorWidth||ny>=game.floorHeight) {
    logMsg(`There’s just a solid filing cabinet that way.<br/><em>You can't move ${dir}.</em>`);
    return;
  }
  p.x = nx; p.y = ny;
  const cell = game.floor.grid[ny][nx];
  cell.seen = true;
  cell.visits = (cell.visits||0) + 1;
  const moveLines = [
    `You walk ${dir} ${game.directions[dir].arrow}.`,
    `You head ${dir} ${game.directions[dir].arrow}.`,
    `You drift ${dir} ${game.directions[dir].arrow}.`,
    `You shuffle ${dir} ${game.directions[dir].arrow}.`,
    `You slip ${dir} ${game.directions[dir].arrow}.`
  ];
  logMsg(`<b>${getRandom(moveLines)}</b>`);
  // Show basic description
  let desc = cellDescription(nx, ny);
  logMsg(desc);
  renderMap();
  // Reduce energy!
  p.energy--;
  checkEndings();
}
function cellDescription(x,y){
  let cell = game.floor.grid[y][x];
  let lines = [];
  // Ambient per biome with variety
  const ambient = {
    cubicle: [
      "The smell of spilled toner hangs in the air.",
      "Rows of partitions muffle distant gossip.",
      "A stapler clicks somewhere like a metronome."
    ],
    server: [
      "Faint hum of machines; air is a cold soup.",
      "A fan howls softly; LEDs wink like city lights.",
      "Cable gutters criss-cross like roots."
    ],
    garden: [
      "Strange plants and even stranger birds flit by.",
      "Wind chimes tinkle without wind.",
      "Paving stones form a suspiciously deliberate pattern."
    ],
    basement: [
      "Deep pipes and archival boxes lurk in corners.",
      "Condensation taps out a slow beat.",
      "Dust motes drift like tiny planets."
    ],
    weird: [
      "The geometry here doesn't feel <em>correct</em>.",
      "Walls breathe in time with your steps.",
      "You cast two shadows, both impatient."
    ],
    wellness: [
      "Aromatherapy mist rolls across ergonomic chairs.",
      "Inspirational posters stare you down.",
      "A gong resonates from nowhere in particular."
    ],
    vault: [
      "Shelves of stationery stretch into vanishing points.",
      "You hear the faint clatter of paperclips migrating.",
      "The air smells like fresh cardboard and ambition."
    ]
  };
  // Only show ambient fully on first visit or occasionally thereafter
  const showAmbient = (cell.visits||0) <= 1 || Math.random() < 0.35;
  if (showAmbient && ambient[cell.type]) lines.push(getRandom(ambient[cell.type]));

  // Vary phrasing for contents
  const npcPhrases = [
    `You spot <b>${cell.npc ? cell.npc.name : ''}</b> (${cell.npc ? cell.npc.role : ''}).`,
    `<b>${cell.npc ? cell.npc.name : 'Someone'}</b> lingers nearby.`,
    `A figure waits: <b>${cell.npc ? cell.npc.name : ''}</b>.`
  ];
  const eventPhrases = [
    "Something odd is happening here.",
    "An incident simmers nearby.",
    "You feel a situation coalescing."
  ];
  const itemPhrases = [
    "There’s something here.",
    "A glint of potential bureaucracy lies nearby.",
    "An object peeks from under paperwork."
  ];
  if(cell.npc) lines.push(getRandom(npcPhrases));
  if(cell.event) lines.push(getRandom(eventPhrases));
  if(cell.items && cell.items.length) lines.push(getRandom(itemPhrases));
  if(!lines.length) lines.push(getRandom([
    "Quiet carpet stretches in every direction.",
    "Nothing claims your attention here.",
    "Only the air-conditioning acknowledges you."
  ]));
  return lines.join(" ");
}

function checkEndings() {
  if(game.player.energy <= 0) {
    logMsg(`<span style="color:red;"><b>You're burned out! You wake up at Level 0, your head buzzing.</b></span>`);
    game.player.energy = 10;
    game.player.sanity--;
    game.player.x = 2; game.player.y = 2;
    createFloor();
    renderAll();
    if(typeof saveOrgEcho === 'function') saveOrgEcho();
    return;
  }
  if(game.player.sanity <= 0) {
    logMsg(`<span style="color:red;"><b>Your grip on office reality slips. The world reboots.</b></span>`);
    if(typeof saveOrgEcho === 'function') saveOrgEcho();
    startGame();
    return;
  }
}

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
      triggerEvent(cell.event, cell);
      // cell.event will be cleared after resolving
    }
    if(cell.npc) {
      logMsg(`<i>${cell.npc.name} is here. (<b>talk ${cell.npc.name.split(" ")[0].toLowerCase()}</b>)</i>`);
      if(!game.player.orgChart.includes(cell.npc.name))
        game.player.orgChart.push(cell.npc.name);
      updateOrgChart();
    }
  } else {
    logMsg(getRandom([
      "You find only carpet and the distant sigh of vents.",
      "You search around. Nothing volunteers to be useful.",
      "You conduct a thorough investigation of absolutely nothing."
    ]));
  }
}

// ==== ITEMS (TAKE) ====
function doTake(arg) {
  const cell = getPlayerCell();
  const items = (cell.items || []);
  if (!items.length) {
    logMsg("There’s nothing here to take.");
    return;
  }
  let idx = 0;
  if (arg && arg.trim()) {
    const target = arg.toLowerCase();
    idx = items.findIndex(i => i.toLowerCase().includes(target));
    if (idx === -1) {
      logMsg("You don't see that here.");
      return;
    }
  }
  const picked = items.splice(idx,1)[0];
  logMsg(`<b>You take:</b> ${picked}`);
  game.player.inventory.push(picked);
  updateInventory();
  renderMap();
}

function getPlayerCell() {
  let p = game.player;
  return game.floor.grid[p.y][p.x];
}

// ==== TALKING =====
function doTalk(name) {
  let cell = getPlayerCell();
  // If no name provided but an NPC is present, target them
  if(cell.npc && (!name || !name.trim())) {
    name = cell.npc.name.toLowerCase();
  }
  if(cell.npc && name) {
    const target = name.toLowerCase().trim();
    const npcName = cell.npc.name.toLowerCase();
    const tokens = target.split(/\s+/).filter(Boolean);
    const tokenMatch = tokens.length ? tokens.some(t => npcName.includes(t)) : true;
    if(npcName.startsWith(target) || tokenMatch) {
      let greet = [
        `“Welcome to the ${game.floor.name},” says ${cell.npc.name}. ${cell.npc.desc}`,
        `${cell.npc.name} offers you a sour lolly and wisdom about office life.`,
        `${cell.npc.name} shares a secret: "Beware Level 13."`
      ];
      const line = getRandom(greet);
      logMsg(line);
      // If they offered a sour lolly, place it on the ground for pickup
      if (/sour lolly/i.test(line)) {
        cell.items = cell.items || [];
        if (!cell.items.some(i => /sour lolly/i.test(i)) && !game.player.inventory.some(i => /sour lolly/i.test(i))) {
          cell.items.push("Sour Lolly");
          logMsg("<i>A Sour Lolly drops onto the desk.</i> (<b>take sour</b>)");
          renderMap();
        }
      }
      // Faction rapport +1
      let fact = cell.npc.faction;
      if(fact) game.player.reputation[fact] = clamp((game.player.reputation[fact]||0)+1,0,5);
      // Maybe reward
      if(Math.random()<0.3) {
        let reward = "Blank Form";
        logMsg(`${cell.npc.name} gives you a <b>${reward}</b>`);
        game.player.inventory.push(reward);
        updateInventory();
      }
      updateReputations();
      return;
    }
  }
  logMsg(`There's no one by that name here.`);
}

// ==== OFFICE "CONFLICT" ====
function doOfficeCombat(type) {
  let cell = getPlayerCell();
  if(cell.npc) {
    let outcome = getRandom([
      `You ${type} ${cell.npc.name} (jury’s out). They seem unimpressed.`,
      `Your attempt to ${type} is met with bureaucracy.`,
      `Somehow, this only raises your own doubts.`
    ]);
    logMsg(outcome);
    game.player.reputation[cell.npc.faction] = clamp((game.player.reputation[cell.npc.faction]||0)-1,0,5);
    updateReputations();
    return;
  }
  logMsg("There's no one to confront here!");
}

// ==== SPECIAL ACTIONS ====
function doFile() {
  let forms = game.player.inventory.filter(f=>/form/i.test(f));
  if(!forms.length) {
    logMsg("You have no forms to file!");
    return;
  }
  game.player.inventory = game.player.inventory.filter(f=>!forms.includes(f));
  logMsg(`You file <b>${forms.length} form(s)</b>. You feel a small, hollow pride.`);
  game.player.tasks.push(getRandom([
    "Schedule a mysterious meeting",
    "Update the fax log",
    "Submit a timesheet",
    "Refill the toner"
  ]));
  updateTasks();
  updateInventory();
}
function doScan() {
  if(game.player.inventory.includes("Broken Mouse")) {
    logMsg("You scan the mouse. It’s still broken. But it blinks pink hopefully.");
    // Chance for an upgrade
    if(Math.random()<0.3) {
      logMsg("The scanner transforms it into a <b>Cursed Mouse</b>.");
      game.player.inventory.push("Cursed Mouse");
    }
  } else {
    logMsg("Nothing worthy of scanning in your inventory.");
  }
  updateInventory();
}
function doHack() {
  let cell = getPlayerCell();
  if(cell.type!=='server') { logMsg("There's nothing to hack here."); return; }
  logMsg("You hack at a random terminal. Beep boop. Security doesn't notice... this time.");
  if(Math.random()<0.4) {
    let gain = "Access Chip";
    logMsg(`You score a ${gain}! It hums softly.`);
    game.player.inventory.push(gain);
    updateInventory();
  }
}

function doRest() {
  logMsg("You take a break. Coffee, sigh, stare into the middle distance. Energy +3, Sanity +1.");
  game.player.energy = clamp(game.player.energy+3, 0, 10);
  game.player.sanity = clamp(game.player.sanity+1, 0, 10);
}

function showStatus() {
  logMsg(`<b>Energy:</b> ${game.player.energy}/10 | <b>Sanity:</b> ${game.player.sanity}/10`);
  Object.entries(game.player.reputation).forEach(([f, v]) =>
    logMsg(`<b>${f} Reputation:</b> ${v}`));
}

// ==== FLOOR TRANSITION ====
function changeFloor(change) {
  game.player.floorLevel += change;
  logMsg(`<b>You ${change>0?'ride the lift':'take the stairs'} to Level ${game.player.floorLevel}.</b>`);
  createFloor();
  renderAll();
  if(game.player.floorLevel === 13)
    logMsg('<b>The silence here is overwhelming. The Quiet Ones are near.</b>');
  // Odd effects
  if(Math.abs(game.player.floorLevel)%7===0) {
    logMsg("<b>The floor plan warps. You feel... a strange pressure in your ears.</b>");
    // Sanity test
    if(Math.random()<0.3) {
      game.player.sanity--;
      logMsg("You lose your grip on office reality (-1 Sanity).");
      checkEndings();
    }
  }
}

// ==== EVENTS (Procedural Office Shenanigans) =====
function logEventChoices(ev,cell) {
  let ec = document.getElementById("event-choices");
  if(!ec) return;
  ec.innerHTML = '';
  ev.options.forEach(opt => {
    let btn = document.createElement('button');
    btn.textContent = opt.cmd.toUpperCase();
    btn.onclick = () => resolveEvent(ev,opt,cell);
    ec.appendChild(btn);
  });
}
function triggerEvent(ev,cell) {
  logMsg(`<b>OFFICE INCIDENT:</b><br>${ev.desc}`);
  logEventChoices(ev,cell);
  game.eventState = {ev, cell};
}
function resolveEvent(ev,opt,cell) {
  let ec = document.getElementById("event-choices");
  if(ec) ec.innerHTML = '';
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
  // Handle energy/sanity effects from procedural events
  if(opt.effect && opt.effect.includes('energy')) {
    const cost = parseInt(opt.effect.split(':')[1]) || 1;
    game.player.energy = clamp(game.player.energy - cost, 0, 10);
    logMsg(`Energy: ${game.player.energy}/10`);
  }
  if(opt.effect && opt.effect.includes('sanity')) {
    const cost = parseInt(opt.effect.split(':')[1]) || 1;
    game.player.sanity = clamp(game.player.sanity - cost, 0, 10);
    logMsg(`Sanity: ${game.player.sanity}/10`);
    checkEndings();
  }
  updateReputations();
  if(cell) cell.event = null;
  game.eventState = null;
}

// =========== ORG ECHOES (MULTI RUN SHARE) ============
// Simple: At the end, "leave a note"
function makeIncidentReport() {
  let rep = Object.entries(game.player.reputation).map(([f,v])=> `${f}:${v}`).join(", ");
  let inv = game.player.inventory.join(", ");
  return `ORGSCAPE INCIDENT REPORT (Code ${game.player.id})
Level Reached: ${game.player.floorLevel}
Reputation: ${rep}
Inventory: ${inv}
Tasks completed: ${game.player.tasks.length}
Notes/Echoes: "${getRandom([
    "I never found the breakroom.",
    "Watch out for the Quiet Ones.",
    "The printers are not what they seem.",
    "Management lives in the stairwells."
  ])}"`
}

// ==== Online echoes: simple localStorage (optional remote) ====
async function saveOrgEcho() {
  try {
    const code = game.player.id;
    const report = makeIncidentReport();
    localStorage.setItem(`orgscape-echo-${code}`, report);
  } catch(e) {}
}
async function loadOrgEcho(code) {
  try {
    let s = localStorage.getItem(`orgscape-echo-${code}`);
    if(s) logMsg(`<i>Echo from Org Run ${code}:</i><br><pre>${s}</pre>`);
  } catch(e) {}
}
async function checkForEcho(){
  let url = new URL(window.location.href);
  let code = url.searchParams.get('orgcode');
  if(code) await loadOrgEcho(code);
}
// Preview report on page exit
window.onbeforeunload = function(){
  if(game.player.sanity < 10 || game.player.floorLevel > 0 || game.player.tasks.length > 0)
    return makeIncidentReport();
};