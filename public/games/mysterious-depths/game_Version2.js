// === SCENE VISUALS & STATE ===
const backgrounds = {
    'dark':   'linear-gradient(135deg, #131a26 45%, #181f2a 100%)',
    'stone':  'radial-gradient(ellipse at 60% 90%, #5b5a6a 0 30%, #2e2c3a 100%)',
    'metal':  'repeating-linear-gradient(120deg, #575f7a 0 30px, #4f5770 30px 60px, #3b404d 60px 90px)',
    'space':  'linear-gradient(#080e1a 0%, #1b2452 100%)',
    'tunnel': 'radial-gradient(ellipse at 50% 100%, #243854 0 30%, #111 95%)',
    'reveal': 'linear-gradient(135deg, #eeeffc 0, #462484 98%), repeating-linear-gradient(125deg, #5defff44 0 12px, #eac0ff20 12px 24px)'
};

const overlays = {
    'fog':   'foggy',
    'beam':  'lightbeam',
    'none':  ''
};

// Mapping each node to its visual cue
const visuals = [
    // 0: Darkness/Unknown start
    { bg: 'dark', overlay: 'fog', art: 'dim-light', palette: 'default' },
    // 1: Metal & stone
    { bg: 'metal', overlay: 'none', art: 'metal-stone', palette: 'default' },
    // 2: Echo chamber
    { bg: 'stone', overlay: 'fog', art: 'soundwave', palette: 'default' },
    // 3: Metal + ancient
    { bg: 'metal', overlay: 'beam', art: 'marks', palette: 'default' },
    // 4: Tunnel, light, hatch, crystals
    { bg: 'tunnel', overlay: 'beam', art: 'hatch', palette: 'default' },
    // 5: Machinery, sense weight
    { bg: 'metal', overlay: 'none', art: 'machine', palette: 'underground' },
    // 6: Curved upwards, galaxies
    { bg: 'space', overlay: 'beam', art: 'galaxies', palette: 'space' },
    // 7: Panel, crystal fragment
    { bg: 'metal', overlay: 'fog', art: 'panel', palette: 'default' },
    // 8: Tunnel shifting, stars
    { bg: 'tunnel', overlay: 'none', art: 'stars', palette: 'transition' },
    // 9: Pebble, mining plastic tag
    { bg: 'stone', overlay: 'fog', art: 'pebble', palette: 'underground' },
    // 10: Reveal, space/underground both
    { bg: 'reveal', overlay: 'beam', art: 'reveal', palette: 'reveal' },
    // 11: Collapse/End
    { bg: 'dark', overlay: 'none', art: 'none', palette: 'default' }
];

// NOTE: If you add story nodes below, keep `visuals[]` in sync by appending entries

const paletteThemes = {
    'default': {
        containerBg: 'rgba(30, 35, 50, 0.85)',
        text: '#e0e4ed',
        choiceBtn: '#233246',
        choiceHover: '#3668b8',
        h1: '#95f7f6'
    },
    'underground': {
        containerBg: 'rgba(30,28,40,0.92)',
        text: '#ded8cb',
        choiceBtn: '#445063',
        choiceHover: '#9b6c35',
        h1: '#e0d2ba'
    },
    'space': {
        containerBg: 'rgba(30,40,60,0.72)',
        text: '#c1dcfe',
        choiceBtn: '#0c2056',
        choiceHover: '#73cdfb',
        h1: '#f6f7fe'
    },
    'transition': {
        containerBg: 'rgba(48,34,70,0.68)',
        text: '#e1cad7',
        choiceBtn: '#43216f',
        choiceHover: '#a45de0',
        h1: '#ded2ff'
    },
    'reveal': {
        containerBg: 'rgba(235,225,250,0.94)',
        text: '#304042',
        choiceBtn: '#fff1f7',
        choiceHover: '#a4d4ff',
        h1: '#7a0afc'
    }
};

// === DOM ELEMENTS ===
const storyEl = document.getElementById('story');
const choicesEl = document.getElementById('choices');
const bgEl = document.getElementById('background');
const overlayEl = document.getElementById('ambient-overlay');
const sceneArtEl = document.getElementById('scene-art');
const gameContainer = document.getElementById('game-container');
const h1El = document.querySelector('h1');
const settingsBtn = document.getElementById('open-settings');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const volumeInput = document.getElementById('volume');
const toggleSoundInput = document.getElementById('toggle-sound');
const toggleAnimInput = document.getElementById('toggle-anim');
const themeSelect = document.getElementById('theme-select');
const saveBtn = document.getElementById('save-slot');
const loadBtn = document.getElementById('load-slot');
const logPanel = document.getElementById('log-panel');
const toggleLogBtn = document.getElementById('toggle-log');

