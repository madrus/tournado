# Role-Based Access Control (RBAC)

This document describes the Role-Based Access Control system implemented in Tournado, including security fixes and best practices for route parameter handling.

## Overview

The RBAC system provides fine-grained access control based on user roles and permissions. It includes middleware for route protection, permission checking, and secure parameter handling.

## Core Components

### Roles and Permissions

The system defines four user roles with hierarchical permissions:

```typescript
// app/utils/rbac.ts
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
   PUBLIC: ['teams:read', 'tournaments:read', 'matches:read'],
   REFEREE: [
      'teams:read',
      'tournaments:read',
      'matches:read',
      'matches:edit',
      'matches:referee',
   ],
   MANAGER: [
      'teams:read',
      'teams:create',
      'teams:edit',
      'teams:delete',
      'tournaments:read',
      'tournaments:create',
      'tournaments:edit',
      'matches:read',
      'matches:create',
      'matches:edit',
   ],
   ADMIN: [
      // All permissions including 'teams:manage', 'tournaments:manage', etc.
   ],
}
```

### RBAC Middleware

The middleware provides route-level protection with permission checking:

```typescript
// app/utils/rbacMiddleware.server.ts
export async function requireUserWithPermission(
   request: Request,
   permission: Permission,
   options?: {
      redirectTo?: string
      allowSelfAccess?: boolean
      userIdParam?: string
      params?: Record<string, string | undefined>
   }
): Promise<User>
```

## Security Fix: URL Parameter Handling

### Problem (Fixed in January 2025)

The original implementation had a critical security vulnerability in how it parsed URL parameters for self-access control:

```typescript
// ❌ VULNERABLE: Manual URL parsing
const userIdIndex = pathSegments.findIndex(
   segment => segment === options.userIdParam?.replace(':', '')
)
const targetUserId = pathSegments[userIdIndex + 1]
```

**Issues:**

- Searched for parameter name in URL segments instead of extracting the actual value
- Vulnerable to path manipulation attacks
- Unreliable parameter extraction
- Could allow unauthorized access to user resources

### Solution (Current Implementation)

The fix uses React Router's built-in parameter parsing:

```typescript
// ✅ SECURE: Use route params directly
if (options?.allowSelfAccess && options?.userIdParam && options?.params) {
  const paramName = options.userIdParam.replace(':', '')
  const targetUserId = options.params[paramName]

  if (targetUserId === user.id) {
    return user // User can access their own resources
  }
}
```

**Security Benefits:**

- Uses React Router's validated parameter parsing
- No manual URL manipulation
- Type-safe parameter extraction
- Eliminates path traversal vulnerabilities

## Usage Examples

### Basic Permission Check

```typescript
// app/routes/tournaments/tournaments._index.tsx
export async function loader({ request }: Route.LoaderArgs) {
   // Require permission to read tournaments
   await requireUserWithPermission(request, 'tournaments:read')

   const tournaments = await getAllTournaments()
   return { tournaments }
}
```

### Self-Access Control (Fixed Implementation)

For routes where users should access their own resources:

```typescript
// app/routes/users/users.$userId.profile.tsx
export async function loader({ request, params }: Route.LoaderArgs) {
   // ✅ CORRECT: Pass params from route loader
   const user = await requireUserWithPermission(request, 'profile:read', {
      allowSelfAccess: true,
      userIdParam: 'userId',
      params: params, // Pass the route params directly
   })

   // User can access their own profile, or admin can access any profile
   return { user }
}
```

### Admin-Only Access

```typescript
// app/routes/admin/admin._index.tsx
export async function loader({ request }: Route.LoaderArgs) {
   // Require admin panel access (ADMIN, MANAGER, or REFEREE roles)
   const user = await requireAdminUser(request)
   return { user }
}
```

## Role-Based Redirects

Users are redirected to appropriate landing pages based on their role after authentication:

```typescript
// app/utils/roleBasedRedirects.ts
const ROLE_LANDING_PAGES = {
   ADMIN: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Admin panel
   MANAGER: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Admin panel
   REFEREE: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Admin panel
   PUBLIC: '/', // Homepage
}
```

## Testing RBAC

### Unit Testing

Test permission functions with different user roles:

```typescript
// test/utils/rbac.test.ts
describe('RBAC permissions', () => {
   test('REFEREE can referee matches', () => {
      const referee = { role: 'REFEREE' } as User
      expect(hasPermission(referee, 'matches:referee')).toBe(true)
   })

   test('PUBLIC cannot manage tournaments', () => {
      const publicUser = { role: 'PUBLIC' } as User
      expect(hasPermission(publicUser, 'tournaments:manage')).toBe(false)
   })
})
```

