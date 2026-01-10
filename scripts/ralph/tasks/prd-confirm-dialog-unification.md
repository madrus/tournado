# PRD: Confirm Dialog Unification & Warning Color System Update

## Introduction

Unify the visual appearance and behavior of confirmation dialogs across the application, and update the global warning color from yellow to amber. This includes removing dead code for removed functionality, standardizing button labels and styling, and ensuring consistent color usage across all warning-intent dialogs.

## Goals

- Establish visual consistency across all confirmation dialogs in the application
- Update the global `warning` semantic color from yellow to amber across the entire design system
- Remove dead code for the removed "delete team from group" functionality
- Standardize button labels and styling for unsaved changes dialogs
- Ensure cancel buttons have consistent slate styling across all dialogs

## User Stories

### US-001: Update global warning color from yellow to amber

**Description:** As a developer, I need to update the warning semantic color definition so that all warning-colored elements use amber instead of yellow.

**Acceptance Criteria:**
- [ ] Update `--color-warning-*` CSS variables to map to amber instead of yellow in `app/styles/colors.css`
- [ ] Update `--color-warning-*` CSS variables in `app/styles/tailwind_theme.css`
- [ ] Update any adaptive warning colors (`--color-adaptive-warning`, `--color-adaptive-bg-warning`, etc.)
- [ ] Verify all existing warning usages render correctly with amber
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-002: Update dialog warning intent to use amber colors

**Description:** As a user, I want warning dialogs to have consistent amber coloring (icon, title, confirm button) matching the pattern used by danger dialogs with brand/red.

**Acceptance Criteria:**
- [ ] Dialog warning intent uses amber shades for background (`bg-warning-50` now amber)
- [ ] Icon container uses amber colors
- [ ] Title uses amber colors
- [ ] Confirm button uses amber colors
- [ ] Visual consistency with danger intent pattern (icon, title, button all same color family)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Standardize cancel button styling across all dialogs

**Description:** As a user, I want cancel buttons in all confirmation dialogs to have the same slate border and text styling.

**Acceptance Criteria:**
- [ ] Cancel button in `ConfirmDialog` uses slate border and text (secondary variant)
- [ ] Cancel button in `SimpleConfirmDialog` uses slate border and text (secondary variant)
- [ ] Cancel button styling matches the existing Teams/Tournaments delete dialog cancel button
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Update unsaved changes dialog labels

**Description:** As a user, I want the unsaved changes dialog to have clear, standard wording so I understand the action I'm about to take.

**Acceptance Criteria:**
- [ ] Description ends with "Are you sure you want to leave?"
- [ ] Cancel button label changed from "Stay on page" to "Cancel"
- [ ] Confirm button label changed from "Leave anyway" to "Yes, leave"
- [ ] Update i18n keys in ALL 6 locales: English (en), Dutch (nl), French (fr), Arabic (ar), Turkish (tr), German (de)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Remove dead code for delete team from group dialog

**Description:** As a developer, I need to remove the UI code for the removed "delete team from group" functionality to keep the codebase clean.

**Acceptance Criteria:**
- [ ] Identify and remove the ConfirmDialog for removing teams from groups in `GroupAssignmentBoard.tsx`
- [ ] Remove any related state variables (e.g., `showRemoveDialog`, `teamToRemove`)
- [ ] Remove any related handler functions
- [ ] Ensure no TypeScript errors after removal
- [ ] Typecheck passes

### US-006: Verify conflict dialog uses warning/amber intent

**Description:** As a user, I want the conflict dialog to use the same warning/amber styling as the unsaved changes dialog for visual consistency.

**Acceptance Criteria:**
- [ ] Conflict dialog uses `intent='warning'` (already the case, but verify after color changes)
- [ ] Conflict dialog displays with amber colors after global warning color update
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: The `--color-warning-*` CSS variables must map to amber color values instead of yellow
- FR-2: All dialogs with `intent='warning'` must display with amber-colored icon, title, and confirm button
- FR-3: Cancel buttons in all confirmation dialogs must use slate border and text styling
- FR-4: The unsaved changes dialog must display description ending with "Are you sure you want to leave?"
- FR-5: The unsaved changes dialog cancel button must display "Cancel"
- FR-6: The unsaved changes dialog confirm button must display "Yes, leave"
- FR-7: The "delete team from group" dialog UI code must be removed from `GroupAssignmentBoard.tsx`
- FR-8: The conflict dialog must use warning intent with amber colors

