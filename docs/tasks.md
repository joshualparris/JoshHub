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

## Task 3 — Routine runner v2 ✅
- Replace the “log run” stub with full runner: start/stop, per-step checkboxes, timer steps with countdown/pause, summary (completed count/time). (done: pause/resume, summary added)
- Add confirm on routine delete; ensure `seedRoutines` is idempotent. (confirm added; seeds already idempotent)

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

## Task 16 — Your Vercel build failed because TypeScript caught an invalid union value in `./src/app/routines/page.tsx`:

* Your step type is typed as `"check" | "timer"`, but you created a new step with `type: "action"`.
* That makes `npm run build` exit with code 1. Fix by changing the default to `"check"` **or** expanding the union + renderer + persistence to support `"action"`.

---

## Why the command palette/search is unreadable in dark mode (your screenshot)

That white dialog in “dark mode” is the classic Radix **Portal + theme class not on `<html>/<body>`** problem:

* Command palette dialogs usually render in a portal attached to `document.body`.
* If your dark theme class / CSS variables are applied only inside an app wrapper `<div>`, the portaled dialog sits *outside* that wrapper and falls back to light theme variables → white background + low-contrast text.

### Fix (the one that usually resolves it immediately)

1. Ensure dark mode class is applied on **`<html>`** (NextThemes / shadcn standard).
   In `app/layout.tsx`:

```tsx
// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

2. Make sure your `ThemeProvider` is the normal next-themes wrapper:

```tsx
// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

3. Ensure your command palette uses theme tokens (popover) not hard-coded light colors:
   Typically in `components/command-menu.tsx` (or wherever):

```tsx
<Command className="w-full rounded-lg border bg-popover text-popover-foreground">
```

If you do just (1), it often fixes everything because the portal will finally “see” `.dark`.

---

## A replacement `tasks.md` that *actually* fixes the missing scaffolding + prevents this regression