// === SFX: lightweight WebAudio click / chime ===
let audioCtx = null;
let sfxEnabled = (localStorage.getItem('sfx') !== 'off');
let masterVolume = parseFloat(localStorage.getItem('volume') || '0.6');
let musicGain = null;
let ambientGain = null;
function ensureAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { audioCtx = null; }
    }
    if (audioCtx) {
        if (!musicGain) { musicGain = audioCtx.createGain(); musicGain.gain.value = masterVolume*0.25; musicGain.connect(audioCtx.destination); }
        if (!ambientGain) { ambientGain = audioCtx.createGain(); ambientGain.gain.value = masterVolume*0.18; ambientGain.connect(audioCtx.destination); }
    }
}
function playChoiceSfx(type = 'click') {
    if (!sfxEnabled) return;
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const g = audioCtx.createGain(); g.gain.value = masterVolume; g.connect(audioCtx.destination);
    if (type === 'click') {
        const o = audioCtx.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(880, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12, now + 0.001);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        o.connect(g); o.start(now); o.stop(now + 0.18);
    } else if (type === 'note') {
        const o = audioCtx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.16, now + 0.002);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        o.connect(g); o.start(now); o.stop(now + 0.46);
    }
}

// Wire up SFX toggle UI (index.html contains #sfx-toggle)
const sfxToggleBtn = document.getElementById('sfx-toggle');
if (sfxToggleBtn) {
    sfxToggleBtn.setAttribute('aria-pressed', String(sfxEnabled));
    sfxToggleBtn.addEventListener('click', () => {
        sfxEnabled = !sfxEnabled;
        sfxToggleBtn.setAttribute('aria-pressed', String(sfxEnabled));
        localStorage.setItem('sfx', sfxEnabled ? 'on' : 'off');
        if (sfxEnabled) {
            ensureAudio();
            playChoiceSfx('note');
        }
    });
}

// === SETTINGS UI ===
if (settingsBtn && settingsModal) {
    const open = () => { settingsModal.hidden = false; };
    const close = () => { settingsModal.hidden = true; };
    settingsBtn.addEventListener('click', open);
    closeSettings && closeSettings.addEventListener('click', close);
    settingsModal.addEventListener('click', (e)=>{ if (e.target === settingsModal) close(); });
}
if (volumeInput) {
    volumeInput.value = String(masterVolume);
    volumeInput.addEventListener('input', () => {
        masterVolume = parseFloat(volumeInput.value);
        localStorage.setItem('volume', String(masterVolume));
        if (musicGain) musicGain.gain.value = masterVolume*0.25;
        if (ambientGain) ambientGain.gain.value = masterVolume*0.18;
    });
}
if (toggleSoundInput) {
    toggleSoundInput.checked = sfxEnabled;
    toggleSoundInput.addEventListener('change', () => {
        sfxEnabled = toggleSoundInput.checked;
        localStorage.setItem('sfx', sfxEnabled ? 'on' : 'off');
    });
}
let animationsEnabled = (localStorage.getItem('animations') !== 'off');
if (toggleAnimInput) {
    toggleAnimInput.checked = animationsEnabled;
    toggleAnimInput.addEventListener('change', () => {
        animationsEnabled = toggleAnimInput.checked;
        localStorage.setItem('animations', animationsEnabled ? 'on' : 'off');
    });
}
let userTheme = localStorage.getItem('theme') || 'deepSea';
if (themeSelect) {
    themeSelect.value = userTheme;
    themeSelect.addEventListener('change', () => {
        userTheme = themeSelect.value;
        localStorage.setItem('theme', userTheme);
        applyGlobalTheme(userTheme);
    });
}
function applyGlobalTheme(name) {
    // Map simple themes to variable changes
    const root = document.documentElement.style;
    if (name === 'deepSea') {
        root.setProperty('--btn-bg', '#233246');
        root.setProperty('--btn-text', '#e9ffff');
        root.setProperty('--accent', '#83eef2');
    } else if (name === 'derelict') {
        root.setProperty('--btn-bg', '#3b3a34');
        root.setProperty('--btn-text', '#efe7d5');
        root.setProperty('--accent', '#f5cf8c');
    } else if (name === 'stardrift') {
        root.setProperty('--btn-bg', '#0c2056');
        root.setProperty('--btn-text', '#dff4ff');
        root.setProperty('--accent', '#9bd2ff');
    }
}
applyGlobalTheme(userTheme);

