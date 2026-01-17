# PRD: Delete Group Stage

## Introduction

Add the ability to delete a Group Stage from Competition Management. Currently, group stages can be created and edited, but not deleted - making testing and data management difficult. This feature extends the existing Competition Management flow by adding a delete button to the group stage detail view, following the established delete patterns from Teams and Tournaments.

**Context:** The Competition Management feature uses a large fuchsia-colored `Panel` component (via `CompetitionLayout`) that contains all competition content. When viewing a specific group stage, the `GroupAssignmentBoard` renders inside this panel, displaying the group stage name, all groups with their slots, and team pools. The delete button should be added to the header area of this board, alongside the "Back to Groups" link but on the opposite side of the panel.

**Related Features:** Competition Management (existing), Teams (delete pattern reference), Tournaments (delete pattern reference)

## Goals & Success Metrics

- Allow ADMIN role to delete any group stage
- Allow MANAGER role to delete group stages where they created the tournament OR the group stage
- Prevent accidental data loss with enhanced confirmation dialog showing impact
- Block deletion only when matches with PLAYED status exist (non-played matches are cascade-deleted)
- Teams remain in tournament (unassigned) after group stage deletion
- Follow existing UX patterns for consistency (SimpleConfirmDialog)

## Use Cases

### UC-000: Add createdBy field to Tournament and GroupStage models

**Description:** As a developer, I need ownership tracking on Tournament and GroupStage to enable MANAGER role permission checks.

**Decision: Development Workflow:** This project is pre-production. The development workflow is:

1. Drop and recreate database (empty tables)
2. Run migrations (no backfill needed - tables are empty)
3. Run `seedSuperAdmins.js` (creates admin users)
4. Run `seed.js` (creates tournaments/teams with `createdBy` set)

The `seed.js` file already handles `createdBy` by finding/creating the `madrus@gmail.com` user and using their ID.

**Acceptance Criteria:**

- [ ] Add `createdBy` field (String, **required**, references User.id) to `Tournament` model in `prisma/schema.prisma`
- [ ] Add `createdBy` field (String, **required**, references User.id) to `GroupStage` model in `prisma/schema.prisma`
- [ ] Generate migration: `pnpm prisma migrate dev --name add_createdby_to_tournament_and_groupstage`
- [ ] Update `createTournament` function to set `createdBy` from authenticated user
- [ ] Update `createGroupStage` function to set `createdBy` from authenticated user
- [ ] Update ALL test fixtures that create Tournament or GroupStage objects to include `createdBy` field (use a valid test user ID from test setup)
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `app/models/__tests__/tournament.server.test.ts` for `createTournament` with `createdBy`
- [ ] Create unit tests in `app/models/__tests__/group.server.test.ts` for `createGroupStage` with `createdBy`
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass

### UC-001: Add delete model function for group stage

**Description:** As a developer, I need a server function to safely delete a group stage and all its child records.

**Implementation Note:** To return deletion statistics, explicitly delete in order: GroupSlots (count), then Groups (count), then GroupStage. Wrap all in a Prisma transaction. Prisma's `onDelete: SetNull` on GroupSlot.teamId automatically handles team preservation.

**Acceptance Criteria:**

- [ ] Create `deleteGroupStage` function in `app/models/group.server.ts`
- [ ] Function accepts `groupStageId` parameter
- [ ] Deletes GroupSlots first (count deleted), then Groups (count deleted), then GroupStage - all in a transaction
- [ ] Teams referenced by GroupSlots remain in database (Prisma `onDelete: SetNull` handles this)
- [ ] Returns deletion statistics: `{ groupsDeleted: number, slotsDeleted: number }`
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `app/models/__tests__/group.server.test.ts` for `deleteGroupStage`
- [ ] Test cascade deletion of Groups and GroupSlots
- [ ] Test that Teams remain (GroupSlot.teamId set to null)
- [ ] Test transaction rollback on error
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass

### UC-002: Add pre-delete validation function

**Description:** As a developer, I need a function to check if a group stage can be safely deleted and report what will be affected.

**Acceptance Criteria:**

