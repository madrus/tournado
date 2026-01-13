# Routing

This project uses **React Router v7 with custom flat routes discovery** for organized flat routes in subdirectories with proper nested routing.

## Route Structure

Routes are **automatically discovered** from organized subdirectories with flat route naming and properly configured as nested parent-child relationships:

```text
app/routes/
├── _index.tsx                                 →  /
├── about.tsx                                  →  /about
├── profile.tsx                                →  /profile
├── settings.tsx                               →  /settings
├── unauthorized.tsx                           →  /unauthorized
├── $.tsx                                      →  /* (catch-all)
├── favicon[.]ico.ts                           →  /favicon.ico
│
├── teams/                                     (Teams section)
│   ├── teams.tsx                              →  /teams (layout)
│   ├── teams._index.tsx                       →  /teams (index child)
│   ├── teams.new.tsx                          →  /teams/new (child)
│   └── teams.$teamId.tsx                      →  /teams/:teamId (child)
│
├── auth/                                      (Auth section)
│   ├── auth.tsx                               →  /auth (layout)
│   ├── auth.signin.tsx                        →  /auth/signin (child)
│   ├── auth.signup.tsx                        →  /auth/signup (child)
│   └── auth.signout.tsx                       →  /auth/signout (child)
│
├── a7k9m2x5p8w1n4q6r3y8b5t1/                  (Admin section)
│   ├── a7k9m2x5p8w1n4q6r3y8b5t1.tsx          →  /a7k9m2x5p8w1n4q6r3y8b5t1 (layout)
│   ├── a7k9m2x5p8w1n4q6r3y8b5t1._index.tsx   →  /a7k9m2x5p8w1n4q6r3y8b5t1 (index child)
│   ├── teams/                                 (Admin Teams section)
│   │   ├── teams.tsx                          →  /a7k9m2x5p8w1n4q6r3y8b5t1/teams (layout)
│   │   ├── teams._index.tsx                   →  /a7k9m2x5p8w1n4q6r3y8b5t1/teams (index)
│   │   ├── teams.new.tsx                      →  /a7k9m2x5p8w1n4q6r3y8b5t1/teams/new
│   │   └── teams.$teamId.tsx                  →  /a7k9m2x5p8w1n4q6r3y8b5t1/teams/:teamId
│   └── tournaments/                           (Admin Tournaments section)
│       ├── tournaments.tsx                    →  /a7k9m2x5p8w1n4q6r3y8b5t1/tournaments (layout)
│       ├── tournaments._index.tsx             →  /a7k9m2x5p8w1n4q6r3y8b5t1/tournaments (index)
│       ├── tournaments.new.tsx                →  /a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new
│       └── tournaments.$tournamentId.tsx      →  /a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/:tournamentId
│
└── resources/                                 (Resources section)
    └── resources.healthcheck.tsx              →  /resources/healthcheck
```

## Implementation Architecture

The routing system uses a clean two-step process:

### 1. Route Discovery (`config/flat-routes.ts`)

Automatically scans all route files and creates proper nested route configurations:

```typescript
type RouteEntry = {
	path: string
	file: string
	isLayout: boolean
	children?: RouteEntry[]
}

export function createFlatRoutes(): RouteEntry[] {
	const routesDir = path.join(process.cwd(), 'app/routes')

	// Find all .tsx files in routes directory and subdirectories
	const files = glob.sync('**/*.{ts,tsx}', {
		cwd: routesDir,
		ignore: ['**/*.test.*', '**/*.spec.*', '**/.*'],
	})

	const routeMap: RouteMap = {}

	// First pass: Create route entries
	files.forEach((file) => {
		const segments = file.replace(/\.(ts|tsx)$/, '').split('/')
		const fileName = segments[segments.length - 1]
		const dirName = segments.length > 1 ? segments[segments.length - 2] : null

		let routePath: string
		let isLayout = false

		// Layout detection: teams/teams.tsx -> layout
		if (dirName === fileName) {
			routePath = '/' + fileName
			isLayout = true
		} else if (fileName === '_index') {
			// Index routes: teams/teams._index.tsx -> /teams::_index
			const parentPath = '/' + segments[0]
			routePath = parentPath + '::_index'
		} else if (segments.length === 1) {
			// Root level routes: about.tsx -> /about
			routePath = fileName === 'favicon[.]ico' ? '/favicon.ico' : '/' + fileName
		} else {
			// Child routes: teams/teams.new.tsx -> /teams::new
			const baseSegment = segments[0]
			const parentPath = '/' + baseSegment
			const childPath = segments
				.slice(1)
				.join('/')
				.replace(/\$([^/]+)/g, ':$1')
			routePath = parentPath + '::' + childPath
		}

		routeMap[routePath] = { path: routePath, file: `routes/${file}`, isLayout }
	})

	// Second pass: Build nested structure
	const routes: RouteEntry[] = []
	const layoutMap = new Map<string, RouteEntry>()

	// Create layout routes first
	Object.values(routeMap).forEach((route) => {
		if (route.isLayout) {
			const layoutRoute: RouteEntry = {
				path: route.path,
				file: route.file,
				isLayout: true,
				children: [],
			}
			routes.push(layoutRoute)
			layoutMap.set(route.path, layoutRoute)
		}
	})

	// Add child routes to their layouts
	Object.values(routeMap).forEach((route) => {
		if (!route.isLayout && route.path.includes('::')) {
			const [parentPath, childPath] = route.path.split('::')
			const layout = layoutMap.get(parentPath)

			if (layout && layout.children) {
				if (childPath === '_index') {
					layout.children.push({
						path: route.path,
						file: route.file,
						isLayout: false,
						index: true,
					})
				} else {
					layout.children.push({
						path: childPath,
						file: route.file,
						isLayout: false,
					})
				}
			}
		} else if (!route.isLayout && !route.path.includes('::')) {
			// Root level routes
			routes.push({
				path: route.path,
				file: route.file,
				isLayout: false,
			})
		}
	})

	return routes
}
```

