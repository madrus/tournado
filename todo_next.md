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

- [ ] Create directory structure:
   ```
   app/components/Panel/
     ├─ Panel.tsx            # generic wrapper
     ├─ panel.variants.ts    # Tailwind-v4 CVA map
     ├─ index.ts             # barrel export
     └─ Panel.types.ts       # shared types (optional)
   ```
- [ ] Copy `components/shared/panel.variants.ts` → `panel.variants.ts` and replace every `dark:` with `@dark:`.
- [ ] Keep the old shared variant file in place until Phase 6.
- [ ] **Implement internal 3-layer render model** inside `Panel.tsx`:
   - [ ] Static background `<div className="absolute inset-0" />` using `gradientFor(color)`.
   - [ ] Base content container (`opacity-100 group-hover:opacity-0`).
   - [ ] Optional hover overlay (`opacity-0 group-hover:opacity-100`) rendered only when `hoverColor` prop is provided.
   - [ ] Ensure no colour-flash occurs during transitions by keeping background constant.
- [ ] **Validation & commit:** all quality checks pass; open draft PR or commit.
- [ ] **Compliance check:** `grep -R --line-number "dark:" app/components/Panel | grep -v "@dark:"` returns no results (ensures Panel package uses only `@dark:` syntax).
- [ ] Replace every `dark:` utility inside **panel-specific** TypeScript/JSX code (variants, tests) with `@dark:` to use the new inline directive.

---

## Phase 4 · Early-Adopter Migration

- [ ] **Trim ActionLinkPanel files**
   - [ ] Delete `PanelBackground.tsx`, `PanelLayer.tsx`, `actionLinkPanel.variants.ts`.
   - [ ] Replace with a one-liner wrapper that passes props to new `Panel` (inherits 3-layer logic).
   - [ ] Update/replace unit tests to cover hover opacity toggle and link behaviour.
- [ ] **Admin dashboard (5 tiles)** – verify UI in light & dark mode; gradients must still match the `@variant dark` overrides in `tailwind.css`.
- [ ] Commit **PR-1 “panel package & early adopters”**.
- [ ] **Validation & commit:** run full quality suite; merge PR-1 once green.

---

## Phase 5 · Incremental Adoption

- [ ] Migrate `TeamForm`, `TournamentForm`, and any list/index pages to the new `Panel` API.
- [ ] Convert all `dark:` utilities in touched files to `@dark:`.
- [ ] Run `vitest` + Playwright visual tests.
- [ ] **Eliminate `getPanelClasses`**
   - [ ] Replace each call with `panel.variants` helpers or direct Tailwind classes.
   - [ ] Update associated unit tests and snapshots.
- [ ] **Validation & commit:** ensure lint/type/test pass after each migrated file set; commit frequently.

---

## Phase 6 · Bulk Migration & Cleanup

- [ ] Run repo-wide codemod:
   ```bash
   npx jscodeshift -t scripts/codemods/dark-to-dark.js app/components
   ```
- [ ] Delete legacy files:
   - [ ] `app/components/PanelOld.tsx`
   - [ ] `app/components/shared/panel.variants.ts`
   - [ ] `app/styles/panel.styles.ts` (removes `getPanelClasses` and legacy helpers)
- [ ] Remove the temporary import shim lines.
- [ ] **Validation & commit:** final green run of lint, typecheck, tests before deleting legacy files; open PR-2.
- [ ] **Remove legacy declaration** `@custom-variant dark (&:where(.dark, .dark *));` from `app/styles/tailwind.css` once all other files compile with `@dark:` or `@variant dark`.

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
