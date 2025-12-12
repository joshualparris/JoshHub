# JoshHub Tasks (agent-safe, bite-size)

## Build / Config Stability

### Task 1 — Remove invalid Next 16 eslint config
**Goal:** Stop Next 16 warning about invalid `eslint` key.
**Files:** `next.config.ts`
**Acceptance criteria:**
- `npm run dev` shows no warning about `eslint` key in `next.config.ts`
- `npm run lint` still returns 0 errors (warnings ok)
- `npm run build` passes

### Task 2 — Supabase server client stays Next 16-compatible
**Goal:** Ensure server client is compatible with async `cookies()`.
**Files:** `src/lib/supabase/server.ts` (+ any call sites)
**Acceptance criteria:**
- `createClient` is `async`
- Uses `const cookieStore = await cookies()`
- `npm run build` passes
- No runtime crash on auth-protected pages (if any)

### Task 3 — ESLint “no churn” rule
**Goal:** Avoid reintroducing typed/circular ESLint failures.
**Acceptance criteria:**
- No new ESLint config packages added without a task explicitly calling for it
- `npm run lint` remains 0 errors

---

## Dark Mode Contrast Fixes (Tokens Only)

### Task 4 — Apps search readability in dark mode
**Goal:** Fix unreadable search input + results in dark mode using theme tokens.
**Scope:** `/apps` search input, filters, result text, placeholders, borders.
**Acceptance criteria:**
- Search input text uses `text-foreground`
- Placeholder uses `text-muted-foreground`
- Input background uses `bg-background` or `bg-card`
- Borders use `border-border`
- No raw `slate-*` / `neutral-*` colour classes added
- Visually readable in dark mode (manual check)

### Task 5 — Dashboard “Life focus” contrast fix
**Goal:** Make Life Focus widget readable in dark mode.
**Scope:** dashboard/home component that renders “Life focus”.
**Acceptance criteria:**
- Title uses `text-foreground`
- Supporting text uses `text-muted-foreground`
- Container uses `bg-card` with `border-border` (or equivalent token combo)
- Any badges/chips remain readable in dark mode
- No raw `slate-*` / `neutral-*` colour classes added

---

## /apps UX Refactor (Pinned + Pills + Sorting)

### Task 6 — Add LocalStorage pinning hook
**Goal:** Pin apps by ID and persist between sessions.
**Files:** `src/features/apps/hooks/usePinnedApps.ts`
**Acceptance criteria:**
- Hook supports: `isPinned(id)`, `togglePinned(id)`, `pinnedIds`
- Stored under a single LocalStorage key (e.g. `joshhub:pinnedApps`)
- Safe on SSR (guards for `window`)
- Unit sanity: refresh page preserves pins

### Task 7 — Add pin button on AppCard
**Goal:** Pin/unpin from each card with clear affordance.
**Files:** `src/features/apps/AppCard.tsx` (and AppGrid wiring)
**Acceptance criteria:**
- Pin icon button exists on each card
- Accessible label changes (“Pin app”, “Unpin app”)
- Pinned state is visually indicated
- Clicking doesn’t break card links / primary actions

### Task 8 — Pinned-first sorting
**Goal:** Sort pinned apps first, then by status, then name.
**Acceptance criteria:**
- Sorting is stable and deterministic
- Pinned always appear above non-pinned
- Status order is defined (document it in code)
- Name sort is case-insensitive

### Task 9 — Context pills component
**Goal:** Horizontal pills that filter by tag/category quickly.
**Files:** `src/features/apps/contextPills.tsx`
**Acceptance criteria:**
- Pills render from available tags/categories in data
- Clicking toggles filter
- Clear “active” styling using tokens
- Keyboard accessible

### Task 10 — Tag chips + note truncation
**Goal:** Improve scan-ability of cards.
**Acceptance criteria:**
- Tags render as small chips/pills (token-based)
- Notes truncate to N lines with “more” affordance or tooltip
- Layout doesn’t jump excessively between cards

### Task 11 — Highlight search matches
**Goal:** Make search results easier to scan.
**Acceptance criteria:**
- Matching substrings highlighted in name/tags/notes
- Highlight style uses tokens (no raw slate/neutral)
- Works in light + dark mode

### Task 12 — Status badge colours (token-aligned)
**Goal:** Improve status badge contrast without hardcoding random colours.
**Acceptance criteria:**
- Uses semantic token-friendly classes (or a small mapping that stays consistent)
- Badges are readable in dark mode
- No neon/low-contrast combos

### Task 13 — Header/search/filter UX pass
**Goal:** Make filters feel “product-y” and fast.
**Acceptance criteria:**
- Search is prominent
- Filters are compact and aligned
- Clear/reset filters control exists
- Works well on mobile widths

---

## Prompt Backlog → Solid Tasks (Process)

### Task 14 — Convert “Prompt backlog” bullets into numbered tasks
**Goal:** Every bullet becomes a real task with acceptance criteria.
**Acceptance criteria:**
- Each prompt backlog bullet becomes `Task PB-XX — <verb phrase>`
- Each includes: Goal, Files/Scope (if known), Acceptance criteria
- No vague “improve” tasks; each must be testable

### Task 15 — Add “Prompt backlog” section template (for ongoing)
**Goal:** Make it easy to keep backlog tidy.
**Acceptance criteria:**
- A template block exists for adding new prompt ideas
- A one-line rule: “No bullets remain unconverted for >7 days”

---

## Deployment

### Task 16 — GitHub push (main) with clean build proof
**Acceptance criteria:**
- Repo has `origin` set
- `main` pushed
- Latest commit message references tasks completed
- `npm run build` passing before push

### Task 17 — Vercel deploy with env vars
**Acceptance criteria:**
- Vercel project created/imported
- Required env vars set (Preview + Production)
- Deploy succeeds
- App loads `/` and `/apps` without runtime errors
