# Resource Routes Architecture

This document describes the resource route pattern used in Tournado for separating UI route access from data access permissions.

## Overview

**Resource Routes** are React Router v7 routes that serve only data (JSON) without any UI component. They follow the pattern of having a `loader` or `action` function but **no default export**.

This architectural pattern enables:

- **Separation of concerns**: UI access control vs. data access control
- **Multi-role data access**: Multiple roles can access the same data without accessing admin UIs
- **API endpoints**: Clean JSON endpoints for client-side fetching or external integrations

## Two-Tier Authorization System

### 1. UI Route Authorization (Role-Based)

**Purpose**: Control who can access admin UI pages

**Implementation**: `requireUserWithMetadata` + `RouteMetadata.authorization.requiredRoles`

**Example**:

```typescript
// app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/tournaments._index.tsx
export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['ADMIN', 'MANAGER'], // Only ADMIN and MANAGER can access UI
  },
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserWithMetadata(request, handle) // Role-based check
  // ... load data for UI
}
```

### 2. Data Access Authorization (Permission-Based)

**Purpose**: Control who can access data regardless of UI access

**Implementation**: `requireUserWithPermission` + RBAC permission matrix

**Example**:

```typescript
// app/routes/api.tournaments.tsx (Resource Route)
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  await requireUserWithPermission(request, 'tournaments:read') // Permission-based check

  const tournaments = await getAllTournaments()

  return Response.json({ tournaments })
}

// No default export = Resource route (data-only, no UI)
```

## When to Create a Resource Route

### ✅ Create a Resource Route When:

1. **Multiple roles need data access**
   - Different roles (e.g., REFEREE, EDITOR, BILLING) need the same data
   - Roles shouldn't access the admin UI managing that data
   - **Example**: `api.tournaments.tsx` allows REFEREE to fetch tournaments without accessing admin UI

2. **Client-side data fetching needed**
   - Dynamic loading via JavaScript/AJAX
   - Progressive enhancement patterns
   - **Example**: Loading tournament list in a dropdown without page reload

3. **External integrations**
   - Mobile app endpoints
   - Third-party API access
   - **Example**: Mobile app fetching team data via `/api/teams`

4. **Permission-based access is more natural**
   - Access control better expressed through RBAC permissions
   - Permission spans multiple roles
   - **Example**: `tournaments:read` permission used by 6 different roles

### ❌ Don't Create a Resource Route When:

- Only one role needs the data AND has UI access → Use UI route loader
- Data only used server-side for rendering → Keep in UI route
- Access pattern exactly matches UI access pattern → No need for separation

## Existing Resource Routes

### api.tournaments.tsx

- **Permission**: `tournaments:read`
- **Roles with access**: PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN
- **Use cases**:
  - REFEREE: View tournaments for assigned match filtering
  - EDITOR: Access tournament data for reporting
  - PUBLIC: View public tournament listings

### api.teams.tsx

- **Permission**: `teams:read`
- **Roles with access**: PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN (all roles!)
- **Use cases**:
  - REFEREE: View teams in assigned matches
  - EDITOR: Generate team reports
  - PUBLIC: View team information in public listings

## Resource Route Template

```typescript
/**
 * Resource Route: [Entity] API
 *
 * Pure data endpoint for [entity] access across user roles.
 * This route has no UI component - it only serves JSON data.
 *
 * Authorization: Permission-based ([permission])
 * - [List of roles with access]
 *
 * Use cases:
 * - ROLE: Description of use case
 */
import type { LoaderFunctionArgs } from 'react-router'

import { getAll[Entity] } from '~/models/[entity].server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  // Permission-based authorization
  await requireUserWithPermission(request, '[entity]:read')

  // Get data (future: add filtering via query params)
  const items = await getAll[Entity]()

  // Serialize dates to ISO strings if needed
  const itemsList = items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }))

  // Return JSON using native Response.json()
  return Response.json({ items: itemsList })
}

// No default export = Resource route (data-only, no UI)
```

## File Naming Convention

Resource routes use **dot notation** to clearly distinguish them from UI routes:

- ✅ `api.tournaments.tsx` - Resource route
- ✅ `api.teams.tsx` - Resource route
- ✅ `api.groups.tsx` - Resource route
- ❌ `api/tournaments.tsx` - Would be a nested route under `/api`

This creates clean URLs like `/api/tournaments`, `/api/teams`, etc.

## Accessing Resource Routes

### From UI Components

