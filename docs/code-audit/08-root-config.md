# 08 — Root configuration

**Area:** the 15 tracked files at the repository root.
**Files reviewed:** 15 (all read in full)

```
package.json  next.config.ts  tsconfig.json  eslint.config.mjs
postcss.config.mjs  .gitignore  README.md  COPILOT_SCOPE.md
document.md  tasks.md  package-lock.json
Game-Fixer  PartyAI  Serenity-Keep-Flying   ← submodule gitlinks
```

## What this area gets right

- `tsconfig.json` has `strict: true`, which is doing real work — several findings
  elsewhere would be worse without it.
- `eslint.config.mjs` is thoughtfully written: sensible ignores, TS noise
  downgraded to warnings, a separate block for Node scripts.

---

## Findings

### [x] CFG-01 — There is no CI · Critical
- **Principles:** P15, P11
- **Where:** `.github/workflows/ci.yml`
- **Problem:** Nothing ran `npm run build`, `npm run lint`, `npm test` or
  `npm run validate:apps` automatically. Every check in this repository was
  manual.
- **Why it matters:** This was the direct cause of the longest-running failure in
  the project's history. Production deploys failed continuously from a June
  commit until `3c0bf78` — dozens of commits, months of work — because a deleted
  file left a broken import and nothing ever told anyone. A single workflow
  running `npm run build` on push would have caught it the same day. Every other
  finding in this audit is easier to prevent than to find; CI is the mechanism
  that does the preventing.
- **Fix:** Added `.github/workflows/ci.yml` running on push to `main` and pull
  requests: `npm ci`, `npm run lint`, terminating tests, `npm run build`, and
  `npm run validate:apps`. `node scripts/check-assets.js` remains intentionally
  deferred until the known asset/catalogue failures and CFG-06 are resolved, as
  originally specified by this finding.
- **Verification:** GitHub Actions run `34337559585` completed install, lint,
  tests, production build, and app-catalogue validation successfully on
  `081a7d9`.
- **Status:** Fixed in `081a7d9`

### [x] CFG-02 — `npm test` hangs in any automated context · High
- **Principles:** P13, P15
- **Where:** `package.json` → `"test": "vitest run"`, `"test:watch": "vitest"`
- **Problem:** Bare `vitest` started watch mode. In CI, or any non-interactive
  shell, it never exited.
- **Why it matters:** It made CFG-01 harder to fix correctly and quietly
  discouraged running tests at all. Anyone adding a CI step with `npm test`
  would have received a hung job.
- **Fix:** Changed the default test script to `vitest run` and added
  `test:watch` for intentional local watch mode.
- **Verification:** `npm test` completed successfully inside GitHub Actions run
  `34337559585`.
- **Status:** Fixed in `8b741f5`

### [ ] CFG-03 — Submodule gitlinks with no `.gitmodules` · High
- **Principles:** P6, P13
- **Where:** `Game-Fixer`, `PartyAI`, `Serenity-Keep-Flying`, `projects/Game-Fixer`
- **Problem:** Four entries are committed with git mode `160000` (submodule
  pointers), but there is no `.gitmodules` file anywhere in the repository.
  `Game-Fixer` is registered twice — at the root and under `projects/` —
  pointing at the same commit `4e357cd`.
- **Why it matters:** A fresh clone produces empty directories that
  `git submodule update --init` cannot populate, because there is no URL
  recorded for any of them. The referenced commits may not exist anywhere
  reachable. It also means `git status` can report the tree as modified for
  reasons a newcomer cannot diagnose.
- **Fix:** Decide what these were meant to be. If they should be submodules, add
  a `.gitmodules` with real URLs. If not — most likely, given the duplication —
  remove the gitlinks with `git rm --cached <path>`. Either way, remove the
  duplicate registration of `Game-Fixer`.
- **Status:** Open

### [ ] CFG-04 — Dev and build use different bundlers · Medium
- **Principles:** P13
- **Where:** `package.json` → `"dev": "next dev --webpack"`, `"dev:turbo": "next dev"`, `"build": "next build"`
- **Problem:** The default dev command forces Webpack, while `next build` uses
  Turbopack (confirmed in build output). So the bundler used while developing is
  not the one used to produce the deployed artefact.
