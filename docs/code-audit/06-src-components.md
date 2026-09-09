# 06 — `src/components`

**Area:** shared UI primitives and shared feature-facing components.

This report was originally written before the large 9 September stabilisation sequence. It is reconciled here against the later commits that changed these findings. Re-enumerate the current directory before claiming full file-by-file coverage because several Platform/Care components moved across the enforced feature boundary after the original inventory was recorded.

---

## Findings

### [x] COMP-01 — Theme toggle did not drive `dark:` styling · Critical
- **Principles:** P2, P6, P13
- **Original problem:** Tailwind dark variants followed OS preference instead of JoshHub's `data-theme` selection.
- **Resolution:** `492eb54` connected the theme attribute to Tailwind's dark variant; merge `e0d569d` preserved the theme work alongside concurrent formatting/layering changes.
- **Status:** Fixed in `492eb54` / `e0d569d`.

### [x] COMP-02 — Semantic colour tokens were not registered · High
- **Principles:** P2, P13
- **Original problem:** semantic utilities such as `bg-card`, `text-muted-foreground`, `border-border` and `ring-ring` referenced unregistered Tailwind v4 theme tokens.
- **Resolution:** the theme-system checkpoint registered the semantic tokens and migrated the uncovered views.
- **Status:** Fixed in `492eb54` / `e0d569d`.

### [x] COMP-03 — Shared Button/Separator lacked coherent dark styling · High
- **Principles:** P13
- **Original problem:** common shared controls were light-only while the app offered a dark theme.
- **Resolution:** shared controls were moved onto the repaired semantic theme system.
- **Status:** Fixed in `492eb54` / `e0d569d`.

### [x] COMP-04 — CSV preview defined a second local `Input` · Medium
- **Principles:** P2, P3
- **Original problem:** `src/components/inventory/csv-import.tsx` declared its own `Input` instead of using the canonical shared control.
- **Resolution:** PR #10 removes the local duplicate and imports `@/components/ui/input`.
- **Status:** Fixed in PR #10 corrective checkpoint (pending merge while this branch is in review).

### [x] COMP-05 — `Export Merged JSON` button did nothing · Medium
- **Principles:** P8
- **Original problem:** the preview rendered a control with no handler, implying a capability that did not exist.
- **Resolution:** PR #10 removes the non-functional control rather than inventing product scope merely to preserve the button.
- **Status:** Fixed in PR #10 corrective checkpoint (pending merge while this branch is in review).

### [x] COMP-06 — CSV import silently misaligned quoted-comma rows · Medium
- **Principles:** P7, P11, P15, P18
- **Original problem:** `line.split(",")` shifted columns whenever quoted content contained commas and did no runtime row validation.
- **Resolution history:**
  - `6da5fff` extracted parsing from the React component and added Zod row validation/tests, but its custom parser still accepted ambiguous malformed quote syntax, did not enforce row/header field counts, and reported logical row indexes rather than physical source lines after multiline records.
  - PR #10 tightens the parser state machine, rejects malformed quote placement, validates blank/duplicate headers and exact column counts, preserves arbitrary metadata values, tracks physical record start lines, and expands regression tests.
- **Status:** Fixed in PR #10 corrective checkpoint (pending merge while this branch is in review).

### [x] COMP-07 — Recent list read `localStorage` during render · Medium
- **Principles:** P6
- **Original problem:** browser storage seeded React state during render/hydration.
- **Resolution:** the client-storage checkpoint moved the relevant read/migration work behind mounted client effects/canonical persisted state.
- **Status:** Fixed in `1881aae`.

### [ ] COMP-08 — Component export/naming conventions remain mixed · Low
- **Principles:** P13
- **Current problem:** Prettier now enforces formatting, but formatting alone does not make named/default export and component naming conventions uniform.
- **Fix:** reconcile opportunistically as components are touched; avoid a noisy repo-wide rename campaign.
- **Status:** Open.

### [ ] COMP-09 — Personal prompt context hardcoded in a component · Low
- **Principles:** P3, P8
- **Where:** `src/components/learn/StudyPromptButton.tsx`
- **Problem:** default personal context is embedded in component code rather than editable user state, and feedback uses an inconsistent `alert()` path.
- **Fix:** confirm the current Learn settings contract, then move editable context into canonical settings and use normal inline feedback.
- **Status:** Open.

### [x] COMP-10 — Unknown `StatusChip` status could crash · Low
- **Principles:** P11, P16, P18
- **Original problem:** untrusted/stale stored status strings could index a missing colour entry.
- **Resolution:** unknown status values now degrade through the safe fallback instead of crashing the component.
- **Status:** Fixed in `1881aae`.

### [x] COMP-11 — Redundant ESLint suppression in theme toggle · Low
- **Principles:** P13
- **Original problem:** an unused lint suppression hid signal in already-noisy lint output.
- **Resolution:** removed during the coherent theme-system cleanup.
- **Status:** Fixed in `492eb54` / `e0d569d`.

---

## Current area summary

Known live findings in this report after PR #10: **COMP-08 and COMP-09**.

The component area should still receive opportunistic line-by-line coverage as files are touched because the original file inventory predates the feature-boundary moves. Do not infer that only these two issues exist across every current component; this summary means only that the eleven findings originally recorded here have been reconciled.
