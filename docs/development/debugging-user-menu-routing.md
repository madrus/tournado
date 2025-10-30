# Debugging User Menu Routing Issue

## Problem Summary

**Issue**: The Users menu option in the user menu does not appear, preventing navigation to `/a7k9m2x5p8w1n4q6r3y8b5t1/users`, even though unit tests are passing.

**Root Cause**: The Users menu item is conditionally rendered based on user permissions, specifically the `users:approve` permission, which is only available to users with the `ADMIN` role.

## Why Unit Tests Were Green

The existing unit tests (`app/components/__tests__/UserMenu.test.tsx`) were testing the `UserMenu` component in isolation with hardcoded menu items that included the Users option. These tests were passing because:

1. **Component works correctly**: The `UserMenu` component properly renders whatever menu items are passed to it
2. **Navigation logic works**: The click handlers and navigation functions work as expected
3. **Isolated testing**: The tests didn't account for the real-world permission-based filtering that happens in `AppBar.tsx`

## The Real Issue: Permission-Based Menu Filtering

In `app/components/AppBar.tsx`, the Users menu item is only added to the menu items array if the user has the `users:approve` permission:

```typescript
// Users - only show for ADMIN users
...(canAccess(user || null, 'users:approve')
  ? [
      {
        label: t('common.titles.users'),
        icon: 'people' as IconName,
        href: '/a7k9m2x5p8w1n4q6r3y8b5t1/users',
        authenticated: true,
      },
    ]
  : []),
```

## RBAC Permission Matrix

According to `app/utils/rbac.ts`, only the `ADMIN` role has the `users:approve` permission:

| Role    | Has `users:approve` | Can See Users Menu |
| ------- | ------------------- | ------------------ |
| PUBLIC  | ❌ No               | ❌ No              |
| REFEREE | ❌ No               | ❌ No              |
| EDITOR  | ❌ No               | ❌ No              |
| BILLING | ❌ No               | ❌ No              |
| MANAGER | ❌ No               | ❌ No              |
| ADMIN   | ✅ Yes              | ✅ Yes             |

## Solution: Enhanced Testing Strategy

To prevent this issue in the future, we now have two types of tests:

### 1. Component Unit Tests (`UserMenu.test.tsx`)

- Test the `UserMenu` component in isolation
- Verify that it renders provided menu items correctly
- Test navigation functionality
- **New**: Test that it only shows menu items that are actually provided

### 2. Integration Tests (`AppBar.integration.test.tsx`)

- Test the complete `AppBar` component with different user roles
- Verify that menu items are correctly filtered based on permissions
- Test the real-world scenario where permissions determine menu visibility

## Debugging Steps for Similar Issues

When a menu item or route doesn't appear:

1. **Check User Role**: Verify the current user's role in the database or through browser dev tools
2. **Check Permissions**: Look up the required permission in `app/utils/rbac.ts`
3. **Check Menu Logic**: Examine the conditional logic in `app/components/AppBar.tsx`
4. **Test Both Levels**:
   - Unit test the component in isolation
   - Integration test the complete permission flow

## How to Check Current User Permissions

### In Browser Dev Tools

```javascript
// In browser console, if user data is available
console.log('User role:', window.__USER__?.role)
console.log('User permissions:', window.__PERMISSIONS__)
```

### In Code (for debugging)

```typescript
import { canAccess } from '~/utils/rbac'

// Check if current user has specific permission
const hasUsersPermission = canAccess(user, 'users:approve')
console.log('Can access users:', hasUsersPermission)
```

### In Database

```sql
-- Check user role directly in database
SELECT id, email, role, active FROM User WHERE email = 'your-email@example.com';
```

## Related Files

- **RBAC Configuration**: `app/utils/rbac.ts`
- **Menu Logic**: `app/components/AppBar.tsx` (lines 121-130)
- **User Menu Component**: `app/components/UserMenu.tsx`
- **Unit Tests**: `app/components/__tests__/UserMenu.test.tsx`
- **Integration Tests**: `app/components/__tests__/AppBar.integration.test.tsx`
- **Routes**: `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/users/`

## Key Takeaways

1. **Unit tests alone are insufficient** for testing permission-based UI features
2. **Integration tests are essential** for testing the complete user experience
3. **Permission-based features require role-specific testing** across all user roles
4. **Always test both positive and negative cases** (what should and shouldn't appear)
5. **Document permission requirements** clearly for each feature

## Future Prevention

- Always create integration tests for permission-based features
- Test with different user roles, not just the "happy path"
- Document which permissions are required for each menu item or feature
- Consider adding runtime permission checks in development mode to help debug issues