- [ ] Create `canDeleteGroupStage` function in `app/models/group.server.ts`
- [ ] Returns `{ canDelete: boolean, reason?: string, impact: { groups: number, assignedTeams: number, matchesToDelete: number } }`
- [ ] `canDelete: false` with reason ONLY if matches with `status: PLAYED` exist for teams in this group stage
- [ ] Non-played matches (UPCOMING, CANCELLED, POSTPONED) are included in `matchesToDelete` count and will be cascade-deleted
- [ ] Impact shows number of groups, currently assigned teams that will be unassigned, and matches to be deleted
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `app/models/__tests__/group.server.test.ts` for `canDeleteGroupStage`
- [ ] Test returns `canDelete: false` when matches with PLAYED status exist
- [ ] Test returns `canDelete: true` when only non-played matches exist
- [ ] Test returns `canDelete: true` when no matches exist
- [ ] Test impact calculation includes correct counts
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass

### UC-003: Add delete action to group stage route

**Description:** As a developer, I need the route action to handle delete intent for group stages.

**Acceptance Criteria:**

- [ ] Add `intent: 'delete'` handler to `app/routes/admin/competition/competition.groups.$groupStageId.tsx` action
- [ ] Validate user has ADMIN role (can delete any) OR MANAGER role with ownership
- [ ] For MANAGER: verify user is the creator of EITHER the tournament OR the group stage itself
- [ ] Call `canDeleteGroupStage` before deletion - return error if blocked (matches with PLAYED status)
- [ ] Call `deleteGroupStage` on success (cascades to non-played matches)
- [ ] Redirect to `/admin/competition/groups?tournament={tournamentId}&success=deleted` after deletion
- [ ] On redirect target, show success toast: "Group stage deleted successfully" (translated)
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `test/routes/admin/competition/competition.groups.$groupStageId.test.ts` for delete action
- [ ] Test ADMIN can delete any group stage
- [ ] Test MANAGER can delete if they created tournament
- [ ] Test MANAGER can delete if they created group stage
- [ ] Test MANAGER cannot delete if they didn't create tournament or group stage
- [ ] Test deletion blocked when matches with PLAYED status exist
- [ ] Test successful deletion redirects with success param
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass

### UC-004: Add delete button to group stage detail header

**Description:** As a user (ADMIN/MANAGER), I want a delete button in the group stage detail view so I can remove incorrect configurations.

**Acceptance Criteria:**

- [ ] Add delete button to the header section of `CompetitionGroupStageDetails.tsx`
- [ ] Button positioned on the opposite side of the "Back to Groups" link (same row, vertically middle-aligned, using `justify-between`)
- [ ] Button uses `ActionButton` with `icon='delete'` and `variant='secondary'`
- [ ] Button triggers `SimpleConfirmDialog` with intent='danger'
- [ ] All new UI strings extracted to translation files (nl.json, en.json, ar.json, etc.)
- [ ] Layout verified for responsiveness (Mobile/Desktop) and Bi-directional flow (LTR/RTL mirroring)
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `app/features/competition/components/__tests__/CompetitionGroupStageDetails.test.tsx`
- [ ] Test delete button renders for ADMIN role
- [ ] Test delete button renders for MANAGER role (with ownership)
- [ ] Test delete button does not render for unauthorized roles
- [ ] Test delete button triggers confirmation dialog
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass
- [ ] Verify in browser using `dev-browser` skill

### UC-005: Implement enhanced confirmation dialog

**Description:** As a user, I want to see what will be deleted before confirming, so I don't accidentally lose important data.

**Acceptance Criteria:**

- [ ] Dialog title: "Delete Group Stage" (translated)
- [ ] Dialog description shows impact: "This will delete X groups, unassign Y teams, and remove Z scheduled matches. Teams will remain in the tournament."
- [ ] Only show matches count if > 0
- [ ] Uses `SimpleConfirmDialog` with `intent='danger'` and `destructive` prop
- [ ] Confirm button: "Delete Group Stage" (translated)
- [ ] Cancel button focused by default (destructive action pattern)
- [ ] All new UI strings extracted to translation files
- [ ] Layout verified for responsiveness and RTL mirroring
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `app/features/competition/components/__tests__/CompetitionGroupStageDetails.test.tsx` for confirmation dialog
- [ ] Test dialog shows correct impact counts (groups, teams, matches)
- [ ] Test dialog shows matches count only when > 0
- [ ] Test confirm action triggers delete
- [ ] Test cancel action closes dialog without deleting
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass
- [ ] Verify in browser using `dev-browser` skill

