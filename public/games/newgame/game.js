// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions - will be set by resize handler
let canvasWidth = 800;
let canvasHeight = 600;

// Character creation state
let charCreation = {
    name: '',
    race: null,
    class: null,
    attributes: {
        str: 8,
        dex: 8,
        con: 8,
        int: 8,
        wis: 8,
        cha: 8
    },
    pointsRemaining: 27
};

// Race bonuses
const RACE_BONUSES = {
    human: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    elf: { dex: 2, wis: 1 },
    dwarf: { con: 2, str: 1 },
    orc: { str: 2, con: 1 }
};

// Class stat bonuses
const CLASS_BONUSES = {
    warrior: { str: 3, con: 2, dex: 1 },
    rogue: { dex: 3, int: 2, str: 1 },
    mage: { int: 3, wis: 2, con: 1 },
    ranger: { dex: 2, wis: 2, con: 1, str: 1 }
};

import { Player } from './js/player.js';

// Game state
const game = {
    player: new Player(),
    keys: {},
    enemies: [],
    items: [],
    doors: [],  // Array of door objects
    npcs: [],   // Array of NPC objects
    tiles: [],
    camera: { x: 0, y: 0 },
    inCombat: false,
    currentEnemy: null,
    tileSize: 32,
    moveDelay: 200,  // Milliseconds between moves
    screenShake: 0,  // Screen shake effect
    tutorial: {
        active: true,
        completed: false,
        currentStep: 0,
        steps: [
            { id: 'welcome', completed: false, message: 'Welcome, young adventurer! I am Master Aldric, the village wizard.' },
            { id: 'movement', completed: false, message: 'Use WASD or Arrow Keys to move around. Try moving now!' },
            { id: 'combat', completed: false, message: 'You will encounter enemies. They will chase you, so be ready to fight!' },
            { id: 'items', completed: false, message: 'Collect items you find on the ground. They can heal you or give you gold.' },
            { id: 'chest', completed: false, message: 'Open that chest over there to find useful supplies.' },
            { id: 'ready', completed: false, message: 'You are ready! I will open the gate to the outside world. Good luck!' }
        ]
    },
    tutorialGate: null  // Gate blocking exit from tutorial
};

// High-DPI support
let devicePixelRatio = window.devicePixelRatio || 1;

// Resize canvas function (defined after game object)
function resizeCanvas() {
    const gameArea = document.querySelector('.game-area');
    const uiPanel = document.querySelector('.ui-panel');
    
    devicePixelRatio = window.devicePixelRatio || 1;
    
    if (gameArea && uiPanel) {
        const availableWidth = gameArea.offsetWidth - 20; // Account for gap
        const uiPanelWidth = window.innerWidth > 1200 ? 280 : Math.min(280, availableWidth * 0.3);
        const maxCanvasWidth = availableWidth - uiPanelWidth;
        
        // Maintain aspect ratio but respect available space
        const aspectRatio = 4 / 3;
        const maxWidth = Math.min(800, maxCanvasWidth);
        const maxHeight = Math.min(600, window.innerHeight - 300);
        
        canvasWidth = Math.max(400, Math.min(maxWidth, maxHeight * aspectRatio));
        canvasHeight = canvasWidth / aspectRatio;
        
        // Set CSS size
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        
        // Set actual canvas size with device pixel ratio for crisp rendering
        canvas.width = Math.round(canvasWidth * devicePixelRatio);
        canvas.height = Math.round(canvasHeight * devicePixelRatio);
        
        // Scale context to handle high-DPI
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        
        // Update camera if game has started
        if (game && game.player && game.player.maxHp > 0) {
            game.camera.x = game.player.x - canvasWidth / 2;
            game.camera.y = game.player.y - canvasHeight / 2;
        }
    } else {
        // Fallback for character creation screen
        canvasWidth = Math.min(800, window.innerWidth - 40);
        canvasHeight = Math.min(600, window.innerHeight - 200);
        if (canvas) {
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
            canvas.width = Math.round(canvasWidth * devicePixelRatio);
            canvas.height = Math.round(canvasHeight * devicePixelRatio);
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        }
    }
}

// Tile types
const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    DOOR: 2,
    CHEST: 3,
    SHOP: 4,
    WATER: 5,
    GRASS: 6,
    GATE: 7  // Tutorial gate
};

// Enemy types
const ENEMY_TYPES = {
    bandit: { name: 'Bandit', color: '#654321', hpMult: 1.0, attackMult: 1.0 },
    undead: { name: 'Undead', color: '#4a4a4a', hpMult: 1.2, attackMult: 0.9 },
    beast: { name: 'Dire Wolf', color: '#2a2a2a', hpMult: 0.9, attackMult: 1.2 },
    cultist: { name: 'Cultist', color: '#5a1a1a', hpMult: 0.8, attackMult: 1.3 }
};

// Character Creation Functions
function initCharacterCreation() {
    console.log('Initializing character creation...');
    
    // Use event delegation on the character creation panel for better reliability
    const charCreationPanel = document.querySelector('.char-creation-panel');
    if (!charCreationPanel) {
        console.error('Character creation panel not found!');
        // Retry after a short delay
        setTimeout(initCharacterCreation, 100);
        return;
    }
    
    // Remove event delegation for race/class selection
    // Use only direct listeners below
    
    // Attribute buttons - use event delegation
    charCreationPanel.addEventListener('click', (e) => {
        const attrBtn = e.target.closest('.attr-btn');
        if (attrBtn && !attrBtn.disabled) {
            e.preventDefault();
            e.stopPropagation();
            const attr = attrBtn.dataset.attr;
            const dir = attrBtn.dataset.dir;
            console.log('Attribute button clicked:', attr, dir);
            adjustAttribute(attr, dir === '+' ? 1 : -1);
        }
    });
    
    // Also attach direct listeners as backup
    const raceOptions = document.querySelectorAll('.race-option');
    console.log('Found race options:', raceOptions.length);
    raceOptions.forEach(option => {
        option.style.pointerEvents = 'auto';
        option.style.cursor = 'pointer';
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Race clicked (direct):', option.dataset.race);
            document.querySelectorAll('.race-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            charCreation.race = option.dataset.race;
            console.log('Race set to:', charCreation.race);
            checkStartButton();
        });
    });
    
    const classOptions = document.querySelectorAll('.class-option');
    console.log('Found class options:', classOptions.length);
    classOptions.forEach(option => {
        option.style.pointerEvents = 'auto';
        option.style.cursor = 'pointer';
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Class clicked (direct):', option.dataset.class);
            document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            charCreation.class = option.dataset.class;
            console.log('Class set to:', charCreation.class);
            checkStartButton();
        });
    });
    
    const attrButtons = document.querySelectorAll('.attr-btn');
    console.log('Found attribute buttons:', attrButtons.length);
    attrButtons.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const attr = btn.dataset.attr;
            const dir = btn.dataset.dir;
            console.log('Attribute button clicked (direct):', attr, dir);
            adjustAttribute(attr, dir === '+' ? 1 : -1);
        });
    });
    
    // Name input
    const nameInput = document.getElementById('charName');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            charCreation.name = e.target.value.trim();
            console.log('Name set to:', charCreation.name);
            checkStartButton();
        });
    }
    
    // Start button
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Start button clicked');
            startGame();
        });
    }
    
    // Auto-assign button
    const autoAssignBtn = document.getElementById('autoAssignBtn');
    if (autoAssignBtn) {
        autoAssignBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Auto-assign button clicked');
            autoAssignAttributes();
        });
    }
    
    // Initialize display
    updateAttributeDisplay();
    checkStartButton();
    console.log('Character creation initialized');
}

