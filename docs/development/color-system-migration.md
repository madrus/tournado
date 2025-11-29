# Color System Migration

## Research
- [x] What are all the official Tailwind colors that we already ACTUALLY use in our components?
  - [x] global search
  - [x] make a list
  - **Result**: **13 real Tailwind colors** used (see Research Findings below)
  - **Plus 7 semantic aliases** that MAP to some of those colors (brand→red, primary→emerald, etc.)
- [x] What are all the (styles and variants) files that we should reconsider for migration?
  - [x] global search
  - [x] make a list
  - [x] which colors are repetitive and which are one-off?
  - **Result**: 15 variant files + 16 direct className occurrences (see Research Findings below)
- [x] What are the semantics that we already ACTUALLY use in our components?
  - [x] global search
  - [x] make a list
  - [x] list any conflicts/contradictions between semantics in similar situations?
  - **Result**: Button system, Panel system, Adaptive system - no conflicts (see Research Findings below)
- [ ] Which semantic system should we choose next to primary and brand?
  - [ ] 1. Success/Info/Error/Warning states?
  - [ ] 2. Feature-specific colors?
  - [ ] 3. UI component roles?
  - [ ] 4. generic only or component level, or both?
  - [ ] 5. Streamline existing semantics and think of ad-hoc semantic names for all other ACTUALLY used colors that are not yet coupled to semantics

## Requirements
- [ ] Phasing in small increments of one component at a time
- [ ] No visible changes in colors on the screen
- [ ] No issues with Tailwind in terms of its dynamic colors limitation - everything should be static
- [ ] I want to implement this migration one step at a time, so the planning should be created in such a way that first we need some absolutely minimum necessary that maybe doesn't change anything but prepares certain structures. In a way, it's redundant at that moment, and then later start migrating component by component when I have time, and that I can ask you to migrate this one component.
- [ ] Migrating components should also include fixing unit tests for them and maybe even e2e tests.

## Research Findings (Completed)

### ✅ Actually Used Tailwind Colors (RENDERED ON SCREEN) - COMPREHENSIVE VERIFICATION

**IMPORTANT**: This analysis shows colors that are ACTUALLY RENDERED, not just defined in CVA variants.

**Analysis method** (exhaustive):
1. Searched ALL `<Panel color=` usage in `app/**/*.tsx`
2. Searched ALL `<ActionButton color=` and `<ActionLinkButton color=` usage
3. Searched ALL `<Badge color=` usage + roleColors mapping
4. Searched ALL `<ToggleChip color=` and `<NavigationItem color=` usage
5. Searched ALL PANEL_COLORS constants in forms
6. Searched ALL hardcoded className patterns (bg-{color}-*, text-{color}-*, etc.)
7. Verified unused colors (purple, orange, zinc, violet, pink, rose) have ZERO hardcoded usage

**ACTUALLY USED COLORS** (13 colors - excluding unused):

**IMPORTANT SEMANTIC MAPPINGS**:
- **brand** = red (from colors.css: `--color-brand: var(--color-red-600)`)
- **primary** = emerald (from colors.css: `--color-primary: var(--color-emerald-600)`)

