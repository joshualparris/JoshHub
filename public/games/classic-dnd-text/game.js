// Classic D&D 5e Text Adventure Game

// --- GAME STATE ---

const state = {
  stage: 'intro',
  character: {
    name: 'Adventurer',
    hp: 10,
    maxHp: 10,
    ac: 13,
    gold: 0,
    inventory: [],
  }
};

const storyEl = document.getElementById('story');
const choicesEl = document.getElementById('choices');
const diceEl = document.getElementById('dice');

// --- HELPER FUNCTIONS ---

function show(text) {
  storyEl.innerHTML = text;
}
function setChoices(options) {
  choicesEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.onclick = () => opt.action();
    choicesEl.appendChild(btn);
  });
}
function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}
function roll(diceExpr) {
  // e.g. '1d20+3'
  const [all, num, sides, mod] = (/(\d+)d(\d+)([+-]\d+)?/).exec(diceExpr) || [];
  let total = 0;
  for (let i = 0; i < (parseInt(num)||1); i++) total += rollDice(parseInt(sides));
  if (mod) total += parseInt(mod);
  return total;
}
function narrateRoll(desc, expr) {
  const result = roll(expr);
  diceEl.textContent = `${desc} — rolled ${expr}: ${result}`;
  return result;
}
function clearDice() { diceEl.textContent = ''; }

// --- GAME LOGIC ---

