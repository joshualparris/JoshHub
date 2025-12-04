# JoshHub Task Backlog (agent-safe, bite-size)

Purpose: keep JoshHub shipping in small, safe slices. After meaningful changes, run `npm run lint && npm run build` and fix failures immediately.

---

## Task 1 — Contrast polish on Life subpages ✅
- Brighten kicker/title/subtitle on `life-detail-client.tsx` so they’re readable on dark cards.
- Ensure section cards/sidebars use dark-safe text (`text-foreground`/`text-card-foreground`) not raw slate/neutral.
- Update Work/DCS quick links: remove Campaign Copilot from Work (belongs in Tech/Projects).

## Task 2 — Theme-safe text helpers and badges ✅
- Update `metaText`/label helpers to be foreground-based, not hard-coded gray on dark. (done)
- Add a dark-safe badge/chip variant for routine step types (CHECK/TIMER) and use it in the runner. (done)
- Ensure Input/Select/Textarea placeholders are readable in both themes (audit Capture, Notes, Everything Map, Routines). (done via shared Input/Textarea)

## Task 3 — Routine runner v2
- Replace the “log run” stub with full runner: start/stop, per-step checkboxes, timer steps with countdown/pause, summary (completed count/time).
- Add confirm on routine delete; ensure `seedRoutines` is idempotent.

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

## Task 16 — 

## Prompt backlog (from docs)
These are additional deliverables from Prompts 1–20 and supporting docs; start after Tasks 1–14 are stable.
- Life content system (templates, per-area seeding, Play & Creativity area).
- Capture auto-sort engine.
- Dashboard 2.0 (Today tiles/events/tasks/grace).
- Command palette + global search upgrades (actions, saved filters).
- Tasks “not boring” (recurring, next tiny step, streaks/done-by-day).
- Routines templates (morning/evening/conflict/weekly).
- Marriage/Love tools (Love Map QOTD, bids log, repair scripts, check-in agenda).
- Health imports (Withings/Welltory CSV/JSON) + trends.
- Family care expansion (Sylvie NDIS + Kristy MS hubs).
- Studio/Delight suite (D&D ideas, story seeds, game dev board, joy library).
- Backend/auth foundation (Supabase schema + RLS, vault, feature-flagged sync).
