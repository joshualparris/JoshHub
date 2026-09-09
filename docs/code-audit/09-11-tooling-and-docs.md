# 09–11 — `.github`, `scripts` and `docs`

Three small areas covered together because their findings are interlinked: the
scripts are good checks nobody runs, `.github` is where they would run, and
`docs` is where the results should be recorded.

**Files reviewed:** 1 + 6 + 14 = 21 (scripts and `.github` read in full; docs
reviewed by structure and purpose, with the two audit documents read in full)

---

## Area 09 — `.github`

Only `copilot-instructions.md`. The absence of workflows is recorded as CFG-01,
which is the single highest-value fix in the repository.

### [ ] GH-01 — Copilot instructions are good but now partly untrue · Medium
- **Principles:** P12, P2
- **Where:** `.github/copilot-instructions.md`
- **Problem:** The file is genuinely useful — it names the stack, the data
  patterns and the conventions. But two of its statements no longer hold:
  - "`src/data/apps.ts` is the source-of-truth… Do not store catalogue items in
    multiple places" — yet `archive/page.tsx` hardcodes 43 of the same links
    (APP-03), and `apps.ts.bak` is a second committed copy (DATA-01).
  - It lists the developer workflow without mentioning `npm test`,
    `npm run validate:apps` or `node scripts/check-assets.js`, so an agent
    reading it will not know the checks exist.
- **Why it matters:** This file is the first thing an AI agent reads, and this
  repository is largely built by AI agents. Instructions that are subtly out of
  date get faithfully followed into the wrong shape.
- **Fix:** Update it to name the test and validation commands, point at
  `docs/code-audit/` as the current list of known problems, and state the
  theming rules once COMP-01/02 are fixed.
- **Status:** Open

---

## Area 10 — `scripts`

```
check-assets.js               (48)  checks /games and /docs links in apps.ts exist
compare-map-tiles.js          (34)
generate-projects-inventory.js (177) npm run generate-projects
pull_remote_apps_ts.js        (33)
sync_apps_from_live.js        (79)  scrapes the deployed site back into JSON
validate-apps.ts              (132) npm run validate:apps
```

### What this area gets right

`validate-apps.ts` is the best-engineered file in the repository. It checks
identity, duplicate ids and names, URL protocols, `file:///` leakage, status and
confidence enums, availability consistency, and contradictory metadata — with
clear error/warning separation and a proper exit code. It currently passes:
139 entries, zero errors.

### [ ] SCR-01 — Twelve referenced local assets do not exist · High
- **Principles:** P8, P11
- **Where:** `scripts/check-assets.js`, `src/data/apps.ts`, `public/`
- **Problem:** Running the script reports **12 of 51** referenced local assets
  missing, including `/games/neon-dash/index.html`,
  `/games/serenity-keep-flying/index.html`, `/games/dinner-decider/index.html`,
  `/games/wilds-2/index.html`, `/docs/memoirs-of-joshua.html`,
  `/docs/ourdcs.html`, `/docs/christmas-rotation.html` and
  `/docs/deep-research-index.html`.
- **Why it matters:** These are live 404s in the catalogue right now. The tool
  that detects them already exists and is simply never run — which is CFG-01 in
  miniature.
- **Fix:** Either restore the builds into `public/` or correct the catalogue
  entries, then add `node scripts/check-assets.js` to CI so the count cannot
  grow again.
- **Status:** Open

### [ ] SCR-02 — The catalogue is synced *from* the deployed site · Medium
- **Principles:** P6, P2
- **Where:** `scripts/sync_apps_from_live.js`
- **Problem:** The script fetches `https://josh-hub-two.vercel.app/apps` and
  regex-scrapes its HTML back into `src/data/apps.synced.json`. The data flow is
  circular: `apps.ts` → build → deploy → scrape → JSON. It also parses a
  client-rendered React page with three fallback regexes, and hardcodes the
  deployment URL.
- **Why it matters:** The source of truth cannot be downstream of its own
  output. Whatever the scrape produces is a lossy copy of what `apps.ts` already
  says, and the output file is empty (`[]`), so it is not even working.
