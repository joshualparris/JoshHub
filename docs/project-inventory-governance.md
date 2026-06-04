# Project Inventory Governance

This document outlines the principles and procedures for managing the project inventory within JoshHub.

## Purpose
JoshHub's project inventory (`src/data/apps.ts`) is the central source of truth for all projects on this PC. It helps answer:
- Which projects are active?
- Which projects should be archived or deleted?
- Where is the source of truth for a project?
- What are the next steps for a project?

## Metadata Confidence Levels
To distinguish between verified data and guesses, we use three confidence levels:
- **Verified:** Manually confirmed by the user. This data should not be overwritten by automated scripts.
- **Inferred:** Guessed by an AI agent or script (e.g., based on file modification dates). Needs confirmation.
- **Needs Review:** Explicitly flagged as potentially incorrect or incomplete.

## Project Statuses
Use the following statuses to manage the project lifecycle:
- `active`: Currently being worked on.
- `maintained`: Finished but occasionally updated or used.
- `paused`: On hold, but intended to be resumed.
- `complete`: Finished and unlikely to change.
- `archive-candidate`: No longer needed, ready to be moved to external storage.
- `duplicate-candidate`: Likely a copy of another project.
- `needs-review`: Metadata or status is uncertain.
- `broken`: Project no longer builds or runs.

## Identifying Source of Truth
When multiple copies of a project exist:
1. Identify the most recent and complete version.
2. Mark it as `sourceOfTruth: true`.
3. Link other copies using `duplicateOf: "source-id"`.
4. Set a `cleanupRecommendation` for the duplicates (e.g., "Delete after verifying source of truth").

## Local Paths
Local paths (`localPath`) should be absolute paths (e.g., `C:/Projects/MyProject`). 
- **Security:** Browsers block direct `file:///` links for security.
- **Usage:** Use the "Copy Path" button in the JoshHub dashboard to quickly copy the path for use in your terminal or file explorer.

## Validation
Before committing changes to the inventory, run the validation script:
```bash
npm run validate:apps
```
This checks for duplicate IDs, broken URLs, and inconsistent metadata.

## Audit Import Workflow
When a new disk audit is performed (e.g., by GitHub Copilot):
1. Navigate to the **Import Project Audit** page in JoshHub.
2. Upload the `project-inventory.csv` file.
3. Review the matches and conflicts.
4. Manually update `src/data/apps.ts` based on the preview results.
5. **Never** silently overwrite verified metadata with inferred audit data.

## Retention Policy
**Do not delete projects solely because they are old.** 
- If a project is a duplicate, identify the source of truth first.
- If a project is complete but old, move it to `archived` status.
- Only delete projects after they have been successfully archived and verified.