### Integration Testing

Test middleware protection with different roles:

```typescript
// playwright/tests/rbac.spec.ts
test('REFEREE can access admin panel but not user management', async ({ page }) => {
   const referee = await createRefereeUser()

   await signIn(page, referee.email, 'password')

   // Should access admin panel
   await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')

   // Should not see user management options
   await expect(page.getByText('User Management')).not.toBeVisible()
})
```

## Security Best Practices

### 1. Always Use Server-Side Validation

```typescript
// ✅ CORRECT: Server-side permission check
export async function loader({ request }: Route.LoaderArgs) {
   await requireUserWithPermission(request, 'sensitive:read')
   // ... route logic
}

// ❌ WRONG: Client-side only (security vulnerability)
function SensitiveComponent() {
   const user = useUser()
   if (!hasPermission(user, 'sensitive:read')) return null
   // Client-side checks are for UX only, not security
}
```

### 2. Use Route Params Correctly

```typescript
// ✅ CORRECT: Pass route params to middleware
export async function loader({ request, params }: Route.LoaderArgs) {
   const user = await requireUserWithPermission(request, 'profile:read', {
      allowSelfAccess: true,
      userIdParam: 'userId',
      params: params, // Always pass route params
   })
}

// ❌ WRONG: Don't parse URLs manually
const url = new URL(request.url)
const userId = url.pathname.split('/')[2] // Vulnerable to manipulation
```

### 3. Implement Defense in Depth

```typescript
// Multiple layers of protection
export async function loader({ request, params }: Route.LoaderArgs) {
   // 1. Authentication check
   const user = await requireUserWithPermission(request, 'profile:read', {
      allowSelfAccess: true,
      userIdParam: 'userId',
      params: params,
   })

   // 2. Additional business logic validation
   const profile = await getProfileById(params.userId)
   if (!profile || (profile.userId !== user.id && !isAdmin(user))) {
      throw new Response('Forbidden', { status: 403 })
   }

   return { profile }
}
```

## Troubleshooting

### Common Issues

1. **"User cannot access their own resource"**
   - Ensure `params` object is passed to middleware
   - Verify `userIdParam` matches the route parameter name
   - Check that user IDs match exactly (string vs number types)

2. **"Permission denied for valid user"**
   - Verify the user's role includes the required permission
   - Check if the permission name is spelled correctly
   - Ensure the user session is valid and not expired

3. **"Route not properly protected"**
   - Add `requireUserWithPermission()` call to route loader
   - Verify the permission is appropriate for the route's functionality
   - Test with different user roles to ensure proper access control

### Security Checklist

When implementing new protected routes:

- [ ] Add server-side permission check to route loader/action
- [ ] Use correct permission for the route's functionality
- [ ] Pass route `params` when using `allowSelfAccess`
- [ ] Test with different user roles
- [ ] Add client-side permission checks for UX (not security)
- [ ] Document the required permission and user roles

## Migration from Legacy System

### Before (Admin-Only)

```typescript
// Old: Binary admin/non-admin check
export async function loader({ request }: Route.LoaderArgs) {
   await requireAdmin(request) // Only admins allowed
   // ...
}
```

### After (Role-Based)

```typescript
// New: Granular permission-based check
export async function loader({ request }: Route.LoaderArgs) {
   await requireUserWithPermission(request, 'tournaments:read') // Multiple roles allowed
   // ...
}
```

**How Multiple Roles Work:**

When you specify a single permission like `'tournaments:read'`, the middleware automatically allows **all roles** that have this permission in the permission matrix. For example:

- `PUBLIC` role has `'tournaments:read'` ✅ **Allowed**
- `REFEREE` role has `'tournaments:read'` ✅ **Allowed**
- `MANAGER` role has `'tournaments:read'` ✅ **Allowed**
- `ADMIN` role has `'tournaments:read'` ✅ **Allowed**

So this single permission check effectively allows **four different roles** to access the route. You don't need to specify multiple roles - the permission system handles the mapping automatically based on which roles include that permission.

This allows for more flexible access control where MANAGER and REFEREE roles can access specific admin functionality without full admin privileges.

---

> **Security Note**: The URL parameter parsing fix addresses a critical vulnerability where manual URL parsing could be manipulated. Always use React Router's built-in parameter parsing for security-sensitive operations.
