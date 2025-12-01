Prompt 16 Foundation — Codex handoff
=================================

Files added in branch `copilot/prompt-16-foundation`:

- `COPILOT_SCOPE.md` (root) — branch rules and boundaries.
- `src/lib/models/life.ts` — `LIFE_AREAS`, `LifeArea`, helpers.
- `src/lib/models/capture.ts` — `CaptureItem`, `CaptureKind`, helpers `makeCapture`, `makeId`, `nowIso`.
- `src/lib/models/lifeContent.ts` — `LifeItem` model + helper.
- `src/lib/seed/defaultTags.ts` — default tag suggestions per area.
- `src/lib/seed/lifeStarterPack.ts` — `getStarterPack()` returns `LifeItem[]` (pure data).
- `src/lib/logic/tagging.ts` — `extractHashtags`, `normalizeTag`.
- `src/lib/logic/autoSort.ts` — `inferKind`, `inferArea`, `extractTitle`, `autoSort` (pure heuristics).
- `src/lib/logic/date.ts` — `dateKeyLocal`, `isSameLocalDay`, `isOverdue`.
- `src/lib/logic/lifeDerivations.ts` — `getAreaCounts` (counts and recent captures).
- `src/lib/repos/captureRepo.ts` — `CaptureRepo` interface and `createInMemoryCaptureRepo()`.
- `src/lib/repos/lifeContentRepo.ts` — `LifeContentRepo` interface and `createInMemoryLifeContentRepo()`.

Handoff guidance for Codex (what to wire next):

1) Storage adapter
   - Implement a Dexie-backed adapter that implements `CaptureRepo` and `LifeContentRepo`.
   - Do NOT change `src/lib/db/dexie.ts` or `src/lib/db/schema.ts` in this branch. Codex (Prompt 4) will add table names or migrations as needed.
   - Suggested approach: implement adapter file(s) under `src/lib/repos/dexieAdapters/*` mapping `CaptureItem` <-> Dexie table rows.

2) Input classification
   - Use `autoSort(text, url?)` to suggest `kind`, `area`, `title`, and initial `tags` when capturing quick input.

3) Seeding life content
   - Use `getStarterPack()` as source-of-truth for initial life items. Codex should call this from an initialization seed step into Dexie.

4) UI wiring
   - Replace any ad-hoc localStorage capture stores with the `CaptureItem` model and the `CaptureRepo` API.
   - For `life` content pages, use `LifeItem` and `LifeContentRepo`.

5) Tests
   - The in-memory repos are provided for unit tests and local development. Codex can write unit tests against `createInMemoryCaptureRepo()` and logic helpers.

Notes:
- All added modules are pure/compile-safe and do not touch existing routes or DB schema.
- Keep adapters and Dexie wiring in a separate branch or changeset so this foundation remains non-conflicting.
