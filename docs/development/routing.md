# Routing Architecture

## Overview

Tournado uses **React Router v7** (the new evolution of Remix) with a file-based routing system that provides powerful features like nested routes, layouts, and advanced prefetching strategies.

## Route Configuration

All routes are defined in `app/routes.ts` using React Router v7's configuration format:

```typescript
import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
   // Public routes
   index('routes/index.tsx'),
   route('about', 'routes/about.tsx'),
   route('unauthorized', 'routes/unauthorized.tsx'),
   route('resources/healthcheck', 'routes/resources/healthcheck.tsx'),
   route('teams', 'layouts/teams-layout.tsx', [
      index('routes/teams/index.tsx'),
      route('new', 'routes/teams/new.tsx'),
      route(':teamId', 'routes/teams/team.tsx'),
   ]),

   // Auth routes (public)
   route('auth', 'layouts/auth-layout.tsx', [
      route('signin', 'routes/auth/signin.tsx'),
      route('signup', 'routes/auth/signup.tsx'),
      route('signout', 'routes/auth/signout.tsx'),
   ]),

   // Protected routes
   route('profile', 'routes/profile.tsx'),
   route('settings', 'routes/settings.tsx'),

   // Admin routes (role-protected)
   route('admin', 'routes/admin.tsx'),
] satisfies RouteConfig
```

## Route Structure

### Public Routes

| Route                    | File                               | Description                    |
| ------------------------ | ---------------------------------- | ------------------------------ |
| `/`                      | `routes/index.tsx`                 | Landing page with app overview |
| `/about`                 | `routes/about.tsx`                 | About page                     |
| `/unauthorized`          | `routes/unauthorized.tsx`          | Access denied page             |
| `/resources/healthcheck` | `routes/resources/healthcheck.tsx` | Health check endpoint          |

### Teams Routes (Nested Layout)

| Route            | File                                                  | Description                 |
| ---------------- | ----------------------------------------------------- | --------------------------- |
| `/teams`         | `layouts/teams-layout.tsx` + `routes/teams/index.tsx` | Teams listing page          |
| `/teams/new`     | `routes/teams/new.tsx`                                | Create new team form        |
| `/teams/:teamId` | `routes/teams/team.tsx`                               | Individual team detail page |

### Authentication Routes (Nested Layout)

| Route           | File                      | Description     |
| --------------- | ------------------------- | --------------- |
| `/auth/signin`  | `routes/auth/signin.tsx`  | Sign in form    |
| `/auth/signup`  | `routes/auth/signup.tsx`  | Sign up form    |
| `/auth/signout` | `routes/auth/signout.tsx` | Sign out action |

### Protected Routes

| Route       | File                  | Description       | Protection Level    |
| ----------- | --------------------- | ----------------- | ------------------- |
| `/profile`  | `routes/profile.tsx`  | User profile page | Authenticated users |
| `/settings` | `routes/settings.tsx` | User settings     | Authenticated users |
| `/admin`    | `routes/admin.tsx`    | Admin panel       | Admin role required |

## Route Metadata System

Each route can export a `handle` object that defines metadata for the route:

```typescript
export const handle: RouteMetadata = {
  isPublic: boolean,
  title?: string,
  auth?: {
    required?: boolean,
    redirectTo?: string,
    preserveRedirect?: boolean,
  },
  authorization?: {
    requiredRoles?: Array<'tournamentOrganiser' | 'admin' | 'referee' | 'participant'>,
    roleMatchMode?: 'all' | 'any',
    redirectTo?: string,
  },
  protection?: {
    autoCheck?: boolean,
    customCheck?: (request: Request, user?: User | null) => Promise<boolean | Response>,
  },
}
```

### Example Route Metadata

```typescript
// Public route
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.welcome',
}

// Protected route
export const handle: RouteMetadata = {
  isPublic: false,
  title: 'common.titles.profile',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
}

// Admin-only route
export const handle: RouteMetadata = {
  isPublic: false,
  title: 'Admin Panel',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
}
```