// Save/Load and Log controls
if (saveBtn) saveBtn.addEventListener('click', () => {
    const payload = { step: gameState.step, clues: gameState.clues, location: gameState.location || null };
    localStorage.setItem('save_slot', JSON.stringify(payload));
    playChoiceSfx('note');
});
if (loadBtn) loadBtn.addEventListener('click', () => {
    const raw = localStorage.getItem('save_slot');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        gameState.step = data.step || 0;
        gameState.clues = data.clues || [];
        gameState.location = data.location || null;
        render();
        playChoiceSfx('note');
    } catch {}
});
if (toggleLogBtn && logPanel) {
    toggleLogBtn.addEventListener('click', () => {
        logPanel.hidden = !logPanel.hidden;
    });
}

// === GAME STATE ===
const gameState = {
    clues: [],
    step: 0,
    log: []
};

// === STORY DATA ===
const storyNodes = [
{
    text: "You wake up. It is silent.\nYou feel hard, cold ground beneath you. The air is stale. You don’t know if you are deep below the earth, lost in the void of space, or somewhere stranger.\n\nWhat do you do?",
    choices: [
        { text: "Reach out in the darkness", nextStep: 1 },
        { text: "Call out: 'Hello?'", nextStep: 2 }
    ]
},
{
    text: "Your hand brushes against a rough wall on one side, metal on the other. There’s a slight vibration, almost like a distant engine. A faint, shimmering light appears overhead.",
    choices: [
        { text: "Investigate the metal surface", nextStep: 3, clue: "metal wall" },
        { text: "Move towards the light", nextStep: 4 },
        { text: "Keep still and listen", nextStep: 5 }
    ]
},
{
    text: "Your voice echoes oddly, as if both muffled and endless. Something about the acoustics feels 'not right'. You sense movement—maybe just the air.",
    choices: [
        { text: "Feel the surroundings", nextStep: 1 },
        { text: "Stay quiet and listen", nextStep: 5 }
    ]
},
{
    text: "You trace your fingers along the metal wall. There are markings—like scorch marks, or… fossils? It feels both ancient and technological. The wall curves upward and downward.",
    choices: [
        { text: "Follow the curve upward", nextStep: 6, clue: "curved wall" },
        { text: "Try to open a panel", nextStep: 7, clue: "panel" }
    ]
},
{
    text: "The light flickers, then stabilizes. Nearby, you see what might be a hatch. Beyond, a tunnel stretches into darkness—with what looks like stars... or glowing crystals.",
    choices: [
        { text: "Approach the hatch", nextStep: 7 },
        { text: "Walk down the tunnel", nextStep: 8 }
    ]
},
{
    text: "You focus. There _is_ a sound—machinery?\nBut you also sense the oppressive weight of rock, like being deep underground.",
    choices: [
        { text: "Try to find the source of the machinery sound", nextStep: 4, clue: "machinery" },
        { text: "Search the ground", nextStep: 9 }
    ]
},
{
    text: "As you follow the curve, the air seems lighter. Suddenly, you see both a ceiling of stone _and_ a glimpse of swirling galaxies above.\nYou realize: this place is both deep below and far beyond. Reality shivers.",
    choices: [
        { text: "Reach for the galaxies", nextStep: 10, clue: "galaxies" },
        { text: "Collapse, overwhelmed", nextStep: 11 }
    ]
},
{
    text: "You open the panel. Inside: dust, a strange crystal, and a fragment that reads ‘Experiment U235: INTERFACE INSTABILITY’. You pocket the fragment.",
    choices: [
        { text: "Return to darkness", nextStep: 0, clue: "fragment" },
        { text: "Look for a way out", nextStep: 8 }
    ]
},
{
    text: "You follow the tunnel. Features shift: walls of rough stone become metal, then transparent, then stars. Your memory flickers—you were never in one place. You always were both.",
    choices: [
        { text: "Embrace the paradox", nextStep: 10, clue: "acceptance" },
        { text: "Resist, try to wake up", nextStep: 11 }
    ]
},
{
    text: "Feeling on the ground, you find pebbles—and scraps of plastic. One reads, faintly: 'Starlift Mining Complex // Deck -2'. You are… under ground? Or in space?",
    choices: [
        { text: "Continue to search", nextStep: 1, clue: "mining complex" },
        { text: "Sit and wait", nextStep: 11 }
    ]
},
{
    text: "You let go, and understanding dawns: This place is both a derelict spaceship buried in rock and a forgotten mine drifting through stars. You've discovered the truth, and with acceptance, are finally free.\n\n--THE END--",
    choices: [
        { text: "Play Again", nextStep: 0, reset: true }
    ]
},
{
    text: "Your mind reels. You slip into unconsciousness, unsure if you dream or wake.\n\n-- THE END --",
    choices: [
        { text: "Play Again", nextStep: 0, reset: true }
    ]
}
];

