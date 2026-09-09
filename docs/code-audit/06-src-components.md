# 06 — `src/components`

**Area:** shared UI — the `ui/` primitives plus feature-specific cards, lists and
the global search.
**Files reviewed:** 26 of 32 read in full. The remaining 6
(`project-inventory-card`, `learn/PromptTemplatesEditor`, `learn/ImportTopicsModal`,
`platform/decisions-list`, `platform/opportunities-list`, `platform/weekly-review`)
were checked by targeted search for the cross-cutting patterns below — every
finding marked *(repo-wide)* was counted across all 32 files, so those counts are
complete. Give those six a full read when COMP-01 is fixed.

**This area contains the two highest-blast-radius findings in the audit so far.**
Both are single-line causes with app-wide effects, and both explain a long tail
of "contrast polish" commits in the git history that were treating symptoms.

---

## Findings

### [ ] COMP-01 — The theme toggle does not drive any `dark:` styling · Critical
- **Principles:** P2, P6, P13
- **Where:** `src/app/globals.css`, `src/components/theme-toggle.tsx`, and 504 `dark:` usages *(repo-wide)*
- **Problem:** The project uses Tailwind v4 in CSS-first mode (`@import "tailwindcss"`,
  no config file). In v4 the `dark:` variant defaults to the
  `prefers-color-scheme` media query, and it only becomes class- or
  attribute-driven if you declare a custom variant. `globals.css` declares none.

  Meanwhile `applyTheme()` sets `data-theme` on `<html>` and toggles a `.dark`
  class on `<body>` — neither of which Tailwind's `dark:` variant looks at. So:
  - The toggle changes only the CSS custom properties under
    `:root[data-theme="dark"]` and the `body.dark` background gradient.
  - All **504** `dark:` utilities follow the operating system instead.
- **Why it matters:** Two independent things decide how the app looks, and they
  disagree. A user on a light OS who switches the app to dark gets a dark page
  background with light-mode cards, text and borders on top of it. A user on a
  dark OS gets dark cards even with the toggle on "light". This is almost
  certainly the root cause of the recurring contrast work in the history
  (`dd528dc` "Fix contrast…", `96f96be` "Polish life pages contrast", tasks 1
  and 2 in `docs/tasks.md`) — each one adjusted individual colours instead of
  the variant.
- **Fix:** One line in `globals.css`, so the variant follows the attribute the
  toggle already sets:
  ```css
  @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
  ```
  Then verify a few screens in both modes. **Expect this to reveal contrast
  problems that were previously invisible** — dark styles will apply for the
  first time on a light OS. Do it before any further colour tuning, or that
  tuning is wasted.
- **Status:** Open

### [ ] COMP-02 — 110 colour classes reference tokens that were never registered · High
- **Principles:** P2, P13
- **Where:** `src/app/globals.css` (`@theme inline`), used *(repo-wide)*
- **Problem:** `@theme inline` registers exactly two colours —
  `--color-background` and `--color-foreground`. Tailwind v4 only generates
  utilities for what is registered there, so `bg-background` and `text-foreground`
  work and everything else in the palette does not. Current usage:

  | Class | Uses | Exists? |
  |---|---|---|
  | `text-muted-foreground` | 56 | No |
  | `text-card-foreground` | 26 | No |
  | `bg-muted` | 16 | No |
  | `ring-ring` | 6 | No |
  | `bg-card` | 4 | No |
  | `border-border` | 2 | No |
  | `text-foreground` | 20 | Yes |
  | `bg-background` | 4 | Yes |

  `globals.css` defines `--card`, `--muted` and `--border` as CSS variables, so
  the intent was clearly there — they were just never mapped into `@theme`.
- **Why it matters:** 110 elements silently render with inherited colour instead
  of the intended one. Because the text usually still *appears*, this reads as a
  vague "contrast is a bit off" rather than an obvious bug, which is why it has
  survived. It also means two styling vocabularies are in play — semantic tokens
  and raw `neutral-*`/`slate-*` — and only one of them works.
- **Fix:** Register the rest in `@theme inline`:
  ```css
  --color-card: var(--card);
  --color-card-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted);
  --color-border: var(--border);
  --color-ring: var(--accent);
  ```
  Then pick semantic tokens as the standard and migrate raw palette classes
  gradually. Fix together with COMP-01 — they are the same underlying problem of
  a half-finished theming system.
- **Status:** Open

### [ ] COMP-03 — `Button` has no dark-mode styling at all · High
- **Principles:** P13
- **Where:** `src/components/ui/button.tsx`
- **Problem:** All three variants are light-only: `default` is
  `bg-black text-white`, `outline` is `bg-white text-neutral-900`, `ghost` is
  `text-neutral-900 hover:bg-neutral-100`. No `dark:` classes anywhere.
- **Why it matters:** `Button` is the most-used component in the app. Once
  COMP-01 is fixed and dark mode genuinely applies, every outline and ghost
  button becomes near-black text on a dark card. `Separator` has the same problem
  (`bg-neutral-200`, no dark variant).
- **Fix:** Add dark variants to each button variant and to `Separator`. Best done
  immediately after COMP-01, since that is when the breakage becomes visible.
