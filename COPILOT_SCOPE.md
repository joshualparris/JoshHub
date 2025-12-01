Copilot branch scope
===================

- Copilot changes restricted to `src/lib/**` only in this branch.
- Do not edit any files under `src/app/**` while Codex finishes Prompt 4.
- Avoid editing Dexie schema files (`src/lib/db/dexie.ts`, `src/lib/db/schema.ts`) in this branch.
- This branch contains foundation modules (models, seeds, pure logic, in-memory repos) only.
- Codex will implement the Dexie adapters and UI wiring after Prompt 4 completes.

Branch: `copilot/prompt-16-foundation`
