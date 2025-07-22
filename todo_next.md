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
   - [x] Add `panelNumber` prop for form step indicators (completed - used in forms)
   - [x] Add `disabled` prop for form step progression (completed - used in forms)
   - [ ] Add interaction props: `onClick`, `href` for action panels
   - [x] Ensure backward compatibility with existing ActionLinkPanel usage (layer variants preserved)

### 6.2 Content Panel Migration (Simple → Complex)

- [x] **TeamForm success message migration:**
   - [x] Replace custom div with Panel component using `variant='content-panel'`
   - [x] Convert icon structure to use Panel's `icon` prop
   - [x] Maintain existing visual styling and behavior
   - [x] Simplify component structure (15 lines → 8 lines)
- [x] **TournamentForm success message migration:**
   - [x] Same migration steps as TeamForm
   - [x] Ensure consistent success message behavior across forms
   - [x] Fix failing tests (PanelLayer variant and Panel test expectations)
- [x] **Other content panels:** Audit completed - no remaining PanelOld imports found

### 6.3 Dashboard Panel Migration

- [x] **Enhance Panel for dashboard variant:**
   - [x] Add structured layout for metrics display with horizontal icon + stats layout
   - [x] Optimize icon positioning for stats (CVA-based `dashboardIconVariants`)
   - [x] Add consistent theming support with independent panel/icon color control
   - [x] Add RTL support for dashboard layouts and positioning
- [x] **Admin Teams route migration:**
   - [x] Convert stat panels to use Panel component with `variant='dashboard-panel'`
   - [x] Maintain consistent 'teal' color theme throughout admin section
   - [x] Update team list containers to use Panel with `variant='content-panel'`
   - [x] Ensure responsive behavior on mobile/desktop
- [x] **Admin Tournaments route migration:**
   - [x] Convert stat panels to use Panel component with `variant='dashboard-panel'`
   - [x] Update tournament list containers to use Panel with `variant='content-panel'`
   - [x] Add glow effects with `showGlow` prop
- [x] **Other admin routes:** Audit completed - no remaining legacy panel usage found

### 6.4 Form Panel Migration (Most Complex)

- [x] **Enhance Panel for form variant:**
   - [x] Add numbered step support (panelNumber prop integration)
   - [x] Add progressive disclosure (disabled state styling)
   - [x] Add form-optimized layout and spacing
   - [x] Add CVA color variants for subtitle styling
   - [x] Fix layout constraints to preserve justify-between and grid layouts
- [x] **TeamForm step panels migration:**
   - [x] Replace `PanelOld` imports with new `Panel` component
   - [x] Migrate `PANEL_COLORS` usage to new Panel `color` prop
   - [x] Update step numbering to use Panel `panelNumber` prop
   - [x] Convert panel title/description styling to Panel `title`/`subtitle` props
   - [x] Test form progression and disabled state behavior
- [x] **TournamentForm step panels migration:**
   - [x] Same migration steps as TeamForm
   - [x] Ensure consistent multi-step panel behavior using Panel title/subtitle props
   - [x] Fix subtitle coloring to match panel colors using CVA variants
   - [x] Verify all form interactions work correctly

### 6.5 Legacy Component Cleanup

- [x] **Field variants extraction:**
   - [x] Create `app/components/shared/field.variants.ts` with semantic classes (`checkmark-brand`, `field-error-icon`)
   - [x] Add semantic CSS classes to `tailwind_components.css` using color variables
   - [x] Update `FieldCheckmark`, `FieldErrorIcon`, `FieldStatusIcon` to import from field variants
   - [x] Remove field-specific variants from `shared/panel.variants.ts`
   - [x] Add field variants to `shared/index.ts` exports
- [ ] **Outstanding migrations:**
   - [ ] Migrate `app/routes/teams/teams.$teamId.tsx` to use new Panel component (currently uses legacy panel variants)
- [ ] **Delete legacy files:**
   - [x] `app/components/PanelOld.tsx`
   - [ ] `app/components/shared/panel.variants.ts` _(blocked by `app/routes/teams/teams.$teamId.tsx` - requires Panel migration)_
   - [ ] `app/styles/panel.styles.ts` (removes `getPanelClasses` and legacy helpers)
- [x] **Remove temporary import shims:**
   - [x] Remove all `PanelOld as Panel` import statements
   - [x] Update remaining direct `PanelOld` references
- [ ] **Clean up variant files:** Remove any duplicate or unused panel variant definitions
- [x] **Note:** Current `dark:` syntax in component variants is correct and should remain unchanged (Tailwind CSS v4 still uses `dark:` syntax)

### 6.5 RTL Support & Internationalization

- [x] **RTL-aware positioning:**
   - [x] Update glow effect positioning (top-right LTR → top-left RTL)
   - [x] Update gradient directions (bottom-right LTR → bottom-left RTL)
   - [x] Test Arabic language support with proper glow and gradient mirroring
- [x] **CSS class updates:**
   - [x] Add `rtl:-left-8 rtl:right-auto` to panel glow variants
   - [x] Add `rtl:bg-gradient-to-bl` to all panel background classes
   - [x] Ensure all panel variants support RTL languages
- [x] **Testing coverage:**
   - [x] Add RTL-specific unit tests for glow positioning
   - [x] Add comprehensive CVA variant testing
   - [x] Test dashboard variant with RTL layout
   - [x] Fix Testing Library violations in panel tests
   - [x] Update unit tests for colored subtitle classes (panelDescriptionVariants)

### 6.6 Testing & Validation

- [x] **Visual regression testing:**
   - [x] Verify TeamForm success message renders correctly
   - [x] Test TournamentForm success message (all 1,223 tests passing)
   - [x] Test admin dashboard panel layouts with proper metrics display
   - [x] Confirm ActionLinkPanel hover effects still work
   - [x] Test dark/light mode transitions across all panel types
- [x] **RTL testing:**
   - [x] Verify glow positioning in RTL vs LTR languages
   - [x] Test gradient direction changes for Arabic
   - [x] Confirm dashboard icon positioning works in RTL
- [x] **Functional testing:**
   - [x] Test form progression (disabled → enabled panel states)
   - [x] Verify panel click/navigation behavior (ActionLinkPanel)
   - [x] Test responsive behavior on different screen sizes
   - [x] Verify layout preservation (justify-between, grid layouts)
- [ ] **Accessibility testing:**
   - [ ] Ensure panel focus management works correctly
   - [ ] Verify ARIA labels and semantic structure
   - [ ] Test keyboard navigation through form panels

### 6.7 Final Cleanup

- [ ] **Validation & commit:** final green run of lint, typecheck, tests before deleting legacy files; open PR-2.
- [ ] **Remove legacy declaration** `@custom-variant dark (&:where(.dark, .dark *));` from `app/styles/tailwind.css` (redundant with Tailwind v4's native dark mode support)
- [ ] **Documentation update:** Update any component documentation to reflect new Panel API
- [ ] **Performance audit:** Ensure no CSS duplication or unused styles remain

---

## Phase 7 · Guardrails

- [ ] Add ESLint / CI check to reject `dark:` classes (that aren’t `@dark:`) in any `*.tsx` under `app/components/`.
   ```bash
   grep -R "getPanelClasses" app/components && exit 1
   ```
- [ ] **Validation & commit:** CI must fail if rule violated; merge guardrail enforcement PR.

---

## Deliverables

- Capitalised folder \*\*`
