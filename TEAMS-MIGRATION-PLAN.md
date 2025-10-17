# Teams Feature Migration Plan

## Overview

Migrate teams functionality to `app/features/teams/` following the single-feature-with-variants pattern (matching tournaments feature). All components, stores, utilities, types, and tests will be consolidated, while routes and models remain in their current locations.

## Target Structure

```
app/features/teams/
├── components/
│   ├── __tests__/
│   │   ├── TeamForm.test.tsx
│   │   ├── TeamList.test.tsx
│   │   ├── TeamsPageContent.test.tsx
│   │   └── TeamsLayoutHeader.test.tsx
│   ├── TeamChip/
│   │   ├── __tests__/
│   │   │   └── TeamChip.test.tsx
│   │   ├── TeamChip.tsx
│   │   ├── teamChip.variants.ts
│   │   └── index.ts
│   ├── TeamForm.tsx
│   ├── TeamList.tsx
│   ├── TeamsPageContent.tsx
│   ├── TeamsLayoutHeader.tsx
│   └── index.ts
├── stores/
│   ├── __tests__/
│   │   └── useTeamFormStore.test.ts
│   ├── helpers/
│   │   ├── __tests__/
│   │   │   └── teamFormHelpers.test.ts
│   │   ├── teamFormTypes.ts
│   │   ├── teamFormHelpers.ts
│   │   └── teamFormConstants.ts
│   └── useTeamFormStore.ts
├── utils/
│   ├── __tests__/
│   │   └── teamCreation.server.test.ts
│   └── teamCreation.server.ts
├── hooks/
│   └── (future team-specific hooks)
├── types.ts
└── validation.ts

app/components/examples/
└── SidebarTeamsExample.tsx
```

## Migration Steps

### Phase 0: Prepare Test Structure ✅ COMPLETED

- [x] Create `test/routes/admin/teams/` directory
- [x] Move `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/__tests__/teams.$teamId.test.tsx` to `test/routes/admin/teams/teams.$teamId.test.tsx`
- [x] Update imports in moved route test
- [x] Verify route test still passes after move (11 tests passed)
- [x] **BONUS**: Create `test/routes/admin/tournaments/` directory
- [x] **BONUS**: Move `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/__tests__/tournaments.$tournamentId.test.tsx` to `test/routes/admin/tournaments/`
- [x] **BONUS**: Update imports in moved tournament test
- [x] **BONUS**: Verify tournament test still passes (16 tests passed)

### Phase 1: Create Feature Structure ✅ COMPLETED

- [x] Create `app/features/teams/components/` directory
- [x] Create `app/features/teams/stores/helpers/` directory
- [x] Create `app/features/teams/utils/` directory
- [x] Create `app/features/teams/hooks/` directory
- [x] Create `app/components/examples/` directory

### Phase 2: Move Components (with tests) ✅ COMPLETED

- [x] Move `TeamForm.tsx` from `app/components/` to `app/features/teams/components/`
- [x] Move `TeamList.tsx` from `app/components/` to `app/features/teams/components/`
- [x] Move `TeamsPageContent.tsx` from `app/components/` to `app/features/teams/components/`
- [x] Move `app/components/__tests__/TeamForm.test.tsx` to `app/features/teams/components/__tests__/`
- [x] Move `app/components/__tests__/TeamsPageContent.test.tsx` to `app/features/teams/components/__tests__/`
- [x] Move `TeamsLayoutHeader.tsx` from `app/components/layouts/` to `app/features/teams/components/`
- [x] Move `app/components/layouts/__tests__/TeamsLayoutHeader.test.tsx` to `app/features/teams/components/__tests__/`
- [x] Move entire `TeamChip/` folder from `app/components/` to `app/features/teams/components/`
- [x] Move `SidebarTeamsExample.tsx` from `app/components/` to `app/components/examples/`
- [x] Create `app/features/teams/components/index.ts` with exports

### Phase 3: Move Stores (with helpers and tests) ✅ COMPLETED