- **Why it matters:** It creates a class of bug that only appears in production
  builds — exactly the situation this project has already suffered from at
  length. Whatever prompted the `--webpack` pin is no longer recorded.
- **Fix:** Find out whether the Webpack pin is still needed. If not, drop it so
  dev and build match. If it is, add a comment saying why, and make CI build the
  way production does.
- **Status:** Open

### [ ] CFG-05 — `set-state-in-effect` is disabled globally *and* suppressed per file · Low
- **Principles:** P13
- **Where:** `eslint.config.mjs` (`'react-hooks/set-state-in-effect': 'off'`), plus four file-level directives
- **Problem:** The rule is switched off project-wide as "noisy", yet
  `family/page.tsx`, `notes/[id]/page.tsx`, `routines/[id]/page.tsx` and
  `theme-toggle.tsx` each carry a `/* eslint-disable */` for it. All four are
  therefore redundant, and ESLint already reports one as unused.
- **Why it matters:** It reads as though the rule is active and being worked
  around, which misleads anyone deciding whether the pattern is acceptable.
- **Fix:** Remove all four directives. Separately, reconsider whether the rule
  should be a warning rather than off — it was pointing at a real pattern worth
  extracting (APP-08).
- **Status:** Open

### [ ] CFG-06 — `.gitignore` misses the artefacts actually causing bloat · Medium
- **Principles:** P9
- **Where:** `.gitignore`
- **Problem:** It ignores `*.exe`, `*.dll`, `*.apk` and some scratch text files,
  but not `*.bak` (DATA-01 committed one) and not Android build output, of which
  31 MB is committed (see report 12–14).
- **Why it matters:** The ignore file was written for problems the repo does not
  have while the ones it does have went untracked.
- **Fix:** Add `*.bak` and `public/games/**/twa-build/`, then remove the tracked
  copies.
- **Status:** Open

### [ ] CFG-07 — Two task backlogs, one referencing a file that does not exist · Medium
- **Principles:** P2
- **Where:** `tasks.md` (root, 154 lines), `docs/tasks.md` (342 lines)
- **Problem:** Two different backlogs with different content. The root one
  describes work on `src/lib/supabase/server.ts`; there is no Supabase code in
  this repository at all.
- **Why it matters:** Neither can be trusted as the list of what to do next, and
  one is describing a different project.
- **Fix:** Keep `docs/tasks.md`, delete the root one after checking nothing in it
  is still wanted. Point new work at `docs/code-audit/` instead.
- **Status:** Open

### [ ] CFG-08 — `COPILOT_SCOPE.md` describes a branch that was merged long ago · Low
- **Principles:** P12
- **Where:** `COPILOT_SCOPE.md`
- **Problem:** It states that changes are "restricted to `src/lib/**` in this
  branch" and that "Codex will implement the Dexie adapters and UI wiring after
  Prompt 4 completes" — instructions for `copilot/prompt-16-foundation`, which is
  no longer the working branch. The wiring it anticipates never happened
  (SCAF-01).
- **Why it matters:** A root-level file that reads as current policy but is a
  stale note to a past agent. It actively misdirects.
- **Fix:** Move it into `docs/` as historical context alongside the handoff doc,
  or delete it once SCAF-01 is settled.
- **Status:** Open

### [ ] CFG-09 — `next.config.ts` is an empty placeholder · Low
- **Principles:** P12
- **Where:** `next.config.ts`
- **Problem:** Contains only `// add other valid Next.js options here if needed`.
- **Why it matters:** Harmless, but the history shows repeated config churn
  (`1f06533` "Pin turbopack root for Windows", `6f6adc4` "update next.config.ts
  for Vercel build") — so options were added and removed without any record of
  why.
- **Fix:** Leave the file, but note in it that config was deliberately reset to
  defaults, so the next person does not re-add settings blindly.
- **Status:** Open