## Layout System

### Teams Layout (`app/layouts/teams-layout.tsx`)

Provides a sidebar navigation for teams management with dual rendering contexts:

- **Sidebar context**: Shows team list for navigation
- **Main context**: Shows selected team or prompt to create/select

### Auth Layout (`app/layouts/auth-layout.tsx`)

Simple layout wrapper for authentication pages.

## Route Protection

### Authentication Levels

1. **Public Routes**: Accessible to everyone

   - Landing page (`/`)
   - About page (`/about`)
   - All auth routes (`/auth/*`)

2. **Protected Routes**: Require authentication

   - Profile (`/profile`)
   - Settings (`/settings`)

3. **Role-Based Routes**: Require specific roles
   - Admin panel (`/admin`) - requires `admin` role

### Server-Side Protection

Route protection is handled server-side in loaders using utilities from `app/utils/route-utils.server.ts`:

```typescript
export async function loader({ request }: LoaderArgs) {
   // Enhanced protection automatically handles authentication and authorization
   const user = await requireUserWithMetadata(request, handle)
   return { user }
}
```

## Prefetching Strategy

The application implements an intelligent prefetching strategy to optimize navigation performance. See [Prefetching Strategy](../PREFETCHING_STRATEGY.md) for detailed information.

### Link Components

```typescript
// Primary navigation
<PrimaryNavLink to="/teams">Teams</PrimaryNavLink>

// Action buttons
<ActionLink to="/teams/new">Create Team</ActionLink>

// List items
<ListItemNavLink to={`/teams/${team.id}`}>{team.name}</ListItemNavLink>

// Error recovery
<ErrorRecoveryLink to="/">Back to Home</ErrorRecoveryLink>
```

## Navigation Patterns

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router'

function Component() {
   const navigate = useNavigate()

   const handleSuccess = () => {
      navigate('/teams', { replace: true })
   }
}
```

### Protected Navigation

```typescript
import { redirect } from 'react-router'

import { requireUser } from '~/utils/session.server'

export async function loader({ request }) {
   const user = await requireUser(request)
   // Route is protected
   return { user }
}
```

## Error Handling

### Error Boundaries

Each route can export an `ErrorBoundary` component to handle errors:

```typescript
export function ErrorBoundary() {
  return (
    <div>
      <h1>Something went wrong</h1>
      <ErrorRecoveryLink to="/">Go home</ErrorRecoveryLink>
    </div>
  )
}
```

### Catch-All Route

The `app/routes/$.tsx` file handles 404 errors for unmatched routes.

## SEO and Meta Tags

Each route can export a `meta` function for SEO optimization:

```typescript
export const meta: MetaFunction = () => [
   { title: 'Teams | Tournado' },
   { name: 'description', content: 'Manage your tournament teams' },
   { property: 'og:title', content: 'Teams | Tournado' },
   { property: 'og:description', content: 'Manage your tournament teams' },
   { property: 'og:type', content: 'website' },
]
```

## Internationalization

Routes support internationalization through the `usePageTitle()` hook:

```typescript
import { usePageTitle } from '~/utils/route-utils'

function Component() {
   const pageTitle = usePageTitle() // Gets translated title from route metadata
}
```

## Best Practices

### 1. Route Organization

- Group related routes in subdirectories
- Use layouts for shared UI components
- Keep route files focused and small

### 2. Route Protection

- Always define `isPublic` in route metadata
- Use server-side protection in loaders
- Implement proper error boundaries

### 3. Performance

- Use appropriate prefetching strategies
- Implement proper loading states
- Optimize bundle sizes with code splitting

### 4. SEO

- Export meta functions for all public routes
- Use semantic HTML and proper headings
- Implement proper Open Graph tags

## Migration Notes

This application has been migrated to React Router v7 from Remix. Key changes:

- Route configuration moved to `app/routes.ts`
- File-based routing still supported but using explicit configuration
- Enhanced prefetching capabilities
- Improved error handling and type safety