- **Fix:** Delete the script and `apps.synced.json`, or repoint it at whatever
  the real upstream is. If the intent was to recover catalogue entries that only
  exist on the deployed site, do that once by hand and record the result in
  `apps.ts`.
- **Status:** Open

### [ ] SCR-03 — Useful checks are not reachable from `package.json` · Low
- **Principles:** P4, P13
- **Where:** `package.json`, `scripts/check-assets.js`, `scripts/compare-map-tiles.js`, `scripts/pull_remote_apps_ts.js`
- **Problem:** Only `generate-projects` and `validate:apps` have npm scripts. The
  other four must be invoked by path, so they are effectively invisible.
- **Why it matters:** `check-assets.js` found 12 real broken links the moment it
  was run. A check nobody can find is a check nobody runs.
- **Fix:** Add `"check:assets"` and any other genuinely useful ones as npm
  scripts; delete the scripts that are no longer wanted rather than leaving them
  undiscoverable.
- **Status:** Open

---

## Area 11 — `docs`

```
CODEX_HANDOFF_PROMPT16_FOUNDATION.md  the unwired scaffolding handoff (SCAF-01)
IMPROVEMENTS.md                       per-app quality tracker (30 apps)
PROJECT-AUDIT-EVIDENCE-PACK.md        prior project-level audit
PROJECT-AUDIT-STABILISATION-PLAN.md   prior stabilisation plan
tasks.md                              task backlog (342 lines)
JoshHub - Prompts 1 to 10.txt         raw prompt transcript (1,755 lines)
_1st / _2nd / _3rd 10 Reviews.txt      raw review transcripts (723 lines)
joshhub-sync-qa-report.md  local-sync-comparison.md
project-inventory-governance.md
code-audit/                            this audit
```

### [ ] DOC-01 — Raw transcripts are stored as documentation · Medium
- **Principles:** P4, P12
- **Where:** `docs/JoshHub - Prompts 1 to 10.txt`, `docs/_1st|_2nd|_3rd 10 Reviews.txt`
- **Problem:** 2,478 lines of unedited prompt and review transcripts sit
  alongside real documentation, in non-UTF-8 encodings with mixed CRLF/CR line
  endings (they had to be handled separately during the `ms`/`care2` repair) and
  filenames containing spaces and leading underscores.
- **Why it matters:** They are a record of how decisions were reached, which has
  value — but as documentation they are unusable, and they dilute the four
  documents that are genuinely worth reading.
- **Fix:** Move them to `docs/history/` with a one-line README saying what they
  are, so the useful docs stand out. Do not delete — they are the only record of
  the reasoning behind several decisions.
- **Status:** Open

### [ ] DOC-02 — Nothing tells a newcomer where to start · Medium
- **Principles:** P12
- **Where:** `README.md`, `docs/`
- **Problem:** The root README is 49 lines covering stack and `npm run dev`. It
  does not mention that the app is local-first with no server, that all data
  lives in the browser, that backups are the only way to move data, or that
  `docs/` contains four different audits.
- **Why it matters:** The single most important fact about this application —
  your data exists only in this browser — is not written down anywhere a new
  reader would look. That fact is what makes the backup findings critical rather
  than routine.
- **Fix:** Extend the README with a short "How this app stores data" section and
  a map of `docs/`, pointing at `docs/code-audit/README.md` for known issues.
- **Status:** Open

### [ ] DOC-03 — Four overlapping audits with no index · Low
- **Principles:** P2
- **Where:** `docs/IMPROVEMENTS.md`, `docs/PROJECT-AUDIT-*.md`, `document.md`, `docs/code-audit/`
- **Problem:** Four audit-shaped documents written at different times for
  different purposes — app quality, project prioritisation, stabilisation, and
  now source code — with nothing explaining how they relate.
- **Why it matters:** A reader cannot tell which is current or which answers
  their question.
- **Fix:** Add a short `docs/README.md` listing each document, its scope and its
  date. The code audit's README already states its own scope and what it is not.
- **Status:** Open