- [x] Move `useTeamFormStore.ts` from `app/stores/` to `app/features/teams/stores/`
- [x] Move `app/stores/__tests__/useTeamFormStore.test.ts` to `app/features/teams/stores/__tests__/`
- [x] Move `teamFormTypes.ts` from `app/stores/helpers/` to `app/features/teams/stores/helpers/`
- [x] Move `teamFormHelpers.ts` from `app/stores/helpers/` to `app/features/teams/stores/helpers/`
- [x] Move `teamFormConstants.ts` from `app/stores/helpers/` to `app/features/teams/stores/helpers/`
- [x] Move `app/stores/helpers/__tests__/teamFormHelpers.test.ts` to `app/features/teams/stores/helpers/__tests__/`

### Phase 4: Move Utils (with tests) ✅ COMPLETED

- [x] Move `teamCreation.server.ts` from `app/utils/` to `app/features/teams/utils/`
- [x] Move `app/utils/__tests__/teamCreation.server.test.ts` to `app/features/teams/utils/__tests__/`
- [x] Evaluate `teamsMetaFactory.ts` - **DECISION: DELETE** (premature abstraction, only 2 use cases, inline meta is more idiomatic for React Router v7)

### Phase 5: Create Types and Validation ✅ COMPLETED

- [x] Create `app/features/teams/types.ts` and extract team types from `app/lib/lib.types.ts`
- [x] Create `app/features/teams/validation.ts` and extract team validation from `app/lib/lib.zod.ts` and `app/utils/formValidation.ts`

### Phase 6: Update All Imports ✅ COMPLETED

**IMPORTANT**: No re-exports. All imports must point directly to feature modules.

**Step 1: Update all team type imports across codebase** ✅

- [x] Search for all imports from `~/lib/lib.types` that use team types
- [x] Update them to import from `~/features/teams/types`
- [x] Search for all imports from `~/lib/lib.zod` that use team validation
- [x] Update them to import from `~/features/teams/validation`
- [x] Search for all imports from `~/utils/formValidation` that use team utilities
- [x] Update them to import from `~/features/teams/validation`

**Step 2: Update component imports** ✅

- [x] Update imports in moved components to use feature-relative paths
- [x] Update `~/components/Team*` imports to `~/features/teams/components`
- [x] Update `~/stores/useTeamFormStore` imports to `~/features/teams/stores`
- [x] Update `~/utils/teamCreation.server` imports to `~/features/teams/utils`
- [x] Update imports in `app/components/emails/TeamRegisteredEmail.tsx`

**Step 3: Update route imports** ✅

- [x] Update all imports in `app/routes/teams/*.tsx`
- [x] Update all imports in `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/*.tsx`

**Step 4: Clean up original files (after all imports updated)** ✅

- [x] Remove team types from `app/lib/lib.types.ts` (lines 32, 42, 134, 140-321)
- [x] Remove team validation from `app/lib/lib.zod.ts` (entire file deleted)
- [x] Remove team utilities from `app/utils/formValidation.ts` (lines 8-126)
- [x] Verify NO team-related exports remain in lib files

**Step 5: Verify no re-exports** ✅

- [x] Confirm `app/lib/lib.types.ts` has NO team re-exports
- [x] Confirm `app/lib/lib.zod.ts` has NO team re-exports (file deleted)
- [x] Confirm `app/utils/formValidation.ts` has NO team re-exports

**Step 6: Fix deprecated Zod API usage** ✅

- [x] Replace `z.ZodIssue` with `z.core.$ZodIssue` in `app/features/teams/validation.ts`
- [x] Replace `z.ZodIssue` with `z.core.$ZodIssue` in `app/utils/formValidation.ts`
- [x] Delete obsolete `app/lib/__tests__/lib.zod.test.ts` (tests moved to feature)

**Step 7: Fix tournament type imports (done early to unblock typecheck)** ✅