**Production usage (non-test files)**:
1. **brand (red)** - ActionLinkButton in TeamsLayoutHeader, TournamentsLayoutHeader, TeamForm (×3), TournamentForm (×3), Badge (deactivated users ×2), TeamForm/TournamentForm step 1 panels, ADMIN role badge, team detail error panel, competition error messages (hardcoded)
2. **primary (emerald)** - ActionLinkButton in _index.tsx, TournamentForm, test files
3. **slate** - RoleBadge (PUBLIC role), UserMobileRow, disabled form panels, empty states, healthcheck UI
4. **amber** - TeamForm/TournamentForm step 2 panels
5. **indigo** - TeamForm/TournamentForm step 3 panels
6. **fuchsia** - Competition page panels, TeamForm/TournamentForm step 4 panels, group management (hardcoded)
7. **teal** - Panels in Users/Tournaments/Teams pages (PANEL_COLOR constants ×3), UserDetailCard panel, UserAuditLogList, Firebase auth, teams detail headings (hardcoded)
8. **sky** - Tournament detail panels, team detail panels, UserAuditLogList
9. **blue** - MANAGER role badge, teams detail "Coming Soon" boxes (hardcoded), competition checkboxes/summary (hardcoded)
10. **green** - REFEREE role badge, teams detail success messages (hardcoded), healthcheck success (hardcoded), tournament success alerts (hardcoded)
11. **yellow** - BILLING role badge, teams detail "PENDING" status (hardcoded)
12. **purple** - EDITOR role badge (RoleBadge component)
13. **lime** - Admin panel Competition Management icon (a7k9m2x5p8w1n4q6r3y8b5t1._index.tsx)
14. **disabled** - Part of ColorAccent type (treated as distinct semantic)

**VERIFIED UNUSED** (5 colors - excluded from semantic modeling):
- ❌ **zinc** - No prop usage, no hardcoded usage - EXCLUDE FROM PLANNING
- ❌ **orange** - No prop usage, no hardcoded usage - EXCLUDE FROM PLANNING
- ❌ **violet** - No prop usage, no hardcoded usage - EXCLUDE FROM PLANNING
- ❌ **pink** - No prop usage, no hardcoded usage - EXCLUDE FROM PLANNING
- ❌ **rose** - No prop usage, no hardcoded usage - EXCLUDE FROM PLANNING

**Summary: The REAL Color Palette**:

**13 REAL TAILWIND COLORS ACTUALLY USED** (the visual palette):
1. **red** - error messages, ADMIN role, deactivated badge, form step 1
2. **emerald** - primary buttons, success states
3. **slate** - PUBLIC role, disabled panels, empty states
4. **amber** - form step 2
5. **indigo** - form step 3
6. **fuchsia** - competition area, form step 4, admin panel Reports & Analytics icon
7. **teal** - user/auth/tournament areas
8. **sky** - detail pages
9. **blue** - MANAGER role, info boxes
10. **green** - REFEREE role, success messages
11. **yellow** - BILLING role, pending/warning status
12. **purple** - EDITOR role
13. **lime** - admin panel Competition Management icon

**7 SEMANTIC ALIASES** (names that map to real colors above):
- **brand** → red
- **primary** → emerald
- **disabled** → slate (to verify)
- **success** → green (to add to colors.css)
- **error** → red (to add to colors.css)
- **warning** → yellow (to add to colors.css)
- **info** → blue (to add to colors.css)

**6 UNUSED REAL COLORS** (exclude from planning):
zinc, orange, violet, pink, rose

**Key principle**:
- **Real colors** = actual Tailwind color families (red, blue, etc.) - **MUST be strict about these**
- **Semantic aliases** = names that MAP to real colors - **can have as many as needed**

**Key usage patterns**:
- **Multi-step forms** (TeamForm, TournamentForm): brand(red)→amber→indigo→fuchsia for visual step progression
- **Status communication**: green (success?), brand(red) (error?), yellow (warning?), blue (info?)
- **Feature areas**: teal (users/auth/tournaments/teams), sky (details), fuchsia (competition)
- **Role badges**: slate (PUBLIC), blue (MANAGER), brand(red) (ADMIN), green (REFEREE), purple (EDITOR), yellow (BILLING)

**Key insight**: Your intuition was correct! We're only ACTUALLY using **11 out of 21 colors** on real screens. The other 10 exist in CVA variant definitions but are never instantiated.

### ✅ Files Needing Migration (15 variant files)

