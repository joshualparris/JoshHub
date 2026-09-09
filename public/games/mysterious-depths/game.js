const storyEl = document.getElementById('story');
const choicesEl = document.getElementById('choices');

const gameState = {
    clues: [],
    location: 'dark',
    step: 0
};

// STORY DATA
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

// RENDERING
function render() {
    const curr = storyNodes[gameState.step];
    storyEl.textContent = curr.text + (gameState.clues.length > 0 && gameState.step < 10
        ? "\n\nClues found: " + gameState.clues.join(', ')
        : '');
    choicesEl.innerHTML = '';
    curr.choices.forEach((choice, i) => {
        const requires = choice.requires || [];
        const allowed = requires.every(r => gameState.clues.includes(r));
        const btn = document.createElement('button');
        btn.className = 'choice-btn' + (allowed ? '' : ' locked');
        const num = document.createElement('span'); num.className = 'choice-num'; num.textContent = String(i+1);
        btn.appendChild(num);
        const label = document.createElement('span'); label.textContent = ' ' + choice.text;
        btn.appendChild(label);
        btn.onclick = () => { if (allowed) makeChoice(choice); };
        if (!allowed) {
            btn.title = 'Requires: ' + requires.join(', ');
            btn.disabled = true;
        }
        choicesEl.appendChild(btn);
    });
}

function makeChoice(choice) {
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
        gameState.location = 'dark';
    }
    gameState.step = choice.nextStep;
    render();
}

// START GAME
render();