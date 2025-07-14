# What to do next

1. Create/extend semantic token classes in your Tailwind plugin (if not already):

   - `bg-surface`, `bg-panel`, `text-muted`, `text-onAccent`, `border-border`, etc.
   - Map them to CSS variables (see `app/styles/colors.css`).

2. Refactor the files above in small PRs:

   - Replace hard-coded greys/whites with semantic classes.
   - Remove conditional colour logic where possible; prefer a single class that the theme swaps via variables.
   - Run UI smoke tests in both light & dark themes.

3. Add a Playwright visual-regression snapshot for:

   - Tournaments list page
   - Teams list page
   - Any form using CustomDatePicker

4. Update design docs: note the new tokens and deprecate direct Tailwind grey/white utilities.

When these components are migrated, dark-mode coverage will be above 90%, leaving only edge-case SVG fills or static images to address.

---

# Dark-Mode Component Audit

**Goal**: “hard-coded Tailwind colour utilities” → replace with semantic tokens such as bg-background, text-foreground, border-border, etc.

1. **High-traffic Routes** -`app/routes/.../tournaments/tournaments.\_index.tsx`

   - `bg-gray-100`, `bg-gray-50`, `bg-white`, `border-gray-200`, `text-gray-*`,
     plus conditional `bg-*-600/400` colour toggles inside the status pills.
   - `app/routes/.../teams/teams._index.tsx`
      - Same pattern: card shells use `bg-white` + `border-gray-200`.

2. **Reusable Form Components**

   - `app/components/inputs/CustomDatePicker.tsx`
      - Calendar pop-over: `bg-white`, `border-gray-200`, date states `bg-gray-50`, `text-grays`.
   - `app/components/inputs/DateInputField.tsx`
      - Disabled state uses `disabled:bg-gray-100` & `disabled:text-gray-400`.
   - `app/components/inputs/TextInputField.tsx`
      - Same disabled-colour pattern.
   - `app/components/inputs/ComboField.tsx`
      - Dropdown menu shell `bg-white border-gray-200`, caret icon `text-gray-400`.

3. **Complex Forms**

   - `app/components/TournamentForm.tsx`
      - Panel progress bar still hard-codes `bg-gray-400`, `text-gray-400`, and several `bg-*-600` colour accents that should map to semantic tokens (e.g., `bg-status-active`).
   - `app/components/TeamForm.tsx` (not flagged by first 50 hits but worth checking).

4. **Misc./Visual Components**

   - `app/components/ActionLinkPanel/__tests__/PanelBackground.test.tsx` references `bg-gray-800/900` (test helpers).
   - `app/routes/mobile header sections` (header still uses `bg-slate-800` by design—confirm if this stays `brand-primary` in both themes).

5. **Border / Card Patterns**

   - Widespread `border-gray-200 bg-white rounded-lg shadow-sm` card skeleton appears in multiple list/grid views. Should become something like `bg-surface border-border`.

6. **Icons & Inline SVGs**

   - Several icons specify fixed greys `text-gray-400/500` — switch to `text-foreground` or similar so they inherit theme.
