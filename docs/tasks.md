# JoshHub Task Backlog (agent-safe, bite-size)

Purpose: keep JoshHub shipping in small, safe slices without TypeScript/Dexie regressions.
Rule: **never start feature work unless `npm run lint && npm run build` is green.**

---

## Task 0 — Guardrails (read this before touching code)

### 0.1 Non-negotiables (Codex must follow)
- Keep commits small: **1 task slice per commit**.
- After meaningful changes run: `npm run lint && npm run build`.
- No “silent type loosening”:
  - Don’t `any`/typecast to bypass a failing build.
  - Prefer extending union types + exhaustive renderers.
- Offline-first rules:
  - Dexie is source of truth until Supabase epic (later).
  - Seeds must be **idempotent** (running twice never duplicates rows).
- Env secrets:
  - **Never** import server-only env into client.
  - Never log secrets.
- UI rules:
  - Use theme tokens: `text-foreground`, `text-muted-foreground`, `text-card-foreground`.
  - Placeholders and subtle text must be readable in dark theme.
- Destructive actions always require confirm dialog (or undo).

### 0.2 “Find the truth” checklist (do this once, then keep consistent)
Codex should locate and treat these as sources of truth:
- **Routine step type union** (where `"check" | "timer"` is defined).
- **Dexie DB schema + version** (tables, indexes, types).
- **Seeder functions** (where initial data is inserted).

Implementation note:
- Use ripgrep:
  - `rg -n "check\" \\| \"timer" src`
  - `rg -n "Dexie\\(" src`
  - `rg -n "seed" src`
- Once found, add a short “Pointers” section **below** with exact file paths.

### 0.3 Definition of Done (DoD) — every task must satisfy
- ✅ `npm run lint` passes
- ✅ `npm run build` passes (this is what Vercel runs)
- ✅ UI works in light + dark theme
- ✅ Create/Edit/Delete works where relevant (and persists across refresh)
- ✅ Seeds are idempotent (manual: reload page / rerun seed without duplicates)
- ✅ No console errors in dev
- ✅ Date/time fields don’t shift unexpectedly when viewed later (local-time safe)

### 0.4 Pointers (fill in once discovered)
- Routine step types live at: `__________`
- Dexie schema/types live at: `__________`
- Seeders live at: `__________`
- Shared UI primitives (Dialog/Badge/Input/etc.) live at: `__________`

---

## Task 1 — Make build green (fix the exact Vercel failure)

### Problem (current)
Vercel failed on TypeScript:
`Type '"action"' is not assignable to type '"check" | "timer"'` in `src/app/routines/page.tsx` (Add Step default).

### Outcome
- The app builds in CI/Vercel.
- Routine steps are internally consistent: data model ⇄ UI ⇄ badges ⇄ persistence.

### Do
1) In `src/app/routines/page.tsx`, change the “new step” default to a valid union value:
- If the union is `"check" | "timer"` then default to `"check"`.

2) Add an **exhaustive renderer** for step types wherever they’re displayed:
- Use `switch (step.type)` with a `default` that asserts `never` so new types can’t slip in unnoticed.

3) If you truly want `"action"` as a supported type:
- Update the union type definition,
- Update badge rendering,
- Update runner behavior,
- Update seed data/migrations if needed.
(Do not half-implement.)

### Verify
- `npm run build` succeeds locally.
- Add step → save routine → refresh page → step persists and renders correctly.

---

## Task 2 — Project scaffolding: docs + scripts that prevent regressions

### Outcome
A future agent can’t “accidentally” break build/types/seeding without being caught quickly.

### Do
- Add `docs/DEV.md` with:
  - install/run commands
  - where schema/types/actions live (from Task 0.4)
  - seeding rules (idempotent)
  - date/time storage rules (see Task 3.3)
- Add a script alias (if missing) for typechecks you rely on:
  - Prefer `npm run build` as the ultimate gate, but add `npm run typecheck` if you have a separate TS script.
- Add `.env.example`:
  - include `GROQ_API_KEY=` placeholder (no real key).

### Verify
- New dev can run dev server and build using only `docs/DEV.md`.

---

## Task 3 — Theme safety foundation (text, placeholders, badges)