## Non-Goals

- No changes to the `danger` intent styling (red/brand colors)
- No changes to `info` or `success` intent styling
- No removal of backend/model functions for team-from-group deletion (only UI code)
- No changes to the core dialog component structure or API
- No changes to `SimpleConfirmDialog` vs `ConfirmDialog` distinction (controlled vs uncontrolled)

## Design Considerations

- **Color System**: The warning color change from yellow to amber is a global design system change that will affect all components using `warning-*` color tokens
- **Existing Components**: Both `ConfirmDialog` and `SimpleConfirmDialog` share the same `dialog.variants.ts` for styling, so changes will apply consistently
- **Button Variants**: Cancel buttons should use `variant='secondary'` with slate color to achieve the border/text styling
- **i18n**: All label changes must be updated in all 6 locales (en, nl, fr, ar, tr, de)

## Technical Considerations

### Files to Modify

1. **Color System**:
   - `app/styles/colors.css` - Update warning color definitions
   - `app/styles/tailwind_theme.css` - Update warning color definitions
   - `app/styles/tailwind_dark.css` - Update adaptive warning colors

2. **Dialog Components**:
   - `app/components/ConfirmDialog/dialog.variants.ts` - Verify warning intent uses correct color tokens
   - `app/components/ConfirmDialog/dialog.utils.ts` - Verify cancel button color returned

3. **Competition Feature**:
   - `app/features/competition/components/GroupAssignmentBoard.tsx` - Remove dead dialog code, update labels

4. **Internationalization**:
   - `app/i18n/locales/en.json` - Update unsaved changes labels
   - `app/i18n/locales/nl.json` - Update unsaved changes labels
   - `app/i18n/locales/fr.json` - Update unsaved changes labels
   - `app/i18n/locales/ar.json` - Update unsaved changes labels
   - `app/i18n/locales/tr.json` - Update unsaved changes labels
   - `app/i18n/locales/de.json` - Update unsaved changes labels

### Amber Color Reference

Per ADR-0029, the project uses `accent-amber` as a visual accent color. The warning semantic should map to these amber values.

## Success Metrics

- All confirmation dialogs have consistent visual appearance
- Warning-colored elements throughout the app display in amber, not yellow
- No dead code remains for removed "delete team from group" functionality
- Unsaved changes dialog has clear, standard button labels
- All 6 locales updated with new translations

### US-007: Add unit tests for dialog components

**Description:** As a developer, I need comprehensive unit tests for the dialog components to ensure at least 80% code coverage and prevent regressions.

**Acceptance Criteria:**
- [ ] Unit tests for `ConfirmDialog` component covering all intents (warning, danger, info, success)
- [ ] Unit tests for `SimpleConfirmDialog` component covering all intents
- [ ] Unit tests verify correct color classes are applied for warning intent (amber)
- [ ] Unit tests verify cancel button uses slate styling
- [ ] Unit tests verify confirm button uses intent-appropriate colors
- [ ] Unit tests for `dialog.utils.ts` functions
- [ ] Unit tests for `dialog.variants.ts` variant outputs
- [ ] Achieve minimum 80% code coverage for dialog components
- [ ] All tests pass with `pnpm test:run`
- [ ] Typecheck passes

## Testing Requirements

### Coverage Target

- **Minimum 80% code coverage** for all modified dialog components and utilities
- Run `pnpm test:run --coverage` to verify coverage thresholds

### Test Files to Create/Update

1. `app/components/ConfirmDialog/__tests__/ConfirmDialog.test.tsx`
2. `app/components/ConfirmDialog/__tests__/SimpleConfirmDialog.test.tsx`
3. `app/components/ConfirmDialog/__tests__/dialog.utils.test.ts`
4. `app/components/ConfirmDialog/__tests__/dialog.variants.test.ts`

### Test Scenarios

- Render dialog with each intent type and verify correct color classes
- Verify cancel button styling matches slate variant
- Verify confirm button styling matches intent color
- Test controlled vs uncontrolled dialog behavior
- Test loading state prevents dialog closure
- Test destructive flag changes focus behavior

## Open Questions

- Are there any other components using `warning-*` colors that need visual verification after the change?
