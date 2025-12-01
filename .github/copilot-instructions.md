<!-- Copilot / AI agent instructions for JoshHub -->
# JoshHub — Copilot Instructions

Brief, actionable guidance for AI coding agents working on this repository.

- Project type: Next.js (App Router) + TypeScript + Tailwind CSS. App lives in `src/app`.
- UI: small shadcn-style components in `src/components`; styling via Tailwind and `class-variance-authority`.
- Data patterns:
  - Static catalogue data: `src/data/apps.ts` is the source-of-truth for the apps catalogue. New items require `id, name, type, category, status, tags, primaryUrl, urls[]`.
  - Local persistent data: IndexedDB via Dexie in `src/lib/db/*` (see `dexie.ts`, `schema.ts`, and seed logic in `dexie.ts`). Prefer updating schema and seeds consistently.

- Routing & structure:
  - Routes are under `src/app`. Top-level routes include `dashboard`, `apps`, `life`, `notes`, `tasks`, `capture`, `health`, `calendar`, `projects`, `routines`, `settings`, and `family`.
  - Entry points: `src/app/layout.tsx` and `src/app/page.tsx`.

- Scripts and developer workflows (run from repo root):
  - Install: `npm install`
  - Dev server: `npm run dev` (Next dev on http://localhost:3000)
  - Build production: `npm run build`
  - Preview production: `npm run start`
  - Lint: `npm run lint` (ESLint)

- Important conventions and patterns (do not invent alternatives without noting):
  - Catalog edits: modify `src/data/apps.ts` for new apps; keep `id` short/kebab-case and `primaryUrl` accurate.
  - Local data modifications: changes to IndexedDB schema must update `src/lib/db/schema.ts` and `dexie.ts` versioning; include a clear migration path or seed.
  - Use the existing UI components & Tailwind utility classes — prefer composition over new heavy dependencies.

- Integration points & external dependencies:
  - Hosting: Vercel recommended (Next.js App Router); many catalogue items point to GitHub Pages or itch.io — maintain links in `src/data/apps.ts`.
  - IndexedDB via `dexie` + `dexie-react-hooks` for client-side state persistence.

- When changing routes or adding pages:
  - Add files under `src/app/<route>` using the App Router conventions (server/client components as appropriate).
  - If adding client-side Dexie hooks, place them under `src/lib/db` and update types in `schema.ts`.

- Examples to reference when producing code or PRs:
  - Add a catalogue entry: copy object shape from `src/data/apps.ts` (id/name/type/category/status/tags/urls).
  - Seed Dexie: `src/lib/db/dexie.ts` shows `seedRoutines()` pattern.
  - Database schema: `src/lib/db/schema.ts` and `dexie.ts` show versioned `stores` usage.

- What NOT to do:
  - Do not store catalogue items in multiple places—`src/data/apps.ts` is authoritative.
  - Avoid adding new global CSS frameworks; stick with Tailwind and existing utilities.

If any guidance above is unclear or you need examples for a specific change (route, DB migration, or component), ask and include the target file path and a short goal.
