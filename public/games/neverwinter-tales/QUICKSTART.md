# 🚀 QUICK START GUIDE

## The Problem You're Seeing

Those CORS errors happen because web browsers block JavaScript modules from loading via `file://` protocol for security reasons. **This is normal and expected.**

## The Solution (Pick One)

### ✅ EASIEST: Double-click the batch file (Windows)

1. Double-click `start-server.bat`
2. A command window opens
3. Open your browser to: http://localhost:8000
4. **Done!** The game will now work perfectly.

### ✅ ALTERNATIVE: VSCode Live Server

1. Open the `neverwinterGame` folder in VSCode
2. Install "Live Server" extension (if you don't have it)
3. Right-click `index.html` → "Open with Live Server"
4. Game opens automatically in your browser

### ✅ MANUAL: Python Command

Open terminal/command prompt in the game folder:

```bash
python -m http.server 8000
```

Then browse to: http://localhost:8000

---

## Why the Text Was Unreadable

The text colors are actually **perfect** - light text on dark backgrounds. But because the JavaScript wasn't loading (due to CORS), the page appeared broken.

Once you run from a server, you'll see:
- ✨ Amber and gray text on dark slate backgrounds
- 🎨 Color-coded game messages (blue for info, red for combat, etc.)
- 📜 Beautiful fantasy fonts (Cinzel and IM Fell English)

---

## What to Do Next

1. **Start the server** (using any method above)
2. **Type "look"** to see your starting location
3. **Click NPCs** in the sidebar to talk to them
4. **Try the dialogue trees** - some have skill checks!

---

## First Commands to Try

```
look
talk rosene
choose 1
move protectors-enclave
talk gundren
inventory
```

**Enjoy the game!** 🐉
