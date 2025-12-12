JoshHub Improvement Tracker
=================================
Purpose: single source of truth for all JoshHub improvements (app catalogue, games, dashboards), including QA findings, backlog, and verification steps.

How to Use This Tracker
-----------------------
- Treat this doc as the canonical backlog; new findings are appended here and mirrored to tasks with IDs.
- When you fix something, update the status column and move a short note to the Changelog.
- Before deploy: run the QA + Release Checklist; after deploy: verify on Vercel using /version.

Current Status Snapshot
-----------------------
- Build: `npm run lint` ✅ (warnings only); `npm run build` ❌ on WSL (Bus error/core dumped). Vercel build status unknown for latest commit.
- Link audit: `npm run ensure:placeholders && npm run audit:links` ✅ locally (no missing internal assets).
- Known production 404s (reported):
  - /games/amodule-dnd/index.html
  - /games/dnd-spider-queen/index.html
  - /games/midnight-line/index.html
  - /games/null-v2/index.html
  - /games/wilds-sail-west/index.html
  - /games/wilds-main/index.html
  - /games/wilds-2/index.html
- Verified on Vercel: unknown (check /version after next deploy). Local placeholders generated for all catalogue links.
- Data source of truth: `src/data/apps.ts`.

Global Issues (applies to most games/apps)
------------------------------------------
- Missing onboarding/instructions; unclear goals.
- No persistent back-to-hub navigation.
- Broken links or missing subroutes/assets.
- Inconsistent naming/versioning; no version indicator.
- Low contrast/readability in dark mode; minimal styling.
- Lack of responsiveness on small screens.
- No save/load or persistence in many games.

Completed Work Log (Changelog)
-------------------------------
- ✅ Link audit script (`scripts/audit-links.ts`) with reports.
- ✅ Placeholder generator (`scripts/ensure-placeholders.ts`) + `prebuild` hook to prevent /games or /docs 404s.
- ✅ `public/build-info.json` creation and `/version` page to show commit/build time.
- ✅ TMPDIR set for audits; build uses `NODE_OPTIONS=--max-old-space-size=4096`.
- ⏳ Vercel verification of placeholders/links pending next deploy.
- ⚠️ Local `npm run build` still fails (Bus error/core dumped) on WSL; rerun after clean install.

Backlog (Prioritised)
---------------------
- P0 (must-fix)
  - JH-P0-001: Confirm Vercel deploy uses latest commit; ensure `/version` shows new build-info.
  - JH-P0-002: Eliminate production 404s for all `/games/*` and `/docs/*` in catalogue; verify via `npm run audit:links` and live URLs.
  - JH-P0-003: Persist /apps search/category/status filters across theme toggle and reload.
  - JH-P0-004: Fix /projects so it is not the /apps catalogue (real placeholder or redirect).
- P1 (high)
  - JH-P1-005: Improve dark-mode contrast for search inputs, dropdowns, tag chips on /apps.
  - JH-P1-006: Highlight search terms in app names/tags/notes; add tooltip on clamped notes.
  - JH-P1-007: Add back-to-hub/onboarding snippets across games; standardise fonts/spacing.
  - JH-P1-008: Add smoke tests (Playwright) for /apps filtering/pinning/theme persistence and one local game link.
- P2 (nice)
  - JH-P2-009: Improve dashboard Life Focus cards (bg-card + border + icon).
  - JH-P2-010: Add improvements summary script to count P0/P1 and list known 404s.

Per-App / Per-Game Improvements
-------------------------------
Each table: Task | Priority | Effort | Status.

AA Game Adventure
- Links: /games/aa-game-adventure/index.html; Docs in /docs.
- Issues: no onboarding; plain grid; no legend; no back link.
- Suggested: add header, instructions, legend, back link; optional score/win condition.
- Tasks:
  - AA-P1-001 | P1 | S | Not Started | Add title/controls/legend/back link; responsive layout.
  - AA-P2-002 | P2 | M | Not Started | Add scoring/goal + simple save in localStorage.
- Acceptance: On load shows title + instructions + legend + back link; movement works; layout responsive.
- Risks: don’t break existing movement logic.

D&D RPG Dungeon (Python browser port)
- Link: /games/dnd-rpg-dungeon/index.html.
- Issues: no intro/tooltips; start works without validation; no back link.
- Tasks:
  - DD-P1-001 | P1 | S | Not Started | Add intro text, tooltips, disable start until name set, back link.
  - DD-P2-002 | P2 | M | Not Started | Add progress bar/audio + responsive panels.
- Acceptance: Name required; tooltips visible; back link; layout usable on mobile.

Forbidden Lands Lite (Forbidden Quests client)
- Link: under /games/forbidden-quests/ (subroutes).
- Issues: campaign create disabled; tabs empty; contrast low; no back link.
- Tasks:
  - FL-P0-001 | P0 | M | Not Started | Ensure subroutes/pages exist (no 404); add placeholder content per tab; back link.
  - FL-P1-002 | P1 | M | Not Started | Enable local campaign create (localStorage) + explanations per tab.
- Acceptance: No 404s; users can create/select campaigns locally; readable tabs; back link.

OrgScape: The Infinite Office
- Links: /games/orgscape/index.html and GH mirror.
- Issues: tiny map; no header/context/commands; no back link.
- Tasks:
  - ORG-P1-001 | P1 | S | Not Started | Add header/description/command list/back link; enlarge map; center layout.
  - ORG-P2-002 | P2 | M | Not Started | Add save/load + visited-room highlighting.