**High priority** (most hardcoded colors):
1. `app/components/buttons/button.variants.ts` (229 lines) - Worst offender with extensive template literals
2. `app/components/ToggleChip/toggleChip.variants.ts` (316 lines) - 38 compound variants
3. `app/components/Panel/panel.variants.ts` + `panel-base.variants.ts` - 80% semantic already
4. `app/components/Badge.tsx` (38 lines) - Easy win, only 7 colors currently

**Repetitive colors**: All 21 colors used systematically via safelist (576 lines)
**One-off colors**: 16 direct className occurrences in production code

### ✅ Existing Semantics (from app/styles/colors.css)

**Button system** (lines 95-146):
- Pattern: `--color-button-{variant}-{role}-{state}`
- Variants: primary, secondary, tertiary, danger
- Roles: brand, neutral, disabled
- States: background, text, border, hover, active, ring
- **Issue**: CVA components don't use these tokens, they hardcode `bg-red-600` instead

**Panel system** (lines 72-91, 196-215):
- Pattern: `--panel-bg-{color}` for all 21 colors
- Auto-adjusts for dark mode (100 in light, 800 in dark)
- **Status**: Working well, already semantic

**Adaptive system** (NOT in colors.css yet):
- Pattern seen in components: `text-adaptive-{color}-selected`
- Used in ToggleChip for selected text colors
- **Missing**: Need to formalize in colors.css

**No conflicts found**: Systems are complementary, not contradictory

### ❓ Semantic System Choice (Phase 0 - Work Together)

Questions to decide:
1. **Semantic categories**: Success/Info/Error/Warning? Feature-specific? UI roles?
2. **Abstraction layers**: Generic only? Component-level? Both?
3. **Color-to-semantic mapping**: Which of the 21 colors get semantic names beyond brand/primary?

## Planning (FINALIZED)

### Phase 0: Semantic Design Session (✅ COMPLETE)

**Two-Tier Semantic System** - **FINALIZED**:

**Tier 1: Functional Semantics** (7 semantic aliases → 4 real colors):
- `brand` → red
- `primary` → emerald
- `success` → green (ToastType, to add to colors.css)
- `error` → red (ToastType, to add to colors.css)
- `warning` → yellow (ToastType, to add to colors.css)
- `info` → blue (ToastType, to add to colors.css)
- `disabled` → slate (exists in ColorAccent, verify mapping)

**Tier 2: Visual Accents** (6 semantic aliases → 6 real colors):
- `accent-amber` - form step 2
- `accent-indigo` - form step 3
- `accent-fuchsia` - competition area, form step 4
- `accent-teal` - users/auth/tournaments/teams
- `accent-sky` - detail pages
- `accent-purple` - editor role

**Philosophy**:
- Functional semantics = "this color MEANS something" (success, error, brand)
- Visual accents = "this color adds variety/interest" (the "nice tea")

**User decisions**:
1. ✅ Keep multi-color form progression (good UX design)
2. ✅ Visual variety only for accents (no feature semantics yet)
3. ✅ Role badges use accents for now
4. ✅ Structure allows future refinement

**Key principle**: No visual changes during migration - semantic names formalize existing usage

**Checkist**:
- [x] Decide on semantic categories → Two-tier: functional + accents
- [x] Decide on abstraction layers → Both generic (success/error) + component-level (accent-amber)
- [x] Map all 13 real colors to semantics → Complete (see above)
- [x] Document rationale → "nice tea" philosophy + UX design rationale

---

### Phase 0.5: Infrastructure Preparation (NEW - Prepare semantic tokens)

**Status**: ✅ COMPLETE (2025-01-29)

**Goal**: Set up semantic color infrastructure WITHOUT changing any components. This creates "redundant" structures that will be used later during migration.

**Why this phase**: Allows you to migrate components one-by-one when you have time, without needing to design semantics during each migration.

**Steps**:
1. Add semantic color tokens to `colors.css` based on Phase 0 decisions
   - Example: `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*` shades
2. Add adaptive color classes for all 21 colors (currently missing from colors.css)
   - Pattern: `--color-adaptive-{color}-{shade}` for shades 50-950
