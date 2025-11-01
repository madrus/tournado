# What to do next

The following analysis is from October 30, 2025

## 1. Based on my review of TASK-0201, here's the current status:

✅ Completed (Steps 0-9)

- RBAC permissions setup
- Database schema (UserAuditLog model, User.active field)
- Audit log data access layer
- User model management functions
- User list and detail routes
- All UI components (UserListTable, UserDetailCard, UserAuditLogList)
- AppBar integration and icons
- Utility functions (roleUtils)
- i18n strings (English and Dutch)
- ComboField styling enhancements

❌ NOT Completed - Your Doubt is Valid

Step 10: Unit Tests (Missing)

- The file app/models/**tests**/user.server.test.ts does not exist
- Only ComboField component tests were updated
- Need to add tests for:
   - updateUserRole
   - deactivateUser
   - reactivateUser
   - getUsersByRole
   - searchUsers
   - getPendingApprovalUsers
   - getAllUsersWithPagination

Step 11: E2E Tests (Missing)

- The file playwright/tests/users.spec.ts does not exist
- Despite the task saying "E2E Tests completed", all checkboxes are unchecked
- Need to create comprehensive E2E tests for the entire user management workflow

Step 12: Firebase Integration (Pending)

- User deactivation not integrated with Firebase auth
- Deactivated users can still sign in
- Active sessions not invalidated when user is deactivated

Summary

The core functionality (Steps 0-9) is complete, but testing and Firebase integration (Steps
10-12) are missing. Would you like me to:

1. Create the missing unit tests (Step 10)?
2. Create the E2E tests (Step 11)?
3. Implement the Firebase integration (Step 12)?
4. All of the above?

Before that

1. eliminate TEST_TRANSLATIONS if client side
2.

## 2. To show a block with 2 teams that are going to play a match, you need:

- From Match model (schema.prisma:121-137):
   - id, date, time, location, status
   - homeTeamId, awayTeamId

- From Team model (schema.prisma:91-105):
   - id, name, clubName, category, division

- Optional from MatchScore model (schema.prisma:139-147):
   - homeTeamScore, awayTeamScore (if match is played)

So the essential data structure would be:

```ts
{
   match: {
   id: string,
   date: DateTime,
   time: DateTime,
   location: string,
   status: MatchStatus,
   homeTeam: { name: string, clubName: string },
   awayTeam: { name: string, clubName: string }
   }
}
```

```
@app/components/buttons/ActionButton.tsx (AB)  @app/components/buttons/IconLabelButton.tsx
  (ILB) I want to do some refactorings of these 2 buttons in such a way that there are visually
  no changes on the screen.

  1. AB should get an optional icon parameter like ILB
  2.
```