- Acceptance: Title + instructions visible; map/legend readable; back navigation present.

Max Games – Starhaven
- Link: /games/max/index.html (Starhaven tab) + landing page.
- Issues: in-game UI lacks story/commands; input small; no timer/back link.
- Tasks:
  - MAX-P1-001 | P1 | S | Not Started | Inject story + win/lose conditions + command list; enlarge input; add back link.
  - MAX-P2-002 | P2 | M | Not Started | Add timer + clue log; align theme with landing page.
- Acceptance: Starhaven tab shows narrative/commands; back link; timer visible; no console errors.

Max Games – Guess the Number
- Link: /games/max/index.html (Guess tab).
- Issues: minimal UI; no feedback/score/back link.
- Tasks:
  - MGN-P1-001 | P1 | S | Not Started | Add instructions/range, feedback after guess, attempt counter, back link.
- Acceptance: Input focused on load; feedback + attempts shown; back link.

Mysterious Depths (GH)
- Link: https://joshuaparrisdadlan-stack.github.io/MysteriousDepths/.
- Issues: needs back link; accessibility/keyboard nav not confirmed.
- Tasks:
  - MD-P2-001 | P2 | S | Not Started | Add back link + keyboard focus checks; optional hint text.
- Acceptance: Visible back link; choices focusable via keyboard.

New Game (Character Creation)
- Link: /games/newgame/index.html.
- Issues: no validation/tooltips; no back link; responsiveness unknown.
- Tasks:
  - NG-P1-001 | P1 | S | Not Started | Require name/class; update points counters; add tooltips; back link.
  - NG-P2-002 | P2 | M | Not Started | Persist character data; show next sections with placeholders.
- Acceptance: Start disabled until valid; tooltips present; back link; points adjust correctly.

Null – Rope & Silence (GH)
- Link: https://joshuaparrisdadlan-stack.github.io/Null/.
- Issues: contrast; no back link; no save/load; hints absent.
- Tasks:
  - NULL-P1-001 | P1 | S | Not Started | Improve contrast; add back link; add short premise text.
  - NULL-P2-002 | P2 | M | Not Started | Add save/load + optional hints.
- Acceptance: Text readable; back link; progress can resume.

Null – Rope & Silence (itch)
- Link: https://joshualparris.itch.io/null-html-game.
- Issues: same as GH; itch frame reduces width; needs back link in description.
- Tasks:
  - NULLI-P1-001 | P1 | S | Not Started | Update itch page description with back link + summary; upload improved build if GH updated.
- Acceptance: Itch page shows back link/summary; build parity with GH.

Wastes Courier Roguelike
- Link: https://joshualparris.github.io/wastes-courier-roguelike/ and /games/wastes-courier/ (placeholder optional).
- Issues: stub options; no back link.
- Tasks:
  - WCR-P1-001 | P1 | S | Not Started | Add buttons for Start/Museum, instructions, back link.
  - WCR-P2-002 | P2 | M | Not Started | Implement minimal grid run + museum placeholder.
- Acceptance: Buttons work; instructions visible; no 404s; back link exists.

Tile Game
- Link: /games/tile-game/index.html.
- Issues: blank/likely missing assets; no instructions/back link.
- Tasks:
  - TILE-P0-001 | P0 | S | Not Started | Fix asset/bundle paths; ensure grid renders; add instructions/back link.
  - TILE-P2-002 | P2 | M | Not Started | Add basic tile level + keyboard/on-screen controls.
- Acceptance: Start shows grid; controls work; back link present; no console 404s.

Other Cross-Portfolio Tasks
- JH-P1-011: Improve dark-mode contrast for search inputs/dropdowns/tag chips on /apps.
- JH-P1-012: Implement search term highlighting + tooltip on clamped notes.
- JH-P2-013: Add Life Focus card styling (bg-card/border + icons) on dashboard.

Sprint Plan
-----------
- Sprint 0: Fix production 404s with ensure-placeholders + audit; add back links/onboarding to easiest games (AA, Max, OrgScape, Classic D&D, Tile Game); confirm /projects not /apps.
- Sprint 1: Dark-mode polish + search highlighting + filter persistence; responsiveness for key games; contrast fixes; tooltips.
- Sprint 2: Gameplay improvements (save/load, timers, basic roguelike/tile grid), Twine/itch parity, add smoke tests.

QA + Release Checklist
----------------------
- Local: `npm run ensure:placeholders`, `npm run audit:links`, `npm run lint`, `npm run build` (retry if bus error; try clean install).
- Smoke: /apps load; filter + pin; theme toggle retains state; one local game link returns 200; /version shows current commit/build time.
- Vercel: open /version and verify commit + placeholders list; spot-check known 404 URLs.
- Post-deploy: run `npm run audit:links` against deployed assets if possible; update Changelog.

Appendix
--------
- QA review notes (highlights): missing onboarding/back links; low contrast; broken links; lack of navigation; inconsistent naming; no version indicator; easiest wins: instructions + back link + contrast + controls legend + standard fonts/spacing.
- Ranking summaries: best looking (Mysterious Depths/New Game) → least (AA/Max/Tile); most functional (D&D RPG, OrgScape) → least (Tile); easiest to improve (Tile, AA, Max) → hardest (Forbidden Lands Lite, Twine/itch rebuilds).
- Known production 404 URLs (reported): /games/amodule-dnd/index.html, /games/dnd-spider-queen/index.html, /games/midnight-line/index.html, /games/null-v2/index.html, /games/wilds-sail-west/index.html, /games/wilds-main/index.html, /games/wilds-2/index.html.
