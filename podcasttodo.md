# Podcast Integration TODO

**Decision:** Add — highest priority / master implementation.  
**Role:** JoshHub is the source of truth for the reusable Josh Podcast Dock and the cross-app topic catalogue.  
**Current UX standard (13 September 2026):** the podcast dock is **OFF by default**, can be enabled from an app's **Settings** screen, and has a visible **×** that turns it back off. The choice is persisted locally per app/topic.  
**Deployment QA standard (15 September 2026):** a green deployment or HTTP 200 does **not** count as working until the actual app renders meaningful content, compiled assets load, and the dock does not obstruct mobile controls.

## Completed core behaviour
- [x] Shared universal podcast dock in `public/podcast-dock-universal.js`.
- [x] Data-driven topic banks loaded from `public/podcasts/<topic>.json`.
- [x] Persist current episode, recent history and favourites locally.
- [x] Avoid immediate repeats and support **Different podcast** / **Open in Spotify** actions.
- [x] Spotify embeds/deep links without assuming autoplay is allowed.
- [x] Route/path hiding, quiet-on-input and audio/video conflict behaviour.
- [x] Responsive, keyboard, focus-visible, reduced-motion and screen-reader support.
- [x] **Podcast dock defaults OFF.** Existing v1 users also start v2 with the dock off until they explicitly enable it.
- [x] **× close button** persistently disables the dock and unloads the Spotify iframe.
- [x] **Settings toggle** automatically mounts on recognised Settings/Preferences pages and dialogs.
- [x] Apps can provide an exact settings host with `data-settings-target` or their own checkbox/button with `data-josh-podcast-setting`.
- [x] Public control API/events: `window.JoshPodcastDock.enable()`, `.disable()`, `.toggle()`, `.isEnabled()`, plus `josh-podcast:enable`, `josh-podcast:disable`, `josh-podcast:toggle` and `josh-podcast:enabled-change`.
- [x] Existing `josh-podcast:hide` / `josh-podcast:show` remain temporary runtime visibility controls and do not overwrite the user's preference.
- [x] Cross-app rollout and deployment findings are recorded in `docs/podcast-rollout-audit-2026-09-15.md` and exposed in JoshHub at `/podcast-rollout`.

## Remaining catalogue work
- [ ] Continue expanding mature topic banks toward about 25 curated Spotify episodes each where useful.
- [ ] Keep topic metadata fresh and remove broken/stale episode IDs when found.
- [ ] Add repo-specific automated settings/dock regression tests to high-use apps where worthwhile.
- [ ] Keep Nebula Dice and CanonRPG marked red until their hosting/deployment failures are resolved and verified end-to-end.
- [ ] Do not list JoshPlatform or AppFactory as podcast-enabled until the feature is actually present in production.

## Release verification contract
Before an app is marked **working**:

1. Confirm the repository contains the intended integration and its `podcasttodo.md` is truthful.
2. Run the real production build rather than serving Vite/React source directly.
3. Confirm CI/deployment succeeds.
4. Open the production URL and verify meaningful app content renders, not merely the podcast dock or an empty root element.
5. Verify compiled JS/CSS assets resolve.
6. Check mobile layout and ensure the dock does not cover navigation, forms, game controls or primary actions.
7. Confirm default OFF → Settings enable → × disable → reload persistence.
8. Verify Spotify/deep links without assuming autoplay.
9. Verify immersive/audio-heavy routes hide or collapse the dock when intended.

The UpskillApp blank-screen incident is the reference failure mode for why this contract exists.

## Integration contract
Load the shared script and choose a bank:

```html
<script
  src="https://cdn.jsdelivr.net/gh/joshualparris/JoshHub@main/public/podcast-dock-universal.js"
  data-bank="dnd"
></script>
```

Optional integration hooks:

```html
<!-- If the app has a known settings container, point the dock at it. -->
<script
  src="https://cdn.jsdelivr.net/gh/joshualparris/JoshHub@main/public/podcast-dock-universal.js"
  data-bank="dnd"
  data-settings-target="#settings-panel"
></script>

<!-- Or place this checkbox/button inside native app settings. -->
<input type="checkbox" data-josh-podcast-setting>
```

The standard remains opt-in. Do not use `data-default-on="true"` unless a specific app deliberately chooses to override the global UX rule.