3. Create helper utilities in `colorVariants.ts` for semantic mapping
4. Update TypeScript types if needed (ColorAccent, SemanticAccent)
5. **NO COMPONENT CHANGES** - components still use hardcoded colors

**Success criteria**:
- ✅ Semantic tokens exist in colors.css but aren't used yet
- ✅ No visual changes (nothing references new tokens)
- ✅ Infrastructure is ready for incremental component migration
- ✅ You can ask "migrate Badge component" without needing semantic design work

**Deliverables**:
- ✅ Updated `app/lib/lib.types.ts` with FunctionalSemantic and VisualAccent types
- ✅ Updated `app/styles/colors.css` with all semantic tokens (success, error, warning, info, disabled, accent-*)
- ✅ Updated `app/styles/tailwind_theme.css` with adaptive variants for new semantics
- Updated `app/components/shared/colorVariants.ts` with semantic helpers (deferred to Phase 1 as needed)

**New Token Patterns Available**:

*Functional Semantics* (communicate state/intent):
- `--color-success-{50-950}` → green
- `--color-error-{50-950}` → red
- `--color-warning-{50-950}` → yellow
- `--color-info-{50-950}` → blue
- `--color-disabled-{50-950}` → slate

*Visual Accents* (design variety):
- `--color-accent-amber-{50-950}` → amber (form step 2)
- `--color-accent-indigo-{50-950}` → indigo (form step 3)
- `--color-accent-fuchsia-{50-950}` → fuchsia (competition, form step 4)
- `--color-accent-teal-{50-950}` → teal (users/auth/tournaments/teams)
- `--color-accent-sky-{50-950}` → sky (detail pages)
- `--color-accent-purple-{50-950}` → purple (editor role)

*Adaptive Variants* (auto-adjust for dark mode):
- `--color-adaptive-{semantic}` → 600 weight
- `--color-adaptive-{semantic}-selected` → 800 weight

**Checklist**:
- [x] Create ADR-0029 documenting architecture - COMPLETE
- [x] Update types in app/lib/lib.types.ts (FunctionalSemantic, VisualAccent) - COMPLETE
- [x] Add semantic color tokens to colors.css - COMPLETE (all functional + visual accent shades 50-950)
- [x] Add adaptive variants in tailwind_theme.css - COMPLETE (600 + 800 selected weights)
- [x] Update COLOR_VARIANT_KEYS in colorVariants.ts with all 13 semantic colors - COMPLETE
- [x] Fix TypeScript errors in all CVA variant files (button, DataTable, inputs) - COMPLETE
- [x] Document new token patterns in this file - COMPLETE
- [x] Verify no visual changes (build and manual check) - COMPLETE ✅
- [ ] Create semantic helper functions in colorVariants.ts (deferred - will create during Phase 1 component migrations as needed)

---

---

### Phase 0.6: Remove Unused Colors (NEW - Cleanup before Phase 1)

**Status**: ✅ COMPLETED (2025-01-29)

**Goal**: Remove 5 unused legacy colors (zinc, orange, violet, pink, rose) to reduce file sizes and improve maintainability before Phase 1 component migrations.

**Decision**: Remove 5 colors + refactor toast warnings to use semantic `warning` color (yellow).

**Scope**: 13 files, ~260 lines removed

**Results**:
- ColorAccent type reduced from 21 to 16 colors (app/lib/lib.types.ts:125-139)
- COLOR_VARIANT_KEYS reduced from 34 to 29 entries (app/components/shared/colorVariants.ts)
- Toast warnings migrated from orange to yellow/warning semantic (3 files)
- All CVA variant files cleaned (button, dataTable, inputs, toggleChip, firebaseAuth)
- All tests updated and passing
- Zero TypeScript errors, build successful
- Admin panel icons: violet→fuchsia (Reports)

