JoshHub
=======

Personal browser-based dashboard for all your apps and games.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Lightweight shadcn-style UI components (Button/Card/Badge/Input)

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