### 3.1 Contrast polish on Life subpages
- Brighten kicker/title/subtitle on `life-detail-client.tsx` so readable on dark cards.
- Ensure section cards/sidebars use `text-foreground`/`text-card-foreground` not raw slate/neutral.
- Update Work/DCS quick links: remove Campaign Copilot from Work (belongs in Tech/Projects).

### 3.2 Theme-safe meta text helpers
- Update `metaText`/label helpers to use `text-muted-foreground` (not hard-coded gray).
- Audit: Capture, Notes, Everything Map, Routines for placeholder readability.

### 3.3 Routine step type badge (single source)
- Create one shared badge/chip component for step types:
  - CHECK and TIMER (and ACTION only if truly supported).
- Use it everywhere steps appear.

### Verify
- Toggle theme: text and placeholders remain readable everywhere touched.

---

## Task 4 — Global “Confirm” pattern + destructive safety

### Outcome
Every destructive action has a consistent confirm dialog (and optional toast feedback).

### Do
- Pick ONE confirm approach:
  - Shadcn Dialog confirm component OR a small reusable `confirm()` hook component.
- Apply first to: Routines delete (because it’s already in scope), then expand later.

### Verify
- Delete prompts appear, focus is trapped, Esc cancels, Enter confirms (where appropriate).

---

## Task 5 — Routine runner v2 (real runner, no stub)

### Outcome
Routines can be run end-to-end:
- Start/stop
- CHECK steps tickable
- TIMER steps count down with pause/resume
- Summary at end (completed count + duration)
- Optional notes on run

### Do
- Replace “log run” stub with proper runner state machine.
- Ensure seedRoutines is idempotent.
- Confirm on routine delete (reuse Task 4 confirm).

### Verify
- Run a routine, complete steps, finish, refresh: routine unchanged, run summary recorded if persisted.

---

## Task 6 — Everything Map CRUD completeness

- Confirm on delete for map notes (section + global).
- “Manage all notes” view:
  - edit/delete across any section
  - show tags + section
- Ensure placeholders/text readable on dark surfaces.

Verify: edit persists across refresh and dashboard/search reflects changes (if applicable).

---

## Task 7 — Care (NDIS/MS) edit/delete flows

- Providers, appointments, goals, notes:
  - inline or modal edit
  - delete with confirm
- Persist via Dexie actions; avoid duplicate seeds.
- Ensure “next event/next task” summaries update after edits.

Verify: create→edit→delete works without page reload and persists after refresh.

---

## Task 8 — Calendar events CRUD (local-time safe)

### Date/time rule (must follow)
- For date-only: store as `YYYY-MM-DD`.
- For date+time: store as ISO string *with timezone* OR store `{date: YYYY-MM-DD, time: HH:mm}` and compose in UI.
Pick one and apply consistently.

### Do
- Add edit/delete UI (title, date(s), time(s), location, notes, tags) with confirm.
- Make dashboard/up-next use the same parsing logic.

Verify: events don’t shift by timezone after refresh.

---

## Task 9 — Projects status + edit
- Move projects between statuses (Broken/WIP/OK/Archived)
- Edit name/next action/notes
- Persist changes and refresh board without reload.

---

## Task 10 — Tasks/Notes CRUD consistency
- Tasks: edit/delete (title, priority, due date, tags) with confirm.
- Notes: edit/delete (title/body/tags/area) with confirm.
- Fix placeholder contrast on Notes page.

---

## Task 11 — Capture improvements
- Quick capture inputs use themed Input/Textarea (dark-safe).
- Add optional area + tags before save.
- Validate bookmark URLs (clear error UX).
- Make seeders idempotent (no duplicates).

---

## Task 12 — Health logging end-to-end (Dexie + UI + rollups)
- Add Dexie tables/actions/hooks for:
  - sleepLogs, mealLogs, movementLogs, metrics
- Health page forms to log each + edit/delete w/ confirm.
- Dashboard Health Snapshot buttons go to real forms.
- Compute 7d rollups:
  - sleep avg, movement total, last meal, latest metric

Verify: add logs → dashboard updates → refresh persists.

---