- [x] Update `app/features/teams/components/__tests__/TeamForm.test.tsx` → `~/features/tournaments/types`
- [x] Update `app/features/teams/stores/__tests__/useTeamFormStore.test.ts` → `~/features/tournaments/types`
- [x] Update `app/features/teams/stores/helpers/teamFormHelpers.ts` → `~/features/tournaments/types`
- [x] Update `app/features/teams/stores/helpers/__tests__/teamFormHelpers.test.ts` → `~/features/tournaments/types`
- [x] Update `app/root.tsx` → `~/features/tournaments/types`
- [x] Update `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/competition/competition.groups.tsx` → `~/features/tournaments/types`
- [x] Update `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/competition/competition.tsx` → `~/features/tournaments/types`

**Step 8: Delete remaining duplicate files** ✅

- [x] Delete `app/stores/helpers/teamFormTypes.ts` (duplicate)
- [x] Delete `app/components/TeamForm.tsx` (duplicate)
- [x] Delete `app/stores/__tests__/useTeamFormStore.test.ts` (duplicate - already deleted earlier)
- [x] Delete `app/stores/helpers/__tests__/teamFormHelpers.test.ts` (duplicate - already deleted earlier)
- [x] Delete `app/stores/helpers/teamFormHelpers.ts` (duplicate - already deleted earlier)
- [x] Delete `app/utils/teamCreation.server.ts` (duplicate - already deleted earlier)
- [x] Delete `app/components/__tests__/TeamForm.test.tsx` (duplicate - already deleted earlier)

**Results**: ✅ All TypeScript errors resolved (19 → 0), all imports updated, all duplicates removed

### Phase 7: Update Tests ✅ COMPLETED

- [x] Update imports in `test/routes/teams/teams.new.rate-limit.test.ts`
- [x] Update imports in `test/routes/admin/teams/teams.$teamId.test.tsx`
- [x] Update imports in `app/components/examples/SidebarTeamsExample.tsx` (already correct)
- [x] Delete duplicate test file `app/components/__tests__/TeamsPageContent.test.tsx`
- [x] Fix test mocks in `app/features/teams/components/__tests__/TeamsPageContent.test.tsx`
   - Updated mock import path from `~/components/TeamList` to `~/features/teams/components/TeamList`
   - Fixed mock to render `clubName` + `name` (matching actual TeamChip behavior)
   - Updated test assertions to expect "Club A Team A" instead of "Team A"
- [x] Verify all component tests pass with new paths (all unit tests green ✅)
- [ ] Verify E2E tests: `playwright/tests/teams-basic.spec.ts`
- [ ] Verify E2E tests: `playwright/tests/teams-creation.spec.ts`
- [ ] Verify E2E tests: `playwright/tests/admin-teams.spec.ts`

**Results**: ✅ All unit tests passing, test mocks updated to match actual component behavior

### Phase 8: Clean Up ✅ COMPLETED

- [x] Delete original team files from `app/components/` (TeamList.tsx, TeamsPageContent.tsx)
- [x] Delete original team files from `app/components/layouts/` (TeamsLayoutHeader.tsx)
- [x] Delete original team files from `app/utils/` (teamsMetaFactory.ts)
- [x] Delete `app/components/TeamChip/` directory
- [x] Delete `app/components/layouts/__tests__/TeamsLayoutHeader.test.tsx` (duplicate)
- [x] Delete empty `app/components/layouts/__tests__/` directory
- [x] Update `knip.json` - remove `teamsMetaFactory.ts` from ignore list
- [x] Update `knip.json` - update `SidebarTeamsExample.tsx` path to `app/components/examples/`
- [x] Remove `TeamsLayoutHeader` export from `app/components/layouts/index.ts`
- [x] Update `TeamsLayoutHeader` import in `app/routes/teams/teams.tsx`
- [x] Update `TeamsLayoutHeader` import in `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/teams.tsx`
- [x] **NOTE**: `app/components/layouts/` kept (still contains other layout headers)
- [x] **NOTE**: All store and utils duplicates already deleted in Phase 6 ✅
- [x] **NOTE**: `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/__tests__/` already deleted in Phase 0 ✅
- [x] **NOTE**: `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/__tests__/` already deleted in Phase 0 ✅

**Results**: ✅ All duplicate files deleted, all imports updated, knip.json updated, file structure cleaned up