### 2. Route Configuration (`app/routes.ts`)

Simple configuration that uses the flat routes scanner:

```typescript
import { type RouteConfig } from '@react-router/dev/routes'
import { createFlatRoutes } from '../config/flat-routes'

const flatRoutes = createFlatRoutes()

// Convert to React Router format
const routeConfig: RouteConfig = flatRoutes.map((route) => {
	if (route.isLayout && route.children) {
		return {
			path: route.path,
			file: route.file,
			children: route.children.map((child) => ({
				...(child.index ? { index: true } : { path: child.path }),
				file: child.file,
			})),
		}
	}

	return {
		path: route.path,
		file: route.file,
	}
})

export default routeConfig
```

### 3. Vite Configuration (`vite.config.ts`)

Simple configuration that uses the standard React Router approach:

```typescript
import { reactRouter } from '@react-router/dev/vite'

export default defineConfig({
	plugins: [
		reactRouter(), // Uses app/routes.ts automatically
	],
})
```

## File Naming Convention

- **Folders**: Group related functionality (`teams/`, `auth/`, `a7k9m2x5p8w1n4q6r3y8b5t1/`)
- **Flat naming**: Use dots for segments (`teams.new.tsx`, `auth.signin.tsx`)
- **Parameters**: Use `$` prefix (`teams.$teamId.tsx` → `:teamId`)
- **Index routes**: Use `_index` suffix (`teams._index.tsx`)
- **Layouts**: Use the parent name (`teams.tsx`, `auth.tsx`)

## Nested Route Behavior

### Layout Routes

Files like `teams/teams.tsx` become layout components that render:

- Shared UI (sidebar, navigation, etc.)
- `<Outlet />` for child routes

### Child Routes

Files like `teams/teams._index.tsx`, `teams/teams.new.tsx` render inside the layout's `<Outlet />`.

### Context Sharing

Layouts can pass context to children using `<Outlet context={...} />`:

```typescript
// In teams.tsx (layout)
<Outlet context={{ type: 'main' }} />

// In teams._index.tsx (child)
const context = useOutletContext<{ type: string }>()
```

## Benefits

✅ **Automatic Discovery**: No manual route configuration needed
✅ **Organized**: Related routes clustered in folders
✅ **Proper Nesting**: Parent-child route relationships work correctly
✅ **Type-safe**: Full TypeScript support with route parameters
✅ **Clean Logic**: Simple, maintainable route scanning
✅ **Consistent**: All route clusters follow the same pattern
✅ **Scalable**: Add new routes by just creating files

## Adding New Routes

### 1. Create the route file in the appropriate folder

```typescript
// app/routes/teams/teams.schedule.tsx
export default function TeamSchedule() {
  return <div>Team Schedule</div>
}
```

### 2. That's it! Routes are automatically discovered

The route `/teams/schedule` will be automatically available as a child of the teams layout after:

```bash
pnpm typecheck  # Regenerates types
```

### 3. For new sections, create both layout and children

```typescript
// app/routes/tournaments/tournaments.tsx (layout)
export default function TournamentsLayout() {
  return (
    <div>
      <h1>Tournaments</h1>
      <Outlet />
    </div>
  )
}

// app/routes/tournaments/tournaments._index.tsx (index)
export default function TournamentsIndex() {
  return <div>Tournaments List</div>
}
```

No additional configuration needed - the scanner will automatically detect the new layout and children!

## Creating a New Route Cluster

To create a completely new route cluster (e.g., "games"), follow these steps:

### Step 1: Create the File Structure