```md
# JoshHub Task Backlog (agent-safe, bite-size)

Rule: make small commits. After any meaningful change run:
- `npm run lint`
- `npm run build`

If either fails, stop and fix before moving on.

---

## Task 0 — Project guardrails (DO THIS FIRST)

### 0.1 Source of truth + conventions
- Identify and document in this repo (in this file) the paths for:
  - DB schema + versioning (Dexie)
  - Domain types (Task/Note/Routine/Events/etc.)
  - Seed functions (and where they’re called)
  - UI primitives (shadcn components / design tokens)
- Conventions:
  - All entities have `id` (uuid), `createdAt`, `updatedAt`.
  - All date-times stored as ISO strings; UI uses local time formatting.
  - Seeders must be idempotent (re-running doesn’t duplicate).
  - Step unions must be exhaustive: renderer uses `switch(step.type)` with a `never` check.

**Definition of done**
- This file contains the exact paths + conventions above.
- You can point to “where to change step types” without guesswork.

### 0.2 Theme + portal safety baseline (fix your screenshot)
- Make sure the theme class/attribute is applied to `<html>` so Radix portals (Command/Dialog/Popover) render with correct dark variables.
- Audit command palette styles to use `bg-popover text-popover-foreground` and readable muted text.

**Definition of done**
- In dark mode, Ctrl/Cmd+K palette background is dark and all text is readable.
- No hard-coded light backgrounds on portaled UI.

**Verify**
- Manually: toggle dark, open palette on at least 2 pages (e.g. /life/travel and /dashboard).
- `npm run lint && npm run build`.

---

## Task 1 — Regression guard: Routine step type union + Add Step default
- Fix the exact failure you hit:
  - If union is `"check" | "timer"`, Add Step must default to `"check"` (not `"action"`).
- Add an exhaustive renderer pattern for steps:
  - `switch(step.type)` with a `const _exhaustive: never = step.type` in default case.

**Definition of done**
- Build passes.
- Adding a step never creates an invalid type.
- Step rendering is exhaustive.

---

## Task 2 — Contrast polish on Life subpages
- Brighten kicker/title/subtitle on `life-detail-client.tsx` so they’re readable on dark cards.
- Ensure text uses `text-foreground` / `text-card-foreground` and not raw slate/neutral.
- Update Work/DCS quick links: remove Campaign Copilot from Work (belongs in Tech/Projects).

**Verify**
- Toggle dark/light and check headings + body contrast.
- `npm run lint && npm run build`.

---

## Task 3 — Theme-safe text helpers + badges
- Update meta text helpers to be token-based (foreground/-muted-foreground) not “neutral gray”.
- Add dark-safe badge/chip variant for routine step types (CHECK/TIMER) and use it everywhere.
- Audit placeholders on: Capture, Notes, Everything Map, Routines.

**Definition of done**
- No “nearly invisible” helper text in dark mode anywhere.

---

## Task 4 — Routine runner v2
- Replace “log run” stub with full runner:
  - Start/stop
  - Checkbox steps
  - Timer steps with countdown + pause
  - Summary at end (completed count + total time)
- Confirm on routine delete.
- Ensure `seedRoutines` is idempotent.

---

## Task 5 — Everything Map CRUD completeness
- Confirm on delete (section + global).
- “Manage all notes” view: edit/delete across sections, show tags + section.
- Dark-safe placeholders.

---

## Task 6 — Care (NDIS/MS) edit/delete flows
- Providers, appointments, goals, notes:
  - edit + delete with confirm
  - persistence via Dexie actions
  - no duplicate seeds
- Dash “next” summaries update immediately after edits.

---

## Task 7 — Calendar events CRUD
- Add edit/delete UI (title, dates/times, location, notes, tags) with confirm.
- Date handling is local-time safe (no UTC surprise shifts).

---

## Task 8 — Projects status + edit
- Move projects between statuses (Broken/WIP/OK/Archived).
- Edit name/next action/notes.
- Persist and refresh without reload.

---

## Task 9 — Tasks / Notes CRUD consistency
- Tasks: edit/delete (title, priority, due date, tags) with confirm.
- Notes: edit/delete (title/body/tags/area) with confirm.
- Fix Notes placeholder contrast.

---

## Task 10 — Capture improvements
- Themed inputs (dark-safe).
- Optional area + tags before save.
- URL validation for bookmarks.
- Seeders idempotent.

---

## Task 11 — Health logging end-to-end
- Add Dexie tables + actions/hooks: sleepLogs, mealLogs, movementLogs, metrics.
- Health page forms with edit/delete + confirm.
- Dashboard snapshot wired to real data + 7d rollups.

---

## Task 12 — Groq LLM integration (server-side only)
- Add `/api/llm/groq` using `GROQ_API_KEY` (server env only).
- Studio generators + dashboard coach + small chat component.

---

## Task 13 — Global search + command palette
- Index notes/tasks/routines/bookmarks/events/map notes.
- Group results + actions (open/edit/delete).
- Hotkeys: Ctrl/Cmd+K; N=new note; T=new task.

---

## Task 14 — Confirmations and safety
- Confirm modals/toasts for destructive actions across the app.

---

## Task 15 — Optional: Supabase auth/sync epic
- Feature-flagged auth + sync; app still works offline without env vars.
```

---

## A Codex prompt that will “do everything” (safely)

Paste this into Codex **as-is**:

> You are working in the JoshHub repo. Your job is to implement the backlog in `tasks.md` starting at Task 0 and moving down in order.
>
> Hard rules:
>
> * Make small commits per subtask. Do not mix unrelated changes.
> * After each meaningful change, run `npm run lint` and `npm run build`. If either fails, fix before continuing.
> * Do not introduce new libraries unless absolutely necessary.
> * Dexie seeders MUST be idempotent.
> * Theme must apply to Radix portals: ensure dark mode styling works in Command/Dialog/Popover. No hard-coded light backgrounds.
> * Routine step types must be union-safe: no invalid string literals; renderer must be exhaustive with a `never` check.
>
> Execution format:
>
> 1. Before changing code: locate the relevant files and briefly state what you found (paths + current behavior).
> 2. Implement the smallest possible change to satisfy the current task’s Definition of Done.
> 3. Run checks (`lint`, `build`) and include results.
> 4. Commit with a clear message (Task X.Y: ...).
>
> Start now with Task 0.2 (dark mode command palette readability) and Task 1 (routine step type union regression). Fix those first because they block shipping and caused Vercel failures.

If you want, paste the file contents of your current `app/layout.tsx` and the command palette component file, and I’ll point to the exact lines to change (no guesswork).


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
