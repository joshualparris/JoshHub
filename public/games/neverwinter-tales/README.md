# Neverwinter — Tales of the North

A D&D 5e-inspired text adventure game built with Vue 3 and Tailwind CSS.

## 🎲 Quick Start

**IMPORTANT:** This game uses ES modules and **must** be run from a local web server. Opening `index.html` directly in your browser will cause CORS errors.

### Option 1: Python (Easiest - No Installation Needed)

```bash
cd neverwinterGame
python -m http.server 8000
```

Then open your browser to: **http://localhost:8000**

### Option 2: VSCode Live Server (Recommended for Development)

1. Install the "Live Server" extension in VSCode
2. Right-click `index.html` → "Open with Live Server"
3. Game opens automatically in your browser

### Option 3: Node.js

```bash
npx serve
```

Then follow the URL shown in terminal (usually http://localhost:3000)

---

## 🎮 How to Play

### Commands

Type commands in the input box at the bottom:

- `look` - Examine your current location
- `move [location]` - Travel to a new area (e.g., "move blacklake")
- `talk [npc]` - Start a conversation with an NPC (e.g., "talk rosene")
- `choose [number]` - Select a dialogue option (e.g., "choose 1")
- `inventory` - View your items
- `help` - Show available commands

### UI Features

- **Travel Buttons**: Click location names in the sidebar to move
- **NPC Buttons**: Click NPC names to start conversations
- **Dialogue Buttons**: Click response options during conversations
- **Character Sheet**: View your stats, HP, AC, and inventory

---

## 🗺️ Locations

- **The Beached Leviathan** - A grounded ship turned tavern
- **Protector's Enclave** - The bustling city center
- **Blacklake District** - Noble quarter by the misty lake
- **The Chasm** - A dangerous rift in the city
- **Castle Never** - Stronghold of the Open Lord

---

## 🧙 NPCs

- **Madame Rosene** (Beached Leviathan) - Fortune teller with mysterious warnings
- **Gundren Rockseeker** (Protector's Enclave) - Dwarf prospector with a quest
- **Dagult Neverember** (Castle Never) - The Open Lord himself

---

## 🛠️ Troubleshooting

### "CORS policy" errors in console

**Problem:** Opening `index.html` directly via `file://` protocol  
**Solution:** Use one of the server options above (Python is fastest)

### Black text on dark background / Can't read text

**Problem:** Game isn't loading due to CORS errors  
**Solution:** Once you run a local server, all colors will display correctly

### Game doesn't respond to commands

**Check:**
1. Are you running from a local server?
2. Open browser console (F12) - any red errors?
3. Try refreshing the page

---

## 📁 Project Structure

```
neverwinterGame/
├── index.html          # Main game UI
├── game.js             # Vue app & game logic
├── data/
│   ├── npcs.js         # NPC definitions & dialogue trees
│   ├── locations.js    # Location descriptions
│   ├── lore.js         # Neverwinter history
│   ├── dice.js         # D&D dice rolling functions
│   └── quests.js       # Quest data
└── README.md           # This file
```

---

## 🎨 Features

✅ **D&D 5e Mechanics**: Skill checks, ability scores, AC calculation  
✅ **Rich Dialogue Trees**: Branching conversations with skill checks  
✅ **Atmospheric UI**: Dark fantasy theme with custom fonts  
✅ **Interactive NPCs**: Multiple characters with unique personalities  
✅ **Exploration**: Navigate Neverwinter's iconic locations  

---

## 🚀 Development

Built with:
- Vue 3 (CDN)
- Tailwind CSS (CDN)
- ES Modules
- D&D 5e ruleset

No build tools required - pure HTML/JS/CSS!

---

**Enjoy your adventure in Neverwinter!** 🐉