## Task 13 — Groq LLM integration (server-side only)
- Add `/api/llm/groq` route using `GROQ_API_KEY` (server env only).
- Studio tools:
  - D&D Idea Generator
  - Story Seeds
  - prompt → result → copy/save to note
- Dashboard coach:
  - generate 3–5 nudges based on missing logs/tasks
  - allow manual prompt
  - show what context was used (without secrets)

Verify: route works on Vercel; no client bundle includes the key.

---

## Task 14 — Global search & command palette
- Index: notes/tasks/routines/bookmarks/events/map notes
- Grouped results with actions (open/edit/delete)
- Filters: type/area/tags
- Hotkeys:
  - Ctrl/Cmd+K
  - N=new note
  - T=new task
  - Esc closes, focus returns

Verify: keyboard + a11y behavior correct.

---

## Task 15 — Export/backup (offline-first essential)
- Export all Dexie tables to JSON (download).
- Import JSON (with safety prompt and validation).
- Optional dev-only:
  - “Reset local DB” button behind a confirm.

Verify: export→reset→import restores data.

---

## Task 16 — Build discipline: make Vercel failures rare
- Add GitHub Actions CI:
  - install
  - `npm run lint`
  - `npm run build`
- Optional: add a simple Playwright smoke test (routes load, CRUD for one entity).

Verify: PRs show green/red before Vercel deploy.

---

## Task 17 — Optional: Supabase auth/sync epic (cross-device)
- Feature-flagged so app works without env vars.
- Add Supabase Auth + `entities` table + push/pull sync with Dexie fallback.
- RLS rules required.

---

## Prompt backlog (parked)
Do not start these until Tasks 1–16 are stable:
- Life content system (templates, per-area seeding)
- Capture auto-sort engine
- Dashboard 2.0
- “Tasks not boring” (views, recurring, streaks)
- Marriage/Love tools
- Health imports (CSV/JSON)
- Family care expansion
- Studio/Delight suite


# JoshHub Task Backlog (bite-size)

Codex isn’t really “missing features” so much as **your `tasks.md` is missing the scaffolding that tells an agent how to execute safely and consistently**, plus a few cross-cutting product essentials.

Here’s what’s missing (or under-specified) in the doc you pasted:

## 1) A “Task 0” that defines *how the project works*

Right now it says “start at Task 1” but it doesn’t define:

* where the **Dexie schema/types** live (source of truth)
* how to run/reset seeds locally (and how to verify idempotence)
* where “areas/tags/statuses” are enumerated / typed
* conventions: file structure, component patterns, UI primitives, styling rules

Agents do best with *rules* + *paths*.

## 2) Acceptance criteria per task (Definition of Done)

Each task is a list of bullets, but it lacks:

* what “done” means (exact UI behavior, edge cases, expected data changes)
* minimum test/verification steps (beyond “lint && build”)
* screenshots or descriptions of current vs target state

Without this, Codex can “complete” a task in a way you wouldn’t accept.

## 3) Data model + migrations plan (Dexie versioning)

You mention many entities (providers, appointments, goals, logs, etc.) but you don’t specify:

* table names, indexes, relationships, IDs
* migration/version bump strategy
* how edits propagate to dashboard summaries

This is *the* biggest source of regressions in offline-first apps.

## 4) Form validation + error handling standards

Tasks mention CRUD everywhere, but not:

* validation rules (dates, required fields, URL validation rules for bookmarks, tag format)
* error UX (toasts, inline errors)
* optimistic vs pessimistic updates
* “safe defaults” for local-time date handling

## 5) Accessibility + keyboard behavior (esp. command palette)

You add hotkeys and destructive confirmations, but not:

* focus management in modals/dialogs
* ARIA labels for the palette
* escape/enter behavior consistency
* tab order and visible focus rings

This tends to get botched unless it’s spelled out.

## 6) Empty states / loading states / “no data yet” UX

A bunch of pages will need:

* empty state copy + actions (“Create your first routine”, “Add your first note”, etc.)
* loading spinners/skeletons if any async work
* guardrails when DB is empty or seeds are disabled

## 7) Export/backup (local-first reality)

If Dexie is your primary store, you probably want at least one of:

* export JSON (all tables) + import JSON
* “download backup” button
* “reset local database” dev tool