// --- Additional nodes & features added: requires/effect support, more branches ---
storyNodes.push({
    text: "You manage to pry a stubborn panel further open. Inside a faint console hums — a place to fit that fragment.",
    choices: [
        { text: "Insert the fragment into the console", nextStep: 10, requires: ['fragment'], effect: { giveClue: 'interface' } },
        { text: "Take a sample of the crystal and move on", nextStep: 8, effect: { giveClue: 'crystal-sample' } },
        { text: "Seal the panel and leave it alone", nextStep: 1 }
    ]
});

storyNodes.push({
    text: "You trigger the console. For a moment the world aligns: panels glow and a hidden hatch opens, revealing a narrow shaft. The machine recognizes you.",
    choices: [
        { text: "Climb into the shaft", nextStep: 14 },
        { text: "Step back and observe", nextStep: 1 }
    ]
});

storyNodes.push({
    text: "Using the mining tag you found, you yank at a rusty latch; a service door groans open and fresh air whispers through.",
    choices: [
        { text: "Follow the fresh air", nextStep: 14, clue: 'open-door' },
        { text: "Close the door and hide", nextStep: 11 }
    ]
});

storyNodes.push({
    text: "The shaft narrows but gives way to a small chamber with a viewport showing a glittering sky. You found a way out — or a new way in.",
    choices: [
        { text: "Reach through the viewport", nextStep: 10 },
        { text: "Return to the deeper tunnels", nextStep: 8 }
    ]
});

// Keep visuals in sync: append neutral visuals for the new nodes
visuals.push({ bg: 'metal', overlay: 'beam', art: 'panel', palette: 'default' }); // for fragment console
visuals.push({ bg: 'reveal', overlay: 'beam', art: 'reveal', palette: 'reveal' }); // for console triggered
visuals.push({ bg: 'tunnel', overlay: 'none', art: 'hatch', palette: 'underground' }); // mining tag door
visuals.push({ bg: 'space', overlay: 'none', art: 'galaxies', palette: 'space' }); // shaft/view

// RENDERING helpers: show clues in a small bar
const clueBar = document.getElementById('clue-bar');
const achvBar = document.getElementById('achv-bar');
function renderClues() {
    if (!clueBar) return;
    clueBar.innerHTML = '';
    gameState.clues.forEach(c => {
        const el = document.createElement('div');
        el.className = 'clue';
        el.textContent = c;
        clueBar.appendChild(el);
    });
}

// Achievements
const achievements = [
    { key: 'first-steps', label: 'Awakened', test: (s)=> s.step > 0 },
    { key: 'collector', label: '3+ Clues', test: (s)=> s.clues.length >= 3 },
    { key: 'interface', label: 'Interface Found', test: (s)=> s.clues.includes('interface') },
    { key: 'ending', label: 'Reached Ending', test: (s)=> s.step === 10 || s.step === 11 }
];
function renderAchievements() {
    if (!achvBar) return;
    const unlocked = new Set(JSON.parse(localStorage.getItem('achievements') || '[]'));
    const newUnlocked = [];
    achievements.forEach(a => { if (a.test(gameState)) unlocked.add(a.key); });
    localStorage.setItem('achievements', JSON.stringify(Array.from(unlocked)));
    achvBar.innerHTML = achievements.map(a => {
        const has = unlocked.has(a.key);
        return `<div class="achv ${has?'':'locked'}">${has ? a.label : '????'}</div>`;
    }).join('');
}