function intro() {
  // Enhanced D&D 5e Text Adventure with character creator and minimap

  // --- GAME STATE ---
  const state = {
    stage: 'intro',
    map: { x: 0, y: 0, width: 10, height: 10 },
    character: {
      name: 'Adventurer',
      race: 'Human',
      class: 'Fighter',
      background: '',
      alignment: 'Neutral',
      level: 1,
      hp: 10,
      maxHp: 10,
      ac: 13,
      gold: 0,
      inventory: [],
      stats: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 }
    }
  };

  // --- DOM refs ---
  const storyEl = document.getElementById('story');
  const choicesEl = document.getElementById('choices');
  const diceEl = document.getElementById('dice');
  const mapCanvas = document.getElementById('map-canvas');
  const mapCoordsEl = document.getElementById('map-coords');
  const openCreatorBtn = document.getElementById('open-creator');
  const creatorEl = document.getElementById('character-creator');
  const ccName = document.getElementById('cc-name');
  const ccRace = document.getElementById('cc-race');
  const ccClass = document.getElementById('cc-class');
  const ccBackground = document.getElementById('cc-background');
  const ccAlignment = document.getElementById('cc-alignment');
  const abilityScoresEl = document.getElementById('ability-scores');
  const ccApply = document.getElementById('cc-apply');
  const ccRandomize = document.getElementById('cc-randomize');
  const ccReset = document.getElementById('cc-reset');
  const mapControls = document.getElementById('map-controls');

  const briefName = document.getElementById('char-name');
  const briefHp = document.getElementById('brief-hp');
  const briefAc = document.getElementById('brief-ac');
  const briefGold = document.getElementById('brief-gold');

  const ctx = mapCanvas.getContext('2d');

  // --- Dice & helpers ---
  function rollDice(sides) { return Math.floor(Math.random() * sides) + 1; }
  function roll(expr) {
    // e.g. '1d20+3' or '4d6dl1'
    const dl = expr.match(/(\d+)d(\d+)dl(\d+)/);
    if (dl) {
      const [, n, s, drop] = dl.map(x => parseInt(x));
      const rolls = [];
      for (let i = 0; i < n; i++) rolls.push(rollDice(s));
      rolls.sort((a,b)=>a-b);
      return rolls.slice(drop).reduce((a,b)=>a+b,0);
    }
    const m = (/([0-9]+)d([0-9]+)([+-][0-9]+)?/).exec(expr);
    if (!m) return parseInt(expr) || 0;
    const num = parseInt(m[1]), sides = parseInt(m[2]);
    const mod = m[3] ? parseInt(m[3]) : 0;
    let total = 0;
    for (let i=0;i<num;i++) total += rollDice(sides);
    return total + mod;
  }
  function narrateRoll(desc, expr) { const r = roll(expr); diceEl.textContent = `${desc}: ${r}`; return r; }
  function show(text) { storyEl.innerHTML = text; }
  function clearDice(){ diceEl.textContent = ''; }
  function setChoices(options){ choicesEl.innerHTML=''; options.forEach(o=>{ const btn=document.createElement('button'); btn.textContent=o.text; btn.onclick=()=>o.action(); choicesEl.appendChild(btn); }); }

  // --- Character creator implementation ---
  const STATS = ['STR','DEX','CON','INT','WIS','CHA'];
  const POINT_BUY_COST = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  function renderAbilityScores(method='standard', values){
    abilityScoresEl.innerHTML = '';
    if (!values) values = {...state.character.stats};
    // For point buy show budget
    let budget = 27;
    if (method==='pointbuy'){
      const cost = STATS.reduce((s,k)=> s + POINT_BUY_COST[values[k]], 0);
      budget = 27 - cost;
      const b = document.createElement('div'); b.textContent = `Point Buy remaining: ${budget}`; b.style.marginBottom='6px'; abilityScoresEl.appendChild(b);
    }

    STATS.forEach(stat=>{
      const box = document.createElement('div'); box.className='score-box';
      const label = document.createElement('div'); label.textContent = stat;
      const val = document.createElement('span'); val.textContent = values[stat]; val.style.fontWeight='700'; val.style.marginLeft='8px';
      box.appendChild(label);
      box.appendChild(val);

      if (method==='pointbuy'){
        const minus = document.createElement('button'); minus.textContent='-';
        const plus = document.createElement('button'); plus.textContent='+';
        minus.onclick = ()=>{
          if (values[stat] > 8){ values[stat]--; renderAbilityScores(method, values); }
        };
        plus.onclick = ()=>{
          if (values[stat] < 15){
            // check if enough budget
            const newCost = STATS.reduce((s,k)=> s + POINT_BUY_COST[(k===stat? values[k]+1 : values[k])], 0);
            if (newCost <= 27){ values[stat]++; renderAbilityScores(method, values); }
          }
        };
        box.appendChild(minus); box.appendChild(plus);
      }

      abilityScoresEl.appendChild(box);
    });
  }

  function roll4d6dl1(){
    return roll('4d6dl1');
  }

  function applyCreator(){
    const name = ccName.value.trim() || 'Adventurer';
    state.character.name = name;
    state.character.race = ccRace.value;
    state.character.class = ccClass.value;
    state.character.background = ccBackground.value;
    state.character.alignment = ccAlignment.value;
    // read ability scores from rendered UI (fallback to existing)
    const boxes = abilityScoresEl.querySelectorAll('.score-box');
    if (boxes.length>0){
      boxes.forEach((b,i)=>{
        const stat = STATS[i];
        const v = parseInt(b.querySelector('span').textContent) || state.character.stats[stat];
        state.character.stats[stat]=v;
      });
    }
    // derive simple hp/ac from class and CON
    const con = state.character.stats.CON;
    state.character.maxHp = 8 + Math.floor((con-10)/2) + (state.character.level-1)*5;
    state.character.hp = Math.max(1, state.character.maxHp);
    state.character.ac = 10 + Math.floor((state.character.stats.DEX-10)/2) + (state.character.class==='Fighter'?2:0);
    saveCharacter();
    updateBrief();
    toggleCreator(false);
  }

  function randomizeRolls(){
    const vals = {};
    STATS.forEach(s=> vals[s]=roll4d6dl1());
    renderAbilityScores('roll', vals);
  }

  function resetCreator(){
    // default standard array
    const std = {STR:15, DEX:14, CON:13, INT:12, WIS:10, CHA:8};
    ccName.value = state.character.name || 'Adventurer';
    ccRace.value = state.character.race || 'Human';
    ccClass.value = state.character.class || 'Fighter';
    ccBackground.value = state.character.background || '';
    ccAlignment.value = state.character.alignment || 'Neutral';
    renderAbilityScores('standard', std);
  }

  function toggleCreator(showFlag){ creatorEl.classList.toggle('hidden', !showFlag); }

  // --- Persist/load ---
  function saveCharacter(){ localStorage.setItem('dnd_text_character', JSON.stringify(state.character)); }
  function loadCharacter(){ const data = localStorage.getItem('dnd_text_character'); if (data){ state.character = Object.assign(state.character, JSON.parse(data)); } }

  function updateBrief(){ briefName.textContent = state.character.name; briefHp.textContent = state.character.hp; briefAc.textContent = state.character.ac; briefGold.textContent = state.character.gold; }

  // --- Minimap ---
  function drawMap(){
    const size = 200;
    const cols = state.map.width;
    const rows = state.map.height;
    const cell = size/cols;
    ctx.clearRect(0,0, size, size);
    // background
    ctx.fillStyle = '#0b0a09'; ctx.fillRect(0,0,size,size);
    // grid
    ctx.strokeStyle = '#222';
    for (let i=0;i<=cols;i++){ ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,size); ctx.stroke(); }
    for (let j=0;j<=rows;j++){ ctx.beginPath(); ctx.moveTo(0,j*cell); ctx.lineTo(size,j*cell); ctx.stroke(); }
    // player
    const px = (state.map.x + 0.5) * cell;
    const py = (state.map.y + 0.5) * cell;
    ctx.fillStyle = '#e6b400'; ctx.beginPath(); ctx.arc(px,py,cell*0.35,0,Math.PI*2); ctx.fill();
    // optional: mark special tile (e.g. treasure at 5,5)
    ctx.fillStyle = '#a23'; ctx.fillRect(5*cell+cell*0.2,5*cell+cell*0.2,cell*0.6,cell*0.6);
    mapCoordsEl.textContent = `(${state.map.x},${state.map.y})`;
  }

  function move(dir){
    if (dir==='north') state.map.y = Math.max(0, state.map.y-1);
    if (dir==='south') state.map.y = Math.min(state.map.height-1, state.map.y+1);
    if (dir==='west') state.map.x = Math.max(0, state.map.x-1);
    if (dir==='east') state.map.x = Math.min(state.map.width-1, state.map.x+1);
    drawMap();
  }

  // bind map controls
  mapControls.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if (!btn) return; const dir = btn.dataset.dir; if (dir) move(dir);
  });

  // keyboard arrows
  window.addEventListener('keydown', e=>{
    if (e.key==='ArrowUp') move('north');
    if (e.key==='ArrowDown') move('south');
    if (e.key==='ArrowLeft') move('west');
    if (e.key==='ArrowRight') move('east');
  });

  // --- Story / Game logic (expanded) ---
  function intro(){
    state.stage='intro';
    loadCharacter();
    updateBrief();
    show(`<b>A Simple Dungeon Awaits...</b><br>
      The village elder asks for a champion to investigate the Goblin Warrens. Prepare your character or open the creator.`);
    setChoices([
      { text: 'Open Character Creator', action: ()=>toggleCreator(true) },
      { text: 'Enter the Warrens', action: firstRoom }
    ]);
    drawMap();
  }

  function firstRoom(){
    state.stage='firstRoom';
    show(`Brave <b>${state.character.name}</b>, you step into torchlit darkness. You hear <i>snickering</i> from a side tunnel.<br><br><b>What will you do?</b>`);
    const opts = [
      { text: 'Draw your weapon and advance', action: goblinEncounter },
      { text: 'Sneak quietly along the wall', action: sneakTest },
      { text: 'Try to talk (roleplay)', action: talkToGoblin },
      { text: 'Flee', action: gameOver }
    ];
    // class-specific option
    if (state.character.class === 'Rogue') opts.splice(1,0,{ text:'Attempt a stealthy disarm', action: rogueDisarm });
    setChoices(opts);
  }

  function talkToGoblin(){
    // influence by CHA
    const chaMod = Math.floor((state.character.stats.CHA-10)/2);
    const res = narrateRoll('Persuasion (d20 + CHA mod)', `1d20${chaMod>=0?'+'+chaMod:''}${chaMod<0?chaMod:''}`);
    if (res >= 12){ show('Your words calm the goblin, and it leads you to a small stash (7 gold).'); state.character.gold += 7; setChoices([{text:'Continue', action: nextRoom}]); }
    else { show('The goblin is not convinced and attacks!'); setChoices([{text:'Fight!', action: goblinBattle}]); }
  }

  function rogueDisarm(){
    const res = narrateRoll('Dex check (d20+Dex mod)', `1d20${Math.floor((state.character.stats.DEX-10)/2)>=0?'+'+Math.floor((state.character.stats.DEX-10)/2):Math.floor((state.character.stats.DEX-10)/2)}`);
    if (res>=13){ show('You successfully bypass a trap and find hidden coins (12 gold).'); state.character.gold+=12; setChoices([{text:'Proceed', action: nextRoom}]); }
    else { show('You fumble and trigger a small alarm. Goblins converge.'); setChoices([{text:'Fight!', action:goblinBattle}]); }
  }

  function sneakTest(){
    const dexMod = Math.floor((state.character.stats.DEX-10)/2);
    const result = narrateRoll('Sneak check (d20 + DEX mod)', `1d20${dexMod>=0?'+'+dexMod:''}`);
    if (result >= 12) { setTimeout(()=>{ show('You slink past a dozing goblin unseen. You discover a pouch (10 gold)!'); state.character.gold += 10; setChoices([{text:'Continue onward',action: nextRoom}]); clearDice(); },800); }
    else { setTimeout(()=>{ show('You stumble, kicking a rock! A goblin leaps at you!'); setChoices([{text:'Fight!', action:goblinBattle}]); },800); }
  }

  function goblinEncounter(){ show('A mischievous goblin leaps from the shadows, ready to fight!'); setChoices([{text:'Fight!', action:goblinBattle},{text:'Try to flee', action: gameOver}]); clearDice(); }

  function goblinBattle(){
    let goblin = { hp: 6, ac: 12 };
    function playerTurn(){ show(`Your HP: ${state.character.hp}/${state.character.maxHp}<br>Goblin HP: ${goblin.hp}<br><br>You can:`); setChoices([{text:'Attack', action: attackGoblin},{text:'Intimidate', action:intimidateGoblin},{text:'Use skill', action: useSkill}]); clearDice(); }
    function attackGoblin(){ const atk = narrateRoll('Attack (d20+5)','1d20+5'); if (atk>=goblin.ac){ let dmg = roll('1d8+3'); goblin.hp -= dmg; storyEl.innerHTML += `<br><b>You hit for ${dmg} damage!</b><br>`; if (goblin.hp<=0){ setTimeout(()=>{ show('The goblin collapses! You loot 5 gold and head deeper...'); state.character.gold+=5; setChoices([{text:'Continue', action: nextRoom}]); clearDice(); },700); return; } } else { storyEl.innerHTML += `<br>You miss!<br>`; } setTimeout(enemyTurn,700); }
    function intimidateGoblin(){ const cha = narrateRoll('Intimidate','1d20-1'); if (cha>14){ show('The goblin flees in terror, dropping 3 gold!'); state.character.gold+=3; setChoices([{text:'Continue',action: nextRoom}]); clearDice(); } else { storyEl.innerHTML += '<br><i>It is unimpressed...</i><br>'; setTimeout(enemyTurn,500); } }
    function useSkill(){ show('You fumble through options and gain no advantage.'); setTimeout(enemyTurn,600); }
    function enemyTurn(){ let atk = roll('1d20+4'); if (atk >= state.character.ac){ let dmg = roll('1d6+2'); state.character.hp -= dmg; storyEl.innerHTML += `<br><b>The goblin slashes you for ${dmg}!</b>`; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; if (state.character.hp <= 0){ setTimeout(()=>{ show('You fall, defeated. <b>Game Over!</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); },700); return; } } else { storyEl.innerHTML += '<br><i>The goblin\'s dagger misses you!</i>'; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; } setTimeout(playerTurn,700); }
    playerTurn();
  }

  function nextRoom(){
    show('You find a deeper chamber with multiple exits. The adventure continues...<br><b>Victory (for now)</b>');
    setChoices([{text:'Play Again', action: intro}]);
    clearDice();
  }

  function gameOver(){ show('You flee the dungeon, adventure left unfinished.<br><b>Game Over.</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); }

  // --- UI wiring ---
  openCreatorBtn.addEventListener('click', ()=>{ resetCreator(); toggleCreator(true); });
  ccApply.addEventListener('click', applyCreator);
  ccRandomize.addEventListener('click', ()=>{ randomizeRolls(); });
  ccReset.addEventListener('click', resetCreator);

  // initialize
  resetCreator(); loadCharacter(); updateBrief(); drawMap();
  // start game
  intro();
  mapControls.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if (!btn) return; const dir = btn.dataset.dir; if (dir) move(dir);
  });

  // keyboard arrows
  window.addEventListener('keydown', e=>{
    if (e.key==='ArrowUp') move('north');
    if (e.key==='ArrowDown') move('south');
    if (e.key==='ArrowLeft') move('west');
    if (e.key==='ArrowRight') move('east');
  });

  // --- Story / Game logic (expanded) ---
  function intro(){
    state.stage='intro';
    loadCharacter();
    updateBrief();
    show(`<b>A Simple Dungeon Awaits...</b><br>
      The village elder asks for a champion to investigate the Goblin Warrens. Prepare your character or open the creator.`);
    setChoices([
      { text: 'Open Character Creator', action: ()=>toggleCreator(true) },
      { text: 'Enter the Warrens', action: firstRoom }
    ]);
    drawMap();
  }

  function firstRoom(){
    state.stage='firstRoom';
    show(`Brave <b>${state.character.name}</b>, you step into torchlit darkness. You hear <i>snickering</i> from a side tunnel.<br><br><b>What will you do?</b>`);
    const opts = [
      { text: 'Draw your weapon and advance', action: goblinEncounter },
      { text: 'Sneak quietly along the wall', action: sneakTest },
      { text: 'Try to talk (roleplay)', action: talkToGoblin },
      { text: 'Flee', action: gameOver }
    ];
    // class-specific option
    if (state.character.class === 'Rogue') opts.splice(1,0,{ text:'Attempt a stealthy disarm', action: rogueDisarm });
    setChoices(opts);
  }

  function talkToGoblin(){
    // influence by CHA
    const chaMod = Math.floor((state.character.stats.CHA-10)/2);
    const res = narrateRoll('Persuasion (d20 + CHA mod)', `1d20${chaMod>=0?'+'+chaMod:''}${chaMod<0?chaMod:''}`);
    if (res >= 12){ show('Your words calm the goblin, and it leads you to a small stash (7 gold).'); state.character.gold += 7; setChoices([{text:'Continue', action: nextRoom}]); }
    else { show('The goblin is not convinced and attacks!'); setChoices([{text:'Fight!', action: goblinBattle}]); }
  }

  function rogueDisarm(){
    const res = narrateRoll('Dex check (d20+Dex mod)', `1d20${Math.floor((state.character.stats.DEX-10)/2)>=0?'+'+Math.floor((state.character.stats.DEX-10)/2):Math.floor((state.character.stats.DEX-10)/2)}`);
    if (res>=13){ show('You successfully bypass a trap and find hidden coins (12 gold).'); state.character.gold+=12; setChoices([{text:'Proceed', action: nextRoom}]); }
    else { show('You fumble and trigger a small alarm. Goblins converge.'); setChoices([{text:'Fight!', action:goblinBattle}]); }
  }

  function sneakTest(){
    const dexMod = Math.floor((state.character.stats.DEX-10)/2);
    const result = narrateRoll('Sneak check (d20 + DEX mod)', `1d20${dexMod>=0?'+'+dexMod:''}`);
    if (result >= 12) { setTimeout(()=>{ show('You slink past a dozing goblin unseen. You discover a pouch (10 gold)!'); state.character.gold += 10; setChoices([{text:'Continue onward',action: nextRoom}]); clearDice(); },800); }
    else { setTimeout(()=>{ show('You stumble, kicking a rock! A goblin leaps at you!'); setChoices([{text:'Fight!', action:goblinBattle}]); },800); }
  }

  function goblinEncounter(){ show('A mischievous goblin leaps from the shadows, ready to fight!'); setChoices([{text:'Fight!', action:goblinBattle},{text:'Try to flee', action: gameOver}]); clearDice(); }

  function goblinBattle(){
    let goblin = { hp: 6, ac: 12 };
    function playerTurn(){ show(`Your HP: ${state.character.hp}/${state.character.maxHp}<br>Goblin HP: ${goblin.hp}<br><br>You can:`); setChoices([{text:'Attack', action: attackGoblin},{text:'Intimidate', action:intimidateGoblin},{text:'Use skill', action: useSkill}]); clearDice(); }
    function attackGoblin(){ const atk = narrateRoll('Attack (d20+5)','1d20+5'); if (atk>=goblin.ac){ let dmg = roll('1d8+3'); goblin.hp -= dmg; storyEl.innerHTML += `<br><b>You hit for ${dmg} damage!</b><br>`; if (goblin.hp<=0){ setTimeout(()=>{ show('The goblin collapses! You loot 5 gold and head deeper...'); state.character.gold+=5; setChoices([{text:'Continue', action: nextRoom}]); clearDice(); },700); return; } } else { storyEl.innerHTML += `<br>You miss!<br>`; } setTimeout(enemyTurn,700); }
    function intimidateGoblin(){ const cha = narrateRoll('Intimidate','1d20-1'); if (cha>14){ show('The goblin flees in terror, dropping 3 gold!'); state.character.gold+=3; setChoices([{text:'Continue',action: nextRoom}]); clearDice(); } else { storyEl.innerHTML += '<br><i>It is unimpressed...</i><br>'; setTimeout(enemyTurn,500); } }
    function useSkill(){ show('You fumble through options and gain no advantage.'); setTimeout(enemyTurn,600); }
    function enemyTurn(){ let atk = roll('1d20+4'); if (atk >= state.character.ac){ let dmg = roll('1d6+2'); state.character.hp -= dmg; storyEl.innerHTML += `<br><b>The goblin slashes you for ${dmg}!</b>`; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; if (state.character.hp <= 0){ setTimeout(()=>{ show('You fall, defeated. <b>Game Over!</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); },700); return; } } else { storyEl.innerHTML += '<br><i>The goblin\'s dagger misses you!</i>'; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; } setTimeout(playerTurn,700); }
    playerTurn();
  }

  function nextRoom(){
    show('You find a deeper chamber with multiple exits. The adventure continues...<br><b>Victory (for now)</b>');
    setChoices([{text:'Play Again', action: intro}]);
    clearDice();
  }

  function gameOver(){ show('You flee the dungeon, adventure left unfinished.<br><b>Game Over.</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); }

  // --- UI wiring ---
  openCreatorBtn.addEventListener('click', ()=>{ resetCreator(); toggleCreator(true); });
  ccApply.addEventListener('click', applyCreator);
  ccRandomize.addEventListener('click', ()=>{ randomizeRolls(); });
  ccReset.addEventListener('click', resetCreator);

  // initialize
  resetCreator(); loadCharacter(); updateBrief(); drawMap();
  // start game
  intro();
  mapControls.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if (!btn) return; const dir = btn.dataset.dir; if (dir) move(dir);
  });

  // keyboard arrows
  window.addEventListener('keydown', e=>{
    if (e.key==='ArrowUp') move('north');
    if (e.key==='ArrowDown') move('south');
    if (e.key==='ArrowLeft') move('west');
    if (e.key==='ArrowRight') move('east');
  });

  // --- Story / Game logic (expanded) ---
  function intro(){
    state.stage='intro';
    loadCharacter();
    updateBrief();
    show(`<b>A Simple Dungeon Awaits...</b><br>
      The village elder asks for a champion to investigate the Goblin Warrens. Prepare your character or open the creator.`);
    setChoices([
      { text: 'Open Character Creator', action: ()=>toggleCreator(true) },
      { text: 'Enter the Warrens', action: firstRoom }
    ]);
    drawMap();
  }

  function firstRoom(){
    state.stage='firstRoom';
    show(`Brave <b>${state.character.name}</b>, you step into torchlit darkness. You hear <i>snickering</i> from a side tunnel.<br><br><b>What will you do?</b>`);
    const opts = [
      { text: 'Draw your weapon and advance', action: goblinEncounter },
      { text: 'Sneak quietly along the wall', action: sneakTest },
      { text: 'Try to talk (roleplay)', action: talkToGoblin },
      { text: 'Flee', action: gameOver }
    ];
    // class-specific option
    if (state.character.class === 'Rogue') opts.splice(1,0,{ text:'Attempt a stealthy disarm', action: rogueDisarm });
    setChoices(opts);
  }

  function talkToGoblin(){
    // influence by CHA
    const chaMod = Math.floor((state.character.stats.CHA-10)/2);
    const res = narrateRoll('Persuasion (d20 + CHA mod)', `1d20${chaMod>=0?'+'+chaMod:''}${chaMod<0?chaMod:''}`);
    if (res >= 12){ show('Your words calm the goblin, and it leads you to a small stash (7 gold).'); state.character.gold += 7; setChoices([{text:'Continue', action: nextRoom}]); }
    else { show('The goblin is not convinced and attacks!'); setChoices([{text:'Fight!', action: goblinBattle}]); }
  }

  function rogueDisarm(){
    const res = narrateRoll('Dex check (d20+Dex mod)', `1d20${Math.floor((state.character.stats.DEX-10)/2)>=0?'+'+Math.floor((state.character.stats.DEX-10)/2):Math.floor((state.character.stats.DEX-10)/2)}`);
    if (res>=13){ show('You successfully bypass a trap and find hidden coins (12 gold).'); state.character.gold+=12; setChoices([{text:'Proceed', action: nextRoom}]); }
    else { show('You fumble and trigger a small alarm. Goblins converge.'); setChoices([{text:'Fight!', action:goblinBattle}]); }
  }

  function sneakTest(){
    const dexMod = Math.floor((state.character.stats.DEX-10)/2);
    const result = narrateRoll('Sneak check (d20 + DEX mod)', `1d20${dexMod>=0?'+'+dexMod:''}`);
    if (result >= 12) { setTimeout(()=>{ show('You slink past a dozing goblin unseen. You discover a pouch (10 gold)!'); state.character.gold += 10; setChoices([{text:'Continue onward',action: nextRoom}]); clearDice(); },800); }
    else { setTimeout(()=>{ show('You stumble, kicking a rock! A goblin leaps at you!'); setChoices([{text:'Fight!', action:goblinBattle}]); },800); }
  }

  function goblinEncounter(){ show('A mischievous goblin leaps from the shadows, ready to fight!'); setChoices([{text:'Fight!', action:goblinBattle},{text:'Try to flee', action: gameOver}]); clearDice(); }

  function goblinBattle(){
    let goblin = { hp: 6, ac: 12 };
    function playerTurn(){ show(`Your HP: ${state.character.hp}/${state.character.maxHp}<br>Goblin HP: ${goblin.hp}<br><br>You can:`); setChoices([{text:'Attack', action: attackGoblin},{text:'Intimidate', action:intimidateGoblin},{text:'Use skill', action: useSkill}]); clearDice(); }
    function attackGoblin(){ const atk = narrateRoll('Attack (d20+5)','1d20+5'); if (atk>=goblin.ac){ let dmg = roll('1d8+3'); goblin.hp -= dmg; storyEl.innerHTML += `<br><b>You hit for ${dmg} damage!</b><br>`; if (goblin.hp<=0){ setTimeout(()=>{ show('The goblin collapses! You loot 5 gold and head deeper...'); state.character.gold+=5; setChoices([{text:'Continue', action: nextRoom}]); clearDice(); },700); return; } } else { storyEl.innerHTML += `<br>You miss!<br>`; } setTimeout(enemyTurn,700); }
    function intimidateGoblin(){ const cha = narrateRoll('Intimidate','1d20-1'); if (cha>14){ show('The goblin flees in terror, dropping 3 gold!'); state.character.gold+=3; setChoices([{text:'Continue',action: nextRoom}]); clearDice(); } else { storyEl.innerHTML += '<br><i>It is unimpressed...</i><br>'; setTimeout(enemyTurn,500); } }
    function useSkill(){ show('You fumble through options and gain no advantage.'); setTimeout(enemyTurn,600); }
    function enemyTurn(){ let atk = roll('1d20+4'); if (atk >= state.character.ac){ let dmg = roll('1d6+2'); state.character.hp -= dmg; storyEl.innerHTML += `<br><b>The goblin slashes you for ${dmg}!</b>`; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; if (state.character.hp <= 0){ setTimeout(()=>{ show('You fall, defeated. <b>Game Over!</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); },700); return; } } else { storyEl.innerHTML += '<br><i>The goblin\'s dagger misses you!</i>'; diceEl.textContent = `Goblin attack roll: ${atk} vs AC ${state.character.ac}`; } setTimeout(playerTurn,700); }
    playerTurn();
  }

  function nextRoom(){
    show('You find a deeper chamber with multiple exits. The adventure continues...<br><b>Victory (for now)</b>');
    setChoices([{text:'Play Again', action: intro}]);
    clearDice();
  }

  function gameOver(){ show('You flee the dungeon, adventure left unfinished.<br><b>Game Over.</b>'); setChoices([{text:'Restart', action: intro}]); clearDice(); }

  // --- UI wiring ---
  openCreatorBtn.addEventListener('click', ()=>{ resetCreator(); toggleCreator(true); });
  ccApply.addEventListener('click', applyCreator);
  ccRandomize.addEventListener('click', ()=>{ randomizeRolls(); });
  ccReset.addEventListener('click', resetCreator);

  // initialize
  resetCreator(); loadCharacter(); updateBrief(); drawMap();
  // start game
  intro();