```typescript
// Using Link with reloadDocument for download/export
<Link to="/api/tournaments" reloadDocument>
  Download Tournaments
</Link>

// Using fetch for client-side data loading
const response = await fetch('/api/tournaments')
const { tournaments } = await response.json()
```

### Query Parameters (Future Enhancement)

Resource routes can be extended with filtering via query params:

```typescript
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  await requireUserWithPermission(request, 'tournaments:read')

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const year = url.searchParams.get('year')

  const tournaments = await getTournamentsFiltered({ status, year })

  return Response.json({ tournaments })
}
```

Usage: `/api/tournaments?status=active&year=2025`

## Testing Resource Routes

### Unit Tests

Resource routes require custom test approach since they use permission-based auth:

```typescript
// test/routes/api.tournaments.test.ts
describe('Resource Route: /api/tournaments', () => {
  const rolesWithAccess: Role[] = [
    'PUBLIC',
    'REFEREE',
    'EDITOR',
    'BILLING',
    'MANAGER',
    'ADMIN',
  ]

  rolesWithAccess.forEach(role => {
    it(`${role} users should access (has tournaments:read permission)`, async () => {
      const mockUser = createMockUser(role)
      vi.mocked(getUser).mockResolvedValue(mockUser)

      const request = new Request('http://localhost/api/tournaments')
      const response = await loader({ request, params: {}, context: {} })
      const json = await response.json()

      expect(json).toHaveProperty('tournaments')
      expect(Array.isArray(json.tournaments)).toBe(true)
    })
  })
})
```

### E2E Tests

Test resource routes like any API endpoint:

```typescript
test('REFEREE can fetch tournament data via API', async ({ page, request }) => {
  // Login as REFEREE
  await loginAsReferee(page)

  // Fetch from resource route
  const response = await request.get('/api/tournaments')
  expect(response.ok()).toBeTruthy()

  const json = await response.json()
  expect(json.tournaments).toBeDefined()
})
```

## Migration from Permission-Based UI Routes

When converting a UI route from `requireUserWithPermission` to `requireUserWithMetadata`:

1. **Identify the permission** used (e.g., `tournaments:read`)
2. **Check RBAC matrix** to see which roles have that permission
3. **Convert UI route** to use `requireUserWithMetadata` with appropriate roles
4. **Create resource route** if multiple roles need data access
5. **Write unit tests** for both UI route and resource route

**Example Migration**:

```typescript
// BEFORE: UI route using permission-based auth
export async function loader({ request }: Route.LoaderArgs) {
  await requireUserWithPermission(request, 'tournaments:read') // ❌ Too permissive for UI
  const tournaments = await getAllTournaments()
  return { tournaments }
}

// AFTER: UI route with role-based auth
export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['ADMIN', 'MANAGER'], // ✅ Only admin roles for UI
  },
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserWithMetadata(request, handle)
  const tournaments = await getAllTournaments()
  return { tournaments }
}

// NEW: Resource route for broader data access
// app/routes/api.tournaments.tsx
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  await requireUserWithPermission(request, 'tournaments:read') // ✅ REFEREE, EDITOR, etc. can access
  const tournaments = await getAllTournaments()
  return Response.json({ tournaments })
}
```

## React Router v7 Specifics

### Using Response.json()

React Router v7 recommends using native `Response.json()` instead of the deprecated `json()` helper:

```typescript
// ✅ Correct (React Router v7)
return Response.json({ tournaments })

// ❌ Deprecated (Remix/older RR versions)
return json({ tournaments })
```

### Resource Route Detection

Routes without a default export are automatically treated as resource routes:

```typescript
// Resource route (no default export)
export async function loader() {
  /* ... */
}

// UI route (has default export)
export default function Component() {
  /* ... */
}
export async function loader() {
  /* ... */
}
```

## Best Practices

1. **Always add explicit return type**: `Promise<Response>` for loader functions
2. **Document permissions**: Clear comments showing which roles have access
3. **Serialize dates**: Convert Date objects to ISO strings for JSON transport
4. **Plan for filtering**: Design with query param support in mind
5. **Test all roles**: Ensure every role with the permission can access the route
6. **Follow naming convention**: Use `api.[entity].tsx` pattern consistently

## Related Documentation

- [RBAC Security](/docs/security/rbac.md)
- [Routing Guide](/docs/development/routing.md)
- [Testing Strategy](/docs/testing/overview.md)
- [Authentication](/docs/development/authentication.md)

---

#architecture #react-router #authorization #resource-routes #api