// === ART DRAWING FUNCTIONS ===
function drawSVGArt(type) {
    switch(type) {
        case 'dim-light': // first scene, just a faint dot
            return `<svg width="80" height="80"><radialGradient id="g"><stop offset="0%" stop-color="#edfcff"/><stop offset="65%" stop-color="#e4ebfc00"/></radialGradient><circle cx="40" cy="45" r="23" fill="url(#g)" opacity="0.23"/></svg>`;
        case 'metal-stone':
            return `<svg width="100" height="90">
                <rect x="3" y="15" width="27" height="58" rx="8" fill="#837c92" stroke="#374a60" stroke-width="3"/>
                <rect x="38" y="12" width="49" height="62" rx="15" fill="#23242e" stroke="#6d6a6e" stroke-width="3"/>
                <ellipse cx="52" cy="65" rx="35" ry="16" fill="#787a7f99"/>
            </svg>`;
        case 'soundwave': // echo
            return `<svg width="88" height="60">
                <polyline points="5,35 18,32 39,46 57,21 69,44 81,37" fill="none" stroke="#a1c6fe" stroke-width="2"/>
                <ellipse cx="20" cy="45" rx="6" ry="3" fill="#eee2" />
            </svg>`;
        case 'marks': // fossil/markings
            return `<svg width="100" height="80">
                <path d="M31 60Q35 56,44 53T69 43" stroke="#e6d8bf" fill="none" stroke-width="3"/>
                <path d="M37 54 Q50 61,80 41" stroke="#8aabae" fill="none" stroke-width="3"/>
                <circle cx="61" cy="44" r="5" fill="#f7f2d4" />
            </svg>`;
        case 'hatch':
            return `<svg width="110" height="94">
                <ellipse cx="55" cy="65" rx="39" ry="23" fill="#f5eedd" stroke="#a8cbe4" stroke-width="3" opacity=".86"/>
                <rect x="25" y="40" width="60" height="22" rx="5" fill="#7993b0" stroke="#63708c" stroke-width="2"/>
                <rect x="45" y="57" width="19" height="17" rx="2" fill="#312d34" stroke="#b6edd9" stroke-width="2"/>
            </svg>`;
        case 'machine':
            return `<svg width="90" height="70">
                <rect x="9" y="20" width="72" height="18" rx="9" fill="#2089a2" stroke="#a6c1c4" stroke-width="3"/>
                <circle cx="23" cy="41" r="7" fill="#e8c283" stroke="#444" stroke-width="2"/>
                <rect x="53" y="43" width="18" height="7" rx="3" fill="#9c8e85"/>
                <rect x="34" y="55" width="20" height="7" rx="4" fill="#282f2b"/>
            </svg>`;
        case 'galaxies':
            return `<svg width="120" height="90">
                <ellipse cx="103" cy="33" rx="10" ry="3" fill="#fffbe7aa"/>
                <ellipse cx="83" cy="20" rx="21" ry="7" fill="#cdcfff80"/>
                <ellipse cx="55" cy="65" rx="27" ry="11" fill="#77a0ff60"/>
                <circle cx="41" cy="37" r="14" fill="#eda6f690"/>
                <circle cx="73" cy="61" r="8" fill="#43fff890"/>
            </svg>`;
        case 'panel': // crystal & scrap
            return `<svg width="102" height="84">
                <rect x="21" y="30" width="60" height="25" rx="5" fill="#cbeeff" stroke="#b7f3ff" stroke-width="2"/>
                <polygon points="46,25 54,34 39,36" fill="#00ede7"/>
                <rect x="59" y="45" width="23" height="8" rx="1" fill="#2c2b23"/>
            </svg>`;
        case 'stars':
        case 'reveal':
            // handled dynamically as twinkling spans
            return "";
        case 'pebble':
            return `<svg width="67" height="70">
                <ellipse cx="26" cy="54" rx="17" ry="8" fill="#928e86"/>
                <ellipse cx="51" cy="64" rx="7" ry="3" fill="#ccbba7"/>
                <rect x="15" y="45" width="36" height="6" rx="3" fill="#f1d0ab" />
            </svg>`;
        case 'none':
        default:
            return "";
    }
}

