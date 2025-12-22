# NFC Audio Player — Browser Yoto

This project is a Progressive Web App (PWA) that turns any compatible Android phone (Chrome on Android with Web NFC) into a Yoto-like NFC audio player without installing a native app.

Features:
- PWA installable (Add to Home Screen)
- Works offline after first load (service worker + IndexedDB)
- Read and write NFC cards via Web NFC API (NDEF text records)
- Upload audio tracks from phone, create cards (playlists), store everything in IndexedDB
- Kid-friendly playback UI with large controls

How to use (quick):
1. Host the folder on a simple HTTP server (Android Chrome blocks many features on file://). Example using Python:

```powershell
# from project folder
python -m http.server 8000
``` 

2. Open `http://<your-pc-or-phone-ip>:8000` in Chrome on your Android phone (or open directly on the device if you host there).
3. Tap the menu and choose "Add to Home screen" to install PWA.
4. Upload audio files using the upload area.
5. Create a card (playlist), add tracks to it.
6. Use "Write to Card" and tap your blank NTAG213/215 card to write the card ID as an NDEF text record.
7. When a programmed card is tapped, the app will automatically play that playlist from track 1.

Notes & Limitations:
- Web NFC is only available in Chromium-based browsers on Android (Chrome 89+). If the browser does not support it, the app will show messages.
- For maximum offline storage, allow storage persistence if the browser prompts.
- The manifest references `icons/` which you may add images to (192x192 and 512x512 PNGs) for proper home-screen icons.

iPhone and deep-links
---------------------
- iPhone Safari cannot run Web NFC in the browser. To support iPhone users, NFC tags should store an HTTPS URL that links back to this app with the card id, for example `https://<user>.github.io/<repo>/#card=<id>`.
- Tapping such a URL tag on iPhone will open Safari to the deep-link. The app will then load the playlist and attempt autoplay. If autoplay is blocked, the page shows a single large Play button for the user to tap.
- This repo now writes URL records by default to maximize cross-device compatibility. Android still supports Web NFC scanning when the page is open and scanning is started.

Files:
- `index.html` — main UI
- `styles.css` — styling
- `app.js` — application logic (NFC, playback, UI)
- `db.js` — IndexedDB helper
- `sw.js` — service worker
- `manifest.json` — PWA manifest

Want me to:
- Add icon PNGs into `/icons` and a nicer default cover image? (I can generate simple SVG icons.)
- Improve track-to-card assignment UI (drag/drop)?
- Add export/import buttons in UI? (Currently available via `DB.exportAll()` in console.)

Quick GitHub Pages deploy
-------------------------
1. Create a repository on GitHub and push this project (or use the repo you already created).
2. Ensure the repo is Public (Pages from `gh-pages` works automatically for public repos).
3. To publish immediately from the `gh-pages` branch, run locally (PowerShell):

```powershell
git checkout main
git push -u origin main
git checkout -b gh-pages main
git push -u origin gh-pages --force
git checkout main
```

4. The site will be available at `https://joshualparris.github.io/JoshNFCAudio/` (may take a minute).

Notes about Web NFC and testing
--------------------------------
- Web NFC works in Chrome/Chromium on Android and requires HTTPS (or localhost). GitHub Pages provides HTTPS.
-- Use the in-app "Write to Card" flow to write a URL record that links back to the app by default. The app writes a URL of the form:

```
https://joshualparris.github.io/JoshNFCAudio/?card=<card-id>
```

When a user taps the card on iPhone or Android, the phone opens that URL in the browser. The page will load the matching card from IndexedDB and show a large Play button so the user can start playback with a single tap. If the card isn't present on that phone, the app shows a message explaining how to import tracks.
- Blank NTAG21x tags will show as "Blank card — no NDEF records" in the UI; use Write mode to program them.

If you want me to push and publish this repo for you again or change Pages settings, tell me and I can run the necessary git commands from this workspace.