### UC-006: Handle blocked deletion state

**Description:** As a user, I want clear feedback when deletion is blocked due to existing match results.

**Acceptance Criteria:**

- [ ] If `canDeleteGroupStage` returns `canDelete: false`, show toast error with reason
- [ ] Error message: "Cannot delete: This group stage has matches with recorded results" (translated)
- [ ] Delete button remains visible but action is rejected server-side
- [ ] All new UI strings extracted to translation files
- [ ] Typecheck/lint pass
- [ ] Create unit tests in `test/routes/admin/competition/competition.groups.$groupStageId.test.ts` for blocked deletion
- [ ] Test error toast shown when deletion blocked due to PLAYED matches
- [ ] Test correct error message displayed
- [ ] Run unit tests for changed files (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`) - all related tests must pass

## Functional Requirements

- FR-1: The system must allow ADMIN users to delete any group stage, and MANAGER users to delete group stages where they created the tournament OR the group stage
- FR-2: When a user clicks "Delete", the system must show a confirmation dialog with deletion impact
- FR-3: The confirmation dialog must display counts: number of groups, assigned teams to be unassigned, and non-played matches to be deleted
- FR-4: The system must block deletion ONLY if matches with status PLAYED exist; non-played matches (UPCOMING, CANCELLED, POSTPONED) are cascade-deleted
- FR-5: On successful deletion, all Groups, GroupSlots, and non-played matches belonging to the GroupStage must be removed
- FR-6: Teams previously assigned to deleted GroupSlots must remain in the tournament (unassigned state)
- FR-7: After deletion, the user must be redirected to the group stages list with the tournament filter preserved
- FR-8: After successful deletion, a success toast notification must be displayed confirming the deletion

## Technical & Architectural Considerations

### Data Isolation

- ADMIN: Can delete any group stage (full system access)
- MANAGER: Can delete group stages where they are the creator of EITHER the tournament OR the group stage itself
- EDITOR/BILLING/REFEREE/PUBLIC: No delete access

### RR7 Implementation

- **Modified Route:** `app/routes/admin/competition/competition.groups.$groupStageId.tsx` - add delete intent to action
- **Modified Component:** `app/features/competition/components/CompetitionGroupStageDetails.tsx` - add delete button to header

### Components

- **Reuse:** `SimpleConfirmDialog` from `~/components/ConfirmDialog`
- **Reuse:** `ActionButton` from `~/components/buttons/ActionButton`
- **Modify:** `CompetitionGroupStageDetails` - add delete button to header section (next to "Back to Groups" link)

### Database Operations

**Schema changes required:**

- Add `createdBy` field to `Tournament` model (String, **required**, references User.id)
- Add `createdBy` field to `GroupStage` model (String, **required**, references User.id)
- Backfill existing records with user ID of `madrus@gmail.com`

**Cascade delete behavior:**

- `GroupSlot.teamId` has `onDelete: SetNull` - teams automatically become unassigned
- Non-played matches (UPCOMING, CANCELLED, POSTPONED) tied to this group stage should be deleted
- Matches with `status: PLAYED` block deletion entirely

**New functions in `app/models/group.server.ts`:**

- `canDeleteGroupStage(groupStageId: string)` - pre-flight validation and impact calculation
- `deleteGroupStage(groupStageId: string)` - atomic deletion with cascade

### I18n Strategy

New translation keys in namespace `competition`:

```json
{
  "competition": {
    "deleteGroupStage": "Delete group stage",
    "deleteGroupStageTitle": "Delete Group Stage",
    "deleteGroupStageDescription": "This will delete {{groupCount}} groups and unassign {{teamCount}} teams. Teams will remain in the tournament.",
    "deleteGroupStageDescriptionWithMatches": "This will delete {{groupCount}} groups, unassign {{teamCount}} teams, and remove {{matchCount}} scheduled matches. Teams will remain in the tournament.",
    "deleteGroupStageConfirm": "Delete Group Stage",
    "deleteGroupStageBlocked": "Cannot delete: This group stage has matches with recorded results",
    "deleteGroupStageSuccess": "Group stage deleted successfully"
  }
}
```

### Mirroring Logic

- Delete button uses existing `ActionButton` which handles RTL via logical properties
- Confirmation dialog uses existing `SimpleConfirmDialog` which is RTL-compliant
- Header layout should use `justify-between` to position "Back to Groups" link on start and delete button on end
- No special RTL handling required beyond standard logical properties

### Mobile-First Layout

- Delete button flows naturally in header flex layout with `justify-between items-center`
- On mobile, button and link remain on same row (both are compact enough)
- Dialog is already responsive via Radix UI primitives

## Non-Goals (Out of Scope)

- Soft delete / undo functionality - deletion is permanent
- Batch delete multiple group stages at once
- Archive group stage instead of delete
- Automatic reassignment of teams to other group stages
- **Full cascade deletion of all matches** - Out of scope: Deleting matches with `status: PLAYED` and tournament-scoped matches (not tied to group stage). **In scope per UC-002, FR-4, FR-5:** Deleting non-played matches (UPCOMING, CANCELLED, POSTPONED) that are scoped to the group stage. Played matches and tournament-scoped matches are preserved.
- Audit logging of deletion (defer to future audit feature)

## Design Considerations

- Delete button placement: Same row as "Back to Groups" link, vertically middle-aligned, positioned on the opposite side of the fuchsia panel (using `flex justify-between items-center`)
- Button style: `variant='secondary'` with delete icon (red/danger appearance via intent)
- Confirmation dialog: Standard destructive action pattern with impact summary
- The button lives within the large fuchsia `Panel` that wraps all competition content (rendered via `CompetitionLayout`)

### Reference: Existing Delete Pattern (Team)

```tsx
<SimpleConfirmDialog
  intent='danger'
  trigger={
    <ActionButton icon='delete' variant='secondary'>
      {t('common.actions.delete')}
    </ActionButton>
  }
  title={t('teams.deleteTeam')}
  description={t('teams.deleteTeamAreYouSure')}
  confirmLabel={t('common.actions.confirmDelete')}
  cancelLabel={t('common.actions.cancel')}
  destructive
  onConfirm={submitDelete}
/>
```

## Technical Considerations

- Prisma cascade delete: `GroupStage` -> `Group` -> `GroupSlot` handled automatically
- `GroupSlot.teamId` uses `onDelete: SetNull` - teams are preserved
- Transaction wrapping ensures atomicity
- Future match integration: When matches are linked to groups, `canDeleteGroupStage` will need to query match status

### Testing Strategy

- **Unit tests required** for all model functions (`deleteGroupStage`, `canDeleteGroupStage`)
- **Unit tests required** for route actions (authorization, deletion flow, error handling)
- **Unit tests required** for UI components (button rendering, dialog behavior)
- **Test coverage:** All new functions and modified routes must have unit tests
- **Test location:** Tests in `__tests__` subfolders adjacent to code (following project convention)
- **Test execution:** Run `pnpm test:run` after creating/modifying tests - all tests must pass before marking use cases complete
- **Note:** When PRD acceptance criteria include "Run unit tests", this overrides any general project rules about not running tests automatically

### Current Schema Relationships

```prisma
model GroupStage {
  groups     Group[]     // onDelete: Cascade
  groupSlots GroupSlot[] // onDelete: Cascade
}

model Group {
  groupStage GroupStage @relation(onDelete: Cascade)
  slots      GroupSlot[] // onDelete: Cascade
}

model GroupSlot {
  team       Team?      @relation(onDelete: SetNull)  // Team preserved
  group      Group?     @relation(onDelete: Cascade)
  groupStage GroupStage @relation(onDelete: Cascade)
}
```

## Success Metrics

- Delete operation completes in < 500ms for typical group stages (4 groups, 16 slots)
- Zero orphaned records after deletion (verified via database integrity check)
- Users can delete and recreate group stages for testing without manual database intervention
- No regression in group stage creation or editing functionality

## Decisions (from Open Questions)

1. **Ownership fields:** Add `createdBy` field to both `Tournament` and `GroupStage` models. MANAGER can delete a group stage if they created EITHER the tournament OR the group stage itself.

2. **Match deletion behavior:** Block deletion ONLY if matches have `status: PLAYED`. Non-played matches (UPCOMING, CANCELLED, POSTPONED) should be cascade-deleted along with the group stage.

3. **Confirmation detail level:** Show counts only (e.g., "3 groups, 12 teams") - do not list individual group names.
