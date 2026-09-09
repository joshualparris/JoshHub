# 12–15 — `public/` assets and the stray project folders

**Areas:** hosted game builds (161 files), the `josh-nfc-audio` tree (569),
other public assets (44), and `projects` / `experimental` (2).
**Files:** 776 of the repository's 948.

These are reviewed at the level of *policy* rather than line by line. Most of the
content is compiled output — minified bundles, sourcemaps, Gradle artefacts —
where reading each file individually would tell you nothing useful. Where a
finding needed evidence, it was measured.

---

## What this area gets right

- Hosting each game as a static build under `public/games/<slug>/` is a
  reasonable, dependency-free way to keep old projects playable, and it works.
- `eslint.config.mjs` already excludes `public/games/**` from linting, which is
  the right call for vendored bundles.

---

## Findings

### [ ] PUB-01 — A 31 MB Android build tree is committed · High
- **Principles:** P9, P13
- **Where:** `public/games/josh-nfc-audio/twa-build/`
- **Problem:** **548 tracked files, 31 MB** of Android Gradle build output —
  `gradlew`, ProGuard mappings, `build/intermediates/`, merged resource blame
  logs, symbol lists. For comparison, all of `public/games` is 59 MB and `.git`
  is 51 MB, so this one directory is roughly half the repository's weight and
  58% of its file count.
- **Why it matters:** Every clone downloads it. It is regenerated output, not
  source, so it can never be usefully diffed or reviewed — and it was corrupted
  along with everything else by the `ms` → `care2` replacement, which is how it
  surfaced during that repair. It also drags every repo-wide search and tool
  through 548 irrelevant files.
- **Note on the keep-code preference:** this is not code. It is compiled output
  that a build regenerates. Removing it loses nothing that cannot be rebuilt, and
  the history retains it if ever needed.
- **Fix:** `git rm -r --cached public/games/josh-nfc-audio/twa-build`, add
  `public/games/**/twa-build/` to `.gitignore` (CFG-06), and keep the built
  `index.html` and web assets that the app actually serves. Confirm first that
  `/games/josh-nfc-audio/index.html` does not reference anything inside
  `twa-build/`.
- **Status:** Open

### [ ] PUB-02 — Twelve referenced assets are missing from `public/` · High
- **Principles:** P8
- **Where:** `public/games/`, `public/docs/`, referenced from `src/data/apps.ts`
- **Problem:** Same finding as SCR-01, recorded here because the missing files
  belong to this area: `neon-dash`, `serenity-keep-flying`, `dinner-decider`,
  `wilds-2` under `/games/`, and `memoirs-of-joshua`, `ourdcs`,
  `christmas-rotation`, `deep-research-index` under `/docs/`, among 12 total.
- **Why it matters:** Live 404s from the catalogue and the archive page.
  `c43511c` "Restore deleted game builds and docs" suggests this has happened
  before and was only partly recovered.
- **Fix:** For each, decide whether the build should be restored or the
  catalogue entry retired, then wire `check-assets.js` into CI.
- **Status:** Open

### [ ] PUB-03 — Corrupted text remains in game bundles and build output · Medium
- **Principles:** P1
- **Where:** `public/games/josh-nfc-audio/twa-build/**`, `package-lock.json` (historical)
- **Problem:** The repository-wide `ms` → `care2` substring replacement was
  repaired in `3c0bf78` across all source and served game assets, but the
  Android build tree was deliberately left alone as regenerated output. It still
  contains corrupted identifiers such as `ResumeUcare1patchedRunnable` (from
  `ResumeUndispatchedRunnable` — the same event also replaced `ndis` with
  `care1`).
- **Why it matters:** Harmless while nothing builds from it, but it is a trap: if
  anyone ever rebuilds or inspects that tree they will meet corrupted symbols
  with no explanation. It also leaves misleading search hits.
- **Fix:** Resolved for free by PUB-01 — removing the tree removes the remaining
  corrupted artefacts. If the tree is kept for any reason, note the corruption in a README
  beside it.
- **Status:** Open

### [ ] PUB-04 — Game builds are duplicated across slugs · Medium
- **Principles:** P2, P9
- **Where:** `public/games/buckland-v2/` and `public/games/buckland-blocks/`
- **Problem:** Both directories contain 29 files, including identically named
  bundles (`index-BFB1WGog.js`, `index-Dvaw-KYN.css`) — the same build published
  under two slugs. `mysterious-depths` similarly serves both `index.html` and
  `index_Version2.html`, and the archive page links to both as separate entries.
- **Why it matters:** Duplicate copies of the same game double the download
  weight and create two URLs that can drift apart, which is the same
  multiple-versions problem the project-level audit already flagged for the
  GitHub repositories.
- **Fix:** Keep one canonical slug per game, redirect or remove the other, and
  update `apps.ts` and the archive list to match.
- **Status:** Open

### [ ] PUB-05 — `experimental/hugcoach/README.md` is empty · Low
- **Principles:** P9, P12
- **Where:** `experimental/hugcoach/README.md`
- **Problem:** The file has no content. It was added by `dd00d20`
  "chore(sandbox): add experimental/hugcoach placeholder" and never filled in.
  HugCoach also exists as a standalone deployed app and a catalogue entry.
- **Why it matters:** A top-level `experimental/` directory containing one empty
  file tells the reader nothing except that something was once intended.
- **Fix:** Write one line saying what the placeholder is for and what state
  HugCoach is actually in, or remove the directory. This is the same
  keep-vs-clarify decision as SCAF-01, at trivial scale.
- **Status:** Open

### [ ] PUB-06 — `projects/` contains only a duplicate gitlink · Low
- **Principles:** P13
- **Where:** `projects/Game-Fixer`
- **Problem:** The whole `projects/` directory holds a single submodule pointer
  that duplicates the root-level `Game-Fixer`, at the same commit.
- **Why it matters:** Covered by CFG-03; recorded here so the area is accounted
  for.
- **Fix:** Resolve with CFG-03 and remove the empty directory.
- **Status:** Open