- **Status:** Open

### [ ] COMP-04 — A second `Input` component defined inside a page component · Medium
- **Principles:** P2, P3
- **Where:** `src/components/inventory/csv-import.tsx` (bottom of file)
- **Problem:** The file imports nothing from `@/components/ui/input` and instead
  declares its own local `Input` at the bottom, styled with token classes that
  do not exist (`border-input`, `bg-background`, `ring-offset-background`).
- **Why it matters:** Two `Input` components with different styling, one of them
  invisible to anyone searching `src/components/ui`. Changes to the shared input
  will not reach this screen.
- **Fix:** Delete the local one and import the shared `Input`.
- **Status:** Open

### [ ] COMP-05 — "Export Merged JSON" button does nothing · Medium
- **Principles:** P8
- **Where:** `src/components/inventory/csv-import.tsx`
- **Problem:** The button is rendered with no `onClick` and no handler anywhere.
  Clicking it does nothing at all.
- **Why it matters:** The UI promises a capability the app does not have, with no
  indication it is unfinished. That is the same class of problem as showing
  invented figures as live data.
- **Fix:** Implement the export, or remove the button until it exists. If it is a
  deliberate placeholder, disable it and label it.
- **Status:** Open

### [ ] COMP-06 — CSV parser breaks on quoted fields containing commas · Medium
- **Principles:** P11
- **Where:** `src/components/inventory/csv-import.tsx` (`handleFileUpload`)
- **Problem:** Parsing is `line.split(",")`. Any quoted field containing a comma —
  routine in exported audit data, e.g. a notes column — shifts every subsequent
  column on that row.
- **Why it matters:** Import silently produces misaligned data, and the preview
  then reports confident match/conflict counts based on it.
- **Fix:** Use a real CSV parse (handling quotes and escaped quotes), and add
  tests with a quoted-comma row. The parse is pure, so it is easy to test once
  extracted from the component (P7).
- **Status:** Open

### [ ] COMP-07 — localStorage read during render, a third time · Medium
- **Principles:** P6
- **Where:** `src/components/recent-list.tsx:12`
- **Problem:** `useState<RecentItem[]>(() => loadRecent())` — the same hydration
  mismatch pattern fixed on the dashboard in `ead6146` and still present in
  `usePinnedApps` (FEAT-05).
- **Why it matters:** Three occurrences of one mistake means the pattern, not the
  instance, is the problem. `recent-list.tsx` also has no `dark:` styling at all.
- **Fix:** Fix all three together by adopting `useHydrated`/`ClientOnly`
  (LIB-02), so there is one blessed way to read browser-only state.
- **Status:** Open

### [ ] COMP-08 — Mixed export style and indentation across components · Low
- **Principles:** P13
- **Where:** *(repo-wide)* `games/GameCard`, `learn/TopicCard`,
  `learn/StudyPromptButton`, `platform/moveops-list`, `platform/today-focus`,
  `platform/platform-card` use `export default` and four-space indentation; the
  other 26 use named exports and two spaces.
- **Why it matters:** No inferable rule, so every new component is a coin flip,
  and mixed indentation produces noisy diffs when editors reformat.
- **Fix:** Standardise on named exports and two spaces, and adopt Prettier so it
  is enforced rather than remembered (area 08).
- **Status:** Open

### [ ] COMP-09 — A personal context string is hardcoded in a component · Low
- **Principles:** P3, P8
- **Where:** `src/components/learn/StudyPromptButton.tsx`
- **Problem:** The default prompt context is the literal string "Australian
  Christian husband/dad, health + routines focus, wants practical steps and
  Scripture where relevant." It also reports success with `alert()`.
- **Why it matters:** Personal content baked into a component cannot be edited
  from the UI, and `alert()` is inconsistent with how every other screen gives
  feedback.
- **Fix:** Move the default context into the existing `learnSettings` table
  (which already stores prompt templates) so it is editable, and replace the
  alert with inline confirmation.
- **Status:** Open

### [ ] COMP-10 — `StatusChip` will crash on an unknown status · Low
- **Principles:** P11
- **Where:** `src/components/status-chip.tsx`
- **Problem:** `statusColors[status].className` with no fallback. TypeScript
  covers all 12 statuses, but `apps.ts` is hand-maintained data and
  `recent-list.tsx` casts a stored string with `item.status as AppStatus`, so a
  value from older localStorage can reach it untyped.
- **Why it matters:** A stale stored value would throw and blank the component.
- **Fix:** Fall back to the `unknown` entry when the status is not recognised.
  Pairs with the catalogue validation in DATA-08.
- **Status:** Open

### [ ] COMP-11 — Unused eslint-disable directive · Low
- **Principles:** P13
- **Where:** `src/components/theme-toggle.tsx:3`
- **Problem:** `/* eslint-disable react-hooks/set-state-in-effect */` suppresses a
  rule that reports nothing — ESLint already flags the directive as unused.
- **Why it matters:** One of ten standing warnings that make lint output easy to
  ignore.
- **Fix:** Remove it. Clear all ten warnings together.
- **Status:** Open
