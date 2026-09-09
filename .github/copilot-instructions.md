<!-- Copilot / AI agent instructions for JoshHub -->
# JoshHub — Copilot Instructions

Brief, actionable guidance for AI coding agents working on this repository.

## Start here before editing

For any substantial coding task, read these files first and treat them as authoritative working context:

1. `AGENTS.md` — standing agent workflow, safety rules, checkpoint protocol, and engineering principles.
2. `docs/PROJECT_STATE.md` — current repository state, completed checkpoints, and exact next work.
3. `docs/code-audit/TRIAGE.md` — stabilisation order.
4. `docs/code-audit/CONFORMANCE.md` — measurable definition of conformance.
5. the relevant report under `docs/code-audit/` for the area being changed.

At session start, record the exact `main` commit SHA. Do not repeatedly rediscover or re-audit the whole repository when `main` moves; compare the delta from the recorded SHA and reconcile only relevant overlap. Never force-push over another agent's work.

The overriding rule is: **understand the owning subsystem before changing it. Do not optimise for making the diff.** No blind repository-wide replacement is acceptable.

- Project type: Next.js (App Router) + TypeScript + Tailwind CSS. App lives in `src/app`.
- UI: small shadcn-style components in `src/components`; styling via Tailwind and `class-variance-authority`.
- Data patterns:
  - Static catalogue data: `src/data/apps.ts` is the source-of-truth for the apps catalogue. New items require `id, name, type, category, status, tags, primaryUrl, urls[]`.
  - Local persistent data: IndexedDB via Dexie in `src/lib/db/*` (see `dexie.ts` and `schema.ts`). Prefer updating schema, migrations, persistence behaviour, and tests coherently.

- Routing & structure:
  - Routes are under `src/app`. Top-level routes include `dashboard`, `apps`, `life`, `notes`, `tasks`, `capture`, `health`, `calendar`, `projects`, `routines`, `settings`, and `family`.
  - Entry points: `src/app/layout.tsx` and `src/app/page.tsx`.
  - Intended dependency direction from the audit: `app -> features -> components -> lib -> data`.

- Scripts and developer workflows (run from repo root):
  - Install: `npm install`
  - Dev server: `npm run dev` (Next dev on http://localhost:3000)
  - Build production: `npm run build`
  - Preview production: `npm run start`
  - Lint: `npm run lint` (ESLint)
  - Until audit finding CFG-02 is fixed, prefer a terminating test invocation such as `npx vitest run` rather than relying on `npm test` watch mode.

- Important conventions and patterns (do not invent alternatives without documenting the decision):
  - Catalog edits: modify `src/data/apps.ts` for new apps; keep `id` short/kebab-case and `primaryUrl` accurate.
  - Local data modifications: changes to IndexedDB schema must update `src/lib/db/schema.ts` and Dexie versioning/migration behaviour; include a clear migration path where required.
  - Backup/reset/import changes require behavioural tests. The core supported-backup invariant is: **export -> wipe -> import reproduces all user-owned persisted state represented by that backup version.**
  - Use the existing UI components & Tailwind utility classes — prefer composition over new heavy dependencies.
  - Static/demo/example values must be explicitly labelled; do not present them as current user data.
  - Verify imports/usages/history before deleting unused scaffolding. Delete only genuinely obsolete or actively misleading duplicates.

- Integration points & external dependencies:
  - Hosting: Vercel recommended (Next.js App Router); many catalogue items point to GitHub Pages or itch.io — maintain links in `src/data/apps.ts`.
  - IndexedDB via `dexie` + `dexie-react-hooks` for client-side state persistence.

- When changing routes or adding pages:
  - Add files under `src/app/<route>` using the App Router conventions (server/client components as appropriate).
  - If adding client-side Dexie hooks, place them under `src/lib/db` and update types in `schema.ts`.

- Atomic delivery rule:
  - implement one coherent change;
  - run the relevant focused verification;
  - commit it immediately;
  - when direct-to-`main` work has been authorised, push the verified checkpoint immediately;
  - update `docs/PROJECT_STATE.md` and any affected audit finding/status;
  - then begin the next change.

- What NOT to do:
  - Do not store catalogue items in multiple places — `src/data/apps.ts` is authoritative.
  - Do not create parallel backup/persistence systems when the canonical layer can be reused.
  - Avoid adding new global CSS frameworks; stick with Tailwind and existing utilities.
  - Do not use successful deploy/build status as proof that user-data behaviour is correct.
  - Do not hold several completed fixes uncommitted while continuing optional investigation.

If guidance conflicts, prefer `AGENTS.md`, then `docs/PROJECT_STATE.md`, then the current code-audit documents. Record any architectural decision that changes these rules in the same checkpoint as the code change.