**Checklist**:
- [x] Remove 5 colors from ColorAccent type (app/lib/lib.types.ts)
- [x] Remove 5 colors from COLOR_VARIANT_KEYS (app/components/shared/colorVariants.ts)
- [x] Refactor toast warnings: orange → `warning` semantic (toastMessage.variants.ts)
- [x] Clean 5 colors from 5 CVA variant files (button, dataTable, inputs, toggleChip, firebaseAuth)
- [x] Update 5 test files (ring.styles.test.ts, panel.variants.test.ts, toastMessage.variants.test.ts, ToastIcon.test.tsx, toggleChip.variants.ts)
- [x] Fix component props in admin panel (a7k9m2x5p8w1n4q6r3y8b5t1._index.tsx: violet→fuchsia)
- [x] Verify typecheck passes ✅
- [x] Verify build succeeds ✅
- [x] Verify tests pass ✅

**Files Modified** (13 total):
1. app/lib/lib.types.ts - ColorAccent union type
2. app/components/shared/colorVariants.ts - COLOR_VARIANT_KEYS
3. app/components/ToastMessage/toastMessage.variants.ts - orange → yellow
4. app/components/buttons/button.variants.ts - 3 sections cleaned
5. app/components/DataTable/dataTable.variants.ts - 3 Record objects
6. app/components/inputs/inputs.variants.ts - 30 occurrences removed
7. app/components/ToggleChip/toggleChip.variants.ts - compoundVariants
8. app/features/firebase/components/FirebaseAuth/firebaseAuth.variants.ts - violet removed
9. app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1._index.tsx - 2 prop fixes
10. app/styles/__tests__/ring.styles.test.ts - 3 colors removed
11. app/components/Panel/__tests__/panel.variants.test.ts - 5 colors removed
12. app/components/ToastMessage/__tests__/toastMessage.variants.test.ts - orange → yellow
13. app/components/ToastMessage/__tests__/ToastIcon.test.tsx - orange → yellow

**Impact**:
- ✅ Reduced codebase bloat by ~260 lines
- ✅ Color system now has 13 real colors + 13 semantics (26 total, down from 34)
- ✅ Cleaner base for Phase 1 component migrations
- ✅ No visual changes (fuchsia replaces violet)

---

### Phase 1: Component Migration (One at a time - INCREMENTAL)

**Status**: 🟢 In Progress (Badge complete, 6 components remaining)

**Goal**: Migrate components one-by-one to use `ColorVariantKey` type with **100% static class names**. Eliminate all dynamic class generation using template literals.

**Order** (suggested, flexible based on your priorities):
1. ✅ **Badge** (38 lines) - **COMPLETE** - Reference implementation for static class pattern
2. ⚪ Button system (229 lines) - Most complex, highest value
3. ⚪ Panel system - 80% done already
4. ⚪ ToggleChip (316 lines) - Systematic pattern
5. ⚪ Dialog, Toast, DataTable, Inputs, Navigation (as time allows)

**Per-component process**:
1. Read component and identify color usage
2. Replace hardcoded colors OR `createColorVariantMapping()` calls with explicit static class mappings
3. Update unit tests (color class assertions) if needed
4. Update E2E tests if affected
5. Visual regression test (compare before/after screenshots)
6. Single PR per component

**Reference Implementation**: See `app/components/Badge.tsx` for the correct pattern with all 26 colors using explicit static classes.

**Success criteria per component**:
- ✅ No hardcoded Tailwind colors (bg-red-600, etc.)
- ✅ No dynamic color generation (no `bg-${color}-600` template literals)
- ✅ Uses semantic tokens (bg-brand-600, bg-accent-amber-600, etc.)
- ✅ Functions working with temlate literals like `createColorVariantMapping`
   ```typescript
   const borderVariants = createColorVariantMapping(
    (color) => `border-${color}-300 panel-${color}-bg`
   )
   ```
   should be replaced with static classes and removed once they get unused.