// Adds an animated starfield of n stars
function makeStars(n=38) {
    let html = '';
    for(let i=0;i<n;i++) {
        let x = Math.random()*100, y = Math.random()*90;
        let dur = 2.5+Math.random()*2.8;
        html += `<span style="left:${x}%;top:${y}%;animation-duration:${dur}s"></span>`;
    }
    return html;
}

// === RENDERING ===
function applyPalette(theme) {
    const colors = paletteThemes[theme] || paletteThemes['default'];
    gameContainer.style.background = colors.containerBg;
    gameContainer.style.color = colors.text;
    h1El.style.color = colors.h1;
    // Buttons
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.style.background = colors.choiceBtn;
        btn.style.color = colors.text;
        btn.onmouseenter = () => btn.style.background = colors.choiceHover;
        btn.onmouseleave = () => btn.style.background = colors.choiceBtn;
    })
}

// Set background, overlays, and minimal palette shifts
function applySceneVisuals(nodeIdx) {
    // 1. BACKGROUND
    const v = visuals[nodeIdx] || visuals[0];
    const bgType = v.bg, overlayType = v.overlay, artType = v.art, palette = v.palette;
    // Fade bg
    bgEl.style.background = backgrounds[bgType] || backgrounds['dark'];
    // 2. OVERLAY
    overlayEl.className = overlays[overlayType];
    overlayEl.innerHTML = '';
    if(artType === 'stars' || artType === 'reveal') {
        // star field, animated
        overlayEl.className = 'stars';
        overlayEl.innerHTML = makeStars(36 + (artType==='reveal'?28:0));
    } else if(overlayType !== 'none') {
        overlayEl.classList.add(overlays[overlayType]);
    }
    // 3. COLOR PALETTE
    applyPalette(palette);
    // 4. ART SPRITE
    if(artType === 'stars' || artType === 'reveal') {
        sceneArtEl.innerHTML = '';
    } else {
        sceneArtEl.innerHTML = drawSVGArt(artType);
    }
    updateAmbient();
}

// Flicker animation on text (simulate faulty lighting)
function storyFlicker() {
    storyEl.style.transition = "opacity 0.1s";
    storyEl.style.opacity = 0.8 + 0.2*Math.random();
    setTimeout(()=>{storyEl.style.opacity = 1;}, 180+Math.random()*90);
}

// Typewriter effect
async function typeWriter(text) {
    storyEl.classList.remove('typewriter');
    storyEl.textContent = '';
    storyEl.classList.add('typewriter');
    let i = 0;
    const reveal = () => {
        if (i >= text.length) return;
        storyEl.textContent = text.slice(0, ++i);
        if (Math.random() < 0.02 && /interface|console/i.test(text)) {
            storyEl.classList.add('glitch'); setTimeout(()=>storyEl.classList.remove('glitch'), 200);
        }
        if (animationsEnabled) setTimeout(reveal, 12 + Math.random()*20);
        else storyEl.textContent = text;
    };
    reveal();
}

// === MAIN RENDER FUNCTION ===
function render() {
    const curr = storyNodes[gameState.step];
    const fullText = curr.text + (gameState.clues.length > 0 && gameState.step < 10
        ? "\n\nClues found: " + gameState.clues.join(', ')
        : '');
    // Story
    if (animationsEnabled) {
        typeWriter(fullText);
    } else {
        storyEl.textContent = fullText;
    }
    choicesEl.innerHTML = '';
    curr.choices.forEach((choice, i) => {
        // Check requirements (if any)
        const requires = choice.requires || [];
        const allowed = requires.every(r => gameState.clues.includes(r));

        const btn = document.createElement('button');
        btn.className = 'choice-btn' + (allowed ? '' : ' locked');
        // number badge
        const num = document.createElement('span'); num.className = 'choice-num'; num.textContent = String(i+1);
        btn.appendChild(num);

        const label = document.createElement('span'); label.textContent = ' ' + choice.text;
        btn.appendChild(label);

        // Timed choices
        let timerId = null;
        if (typeof choice.timeLimitMs === 'number' && allowed) {
            const timer = document.createElement('span');
            timer.className = 'timer';
            let remain = Math.ceil(choice.timeLimitMs/1000);
            timer.textContent = remain + 's';
            btn.appendChild(timer);
            timerId = setInterval(() => {
                remain -= 1;
                timer.textContent = Math.max(remain,0) + 's';
                if (remain <= 0) {
                    clearInterval(timerId);
                    if (choice.fallback) {
                        makeChoice(choice.fallback);
                    } else {
                        btn.disabled = true;
                    }
                }
            }, 1000);
        }

        btn.onclick = () => { if (allowed) { if (timerId) clearInterval(timerId); makeChoice(choice); } };
        btn.setAttribute('role','button');
        btn.setAttribute('aria-label', choice.text + (allowed ? '' : ' (locked)'));
        if (!allowed) {
            btn.title = 'Requires: ' + requires.join(', ');
            btn.disabled = true;
        } else {
            // small pop-in animation class with stagger
            if (animationsEnabled) setTimeout(()=> btn.classList.add('pop-in'), 30 + i*50);
            btn.addEventListener('mouseenter', () => playChoiceSfx('click'));
        }
        choicesEl.appendChild(btn);
    });
    // render clues to the header bar
    renderClues();
    renderAchievements();
    applySceneVisuals(gameState.step);
    if (Math.random() > 0.8) setTimeout(storyFlicker, 700 + Math.random()*400);
    // update log
    updateLog();
}

