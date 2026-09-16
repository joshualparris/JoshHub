# Podcast rollout and live deployment audit

_Last updated: 15 September 2026_

This document consolidates the podcast-dock rollout, mobile QA findings, deployment failures, fixes, and conventions discussed across the related ChatGPT development threads. JoshHub is the source of truth for the shared dock implementation and catalogue; individual app repos remain responsible for their own integration and deployment health.

## UX standard

- Podcast docks are **OFF by default**.
- Users can enable them from an app's **Settings/Preferences** UI.
- The dock has a visible **×** that persistently disables it and unloads the Spotify iframe.
- The setting persists locally per app/topic.
- Spotify playback must never be assumed to autoplay.
- The dock must collapse/hide around competing app audio, narration/TTS, or focused text-entry where appropriate.
- App content and controls remain primary; the dock must not cover essential mobile UI.
- `/play` or other immersive routes may deliberately omit the dock.

## QA rule learned from the rollout

A URL returning HTTP 200 or a deployment showing green is **not enough**. A release is only considered usable after checking that the actual app renders, its compiled assets load, the relevant route works, the podcast integration is present where intended, and the mobile layout is not obscured.

The UpskillApp incident made this explicit: GitHub Pages served the repository's Vite source `index.html` directly, so the shared podcast script rendered while the React application stayed blank because `/src/main.tsx` had never been compiled for Pages.

## Deployment audit findings

| App / repo | Finding | Action / current state |
|---|---|---|
| `joshualparris/JoshHub` | Master shared podcast implementation. | Source of truth. Opt-in/off-by-default behaviour, settings integration, close button, route filtering, persistence and regression tests are on `main`. |
| `joshualparris/UpskillApp` | **Was blank on GitHub Pages** even though the podcast dock rendered. Vite source was being served without a Pages build. | Added a proper Vite -> GitHub Pages build/deploy workflow; rebuilt Pages successfully. |
| Campaign Copilot | Existing Pages workflow was broken/deprecated. | Workflow repaired and a successful Pages deployment completed during the audit. |
| Whirring Wilderness | Needed a clean rebuilt Pages deployment. | Rebuilt successfully during the audit. |
| `joshuaparris-max/realms-atlas` | Pages checkout failed because two unused malformed gitlinks (`OS-clone` and `fable`) had no matching `.gitmodules` URLs. | Removed both broken gitlinks from `main`; the next Pages deployment completed successfully. |
| Nebula Dice | App build completed, but the final GitHub Pages deployment step was rejected. | Still requires hosting/deployment-side repair; do not label it working merely because the build succeeds. |
| `joshuaparris-max/CanonRPG` | Latest Vercel status observed during the audit was failing. | Keep marked as deployment-failing until a fresh successful production deploy is verified. |
| `joshuaparris-max/DCSCompanion` | Latest checked Pages workflow completed successfully. | Working deployment pipeline at last check. |
| `joshualparris/FaithHub` | Latest checked Pages workflow completed successfully. | Working deployment pipeline at last check. |
| `joshuaparris-max/Waypoint` | Latest checked Pages workflow completed successfully. | Working deployment pipeline at last check. |
| `joshuaparris-max/Midnight-Line` | Latest checked Pages workflow completed successfully. | Working deployment pipeline at last check. |
| `joshuaparris-max/DCSProfessionalDevelopment` | Latest checked Vercel status for the podcast-dock update was successful. | Deployment healthy at last check. |
| `joshuaparris-max/JoshBooksOnline` | Latest checked Vercel status for the books podcast dock was successful. | Deployment healthy at last check. |
| `parristechservices-prog/AIDungeonMaster` | Latest checked Vercel status for the D&D dock implementation was successful. | Dock intentionally stays out of live `/play`. |
| `joshuaparris-max/FieldNotes` | Latest checked Vercel status for the IT troubleshooting dock update was successful. | Deployment healthy at last check. |
| `joshuaparris-max/lifehubdashboard` | Latest checked Vercel status was successful after the mobile-nav repair. | Mobile navigation and shared dock/settings integration are on `main`. |
| JoshPlatform | Earlier rollout list incorrectly implied implementation. | Its `podcasttodo.md` remained unchecked at the time of audit; do not list it as implemented until code and deployment both exist. |
| AppFactory | Live app itself loaded, but the inspected live deployment did **not** contain the podcast dock. | Treat as `not deployed` for this feature until the integration is present in production. |

## Live test targets

These are the stable test targets confirmed or deliberately used during the rollout:

- UpskillApp: <https://joshualparris.github.io/UpskillApp/>
- FaithHub: <https://joshualparris.github.io/FaithHub/>
- JoshHub production: <https://josh-hub-joshualparris-projects.vercel.app/>
- 3layers: <https://3layers.vercel.app/>
- Sword Coast: <https://sword-coast.vercel.app/>
- Eleven Realms: <https://realms.vercel.app/>
- DCS Prep: <https://dcs-prep.vercel.app/>

Where a repo uses another Pages owner or a non-obvious Vercel alias, use the deployment linked from that repo/CI rather than guessing a URL.

## Podcast-bank patterns already in use

- `career`: UpskillApp and career-learning surfaces.
- `it`: DCS/MSP/support learning and troubleshooting surfaces.
- `books`: JoshBooksOnline.
- `dnd`: AI Dungeon Master, 3layers/Epic Quest Saga, Sword Coast and related RPG/worldbuilding apps.
- `faith`: FaithHub and faith-learning surfaces.
- `horses`: JoshHorses / horse-therapy resources.
- Other shared banks in JoshHub include software, research, relationships, decision and homelab.

## Release checklist for every app

1. Confirm the repo actually contains the intended dock integration and the relevant `podcasttodo.md` is truthful.
2. Build the app using the production build command rather than serving Vite/React source directly.
3. Confirm CI/deployment completed successfully.
4. Open the **real production URL** and verify meaningful app content renders, not just the podcast dock or an empty root element.
5. Verify compiled JS/CSS assets resolve successfully.
6. On mobile, confirm the dock does not cover navigation, primary actions, game controls, forms, or bottom bars.
7. Confirm default state is OFF, Settings can enable it, × disables it, and the preference persists after reload.
8. Verify Spotify/deep-link behaviour without assuming autoplay.
9. For audio-heavy or immersive routes, verify the dock collapses or is absent as intended.
10. Only then mark the app as **working** in rollout documentation.

## Source-of-truth files

- `public/podcast-dock.js`
- `public/podcast-dock-universal.js`
- `public/podcasts/*.json`
- `scripts/test-podcast-dock.mjs`
- `podcasttodo.md`

This audit intentionally records technical rollout information only. It does not copy private conversation content or private account data into the public repository.