```text
app/routes/games/
├── games.tsx                    →  /games (layout)
├── games._index.tsx             →  /games (index child)
├── games.new.tsx                →  /games/new (child)
├── games.$gameId.tsx            →  /games/:gameId (child)
└── games.$gameId.edit.tsx       →  /games/:gameId/edit (child)
```

### Step 2: Create the Layout Component

```typescript
// app/routes/games/games.tsx
import { Outlet } from 'react-router'

export default function GamesLayout() {
  return (
    <div className="games-layout">
      <h1>Games</h1>
      <nav>
        {/* Navigation for games section */}
      </nav>
      <Outlet context={{ type: 'main' }} />
    </div>
  )
}
```

### Step 3: Create Child Components

```typescript
// app/routes/games/games._index.tsx
import { useOutletContext } from 'react-router'

export default function GamesIndex() {
  const context = useOutletContext<{ type: string }>()
  return <div>Games List</div>
}

// app/routes/games/games.new.tsx
export default function NewGame() {
  return <div>Create New Game</div>
}

// app/routes/games/games.$gameId.tsx
export default function GameDetails() {
  return <div>Game Details</div>
}
```

### Step 4: Run Type Generation

```bash
pnpm typecheck  # Regenerates types and discovers new routes
```

### Result

Your new games cluster will be automatically available with the following routes:

- `/games` - Games layout with index
- `/games/new` - Create new game
- `/games/:gameId` - Game details
- `/games/:gameId/edit` - Edit game

**No manual configuration required!** The flat routes scanner automatically detects the layout pattern and creates proper nested routes.

## How It Works

1. **File Scanning**: `config/flat-routes.ts` recursively scans `app/routes/` subdirectories
2. **Layout Detection**: Identifies layouts where `dirName === fileName` (e.g., `teams/teams.tsx`)
3. **Route Mapping**: Creates route map with `::` separators for parent-child relationships
4. **Nested Structure**: Two-pass system builds proper parent-child route hierarchy
5. **Type Generation**: React Router generates full TypeScript support
6. **Hot Reloading**: Vite automatically reloads when route files change

This approach gives you **automatic route discovery** with organized folder structure, proper nested routing behavior, and zero configuration overhead for new routes. The clean, consistent logic makes it easy to understand and maintain.

## Authentication & Authorization Flow

### Post-Login Routing Behavior

**All authenticated users are redirected to the Admin Panel after successful login**:

```typescript
// app/routes/auth/auth.signin.tsx
export const loader = async ({ request }: LoaderArgs): Promise<object> => {
	const user = await getUser(request)
	if (user) {
		// Always redirect all authorized users to Admin Panel
		return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1')
	}
	return {}
}

export const action = async ({ request }: ActionArgs): Promise<Response> => {
	// ... validation logic ...

	// Always redirect all authorized users to Admin Panel
	return createUserSession({
		redirectTo: '/a7k9m2x5p8w1n4q6r3y8b5t1',
		remember: remember === 'on' ? true : false,
		request,
		userId: user.id,
	})
}
```

### Route Protection Levels

#### 1. Public Routes (No Authentication Required)

- `/` - Homepage
- `/teams` - Public teams listing
- `/about` - About page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

#### 2. Authenticated Routes (Login Required)

- `/a7k9m2x5p8w1n4q6r3y8b5t1` - Admin Panel (all authenticated users)
- `/a7k9m2x5p8w1n4q6r3y8b5t1/teams` - Admin Teams (all authenticated users)
- `/profile` - User profile
- `/settings` - User settings

#### 3. Admin-Only Routes (ADMIN Role Required)

- `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments` - Tournament management
- `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new` - Create tournament
- `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/:tournamentId` - Edit tournament

### Route Metadata Example

Routes use metadata to define their protection requirements:

```typescript
// Admin-only route example
export const handle: RouteMetadata = {
  isPublic: false,
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

// Authenticated-only route example
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access
}
```

### Navigation Menu Structure

The `AppBar` component dynamically shows menu items based on user authentication and role:

#### For Admin Users:

1. **Tournaments** (admin only) - `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments`
2. **Teams** - `/a7k9m2x5p8w1n4q6r3y8b5t1/teams`
3. **Admin Panel** - `/a7k9m2x5p8w1n4q6r3y8b5t1`
4. **Profile** - `/profile`
5. **Settings** - `/settings`
6. **About** - `/about`
7. **Language Selector**
8. **Sign Out**

#### For Regular Authenticated Users:

1. **Teams** - `/teams` (public view)
2. **Profile** - `/profile`
3. **Settings** - `/settings`
4. **About** - `/about`
5. **Language Selector**
6. **Sign Out**

#### For Unauthenticated Users:

1. **Teams** - `/teams` (public view)
2. **About** - `/about`
3. **Language Selector**
4. **Sign In** - `/auth/signin`

This ensures that all users have appropriate access while maintaining clear separation between public, authenticated, and admin-only functionality.
