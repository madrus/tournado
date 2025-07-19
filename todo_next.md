# Panel Refactor & Tailwind v4 Dark-Variant Migration Plan

> Owner: **frontend team**
> Status: **Draft – please keep this file up-to-date**

---

## 🎯 Goal

Unify every “panel-like” UI element under **one generic `Panel` wrapper** (capital-P directory), adopt native Tailwind v4 `@dark:` syntax across the codebase, and retire the old implementation only after all imports are updated.

---

## Phase 1 · Preparation

- [x] Create tracking branch `feat/panel-refactor`.
- [x] Inventory legacy usage:
   ```bash
   grep -R "from '~/components/Panel'" app | wc -l
   grep -R "getPanelClasses(" app | wc -l
   ```
- [x] Produce a checklist of legacy callers and test files.
- [x] **Validation & commit:** ensure `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass; commit the branch state.

---

## Phase 2 · Legacy Isolation

- [x] **Rename file** `app/components/Panel.tsx` → `app/components/PanelOld.tsx` and `export function PanelOld …`.
- [x] **Automated import shim** – temporarily rewrite existing imports:
   ```ts
   import { PanelOld as Panel } from '~/components/PanelOld'
   ```
- [x] Ensure the repo compiles with the shim in place.
- [x] **Validation & commit:** repo must lint, type-check, and test cleanly; push interim commit.

---

## Phase 3 · New Package

- [x] Create directory structure:
   ```
   app/components/Panel/
     ├─ Panel.tsx            # generic wrapper
     ├─ panel.variants.ts    # Tailwind-v4 CVA map
     ├─ index.ts             # barrel export
     └─ panel.types.ts       # shared types (optional)
   ```
- [x] Copy `components/shared/panel.variants.ts` → `panel.variants.ts` and replace every `dark:` with `@dark:`.
- [x] Keep the old shared variant file in place until Phase 6.
- [x] **Create Panel.tsx** making it possible to implement the following variants:
   - [x] Static background panel `<div className="absolute inset-0" />` using `panelVariants({ color })`.
   - [x] Base content container (`opacity-100 group-hover:opacity-0`).
   - [x] Optional hover overlay (`opacity-0 group-hover:opacity-100`) rendered only when `hoverColor` prop is provided.
- [x] **Compliance check:** `grep -R --line-number "dark:" app/components/Panel | grep -v "@dark:"` returns no results (ensures Panel package uses only `@dark:` syntax).
- [x] Replace every `dark:` utility inside **panel-specific** TypeScript/JSX code (variants, tests) with `@dark:` to use the new inline directive.
- [x] **Validation & commit:** all quality checks pass; open draft PR or commit.

---

## Phase 4 · Early-Adopter Migration

- [x] **Trim ActionLinkPanel files**
   - [x] Refactor `PanelBackground.tsx` and `PanelLayer.tsx` via the new `Panel`.
   - [x] **Fixed height issues:** Restored three-layer architecture with proper positioning (base: `relative z-20`, hover: `absolute inset-0 z-30`)
   - [x] **Fixed hover transitions:** Proper opacity transitions (750ms) between base and hover layers
   - [x] **Fixed brand color mapping:** Brand colors now use semantic gradients that map to red (light) and slate (dark)
   - [x] **Fixed icon color on hover:** Icons properly change to red when hovering with `hoverColor='brand'`
   - [x] **Fixed children text color:** Children text maintains original color (doesn't change on hover)
   - [x] **Fixed duplicate borders:** Removed conflicting styling between PanelBackground and Panel component
   - [ ] Update/replace unit tests to cover hover opacity toggle and link behaviour.
- [x] **Admin dashboard (5 tiles)** – verify UI in light & dark mode; gradients must still match the `@variant dark` overrides in `tailwind.css`.
- [x] **CVA Compliance Issues Identified:**
   - [ ] Use semantic class names (`panel-teal`, `panel-brand`) in ActionLinkPanel and its children as much as possible → fix usage of the actual Tailwind classes
- [x] **Validation & commit:** run full quality suite; merge PR-1 once green.

---

## Phase 5 · Incremental Adoption

- [x] Migrate `TeamForm`, `TournamentForm`, and any list/index pages to the new `Panel` API.
- [x] Convert all `dark:` utilities in touched files to `@dark:`.
- [x] Run `vitest` + Playwright visual tests.
- [x] **Eliminate `getPanelClasses`**
   - [x] Replace each call with `panel.variants` helpers or direct Tailwind classes.
   - [x] Update associated unit tests and snapshots.
- [x] **Validation & commit:** ensure lint/type/test pass after each migrated file set; commit frequently.

---

## Phase 6 · Comprehensive Panel Refactoring & Cleanup

### 6.1 Enhanced Panel Component Development

- [x] **Enhance Panel component** to support all identified use cases:
   - [x] Add `variant` prop: `'content-panel' | 'dashboard-panel' | 'form-panel'` (semantic variants)
   - [ ] Add `size` prop: `'sm' | 'md' | 'lg'` for different panel scales
   - [ ] Add `number` prop for form step indicators (migrate from TeamForm/TournamentForm)
   - [ ] Add `disabled` prop for form step progression
   - [ ] Add interaction props: `onClick`, `href` for action panels
   - [x] Ensure backward compatibility with existing ActionLinkPanel usage (layer variants preserved)

### 6.2 Content Panel Migration (Simple → Complex)

- [x] **TeamForm success message migration:**
   - [x] Replace custom div with Panel component using `variant='content-panel'`
   - [x] Convert icon structure to use Panel's `icon` prop
   - [x] Maintain existing visual styling and behavior
   - [x] Simplify component structure (15 lines → 8 lines)
- [ ] **TournamentForm success message migration:**
   - [ ] Same migration steps as TeamForm
   - [ ] Ensure consistent success message behavior across forms
- [ ] **Other content panels:** Audit and migrate any remaining content-like divs

### 6.3 Dashboard Panel Migration

- [ ] **Enhance Panel for dashboard variant:**
   - [ ] Add structured layout for metrics display
   - [ ] Optimize icon positioning for stats
   - [ ] Add consistent theming support
- [ ] **Admin Teams route migration:**
   - [ ] Convert stat panels to use Panel component with `variant='dashboard-panel'`
   - [ ] Maintain consistent 'teal' color theme throughout admin section
   - [ ] Update team list containers to use Panel
   - [ ] Ensure responsive behavior on mobile/desktop
- [ ] **Other admin routes:** Audit and migrate panel-like components in other admin sections

### 6.4 Form Panel Migration (Most Complex)

- [ ] **Enhance Panel for form variant:**
   - [ ] Add numbered step support (panelNumber prop integration)
   - [ ] Add progressive disclosure (disabled state styling)
   - [ ] Add form-optimized layout and spacing
   - [ ] Add validation state integration
- [ ] **TeamForm step panels migration:**
   - [ ] Replace `PanelOld` imports with new `Panel` component
   - [ ] Migrate `PANEL_COLORS` usage to new Panel `color` prop
   - [ ] Update step numbering to use Panel `number` prop
   - [ ] Convert panel title/description styling to Panel `title`/`subtitle` props
   - [ ] Test form progression and disabled state behavior
- [ ] **TournamentForm step panels migration:**
   - [ ] Same migration steps as TeamForm
   - [ ] Ensure consistent multi-step panel behavior
   - [ ] Verify all form interactions work correctly

### 6.5 Legacy Component Cleanup

- [ ] Run repo-wide codemod:
   ```bash
   npx jscodeshift -t scripts/codemods/dark-to-dark.js app/components
   ```
- [ ] **Delete legacy files:**
   - [ ] `app/components/PanelOld.tsx`
   - [ ] `app/components/shared/panel.variants.ts`
   - [ ] `app/styles/panel.styles.ts` (removes `getPanelClasses` and legacy helpers)
- [ ] **Remove temporary import shims:**
   - [ ] Remove all `PanelOld as Panel` import statements
   - [ ] Update remaining direct `PanelOld` references
- [ ] **Clean up variant files:** Remove any duplicate or unused panel variant definitions

### 6.6 Testing & Validation

- [ ] **Visual regression testing:**
   - [x] Verify TeamForm success message renders correctly
   - [ ] Test TournamentForm success message
   - [ ] Test admin dashboard panel layouts
   - [ ] Confirm ActionLinkPanel hover effects still work
   - [ ] Test dark/light mode transitions across all panel types
- [ ] **Functional testing:**
   - [ ] Test form progression (disabled → enabled panel states)
   - [ ] Verify panel click/navigation behavior
   - [ ] Test responsive behavior on different screen sizes
- [ ] **Accessibility testing:**
   - [ ] Ensure panel focus management works correctly
   - [ ] Verify ARIA labels and semantic structure
   - [ ] Test keyboard navigation through form panels

### 6.7 Final Cleanup

- [ ] **Validation & commit:** final green run of lint, typecheck, tests before deleting legacy files; open PR-2.
- [ ] **Remove legacy declaration** `@custom-variant dark (&:where(.dark, .dark *));` from `app/styles/tailwind.css` once all other files compile with `@dark:` or `@variant dark`.
- [ ] **Documentation update:** Update any component documentation to reflect new Panel API
- [ ] **Performance audit:** Ensure no CSS duplication or unused styles remain

---

## Phase 7 · Guardrails

- [ ] Add ESLint / CI check to reject `dark:` classes (that aren’t `@dark:`) in any `*.tsx` under `app/components/`.
   ```bash
   grep -R --line-number "dark:" app/components | grep -v "@dark:" && exit 1
   ```
- [ ] **Validation & commit:** CI must fail if rule violated; merge guardrail enforcement PR.

---

## Deliverables

- Capitalised folder \*\*`