function autoAssignAttributes() {
    // Reset all attributes to base value (8)
    Object.keys(charCreation.attributes).forEach(attr => {
        charCreation.attributes[attr] = 8;
    });
    charCreation.pointsRemaining = 27;
    
    // Define class-based attribute priorities
    const classPriorities = {
        warrior: { str: 5, con: 4, dex: 2, int: 1, wis: 1, cha: 1 },
        rogue: { dex: 5, int: 3, str: 2, con: 2, wis: 1, cha: 1 },
        mage: { int: 5, wis: 3, con: 2, dex: 1, str: 1, cha: 1 },
        ranger: { dex: 3, wis: 3, con: 2, str: 2, int: 1, cha: 1 }
    };
    
    // If class is selected, use class-based distribution
    if (charCreation.class && classPriorities[charCreation.class]) {
        const priorities = classPriorities[charCreation.class];
        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        
        // Distribute points based on priorities
        let pointsToDistribute = 27;
        const distribution = {};
        
        // First pass: assign based on priority weights
        attributes.forEach(attr => {
            const weight = priorities[attr];
            const points = Math.floor((weight / 18) * 27); // 18 is total weight
            distribution[attr] = Math.min(points, 7); // Max 7 points per attribute (8 base + 7 = 15 max)
        });
        
        // Distribute remaining points
        let totalDistributed = Object.values(distribution).reduce((a, b) => a + b, 0);
        let remaining = 27 - totalDistributed;
        
        // Add remaining points to highest priority attributes
        const sortedAttrs = attributes.sort((a, b) => priorities[b] - priorities[a]);
        for (let i = 0; i < sortedAttrs.length && remaining > 0; i++) {
            const attr = sortedAttrs[i];
            const canAdd = Math.min(remaining, 7 - distribution[attr]);
            distribution[attr] += canAdd;
            remaining -= canAdd;
        }
        
        // Apply distribution
        attributes.forEach(attr => {
            charCreation.attributes[attr] = 8 + distribution[attr];
            charCreation.pointsRemaining -= distribution[attr];
        });
    } else {
        // Balanced distribution (if no class selected)
        const balanced = { str: 4, dex: 4, con: 4, int: 4, wis: 4, cha: 4 };
        let remaining = 27;
        
        // Distribute 4 points to each (24 points)
        Object.keys(balanced).forEach(attr => {
            charCreation.attributes[attr] = 8 + balanced[attr];
            remaining -= balanced[attr];
        });
        
        // Distribute remaining 3 points evenly
        const attrs = Object.keys(balanced);
        for (let i = 0; i < remaining; i++) {
            const attr = attrs[i % attrs.length];
            if (charCreation.attributes[attr] < 15) {
                charCreation.attributes[attr]++;
                charCreation.pointsRemaining--;
            }
        }
    }
    
    // Ensure all points are used
    if (charCreation.pointsRemaining > 0) {
        // Distribute any remaining points to attributes that aren't maxed
        const attrs = Object.keys(charCreation.attributes);
        while (charCreation.pointsRemaining > 0) {
            let distributed = false;
            for (const attr of attrs) {
                if (charCreation.attributes[attr] < 15 && charCreation.pointsRemaining > 0) {
                    charCreation.attributes[attr]++;
                    charCreation.pointsRemaining--;
                    distributed = true;
                }
            }
            if (!distributed) break; // All attributes maxed
        }
    }
    
    updateAttributeDisplay();
    checkStartButton();
    console.log('Attributes auto-assigned:', charCreation.attributes);
}

function adjustAttribute(attr, change) {
    console.log('adjustAttribute called:', attr, change);
    const current = charCreation.attributes[attr];
    const newValue = current + change;
    console.log('Current:', current, 'New:', newValue, 'Points remaining:', charCreation.pointsRemaining);
    
    if (change > 0 && charCreation.pointsRemaining > 0 && newValue <= 15) {
        charCreation.attributes[attr] = newValue;
        charCreation.pointsRemaining--;
        console.log('Increased', attr, 'to', newValue, 'Points remaining:', charCreation.pointsRemaining);
    } else if (change < 0 && newValue >= 8) {
        charCreation.attributes[attr] = newValue;
        charCreation.pointsRemaining++;
        console.log('Decreased', attr, 'to', newValue, 'Points remaining:', charCreation.pointsRemaining);
    } else {
        console.log('Attribute change blocked');
    }
    
    updateAttributeDisplay();
    checkStartButton();
}

function updateAttributeDisplay() {
    const strEl = document.getElementById('strValue');
    const dexEl = document.getElementById('dexValue');
    const conEl = document.getElementById('conValue');
    const intEl = document.getElementById('intValue');
    const wisEl = document.getElementById('wisValue');
    const chaEl = document.getElementById('chaValue');
    const pointsEl = document.getElementById('pointsRemaining');
    
    if (strEl) strEl.textContent = charCreation.attributes.str;
    if (dexEl) dexEl.textContent = charCreation.attributes.dex;
    if (conEl) conEl.textContent = charCreation.attributes.con;
    if (intEl) intEl.textContent = charCreation.attributes.int;
    if (wisEl) wisEl.textContent = charCreation.attributes.wis;
    if (chaEl) chaEl.textContent = charCreation.attributes.cha;
    if (pointsEl) pointsEl.textContent = charCreation.pointsRemaining;
    
    // Update button states
    document.querySelectorAll('.attr-btn').forEach(btn => {
        const attr = btn.dataset.attr;
        const dir = btn.dataset.dir;
        const current = charCreation.attributes[attr];
        
        if (dir === '+') {
            btn.disabled = charCreation.pointsRemaining === 0 || current >= 15;
        } else {
            btn.disabled = current <= 8;
        }
    });
}

function checkStartButton() {
    const btn = document.getElementById('startGameBtn');
    if (!btn) {
        console.log('Start button not found');
        return;
    }
    
    const isValid = charCreation.name && 
                   charCreation.race && 
                   charCreation.class && 
                   charCreation.pointsRemaining === 0;
    
    console.log('Checking start button:', {
        name: charCreation.name,
        race: charCreation.race,
        class: charCreation.class,
        pointsRemaining: charCreation.pointsRemaining,
        isValid: isValid
    });
    
    btn.disabled = !isValid;
}

