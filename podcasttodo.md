# Podcast Integration TODO

**Decision:** Add — highest priority / master implementation.  
**Role:** JoshHub is the source of truth for the reusable Josh Podcast Dock and the cross-app topic catalogue.  
**Current UX standard (13 September 2026):** the podcast dock is **OFF by default**, can be enabled from an app's **Settings** screen, and has a visible **×** that turns it back off. The choice is persisted locally per app/topic.

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

## Remaining catalogue work
- [ ] Continue expanding mature topic banks toward about 25 curated Spotify episodes each where useful.
- [ ] Keep topic metadata fresh and remove broken/stale episode IDs when found.
- [ ] Add repo-specific automated settings/dock regression tests to high-use apps where worthwhile.

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
