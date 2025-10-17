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

### Phase 5: Create Types and Validation

- [ ] Create `app/features/teams/types.ts` and extract team types from `app/lib/lib.types.ts`
- [ ] Create `app/features/teams/validation.ts` and extract team validation from `app/utils/formValidation.ts`

### Phase 6: Update All Imports

- [ ] Update imports in `app/routes/teams/*.tsx`
- [ ] Update imports in `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/*.tsx`
- [ ] Update store imports across codebase
- [ ] Update utility imports across codebase

### Phase 7: Update Tests

- [ ] Update imports in `test/routes/teams/teams.new.rate-limit.test.ts`
- [ ] Update imports in `test/routes/admin/teams/teams.$teamId.test.tsx`
- [ ] Update imports in `app/components/examples/SidebarTeamsExample.tsx`
- [ ] Verify all component tests pass with new paths
- [ ] Verify E2E tests: `playwright/tests/teams-basic.spec.ts`
- [ ] Verify E2E tests: `playwright/tests/teams-creation.spec.ts`
- [ ] Verify E2E tests: `playwright/tests/admin-teams.spec.ts`

### Phase 8: Clean Up

- [ ] Delete original team files from `app/components/` (TeamForm.tsx, TeamList.tsx, TeamsPageContent.tsx, TeamsLayoutHeader.tsx)
- [ ] Delete original team files from `app/stores/` (useTeamFormStore.ts and helpers/)
- [ ] Delete original team files from `app/utils/` (teamCreation.server.ts, teamsMetaFactory.ts)
- [ ] Delete empty `app/components/TeamChip/` directory
- [ ] Delete empty `app/components/layouts/` if it becomes empty after moving TeamsLayoutHeader
- [ ] Update `knip.json` - remove `teamsMetaFactory.ts` from ignore list
- [ ] Update `knip.json` - update `SidebarTeamsExample.tsx` path to `app/components/examples/`
- [ ] **NOTE**: `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/teams/__tests__/` already deleted in Phase 0 ✅
- [ ] **NOTE**: `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/__tests__/` already deleted in Phase 0 ✅

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
2. **Consistency**: Matches tournaments feature pattern
3. **Maintainability**: Easier to find and modify team functionality
4. **Scalability**: Clear pattern for future features
5. **No Duplication**: Single implementation with variant support
6. **Test Co-location**: Tests live next to their source files (except route tests)

## Verification Checklist

- [ ] All TypeScript files compile (`pnpm typecheck`)
- [ ] All unit tests pass (`pnpm test:run`)
- [ ] All E2E tests pass (`pnpm test:e2e:run`)
- [ ] No broken imports in the codebase
- [ ] Public teams routes work (`/teams`, `/teams/new`, `/teams/:id`)
- [ ] Admin teams routes work (`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/*`)
- [ ] All moved tests still pass in their new locations
- [ ] No orphaned moved files nor folders a left behind undeleted
- [ ] No temporary renamed files temporary duplicated files are forgotten
- [ ] All checkmarks are completed (checked)
