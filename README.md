JoshHub
=======

Personal browser-based dashboard for all your apps and games.

**Engineering principles:** v5.1 (`codingprinciples.md`)  
**Assurance tier:** 2 — durable personal software  
**Canonical repository:** https://github.com/joshualparris/JoshHub  
**Live principles page:** `/engineering-principles`

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Lightweight shadcn-style UI components (Button/Card/Badge/Input)

## Engineering standard
- `codingprinciples.md` is the canonical cross-repository engineering standard.
- `docs/ENGINEERING_PRINCIPLES_HISTORY.md` records the version rankings, rationale and historical rollout evidence.
- `docs/code-audit/` remains the repository-specific conformance/audit system. Its 18 principles pre-date v5.1 and should be treated as a JoshHub-specific checklist rather than a competing universal standard.
- AI agents must read `codingprinciples.md` before making changes.

## Getting started
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Build
```bash
npm run build
npm run start  # preview production build
```

## Deploy
- Vercel recommended: push to a repo and import in Vercel; set framework to Next.js (app directory).

## Editing the catalogue
- Source of truth: `src/data/apps.ts`.
- Add new items with `id`, `name`, `category`, `status`, `tags`, `urls[]`, `primaryUrl`, optional `notes`.

## Features
- Home dashboard with quick launch, recent items, broken list, and pinned Life areas.
- `/apps` directory: search, category/status filters, tags; `/apps/[id]` detail with links, embed toggle, status, tags, notes.
- `/projects`: grouped by status with next actions.
- `/engineering-principles`: readable v5.1 standard summary, version rankings, tier model and rollout evidence.
- `/life` and `/life/[slug]`: Life areas with content, quick links, and pin-to-home.
- Global search (Ctrl/Cmd + K) across routes, apps, and life pages.
- Capture + local data (IndexedDB/Dexie):
  - `/capture`: quick add note/task/bookmark + recent feed.
  - `/notes` + `/notes/[id]`: search/filter, edit, and autosave notes.
  - `/tasks`: quick add, grouped Today/Upcoming/Someday, check/priority.
  - `/routines` + `/routines/[id]`: create/run routines, log runs.
  - `/settings/backups`: export/import/reset local data (notes/tasks/bookmarks/routines/runs/pins).
- Health: `/health` hub plus `/health/sleep|movement|nutrition|metrics` logging; sleep chart; dashboard shows health snippets.
- Calendar: `/calendar` manual events; dashboard shows upcoming; ICS import stub at `/settings/calendar`.
- Family: `/family` for rhythm + kid checklists, surfaced on dashboard.
- Pinned Life areas now stored in IndexedDB.

## Accessibility
- Semantic headings, focus rings on interactive elements, keyboard-friendly controls, readable contrast.