// CHOICE LOGIC
function makeChoice(choice) {
    // apply effects first
    if (choice.effect) {
        if (choice.effect.giveClue && !gameState.clues.includes(choice.effect.giveClue)) {
            gameState.clues.push(choice.effect.giveClue);
        }
        if (choice.effect.setLocation) {
            gameState.location = choice.effect.setLocation;
        }
    }
    if (choice.clue && !gameState.clues.includes(choice.clue)) {
        gameState.clues.push(choice.clue);
    }
    if (choice.reset) {
        gameState.clues = [];
    }
    // sound + step change
    playChoiceSfx('click');
    // log
    const prevText = storyNodes[gameState.step].text.split('\n')[0];
    gameState.log.push({ step: gameState.step, took: choice.text, from: prevText.slice(0,100) });
    gameState.step = choice.nextStep;
    render();
}

// === LOG PANEL ===
function updateLog() {
    if (!logPanel) return;
    logPanel.innerHTML = gameState.log.slice(-12).map(entry => {
        return `<div><strong>${entry.took}</strong> — from “${entry.from}”</div>`;
    }).join('');
}

// === AMBIENT LAYERS ===
let ambientNodes = [];
function updateAmbient() {
    if (!audioCtx) return;
    ensureAudio();
    // Simple implementation: one low rumble for underground, one airy noise for space
    ambientNodes.forEach(n => { try{ n.stop(); } catch{} });
    ambientNodes = [];
    const loc = gameState.location || visuals[gameState.step]?.palette || 'default';
    if (loc.includes('space')) {
        // airy sine
        const o = audioCtx.createOscillator(); o.type = 'sine'; o.frequency.value = 160;
        o.connect(ambientGain); o.start(); ambientNodes.push(o);
    } else {
        // low rumble
        const o = audioCtx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 40;
        o.connect(ambientGain); o.start(); ambientNodes.push(o);
    }
}

// === ADAPTIVE MUSIC BED ===
let musicSeq = null;
function startMusic() {
    if (!audioCtx) return;
    ensureAudio();
    if (musicSeq) return;
    const scale = [0,3,5,7,10]; // minor pentatonic
    musicSeq = setInterval(() => {
        const now = audioCtx.currentTime;
        const clues = gameState.clues.length;
        const base = 220 + clues*12;
        const o = audioCtx.createOscillator();
        o.type = 'sine';
        const note = base * Math.pow(2, scale[Math.floor(Math.random()*scale.length)]/12);
        o.frequency.setValueAtTime(note, now);
        const g = audioCtx.createGain();
        g.gain.value = masterVolume*0.15;
        o.connect(g); g.connect(musicGain);
        o.start(now); o.stop(now + 0.35);
    }, 900);
}
function stopMusic() { if (musicSeq) { clearInterval(musicSeq); musicSeq = null; } }

// INIT: position overlay stars (absolute)
overlayEl.style.position = "fixed";
overlayEl.style.left = overlayEl.style.top = "0";
overlayEl.style.width = overlayEl.style.height = "100%";
overlayEl.style.zIndex = 1;

// START GAME
startMusic();
render();