function startGame() {
    // Apply race bonuses
    const raceBonus = RACE_BONUSES[charCreation.race];
    const finalAttributes = { ...charCreation.attributes };
    Object.keys(raceBonus).forEach(attr => {
        finalAttributes[attr] += raceBonus[attr];
    });
    
    // Apply class bonuses
    const classBonus = CLASS_BONUSES[charCreation.class];
    Object.keys(classBonus).forEach(attr => {
        finalAttributes[attr] += classBonus[attr];
    });
    
    // Calculate derived stats
    game.player.name = charCreation.name;
    game.player.race = charCreation.race;
    game.player.class = charCreation.class;
    game.player.attributes = finalAttributes;
    game.player.maxHp = 50 + (finalAttributes.con * 5);
    game.player.hp = game.player.maxHp;
    game.player.attack = 5 + Math.floor(finalAttributes.str / 2) + (finalAttributes.dex / 4);
    game.player.defense = 2 + Math.floor(finalAttributes.dex / 3) + Math.floor(finalAttributes.con / 4);
    game.player.magicPower = 3 + Math.floor(finalAttributes.int / 2);
    game.player.speed = 2 + Math.floor(finalAttributes.dex / 5);
    
    // Update UI
    document.getElementById('playerName').textContent = game.player.name;
    document.getElementById('playerRaceClass').textContent = 
        `${capitalizeFirst(game.player.race)} ${capitalizeFirst(game.player.class)}`;
    
    updateAttributeDisplayInGame();
    updateUI();
    
    // Hide character creation, show game
    document.getElementById('charCreation').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    
    // Resize canvas for game view
    resizeCanvas();
    
    // Clear any stuck keys from character creation
    game.keys = {};
    
    // Reset transition flag
    hasTransitioned = false;
    
    // Initialize game world
    if (game.tutorial.active && !game.tutorial.completed) {
        initTutorialVillage();
    } else {
        initWorld();
        spawnEnemies();
        spawnItems();
    }
    
    updateCamera();
    
    // Start tutorial dialogue
    if (game.tutorial.active && !game.tutorial.completed) {
        setTimeout(() => {
            startTutorialDialogue();
        }, 500);
    } else {
        addLog(`You begin your journey as ${game.player.name}, a ${game.player.race} ${game.player.class}.`);
        addLog('The world is dark and dangerous. Survive if you can.');
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateAttributeDisplayInGame() {
    document.getElementById('displayStr').textContent = game.player.attributes.str;
    document.getElementById('displayDex').textContent = game.player.attributes.dex;
    document.getElementById('displayCon').textContent = game.player.attributes.con;
    document.getElementById('displayInt').textContent = game.player.attributes.int;
    document.getElementById('displayWis').textContent = game.player.attributes.wis;
    document.getElementById('displayCha').textContent = game.player.attributes.cha;
}

// Initialize tutorial village
function initTutorialVillage() {
    game.tiles = [];
    game.doors = [];
    game.npcs = [];
    game.enemies = [];
    game.items = [];
    const villageSize = 20;
    
    // Create a small village area
    for (let y = 0; y < villageSize; y++) {
        game.tiles[y] = [];
        for (let x = 0; x < villageSize; x++) {
            // Create walls around edges
            if (x === 0 || y === 0 || x === villageSize - 1 || y === villageSize - 1) {
                game.tiles[y][x] = TILE_TYPES.WALL;
            } else {
                game.tiles[y][x] = TILE_TYPES.FLOOR;
            }
        }
    }
    
    // Add a few interior walls for village feel
    for (let y = 5; y < 8; y++) {
        for (let x = 5; x < 8; x++) {
            if (y === 6 && x === 6) continue; // Leave door space
            game.tiles[y][x] = TILE_TYPES.WALL;
        }
    }
    
    // Add tutorial chest (for tutorial step)
    game.tiles[8][10] = TILE_TYPES.CHEST;
    
    // Add a healing item for tutorial
    game.items.push({
        gridX: 12,
        gridY: 8,
        width: 18,
        height: 18,
        type: { name: 'Healing Salve', effect: 'heal', value: 25, color: '#8b0000' }
    });
    
    // Add a weak tutorial enemy (will move toward player)
    game.enemies.push({
        gridX: 15,
        gridY: 12,
        width: 28,
        height: 28,
        hp: 20,
        maxHp: 20,
        attack: 5,
        defense: 1,
        xpReward: 15,
        goldReward: 10,
        type: 'bandit',
        typeName: 'Training Dummy',
        color: '#654321',
        moveCooldown: 0,
        moveDelay: 400  // Slower movement for tutorial
    });
    
    // Add wizard NPC at starting position
    game.npcs.push({
        x: 10,
        y: 10,
        name: 'Master Aldric',
        dialogue: ['Welcome to the village!', 'I will guide you through the basics.', 'Press Space to talk to me.'],
        color: '#4a1a4a',
        isWizard: true
    });
    
    // Add gate blocking exit (at right edge)
    game.tutorialGate = { x: villageSize - 1, y: 10, opened: false };
    game.tiles[10][villageSize - 1] = TILE_TYPES.GATE;
    
    // Set player starting position
    game.player.gridX = 10;
    game.player.gridY = 10;
}

// Initialize world
function initWorld() {
    game.tiles = [];
    game.doors = [];
    game.npcs = [];
    const worldSize = 40;
    
    // Create a dungeon-like grid
    for (let y = 0; y < worldSize; y++) {
        game.tiles[y] = [];
        for (let x = 0; x < worldSize; x++) {
            // Create walls around edges and some interior walls
            if (x === 0 || y === 0 || x === worldSize - 1 || y === worldSize - 1) {
                game.tiles[y][x] = TILE_TYPES.WALL;
            } else if ((x % 5 === 0 && y % 3 === 0) || (x % 7 === 0 && y % 4 === 0)) {
                // Some interior walls
                if (Math.random() > 0.7) {
                    game.tiles[y][x] = TILE_TYPES.WALL;
                } else {
                    game.tiles[y][x] = TILE_TYPES.FLOOR;
                }
            } else {
                game.tiles[y][x] = TILE_TYPES.FLOOR;
            }
        }
    }
    
    // Add doors
    for (let i = 0; i < 8; i++) {
        const x = Math.floor(Math.random() * (worldSize - 2)) + 1;
        const y = Math.floor(Math.random() * (worldSize - 2)) + 1;
        if (game.tiles[y][x] === TILE_TYPES.FLOOR) {
            game.doors.push({
                x: x,
                y: y,
                locked: Math.random() > 0.3,  // 70% locked
                opened: false
            });
            game.tiles[y][x] = TILE_TYPES.DOOR;
        }
    }
    
    // Add chests
    for (let i = 0; i < 6; i++) {
        const x = Math.floor(Math.random() * (worldSize - 2)) + 1;
        const y = Math.floor(Math.random() * (worldSize - 2)) + 1;
        if (game.tiles[y][x] === TILE_TYPES.FLOOR) {
            game.tiles[y][x] = TILE_TYPES.CHEST;
        }
    }
    
    // Add shop
    game.tiles[5][35] = TILE_TYPES.SHOP;
    
    // Add NPCs
    const npcTypes = [
        { name: 'Old Guard', dialogue: ['The dungeon is dangerous.', 'Watch out for locked doors.', 'You\'ll need keys to progress.'] },
        { name: 'Merchant', dialogue: ['Welcome, traveler.', 'I have wares if you have coin.', 'Come back anytime.'] },
        { name: 'Wise Sage', dialogue: ['The path ahead is treacherous.', 'Strength comes from within.', 'Trust your instincts.'] },
        { name: 'Wounded Warrior', dialogue: ['I barely escaped...', 'The creatures here are fierce.', 'Be careful out there.'] }
    ];
    
    for (let i = 0; i < 4; i++) {
        const x = Math.floor(Math.random() * (worldSize - 2)) + 1;
        const y = Math.floor(Math.random() * (worldSize - 2)) + 1;
        if (game.tiles[y][x] === TILE_TYPES.FLOOR) {
            const npcType = npcTypes[i % npcTypes.length];
            game.npcs.push({
                x: x,
                y: y,
                name: npcType.name,
                dialogue: npcType.dialogue,
                color: ['#8b6914', '#4a4a4a', '#3a5a3a', '#5a1a1a'][i % 4]
            });
        }
    }
    
    // Ensure starting position is clear
    game.tiles[10][10] = TILE_TYPES.FLOOR;
}

// Update camera based on grid position
function updateCamera() {
    // Ensure player position is valid before updating camera
    if (game.tiles && game.tiles.length > 0 && 
        game.player.gridX >= 0 && game.player.gridX < game.tiles[0].length &&
        game.player.gridY >= 0 && game.player.gridY < game.tiles.length) {
        const pixelX = game.player.gridX * game.tileSize;
        const pixelY = game.player.gridY * game.tileSize;
        game.camera.x = pixelX - canvasWidth / 2;
        game.camera.y = pixelY - canvasHeight / 2;
    }
}

// Spawn enemies
function spawnEnemies() {
    // Don't spawn enemies in tutorial (they're already placed)
    if (game.tutorial.active && !game.tutorial.completed) {
        return;
    }
    
    game.enemies = [];
    const enemyCount = 8 + game.player.level;
    const enemyTypes = Object.keys(ENEMY_TYPES);
    
    for (let i = 0; i < enemyCount; i++) {
        const typeKey = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const type = ENEMY_TYPES[typeKey];
        const baseHp = 40 + game.player.level * 8;
        const baseAttack = 10 + game.player.level * 2;
        
        // Find a valid floor tile
        let gridX, gridY;
        do {
            gridX = Math.floor(Math.random() * (game.tiles[0].length - 2)) + 1;
            gridY = Math.floor(Math.random() * (game.tiles.length - 2)) + 1;
        } while (game.tiles[gridY][gridX] !== TILE_TYPES.FLOOR || 
                 (gridX === game.player.gridX && gridY === game.player.gridY));
        
        game.enemies.push({
            gridX: gridX,
            gridY: gridY,
            width: 28,
            height: 28,
            hp: Math.floor(baseHp * type.hpMult),
            maxHp: Math.floor(baseHp * type.hpMult),
            attack: Math.floor(baseAttack * type.attackMult),
            defense: 3 + game.player.level,
            xpReward: 25 + game.player.level * 8,
            goldReward: 15 + game.player.level * 5,
            type: typeKey,
            typeName: type.name,
            color: type.color,
            moveCooldown: 0,
            moveDelay: 300,  // Movement speed for enemies
            hitTimer: 0,  // For hit feedback
            damageNumber: null,  // For damage popup
            damageNumberTimer: 0  // Timer for damage number
        });
    }
}

// Spawn items
function spawnItems() {
    game.items = [];
    const itemTypes = [
        { name: 'Healing Salve', effect: 'heal', value: 25, color: '#8b0000' },
        { name: 'Gold', effect: 'gold', value: 10, color: '#8b6914' },
        { name: 'Experience Crystal', effect: 'xp', value: 30, color: '#4a4a00' },
        { name: 'Key', effect: 'key', value: 1, color: '#ffd700' }
    ];
    
    for (let i = 0; i < 10; i++) {
        // Find a valid floor tile
        let gridX, gridY;
        do {
            gridX = Math.floor(Math.random() * (game.tiles[0].length - 2)) + 1;
            gridY = Math.floor(Math.random() * (game.tiles.length - 2)) + 1;
        } while (game.tiles[gridY][gridX] !== TILE_TYPES.FLOOR);
        
        game.items.push({
            gridX: gridX,
            gridY: gridY,
            width: 18,
            height: 18,
            type: itemTypes[Math.floor(Math.random() * itemTypes.length)]
        });
    }
}

// Draw functions
function drawTile(x, y, type) {
    const screenX = x * game.tileSize - game.camera.x;
    const screenY = y * game.tileSize - game.camera.y;
    
    if (screenX < -game.tileSize || screenX > canvasWidth || 
        screenY < -game.tileSize || screenY > canvasHeight) return;
    
    const s = game.tileSize;
    
    switch(type) {
        case TILE_TYPES.FLOOR:
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(screenX, screenY, s, s);
            // Brighter grid lines for better visibility
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 0.5, screenY + 0.5, s - 1, s - 1);
            break;
        case TILE_TYPES.WALL:
            // Much darker walls with outline for clear separation
            ctx.fillStyle = '#0d0d0d';
            ctx.fillRect(screenX, screenY, s, s);
            ctx.strokeStyle = '#3a3a3a';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 0.5, screenY + 0.5, s - 1, s - 1);
            break;
        case TILE_TYPES.DOOR:
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(screenX, screenY, s, s);
            // Draw door with lock icon
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);
            ctx.strokeStyle = '#8b6914';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX + 2, screenY + 2, s - 4, s - 4);
            // Draw lock icon (padlock)
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(screenX + s/2, screenY + s/2 - 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX + s/2 - 3, screenY + s/2 + 2, 6, 4);
            break;
        case TILE_TYPES.CHEST:
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(screenX, screenY, s, s);
            // Draw chest with bag/treasure icon
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(screenX + 6, screenY + 6, s - 12, s - 12);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 6, screenY + 6, s - 12, s - 12);
            // Draw latch/strap
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(screenX + s/2 - 4, screenY + 6, 8, 3);
            break;
        case TILE_TYPES.SHOP:
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(screenX, screenY, s, s);
            // Draw shop with coin icon
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(screenX + 4, screenY + 4, s - 8, s - 8);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX + 4, screenY + 4, s - 8, s - 8);
            // Draw coin icon
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(screenX + s/2, screenY + s/2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8b6914';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', screenX + s/2, screenY + s/2);
            break;
        case TILE_TYPES.WATER:
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(screenX, screenY, s, s);
            break;
        case TILE_TYPES.GRASS:
            ctx.fillStyle = '#1a2a1a';
            ctx.fillRect(screenX, screenY, s, s);
            break;
        case TILE_TYPES.GATE:
            // Draw gate bars
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);
            ctx.strokeStyle = '#8b0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX + 2, screenY + 2, s - 4, s - 4);
            // Draw vertical bars
            for (let i = 0; i < 3; i++) {
                ctx.fillStyle = '#2a1a1a';
                ctx.fillRect(screenX + 6 + i * 6, screenY + 4, 2, s - 8);
            }
            break;
    }
}

