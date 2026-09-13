# Podcast Integration TODO

**Decision:** Add — highest priority / master implementation.
**Role:** JoshHub should become the source of truth for the reusable Josh Podcast Dock and the cross-app topic catalogue.

## TODO
- [ ] Create shared podcast topic definitions for Tech, Health, Faith, Family, Career, Games, Books, Horses and other life/app areas.
- [ ] Seed each mature topic with about 25 curated Spotify episodes.
- [ ] Add a collapsed global bottom dock with one-tap **play/load another episode** behaviour.
- [ ] Persist current episode, recent history, favourites and last topic locally.
- [ ] Avoid immediate repeats and support explicit **Different podcast** / **Open in Spotify** actions.
- [ ] Use Spotify embeds/deep links but do not assume autoplay will be allowed.
- [ ] Let app/life-area detail pages request a topic key such as `chess`, `msp`, `piano`, `faith`, `horses`, `dnd`.
- [ ] Define hide/pause rules for child mode, emergency/safety flows, timed games and apps already playing audio/TTS.
- [ ] Keep banks data-driven and easy to maintain/refresh.
- [ ] Add responsive, keyboard and screen-reader support plus tests for routing, persistence, topic switching and broken entries.

## Architecture direction
Treat this as the canonical **Josh Podcast Dock** specification. Other apps may copy a lightweight standalone version while sharing the same conventions and, where practical, the same catalogue format.