## Files NOT Being Moved

### Keep in Current Locations:

- **Routes**: `app/routes/teams/*` and `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/*` (React Router convention)
- **Models**: `app/models/team.server.ts` and its test (data access layer)
- **Emails**: `app/components/emails/TeamRegisteredEmail.tsx` (email templates stay in components/emails)

### Moving to New Locations:

- **TeamChip**: Moving to `app/features/teams/components/TeamChip/` (only used in teams functionality)
- **SidebarTeamsExample**: Moving to `app/components/examples/` (demo/example component)

## Test Files Inventory

### Unit Tests (Moving with their source files):

- ✅ `app/components/__tests__/TeamForm.test.tsx` → `app/features/teams/components/__tests__/`
- ✅ `app/components/__tests__/TeamsPageContent.test.tsx` → `app/features/teams/components/__tests__/`
- ✅ `app/components/layouts/__tests__/TeamsLayoutHeader.test.tsx` → `app/features/teams/components/__tests__/`
- ✅ `app/components/TeamChip/__tests__/TeamChip.test.tsx` → `app/features/teams/components/TeamChip/__tests__/`
- ✅ `app/stores/__tests__/useTeamFormStore.test.ts` → `app/features/teams/stores/__tests__/`
- ✅ `app/stores/helpers/__tests__/teamFormHelpers.test.ts` → `app/features/teams/stores/helpers/__tests__/`
- ✅ `app/utils/__tests__/teamCreation.server.test.ts` → `app/features/teams/utils/__tests__/`

### Route Tests (Moved to test/ directory in Phase 0):

- ✅ `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/__tests__/teams.$teamId.test.tsx` → `test/routes/admin/teams/teams.$teamId.test.tsx` (DONE)
- ✅ `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/__tests__/tournaments.$tournamentId.test.tsx` → `test/routes/admin/tournaments/tournaments.$tournamentId.test.tsx` (DONE - BONUS)
- ⚠️ `test/routes/teams/teams.new.rate-limit.test.ts` (already in test/ - stays)

### Tests Staying in Place:

- ⚠️ `app/models/__tests__/team.server.test.ts` (model test - stays)
- ⚠️ `app/components/emails/__tests__/TeamRegisteredEmail.test.tsx` (email test - stays)

### E2E Tests (No changes needed - reference only):

- 📍 `playwright/tests/teams-basic.spec.ts`
- 📍 `playwright/tests/teams-creation.spec.ts`
- 📍 `playwright/tests/admin-teams.spec.ts`

## Expected Benefits

1. **Code Organization**: All team-related code in one feature folder
2. **True Feature Isolation**: Direct imports show clear dependencies
3. **Maintainability**: Easier to find and modify team functionality
4. **Scalability**: Clean pattern for future features (no re-exports)
5. **No Duplication**: Single implementation with variant support
6. **Test Co-location**: Tests live next to their source files (except route tests)
7. **Explicit Dependencies**: Import paths clearly show where code comes from

## Future Work (Post-Teams Migration)

**Remove Tournament Re-exports** (separate task):

- [ ] Update all tournament type imports to use `~/features/tournaments/types` directly
- [ ] Remove tournament re-exports from `app/lib/lib.types.ts`
- [ ] Establish clean pattern: shared types in lib, feature types in features
- [ ] Document the "no re-exports" principle in CLAUDE.md

## Verification Checklist

- [x] All TypeScript files compile (`pnpm typecheck`) ✅
- [x] All unit tests pass (`pnpm test:run`) ✅
- [ ] All E2E tests pass (`pnpm test:e2e:run`)
- [x] No broken imports in the codebase ✅
- [ ] Public teams routes work (`/teams`, `/teams/new`, `/teams/:id`)
- [ ] Admin teams routes work (`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/*`)
- [x] All moved tests still pass in their new locations ✅
- [x] No orphaned files nor folders left behind undeleted ✅
- [x] No temporary renamed or duplicated files forgotten ✅
- [ ] All migration phases completed (Phases 0-8 complete, E2E verification pending)