// Draw doors
function drawDoors() {
    game.doors.forEach(door => {
        const screenX = door.x * game.tileSize - game.camera.x;
        const screenY = door.y * game.tileSize - game.camera.y;
        
        if (screenX < -game.tileSize || screenX > canvasWidth || 
            screenY < -game.tileSize || screenY > canvasHeight) return;
        
        if (door.opened) {
            // Draw open door (just floor)
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(screenX, screenY, game.tileSize, game.tileSize);
        } else {
            // Draw closed door
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX + 2, screenY + 2, game.tileSize - 4, game.tileSize - 4);
            ctx.strokeStyle = door.locked ? '#8b0000' : '#8b6914';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX + 2, screenY + 2, game.tileSize - 4, game.tileSize - 4);
            
            // Draw lock icon if locked
            if (door.locked) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(screenX + game.tileSize/2, screenY + game.tileSize/2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

// Draw NPCs
function drawNPCs() {
    game.npcs.forEach(npc => {
        const screenX = npc.x * game.tileSize - game.camera.x;
        const screenY = npc.y * game.tileSize - game.camera.y;
        
        if (screenX < -game.tileSize || screenX > canvasWidth || 
            screenY < -game.tileSize || screenY > canvasHeight) return;
        
        const centerX = screenX + game.tileSize / 2;
        const centerY = screenY + game.tileSize / 2;
        
        // Special drawing for wizard
        if (npc.isWizard) {
            // Wizard robe
            ctx.fillStyle = '#4a1a4a';
            ctx.fillRect(screenX + 6, screenY + 8, game.tileSize - 12, game.tileSize - 12);
            // Wizard hat
            ctx.fillStyle = '#2a0a2a';
            ctx.beginPath();
            ctx.moveTo(centerX - 8, centerY - 4);
            ctx.lineTo(centerX, centerY - 12);
            ctx.lineTo(centerX + 8, centerY - 4);
            ctx.closePath();
            ctx.fill();
            // Staff
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(centerX + 10, centerY - 8, 2, 12);
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(centerX + 11, centerY - 10, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Regular NPC body
            ctx.fillStyle = npc.color;
            ctx.fillRect(screenX + 8, screenY + 4, game.tileSize - 16, game.tileSize - 8);
            
            // NPC indicator
            ctx.fillStyle = '#d4af37';
            ctx.beginPath();
            ctx.arc(centerX, screenY + 6, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawWorld() {
    const startX = Math.floor(game.camera.x / game.tileSize);
    const startY = Math.floor(game.camera.y / game.tileSize);
    const endX = startX + Math.ceil(canvasWidth / game.tileSize) + 1;
    const endY = startY + Math.ceil(canvasHeight / game.tileSize) + 1;
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            if (game.tiles[y] && game.tiles[y][x] !== undefined) {
                drawTile(x, y, game.tiles[y][x]);
            } else {
                drawTile(x, y, TILE_TYPES.DIRT);
            }
        }
    }
}

function drawPlayer() {
    const screenX = game.player.gridX * game.tileSize - game.camera.x;
    const screenY = game.player.gridY * game.tileSize - game.camera.y;
    
    // Don't draw if off screen
    if (screenX < -game.tileSize || screenX > canvasWidth + game.tileSize || 
        screenY < -game.tileSize || screenY > canvasHeight + game.tileSize) return;
    
    const centerX = screenX + game.tileSize / 2;
    const centerY = screenY + game.tileSize / 2;
    
    // Hit feedback - red tint when hit
    if (game.player.hitTimer > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, game.player.hitTimer / 200);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(screenX, screenY, game.tileSize, game.tileSize);
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    
    // Draw class/race-specific player icon
    drawPlayerIcon(centerX, centerY, game.player.class, game.player.race);
    
    // HP bar above player
    const barWidth = game.tileSize;
    const barHeight = 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX, screenY - 8, barWidth, barHeight);
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(screenX, screenY - 8, 
                 (game.player.hp / game.player.maxHp) * barWidth, barHeight);
}

function drawPlayerIcon(x, y, playerClass, playerRace) {
    // Base colors by race
    const raceColors = {
        human: '#d4af37',
        elf: '#90ee90',
        dwarf: '#8b4513',
        orc: '#654321'
    };
    const baseColor = raceColors[playerRace] || '#d4af37';
    
    // Draw based on class
    if (playerClass === 'warrior') {
        // Warrior: Shield and sword
        ctx.fillStyle = baseColor;
        ctx.fillRect(x - 10, y - 8, 8, 12); // Body
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 12, y - 6, 4, 8); // Shield
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x + 2, y - 10, 2, 8); // Sword
    } else if (playerClass === 'rogue') {
        // Rogue: Hooded figure with daggers
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(x, y - 4, 6, 0, Math.PI * 2); // Head/hood
        ctx.fill();
        ctx.fillStyle = baseColor;
        ctx.fillRect(x - 8, y, 16, 10); // Body
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x - 12, y + 2, 3, 6); // Left dagger
        ctx.fillRect(x + 9, y + 2, 3, 6); // Right dagger
    } else if (playerClass === 'mage') {
        // Mage: Robed figure with staff
        ctx.fillStyle = '#3a1a3a';
        ctx.fillRect(x - 8, y - 6, 16, 14); // Robe
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y - 8, 4, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + 8, y - 10, 2, 12); // Staff
        ctx.beginPath();
        ctx.arc(x + 9, y - 12, 3, 0, Math.PI * 2); // Staff orb
        ctx.fill();
    } else if (playerClass === 'ranger') {
        // Ranger: Bow and arrow
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(x - 8, y - 4, 16, 12); // Body
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y - 6, 4, 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x - 6, y + 2, 8, 0.5, 2.6); // Bow
        ctx.stroke();
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x + 4, y, 6, 1); // Arrow
    } else {
        // Default: Simple circle
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnemies() {
    game.enemies.forEach(enemy => {
        const screenX = enemy.gridX * game.tileSize - game.camera.x;
        const screenY = enemy.gridY * game.tileSize - game.camera.y;
        
        if (screenX < -game.tileSize || screenX > canvasWidth + game.tileSize || 
            screenY < -game.tileSize || screenY > canvasHeight + game.tileSize) return;
        
        const centerX = screenX + game.tileSize / 2;
        const centerY = screenY + game.tileSize / 2;
        
        // Hit feedback - red tint when hit
        if (enemy.hitTimer > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, enemy.hitTimer / 200);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(screenX, screenY, game.tileSize, game.tileSize);
            ctx.globalAlpha = 1;
            ctx.restore();
        }
        
        // Enemy body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(centerX - 10, centerY - 8, 20, 16);
        
        // Enemy eyes
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(centerX - 6, centerY - 4, 4, 4);
        ctx.fillRect(centerX + 2, centerY - 4, 4, 4);
        
        // HP bar
        const barWidth = game.tileSize;
        const barHeight = 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX, screenY - 5, barWidth, barHeight);
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(screenX, screenY - 5, 
                     (enemy.hp / enemy.maxHp) * barWidth, barHeight);
        
        // Draw damage number if present
        if (enemy.damageNumber && enemy.damageNumberTimer > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, enemy.damageNumberTimer / 1000);
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const offsetY = -20 - (1000 - enemy.damageNumberTimer) / 10;
            ctx.fillText('-' + enemy.damageNumber, centerX, centerY + offsetY);
            ctx.restore();
        }
    });
}