This is often crucial before you add sync/auth.

## 8) Testing beyond `lint && build`

You have “Build/test discipline” but no concrete tests:

* at least a couple of Playwright smoke tests (routes load, create/edit/delete flow works)
* a basic “Dexie actions” unit test layer (if you have pure functions)
* pre-commit / CI checks so Vercel is never the first place failures show up

## 9) Docs for env + deployments

Task 11 mentions `GROQ_API_KEY`, but the doc doesn’t include:

* `.env.example`
* “where to set env vars on Vercel”
* “server-only enforcement” checklist (no client import, no leaking logs)

## 10) A “regression guard” for the exact build failure you hit

You already hit a union-type error (`"action"` not assignable to `"check" | "timer"`). The backlog should explicitly include:

* “AddStep defaults must match union type”
* “All step rendering handled exhaustively (switch with `never`)”
* “If we want ‘action’, update type + renderer + badge + persistence”

---

### If you want, here’s the single best addition:

Add a **Task 0 — Project Guardrails** section that includes:

* file paths to schema/types/actions
* conventions (IDs, timestamps, date handling)
* definition of done template
* required checks + quick smoke test script
* “never do” rules (no env keys in client, no non-idempotent seeding, etc.)

If you paste (or point me to) your Dexie schema file + the routine step types file, I can write a drop-in “Task 0” section tailored exactly to JoshHub.


Status: generated after recent build fixes (routines type error, Dexie capture updates). Use this as the working checklist. Start at Task 1 and move down. Keep commits small and run `npm run lint && npm run build` after meaningful changes.

## Task 1 — Contrast polish on Life subpages
- Brighten kicker/title/subtitle on `life-detail-client.tsx` (Faith/Family/Health/etc.) so they’re readable on dark cards.
- Ensure section cards/sidebars use dark-safe text (`text-foreground`/`text-card-foreground`) not slate/neutral.
- Update Work/DCS quick links: remove Campaign Copilot from Work (belongs in Tech/Projects).

## Task 2 — Theme-safe text helpers and badges
- Update `metaText`/label helpers to be foreground-based, not neutral gray on dark.
- Add a dark-safe badge/chip variant for routine step types (CHECK/TIMER) and use it everywhere.
- Ensure Input/Select/Textarea placeholders are readable in both themes (audit Capture, Notes, Everything Map, Routines).

## Task 3 — Routine runner v2
- Replace “log run” stub with full runner: start/stop, per-step checkboxes, timer steps with countdown/pause, summary (completed count/time).
- Add confirm on routine delete; ensure seedRoutines is idempotent.

## Task 4 — Everything Map CRUD completeness
- Add confirm on delete for map notes (section + global).
- Implement true “Manage all notes” view: edit/delete across any section, show tags/section.
- Ensure placeholders and text are readable on dark surfaces.

## Task 5 — Care (NDIS/MS) edit/delete flows
- Providers, appointments, goals, notes: inline or modal edit + delete with confirm.
- Persist via Dexie actions; avoid duplicate seeds.
- Ensure next-event/next-task summaries use updated data after edits.

## Task 6 — Calendar events CRUD
- Add edit/delete UI for events (title, dates/times, location, notes, tags) with confirmation.
- Make sure date handling is local-time safe; update dashboard/up-next uses.

## Task 7 — Projects status + edit
- Allow moving projects between statuses (Broken/WIP/OK/Archived) and editing name/next action/notes.
- Persist changes and refresh board without reload.

## Task 8 — Tasks/Notes CRUD consistency
- Ensure tasks support edit/delete (title, priority, due date, tags) with confirm.
- Ensure notes support edit/delete (title/body/tags/area) with confirm; fix placeholder contrast on Notes page.

## Task 9 — Capture improvements
- Quick capture inputs use themed Input/Textarea (dark-safe).
- Add optional area + tags before save; validate bookmark URLs.
- Make auto-sort/dedupe seeders idempotent.

## Task 10 — Health logging end-to-end
- Add Dexie tables/actions/hooks for sleepLogs, mealLogs, movementLogs, metrics.
- Create/expand Health page with forms to log each; add edit/delete with confirm.
- Wire dashboard Health Snapshot buttons to real log forms; compute 7d rollups (sleep avg, movement total, last meal, latest metric).