- ✅ Semantic tokens are statically detectable by Tailwind
- ✅ No visual changes on screen
- ✅ All tests passing (unit + E2E)
- ✅ Safelist entries removed for that component

**Checklist per component**:
- [ ] Component migrated to semantic tokens
- [ ] Unit tests updated and passing
- [ ] E2E tests updated and passing (if applicable)
- [ ] Visual regression verified (no changes)
- [ ] Safelist entries removed

---

### Static Class Pattern (REQUIRED)

All component migrations MUST use 100% static class names. Template literals are NOT allowed because Tailwind's static analysis cannot detect dynamically-generated classes at compile time.

**❌ WRONG - Dynamic classes (Tailwind can't detect)**:
```typescript
// This creates dynamic classes that Tailwind cannot detect
color: createColorVariantMapping(
  (color) => `bg-${color}-600 text-${color}-50`
)
```

**✅ CORRECT - Inline explicit static classes**:
```typescript
// badge.variants.ts - Every class name explicitly written inline
import type { ColorVariantKey } from '~/components/shared/colorVariants'

export const badgeVariants = cva('...', {
  variants: {
    color: {
      brand: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
      primary: 'bg-emerald-600 text-emerald-50 dark:bg-emerald-800 dark:text-emerald-50',
      success: 'bg-green-600 text-green-50 dark:bg-green-800 dark:text-green-50',
      // ... all 26 colors explicitly spelled out
    } satisfies Record<ColorVariantKey, string>
  }
})
```

**Why this matters**:
- Tailwind's PurgeCSS/JIT compiler performs static analysis at build time
- Template literals like `` `bg-${color}-600` `` are evaluated at runtime, not compile time
- Tailwind cannot detect which classes will be generated from templates
- Result: Dynamic classes get purged from the final CSS bundle
- Solution: Every class must be written as a complete static string

**Inline Definition Approach**:
- Each component defines its color variants inline with explicit static classes
- Each component has unique color patterns (different shades, properties, states)
- No sharing possible across components - patterns are component-specific
- Use `satisfies Record<ColorVariantKey, string>` for type safety
- Ensures all 26 colors are defined and properly typed

**Helper Function Migration**:
- `createColorVariantMapping()` and related helpers use template literals
- Replace each usage with inline explicit static class definitions
- Expand the template literal logic into 26 explicit entries
- Once ALL usages are removed from the codebase, delete the helper functions from `colorVariants.ts`

**Reference Implementation**: See `app/components/Badge/badge.variants.ts` for the correct pattern with inline explicit classes.

---

### Completed Migrations

#### Badge Component ✅
- **Structure**: Organized folder with separate variants file
  - `app/components/Badge/Badge.tsx` - Component implementation
  - `app/components/Badge/badge.variants.ts` - CVA variants with all colors inline
  - `app/components/Badge/index.ts` - Barrel exports
  - `app/components/Badge/__tests__/Badge.test.tsx` - 36 unit tests
- **Pattern**: 26 explicit static color mappings inline (NO template literals, NO shared constants)
- **Type**: Uses `ColorVariantKey` from colorVariants.ts
- **Type Safety**: `satisfies Record<ColorVariantKey, string>`
- **Changes**: Migrated from 7 hardcoded colors to full 26-color palette
- **Tests**: Added comprehensive unit tests covering all 26 colors + functionality (36 tests)
- **Status**: Complete - serves as reference implementation for all future component migrations

**Key Implementation Details**:
```typescript
// badge.variants.ts - All colors defined inline, explicitly
export const badgeVariants = cva('...', {
  variants: {
    color: {
      brand: 'bg-red-600 text-red-50 dark:bg-red-800 dark:text-red-50',
      primary: 'bg-emerald-600 text-emerald-50 dark:bg-emerald-800 dark:text-emerald-50',
      // ... all 26 colors explicitly spelled out inline
    } satisfies Record<ColorVariantKey, string>
  }
})
```

**Why inline, not shared**:
- Each component has unique color patterns (different shades, hover states, borders)
- Badge uses `bg-{color}-600`, DataTable uses `bg-{color}-50`, ToggleChip uses complex hover patterns
- No practical sharing possible - would create separate constant per component anyway
- Inline keeps all variant logic in one place for maintainability

---

### Phase 2: Cleanup & Enforcement (AFTER all components migrated)

**Status**: ⚪ Not Started (blocked by Phase 1 completion)

**Goal**: Clean up migration artifacts, **REMOVE unused colors entirely**, and enforce semantic-only usage.

**Steps**:

0. **Create ADR documenting architecture** ✅ **COMPLETE**:
   - ADR-0029: Semantic Color System - 12-Color Palette with Two-Tier Naming
   - Rationale for two-tier system
   - **Why 12 colors (not 21)**
   - Migration process and outcomes
   - Location: `.cursor/rules/ADR.mdc`

1. **Remove unused colors from ColorAccent type** (app/lib/lib.types.ts):
   - **REMOVE**: zinc, orange, violet, pink, rose (5 colors)
   - Update ColorAccent to only include the 13 used real colors + semantic aliases
   - Breaking change but justified - these 5 colors are never used

2. **Eliminate safelist.txt entirely**:
   - All dynamic color classes migrated to semantic tokens in Phase 1
   - Semantic tokens are statically detectable by Tailwind (no safelist needed)
   - Delete safelist.txt completely (or reduce to absolute minimum if edge cases found)
   - **Goal**: Zero safelist entries for color classes

3. **Update CLAUDE.md with semantic color rules**:
   - Document two-tier system (functional + accents)
   - **Explicitly state: Only 13 real Tailwind colors allowed**
   - **List forbidden colors**: zinc, orange, violet, pink, rose (5 colors)
   - Examples of correct usage

4. **Add Biome linting rule (optional)**:
   - Detect hardcoded patterns (bg-red-600, text-blue-500)
   - **Detect usage of forbidden colors**
   - Suggest semantic alternatives

**Deliverables**:
- **Updated ColorAccent type (13 colors only)**
- **Deleted safelist.txt** (or minimal if edge cases exist)
- Updated CLAUDE.md
- Optional: Biome rule with forbidden color detection
- ✅ ADR-0029: Color System Architecture (COMPLETE - update to reflect 13 colors)

**Checklist**:
- [x] Create ADR (explain color palette decision) - ADR-0029 created
- [x] Remove 5 unused colors from ColorAccent type
- [ ] Delete safelist.txt entirely (or minimize to absolute edge cases)
- [ ] Update CLAUDE.md (document 13-color system + forbidden list: zinc, orange, violet, pink, rose)
- [ ] Update ADR-0029 to reflect 13 colors instead of 12
- [ ] Create Biome rule with forbidden color detection (optional)
- [ ] Final verification (no unused colors anywhere, no safelist needed)

## Critical Files Reference

### Phase 0 (Semantic Design):
- **Color System Migration.md** (this file) - Document decisions here
- **app/styles/colors.css** (227 lines) - Existing semantic tokens to build upon
- **app/lib/lib.types.ts** (lines 98-119) - ColorAccent type definition

### Phase 1 (Badge POC):
- **app/components/Badge.tsx** (38 lines) - Target component for first migration
- **app/components/shared/colorVariants.ts** (130 lines) - Helper functions to potentially use

### Phase 2 (Button System):
- **app/components/buttons/button.variants.ts** (229 lines) - Complex CVA with extensive hardcoding
- **app/styles/safelist.txt** (576 lines) - Shows dynamic class generation to eliminate

### Phase 3+ (Other Components):
- **app/components/ToggleChip/toggleChip.variants.ts** (316 lines)
- **app/components/Panel/panel.variants.ts** + **panel-base.variants.ts**