function drawItems() {
    game.items.forEach(item => {
        const screenX = item.gridX * game.tileSize - game.camera.x;
        const screenY = item.gridY * game.tileSize - game.camera.y;
        
        if (screenX < -game.tileSize || screenX > canvasWidth + game.tileSize || 
            screenY < -game.tileSize || screenY > canvasHeight + game.tileSize) return;
        
        const centerX = screenX + game.tileSize / 2;
        const centerY = screenY + game.tileSize / 2;
        
        if (item.type.name === 'Key') {
            // Draw key icon
            ctx.fillStyle = item.type.color;
            ctx.fillRect(centerX - 6, centerY - 2, 8, 2);
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 1, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw other items as circles
            ctx.fillStyle = item.type.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

// Delta-time tracking for consistent game speed
let lastFrameTime = performance.now();

// Update functions - Grid-based movement
function updatePlayer(dt) {
    if (game.inCombat || game.player.hp <= 0) return;
    
    // Handle movement cooldown with delta-time
    if (game.player.moveCooldown > 0) {
        game.player.moveCooldown -= dt;
        return;
    }
    
    // Check for movement keys - only process if key is actually pressed
    const keyW = game.keys['w'] || game.keys['W'] || game.keys['ArrowUp'];
    const keyS = game.keys['s'] || game.keys['S'] || game.keys['ArrowDown'];
    const keyA = game.keys['a'] || game.keys['A'] || game.keys['ArrowLeft'];
    const keyD = game.keys['d'] || game.keys['D'] || game.keys['ArrowRight'];
    
    // If no movement keys are pressed, don't move
    if (!keyW && !keyS && !keyA && !keyD) {
        return;
    }
    
    let moved = false;
    let newGridX = game.player.gridX;
    let newGridY = game.player.gridY;
    
    // Cardinal direction movement (W=North, S=South, A=West, D=East)
    // Priority: vertical movement first, then horizontal
    if (keyW) {
        newGridY -= 1;
        moved = true;
    } else if (keyS) {
        newGridY += 1;
        moved = true;
    } else if (keyA) {
        newGridX -= 1;
        moved = true;
    } else if (keyD) {
        newGridX += 1;
        moved = true;
    }
    
    if (moved) {
        // Validate tile array exists and bounds are valid
        if (!game.tiles || !game.tiles[0] || !game.tiles[newGridY] || 
            newGridX < 0 || newGridX >= game.tiles[0].length || 
            newGridY < 0 || newGridY >= game.tiles.length) {
            // Invalid position - don't move
            game.player.moveCooldown = game.moveDelay;
            return;
        }
        
        const tile = game.tiles[newGridY][newGridX];
            
            // Check for walls
            if (tile === TILE_TYPES.WALL) {
                addLog('You cannot pass through the wall.');
                game.player.moveCooldown = game.moveDelay;
                return;
            }
            
            // Check for gates (tutorial)
            if (tile === TILE_TYPES.GATE) {
                // Check if tutorial is completed
                if (game.tutorial && !game.tutorial.completed) {
                    addLog('The gate is locked. Complete the tutorial first.');
                    game.player.moveCooldown = game.moveDelay;
                    return;
                }
                // If tutorial is completed, treat gate as floor and transition to main world
                if (game.tutorial && game.tutorial.completed) {
                    // Tutorial completed - transition to main world
                    transitionToMainWorld();
                    return;
                } else {
                    addLog('The gate is locked. Complete the tutorial first.');
                    game.player.moveCooldown = game.moveDelay;
                    return;
                }
            }
            
            // Check if player is trying to exit tutorial village through the gate area
            // Only check this if we're still in tutorial village (not already transitioned)
            if (!hasTransitioned && game.tutorial && game.tutorial.completed && !game.tutorial.active) {
                const villageSize = 20;
                // If moving east past the gate position
                if (newGridX >= villageSize - 1 && game.player.gridX < villageSize - 1) {
                    transitionToMainWorld();
                    return;
                }
            }
            
            // Check for doors
            if (tile === TILE_TYPES.DOOR) {
                const door = game.doors.find(d => d.x === newGridX && d.y === newGridY);
                if (door && door.locked && !door.opened) {
                    if (game.player.keys > 0) {
                        game.player.keys--;
                        door.opened = true;
                        door.locked = false;
                        addLog('You unlock the door with a key.');
                        updateUI();
                    } else {
                        addLog('The door is locked. You need a key.');
                        game.player.moveCooldown = game.moveDelay;
                        return;
                    }
                }
            }
            
            // Move player
            game.player.gridX = newGridX;
            game.player.gridY = newGridY;
            game.player.moveCooldown = game.moveDelay;
            updateCamera();
            
            // Check for interactions
            checkTileInteractions(newGridX, newGridY);
            
            // Check tutorial progress
            checkTutorialProgress();
        }
    }
    
    // Check for NPCs - allow adjacent interaction (within 1 tile)
    const spaceDown = game.keys[' '] || game.keys['Space'];
    if (spaceDown) {
        // First check if on same tile
        let npc = game.npcs.find(n => n.x === game.player.gridX && n.y === game.player.gridY);
        
        // If not on same tile, check adjacent tiles
        if (!npc) {
            npc = game.npcs.find(n => {
                const dx = Math.abs(n.x - game.player.gridX);
                const dy = Math.abs(n.y - game.player.gridY);
                return (dx === 1 && dy === 0) || (dx === 0 && dy === 1); // Adjacent horizontally or vertically
            });
        }
        
        if (npc) {
            talkToNPC(npc);
            // Clear space key to prevent repeated interactions
            game.keys[' '] = false;
            game.keys['Space'] = false;
        }
    }
}

// Update enemies - make them move toward player
function updateEnemies(dt) {
    if (game.inCombat) return;
    
    game.enemies.forEach((enemy, index) => {
        // Update movement cooldown with delta-time
        if (enemy.moveCooldown > 0) {
            enemy.moveCooldown -= dt;
            return;
        }
        
        // Calculate distance to player
        const dx = game.player.gridX - enemy.gridX;
        const dy = game.player.gridY - enemy.gridY;
        const distance = Math.abs(dx) + Math.abs(dy);
        
        // Only move if player is within range (not too close, not too far)
        if (distance > 0 && distance < 15) {
            let newX = enemy.gridX;
            let newY = enemy.gridY;
            
            // Move toward player (simple pathfinding)
            if (Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally
                newX += dx > 0 ? 1 : -1;
            } else {
                // Move vertically
                newY += dy > 0 ? 1 : -1;
            }
            
            // Check if new position is valid
            if (newX >= 0 && newX < game.tiles[0].length && 
                newY >= 0 && newY < game.tiles.length) {
                const tile = game.tiles[newY][newX];
                
                // Can move to floor tiles or open doors
                if (tile === TILE_TYPES.FLOOR || 
                    (tile === TILE_TYPES.DOOR && game.doors.find(d => d.x === newX && d.y === newY && d.opened))) {
                    // Check if another enemy is there
                    const enemyAtPos = game.enemies.find(e => e !== enemy && e.gridX === newX && e.gridY === newY);
                    if (!enemyAtPos) {
                        enemy.gridX = newX;
                        enemy.gridY = newY;
                        enemy.moveCooldown = enemy.moveDelay || 300;
                        
                        // Check if enemy reached player position
                        if (enemy.gridX === game.player.gridX && enemy.gridY === game.player.gridY && !game.inCombat) {
                            startCombat(enemy, index);
                        }
                    }
                }
            }
        }
    });
}

function checkTileInteractions(x, y) {
    const tile = game.tiles[y][x];
    
    if (tile === TILE_TYPES.CHEST) {
        openChest(x, y);
    } else if (tile === TILE_TYPES.SHOP) {
        if (game.keys[' '] || game.keys['Space']) {
            openShop();
        }
    }
    
    // Check for items on this tile
    game.items.forEach((item, index) => {
        if (item.gridX === x && item.gridY === y) {
            collectItem(item, index);
        }
    });
    
    // Check for enemies on this tile
    game.enemies.forEach((enemy, index) => {
        if (enemy.gridX === x && enemy.gridY === y && !game.inCombat) {
            startCombat(enemy, index);
        }
    });
}

function talkToNPC(npc) {
    const dialogueModal = document.getElementById('dialogueModal');
    const dialogueText = document.getElementById('dialogueText');
    
    // Handle wizard tutorial dialogue
    if (npc.isWizard && game.tutorial.active && !game.tutorial.completed) {
        handleWizardDialogue(npc);
        return;
    }
    
    const randomDialogue = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
    
    dialogueText.textContent = randomDialogue;
    document.querySelector('#dialogueModal h2').textContent = npc.name;
    dialogueModal.classList.remove('hidden');
}

function startTutorialDialogue() {
    const wizard = game.npcs.find(n => n.isWizard);
    if (wizard) {
        handleWizardDialogue(wizard);
    }
}

function handleWizardDialogue(wizard) {
    const dialogueModal = document.getElementById('dialogueModal');
    const dialogueText = document.getElementById('dialogueText');
    const currentStep = game.tutorial.steps[game.tutorial.currentStep];
    
    if (!currentStep) {
        dialogueText.textContent = 'You are ready to face the world! The gate is now open.';
        document.querySelector('#dialogueModal h2').textContent = wizard.name;
        dialogueModal.classList.remove('hidden');
        return;
    }
    
    dialogueText.textContent = currentStep.message;
    document.querySelector('#dialogueModal h2').textContent = wizard.name;
    dialogueModal.classList.remove('hidden');
    
    // Auto-advance certain steps
    if (currentStep.id === 'welcome') {
        setTimeout(() => {
            advanceTutorialStep();
        }, 3000);
    } else if (currentStep.id === 'ready') {
        // Final step - complete tutorial after showing message
        setTimeout(() => {
            advanceTutorialStep();
            completeTutorial();
        }, 2000);
    }
}

function advanceTutorialStep() {
    if (game.tutorial.currentStep < game.tutorial.steps.length) {
        const currentStep = game.tutorial.steps[game.tutorial.currentStep];
        currentStep.completed = true;
        game.tutorial.currentStep++;
        
        // Check if tutorial is complete
        if (game.tutorial.currentStep >= game.tutorial.steps.length) {
            completeTutorial();
        }
    }
}

// Track tutorial state
let tutorialItemCount = 1;  // Initial item count in tutorial
let tutorialPlayerMoved = false;

function checkTutorialProgress() {
    if (!game.tutorial.active || game.tutorial.completed) return;
    
    const currentStep = game.tutorial.steps[game.tutorial.currentStep];
    if (!currentStep) return;
    
    // Check step completion
    if (currentStep.id === 'movement') {
        // Check if player has moved away from starting position
        if ((game.player.gridX !== 10 || game.player.gridY !== 10) && !tutorialPlayerMoved) {
            tutorialPlayerMoved = true;
            advanceTutorialStep();
            addLog('Good! You can move around. Now let me tell you about combat...');
            setTimeout(() => {
                const wizard = game.npcs.find(n => n.isWizard);
                if (wizard) handleWizardDialogue(wizard);
            }, 2000);
        }
    } else if (currentStep.id === 'combat' && game.player.xp > 0) {
        // Player defeated an enemy
        advanceTutorialStep();
        addLog('Excellent! You defeated the training dummy. Now try collecting items...');
        setTimeout(() => {
            const wizard = game.npcs.find(n => n.isWizard);
            if (wizard) handleWizardDialogue(wizard);
        }, 2000);
    } else if (currentStep.id === 'items') {
        // Check if item count decreased (player collected it)
        if (game.items.length < tutorialItemCount) {
            tutorialItemCount = game.items.length;
            advanceTutorialStep();
            addLog('Well done! Items can be very useful. Now try opening that chest...');
            setTimeout(() => {
                const wizard = game.npcs.find(n => n.isWizard);
                if (wizard) handleWizardDialogue(wizard);
            }, 2000);
        }
    } else if (currentStep.id === 'chest') {
        // Check if chest was opened (tile changed to FLOOR)
        const chestX = 10;
        const chestY = 8;
        if (game.tiles[chestY] && game.tiles[chestY][chestX] === TILE_TYPES.FLOOR) {
            advanceTutorialStep();
            addLog('Perfect! You are learning quickly. One final word...');
            setTimeout(() => {
                const wizard = game.npcs.find(n => n.isWizard);
                if (wizard) {
                    handleWizardDialogue(wizard);
                } else {
                    // If wizard not found, complete tutorial anyway
                    completeTutorial();
                }
            }, 2000);
        }
    } else if (currentStep.id === 'ready') {
        // If player talks to wizard on ready step, complete tutorial
        // This is handled in handleWizardDialogue, but we can also auto-complete after a delay
        setTimeout(() => {
            if (game.tutorial.currentStep === game.tutorial.steps.length - 1) {
                const wizard = game.npcs.find(n => n.isWizard);
                if (wizard) handleWizardDialogue(wizard);
            }
        }, 1000);
    }
}

function completeTutorial() {
    // Prevent multiple completions
    if (game.tutorial.completed) return;
    
    game.tutorial.completed = true;
    game.tutorial.active = false;
    
    // Open the gate
    if (game.tutorialGate) {
        game.tutorialGate.opened = true;
        const gateX = game.tutorialGate.x;
        const gateY = game.tutorialGate.y;
        if (game.tiles[gateY] && game.tiles[gateY][gateX] === TILE_TYPES.GATE) {
            game.tiles[gateY][gateX] = TILE_TYPES.FLOOR;
            addLog('Master Aldric opens the gate. "The world beyond is dangerous, but you are ready."');
        }
    } else {
        // If gate object doesn't exist, try to find and open it
        const villageSize = 20;
        const gateX = villageSize - 1;
        const gateY = 10;
        if (game.tiles[gateY] && game.tiles[gateY][gateX] === TILE_TYPES.GATE) {
            game.tiles[gateY][gateX] = TILE_TYPES.FLOOR;
            addLog('Master Aldric opens the gate. "The world beyond is dangerous, but you are ready."');
        }
    }
    
    addLog('You can now pass through the gate to explore the wider world.');
}

// Track if transition has already happened
let hasTransitioned = false;

function transitionToMainWorld() {
    // Prevent multiple transitions
    if (hasTransitioned || !game.tutorial || !game.tutorial.completed || game.tutorial.active) {
        return;
    }
    
    hasTransitioned = true;
    
    addLog('You step through the gate into the wider world...');
    addLog('The dark realm stretches before you. Monsters roam freely here.');
    
    // Initialize main world
    initWorld();
    
    // Place player at a safe starting position in the main world (near left edge, middle)
    let startX = 2;
    let startY = 10;
    
    // Ensure starting position is clear and within bounds
    if (!game.tiles[startY] || game.tiles[startY][startX] !== TILE_TYPES.FLOOR) {
        // Find nearest floor tile
        let found = false;
        for (let y = 8; y < 15 && !found; y++) {
            for (let x = 1; x < 5 && !found; x++) {
                if (game.tiles[y] && game.tiles[y][x] === TILE_TYPES.FLOOR) {
                    startX = x;
                    startY = y;
                    found = true;
                }
            }
        }
    }
    
    // Only update position if we found a valid spot
    if (game.tiles[startY] && game.tiles[startY][startX] === TILE_TYPES.FLOOR) {
        game.player.gridX = startX;
        game.player.gridY = startY;
    }
    
    // Spawn enemies and items
    spawnEnemies();
    spawnItems();
    
    // Update camera smoothly
    updateCamera();
    
    // Mark tutorial as fully inactive
    game.tutorial.active = false;
}

function openChest(x, y) {
    const gold = 20 + Math.floor(Math.random() * 40);
    game.player.gold += gold;
    addLog(`Found ${gold} gold pieces in a weathered chest.`);
    
    // Sometimes find keys
    if (Math.random() > 0.6) {
        game.player.keys++;
        addLog('You found a key!');
    }
    
    game.tiles[y][x] = TILE_TYPES.FLOOR;
    updateUI();
    
    // Check tutorial progress
    checkTutorialProgress();
}

function openShop() {
    document.getElementById('shopModal').classList.remove('hidden');
    renderShop();
}

function renderShop() {
    const shopItems = [
        { name: 'Healing Salve', desc: 'Restores 40 HP', price: 30, effect: 'heal', value: 40 },
        { name: 'Iron Blade', desc: '+3 Attack', price: 120, effect: 'attack', value: 3 },
        { name: 'Leather Armor', desc: '+3 Defense', price: 100, effect: 'defense', value: 3 },
        { name: 'Experience Tome', desc: '+80 XP', price: 60, effect: 'xp', value: 80 }
    ];
    
    const shopDiv = document.getElementById('shopItems');
    shopDiv.innerHTML = '';
    
    shopItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.desc}</div>
            </div>
            <div>
                <span class="shop-item-price">${item.price} gold</span>
                <button class="buy-btn" ${game.player.gold < item.price ? 'disabled' : ''} 
                        onclick="buyItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    Buy
                </button>
            </div>
        `;
        shopDiv.appendChild(itemDiv);
    });
}

window.buyItem = function(item) {
    if (game.player.gold >= item.price) {
        game.player.gold -= item.price;
        addLog(`Purchased ${item.name} from the merchant.`);
        
        if (item.effect === 'heal') {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + item.value);
        } else if (item.effect === 'attack') {
            game.player.attack += item.value;
        } else if (item.effect === 'defense') {
            game.player.defense += item.value;
        } else if (item.effect === 'xp') {
            game.player.xp += item.value;
            checkLevelUp();
        }
        
        updateUI();
        renderShop();
    }
};

function collectItem(item, index) {
    addLog(`Collected ${item.type.name}.`);
    
    if (item.type.effect === 'heal') {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + item.type.value);
    } else if (item.type.effect === 'gold') {
        game.player.gold += item.type.value;
    } else if (item.type.effect === 'xp') {
        game.player.xp += item.type.value;
        checkLevelUp();
    } else if (item.type.effect === 'key') {
        game.player.keys += item.type.value;
    }
    
    game.items.splice(index, 1);
    updateUI();
}

function startCombat(enemy, index) {
    game.inCombat = true;
    game.currentEnemy = { enemy, index };
    document.getElementById('combatModal').classList.remove('hidden');
    updateCombatUI();
}

function updateCombatUI() {
    const enemy = game.currentEnemy.enemy;
    document.getElementById('combatInfo').innerHTML = `
        <p><strong>${game.player.name}</strong> - HP: ${game.player.hp}/${game.player.maxHp}</p>
        <p><strong>${enemy.typeName}</strong> - HP: ${enemy.hp}/${enemy.maxHp}</p>
        <p style="margin-top: 15px; color: #c9a961;">Choose your action.</p>
    `;
}

function attackEnemy() {
    const enemy = game.currentEnemy.enemy;
    const baseDamage = game.player.attack;
    const variance = Math.floor(Math.random() * 6) - 3;
    const playerDamage = Math.max(1, baseDamage - enemy.defense + variance);
    
    // Check for critical hit (5% chance)
    const isCrit = Math.random() < 0.05;
    const finalDamage = isCrit ? Math.floor(playerDamage * 1.5) : playerDamage;
    
    enemy.hp -= finalDamage;
    
    // Hit feedback
    enemy.hitTimer = 200;
    enemy.damageNumber = finalDamage;
    enemy.damageNumberTimer = 1000;
    
    // Screen shake on crit
    if (isCrit) {
        game.screenShake = 10;
        addLog(`Critical hit! You strike for ${finalDamage} damage!`);
    } else {
        addLog(`You strike for ${finalDamage} damage.`);
    }
    
    if (enemy.hp <= 0) {
        winCombat();
        return;
    }
    
    const enemyBaseDamage = enemy.attack;
    const enemyVariance = Math.floor(Math.random() * 6) - 3;
    const enemyDamage = Math.max(1, enemyBaseDamage - game.player.defense + enemyVariance);
    game.player.hp -= enemyDamage;
    
    // Player hit feedback
    game.player.hitTimer = 200;
    game.player.damageNumber = enemyDamage;
    game.player.damageNumberTimer = 1000;
    
    addLog(`The ${enemy.typeName} attacks for ${enemyDamage} damage.`);
    
    if (game.player.hp <= 0) {
        game.player.hp = 0;
        addLog(`You have been defeated.`);
        setTimeout(() => {
            game.player.hp = Math.floor(game.player.maxHp * 0.5);
            game.player.x = canvasWidth / 2;
            game.player.y = canvasHeight / 2;
            game.camera.x = game.player.x - canvasWidth / 2;
            game.camera.y = game.player.y - canvasHeight / 2;
            addLog(`You awaken, wounded but alive.`);
            endCombat();
        }, 2000);
        return;
    }
    
    updateCombatUI();
    updateUI();
}

function defend() {
    const enemy = game.currentEnemy.enemy;
    const defenseBonus = Math.floor(game.player.attributes.dex / 4) + 2;
    const enemyBaseDamage = enemy.attack;
    const enemyVariance = Math.floor(Math.random() * 6) - 3;
    const enemyDamage = Math.max(1, enemyBaseDamage - (game.player.defense + defenseBonus) + enemyVariance);
    game.player.hp -= enemyDamage;
    addLog(`You raise your guard. The ${enemy.typeName} deals ${enemyDamage} damage.`);
    
    if (game.player.hp <= 0) {
        game.player.hp = 0;
        addLog(`You have been defeated.`);
        setTimeout(() => {
            game.player.hp = Math.floor(game.player.maxHp * 0.5);
            game.player.x = canvasWidth / 2;
            game.player.y = canvasHeight / 2;
            game.camera.x = game.player.x - canvasWidth / 2;
            game.camera.y = game.player.y - canvasHeight / 2;
            addLog(`You awaken, wounded but alive.`);
            endCombat();
        }, 2000);
        return;
    }
    
    updateCombatUI();
    updateUI();
}

function flee() {
    const fleeChance = 0.4 + (game.player.attributes.dex / 50);
    const success = Math.random() < fleeChance;
    
    if (success) {
        addLog(`You successfully retreat from combat.`);
        endCombat();
    } else {
        const enemy = game.currentEnemy.enemy;
        const enemyBaseDamage = enemy.attack;
        const enemyVariance = Math.floor(Math.random() * 6) - 3;
        const enemyDamage = Math.max(1, enemyBaseDamage - game.player.defense + enemyVariance);
        game.player.hp -= enemyDamage;
        addLog(`Your escape fails. The ${enemy.typeName} strikes for ${enemyDamage} damage.`);
        
        if (game.player.hp <= 0) {
            game.player.hp = 0;
            addLog(`You have been defeated.`);
        setTimeout(() => {
            game.player.hp = Math.floor(game.player.maxHp * 0.5);
            game.player.x = canvasWidth / 2;
            game.player.y = canvasHeight / 2;
            game.camera.x = game.player.x - canvasWidth / 2;
            game.camera.y = game.player.y - canvasHeight / 2;
            addLog(`You awaken, wounded but alive.`);
            endCombat();
        }, 2000);
            return;
        }
        
        updateCombatUI();
        updateUI();
    }
}

function winCombat() {
    const enemy = game.currentEnemy.enemy;
    game.player.xp += enemy.xpReward;
    game.player.gold += enemy.goldReward;
    addLog(`Victory. Gained ${enemy.xpReward} experience and ${enemy.goldReward} gold.`);
    game.enemies.splice(game.currentEnemy.index, 1);
    checkLevelUp();
    updateUI();
    endCombat();
}

function endCombat() {
    game.inCombat = false;
    game.currentEnemy = null;
    document.getElementById('combatModal').classList.add('hidden');
    
    if (game.enemies.length < 5) {
        spawnEnemies();
    }
}

function checkLevelUp() {
    if (game.player.xp >= game.player.xpToNext) {
        game.player.level++;
        game.player.xp -= game.player.xpToNext;
        game.player.xpToNext = Math.floor(game.player.xpToNext * 1.4);
        game.player.maxHp += 15 + Math.floor(game.player.attributes.con / 2);
        game.player.hp = game.player.maxHp;
        game.player.attack += 2 + Math.floor(game.player.attributes.str / 4);
        game.player.defense += 1 + Math.floor(game.player.attributes.dex / 5);
        addLog(`You have reached level ${game.player.level}.`);
        updateUI();
    }
}

function addLog(message) {
    const logDiv = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function renderInventoryModal() {
    const content = document.getElementById('inventoryModalContent');
    if (game.player.inventory.length === 0) {
        content.innerHTML = '<p style="color: #888; text-align: center;">Your inventory is empty.</p>';
    } else {
        content.innerHTML = game.player.inventory.map((item, index) => 
            `<div class="inventory-item" style="margin-bottom: 10px; padding: 10px; background: rgba(139, 69, 19, 0.2); border: 1px solid #8b4513; border-radius: 3px;">
                <strong>${item.name}</strong> - ${item.desc || ''}
            </div>`
        ).join('');
    }
}

function updateUI() {
    document.getElementById('hpText').textContent = `${game.player.hp}/${game.player.maxHp}`;
    document.getElementById('hpBar').style.width = `${(game.player.hp / game.player.maxHp) * 100}%`;
    document.getElementById('xpText').textContent = `${game.player.xp}/${game.player.xpToNext}`;
    document.getElementById('xpBar').style.width = `${(game.player.xp / game.player.xpToNext) * 100}%`;
    document.getElementById('level').textContent = game.player.level;
    document.getElementById('gold').textContent = game.player.gold;
    
    // Update inventory display with keys
    const invDiv = document.getElementById('inventory');
    let invHTML = '';
    if (game.player.keys > 0) {
        invHTML += `<div class="inventory-item">Keys: ${game.player.keys}</div>`;
    }
    if (game.player.inventory.length === 0 && game.player.keys === 0) {
        invHTML = '<div class="inventory-item" style="opacity: 0.5;">Empty</div>';
    } else {
        invHTML += game.player.inventory.map(item => 
            `<div class="inventory-item">${item.name}</div>`
        ).join('');
    }
    invDiv.innerHTML = invHTML;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    // Prevent default for movement keys to avoid scrolling
    if (['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    game.keys[e.key] = true;
    if (e.key === 'e' || e.key === 'E') {
        if (!game.inCombat) {
            const modal = document.getElementById('inventoryModal');
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                renderInventoryModal();
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

// Clear all keys when window loses focus (prevents stuck keys)
window.addEventListener('blur', () => {
    game.keys = {};
});

// Clear all keys when window regains focus (safety measure)
window.addEventListener('focus', () => {
    game.keys = {};
});

// Also clear keys on visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.keys = {};
    }
});

document.getElementById('attackBtn').addEventListener('click', attackEnemy);
document.getElementById('defendBtn').addEventListener('click', defend);
document.getElementById('fleeBtn').addEventListener('click', flee);
document.getElementById('closeShop').addEventListener('click', () => {
    document.getElementById('shopModal').classList.add('hidden');
});
document.getElementById('closeInventory').addEventListener('click', () => {
    document.getElementById('inventoryModal').classList.add('hidden');
});
document.getElementById('closeDialogue').addEventListener('click', () => {
    document.getElementById('dialogueModal').classList.add('hidden');
});

// Game loop with delta-time
function gameLoop(now = performance.now()) {
    const dt = Math.min(50, now - lastFrameTime); // Clamp to max 50ms to prevent large jumps
    lastFrameTime = now;
    
    // Update hit timers
    if (game.player.hitTimer > 0) {
        game.player.hitTimer -= dt;
    }
    if (game.player.damageNumberTimer > 0) {
        game.player.damageNumberTimer -= dt;
    }
    game.enemies.forEach(enemy => {
        if (enemy.hitTimer > 0) {
            enemy.hitTimer -= dt;
        }
        if (enemy.damageNumberTimer > 0) {
            enemy.damageNumberTimer -= dt;
        }
    });
    
    // Update screen shake
    if (game.screenShake > 0) {
        game.screenShake -= dt * 2;
        if (game.screenShake < 0) game.screenShake = 0;
    }
    
    // Apply screen shake offset
    const shakeX = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;
    const shakeY = game.screenShake > 0 ? (Math.random() - 0.5) * game.screenShake : 0;
    
    // Only draw and update if game is active (character creation is hidden)
    const charCreation = document.getElementById('charCreation');
    const isGameActive = charCreation && charCreation.classList.contains('hidden');
    
    if (isGameActive) {
        ctx.save();
        ctx.translate(shakeX, shakeY);
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        drawWorld();
        drawDoors();
        drawItems();
        drawNPCs();
        drawEnemies();
        drawPlayer();
        
        ctx.restore();
        
        // Draw player damage number
        if (game.player.damageNumber && game.player.damageNumberTimer > 0) {
            const screenX = game.player.gridX * game.tileSize - game.camera.x;
            const screenY = game.player.gridY * game.tileSize - game.camera.y;
            const centerX = screenX + game.tileSize / 2;
            const centerY = screenY + game.tileSize / 2;
            
            ctx.save();
            ctx.globalAlpha = Math.min(1, game.player.damageNumberTimer / 1000);
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const offsetY = -20 - (1000 - game.player.damageNumberTimer) / 10;
            ctx.fillText('-' + game.player.damageNumber, centerX + shakeX, centerY + offsetY + shakeY);
            ctx.restore();
        }
        
        updatePlayer(dt);
        updateEnemies(dt);
    } else {
        // Clear canvas when character creation is visible
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    
    requestAnimationFrame(gameLoop);
}

// Window resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
    }, 100);
});

// Initialize when DOM is ready
function initializeGame() {
    resizeCanvas(); // Initial resize
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
        initCharacterCreation();
    }, 50);
    gameLoop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeGame();
    });
} else {
    // DOM is already loaded
    initializeGame();
}