## Task 11 — Groq LLM integration (server-side only)
- Add `/api/llm/groq` route using `GROQ_API_KEY` (server env only; never in client).
- Studio: D&D Idea Generator + Story Seeds (prompt → result → copy/save to note).
- Dashboard coach: generate 3–5 nudges based on missing logs/tasks; allow manual prompt; show context used.
- Add small chat box component hitting the server route.

## Task 12 — Global search & command palette
- Index notes/tasks/routines/bookmarks/events/map notes.
- Grouped results with actions (open/edit/delete); filters for type/area/tags.
- Hotkeys: Ctrl/Cmd+K; N=new note, T=new task, etc.

## Task 13 — Confirmations and safety
- Add confirm modals/toasts for destructive actions across Care/Calendar/Tasks/Notes/Projects/Routines/Map.
- Ensure undo pattern or at least “Are you sure?” prompts.

## Task 14 — Build/test discipline
- After each slice: run `npm run lint && npm run build` (and tests if present).
- Fix any TypeScript/Next errors immediately.

## Task 15 — Optional: Supabase auth/sync epic (cross-device)
- If/when ready: add Supabase Auth + `entities` table + push/pull sync with Dexie fallback.
- Keep feature-flagged so app works without env vars.

## Prompt backlog (from docs)
These are additional deliverables pulled from `Prompts 1-10`, `Prompts 11-20`, `CODEX_HANDOFF_PROMPT16_FOUNDATION.md`, and `_JoshHub North Star.txt`. Slot these in as future tasks once the core backlog above is under control.

- Prompt 1/2/5 leftover polish:
  - Ensure Apps catalogue still matches seed list + status/nextAction/lastTouched fields; broken list widget.
  - Life pages: add Play & Creativity area; seed quick links and pins; global search covers life headings/content.
- Prompt 10: Life Content system
  - Life store (local) with LifeItem CRUD (focus/quick_link/checklist/ritual/note/memory/resource), import/export.
  - Templates + per-area seeding (starter packs for all areas including Play & Creativity).
  - /life/[area] sections: Focus, Quick Links, Checklists/Rituals, Notes/Memories with empty-state “Seed this area”.
  - Quick-add + command-palette actions for Life content.
- Prompt 11: Capture auto-sort engine
  - Add capture model + auto-sort (infer kind/area/tags/title), fast /capture UX (Enter=save, Shift+Enter newline), recent feed with edit/delete.
  - Storage layer (`joshhub.capture.v1` equivalent) with list/add/update/delete/search; tags/area/kind heuristics.
- Prompt 12: Dashboard 2.0
  - Today dashboard with Abide/Love/Serve/Steward/Play tiles, next 3 events, top tasks, grace card; redirect `/` → `/dashboard`.
- Prompt 13/14: Command palette + global search
  - Full Ctrl/Cmd+K with actions (navigate, create, start routine, pin/unpin, export/import).
  - Global search page with filters/tags/saved filters.
- Prompt 15: Tasks “not boring”
  - Views Today/Week/Someday/Done, recurring tasks, “next tiny step”, done-by-day log/streaks.
- Prompt 16: Routines runner templates
  - Templates: morning anchor, evening wind-down, conflict recovery, weekly review; store last run + notes.
- Prompt 17: Marriage/Love tools
  - Love Map QOTD, bids log, repair scripts, conflict debrief, weekly check-in agenda.
- Prompt 18: Health dashboard imports
  - Import Withings/Welltory CSV/JSON; trends for sleep/HRV/RHR; daily check-in (energy/mood/movement/sunlight).
- Prompt 19: Family care systems (NDIS/MS)
  - Sylvie NDIS + Kristy MS hubs: provider directory, appointment notes, goals, budgets, medication/treatment notes, fatigue-friendly cues.
- Prompt 20: Studio / Delight
  - D&D idea generator, story seeds, game-dev idea board, joy library, quick-launch to games/apps, “what to build next”.
- Prompt 6/9 (backend/auth foundation):
  - Supabase schema with RLS for captures, files, routines, events, health_series; auth + optional vault; feature-flag so app still works offline.
