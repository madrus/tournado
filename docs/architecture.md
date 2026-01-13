# Architecture Overview

## Route Structure

- **File-based routing**: Routes defined in `app/routes/` with React Router v7
- **Nested layouts**: Uses React Router's nested routing capabilities
- **Protected routes**: Authentication handled via session middleware
- **Route groups**: Organized by feature (auth, teams, admin areas)

## Data Layer

- **Models**: Server-side data access in `app/models/` (user.server.ts, team.server.ts, tournament.server.ts)
- **Database**: Prisma schema defines User, Team, Tournament, Match entities with enums for roles, divisions, categories
- **Loaders/Actions**: React Router loader/action pattern for data fetching and mutations

## Component Architecture

- **Shared components**: Reusable UI components in `app/components/`
- **Feature components**: Organized by domain (teams, navigation, auth, etc.)
- **Form handling**: Custom form components with validation
- **Error boundaries**: Layered error handling with fallback UIs
- **Heading hierarchy**: AppBar's `pageTitle` serves as the primary `h1` heading (set via `handle.pageTitle` in routes). Page content uses `h2`/`h3` for section structure. This follows the SPA pattern where persistent chrome provides the main heading.

## State Management

- **Server state**: Handled via React Router loaders/actions
- **Client state**: Zustand stores in `app/stores/`
- **Form state**: Local component state with controlled inputs

## Testing Strategy

- **Unit tests**: Vitest with React Testing Library (\*.test.ts/tsx files)
- **E2E tests**: Playwright in `playwright/tests/` (\*.spec.ts files)
- **Docker tests**: `pnpm test:docker` - validates Docker builds and native dependencies
- **Coverage**: Comprehensive coverage thresholds (70% across all metrics)
- **Test separation**: Clear separation between unit and E2E test files

## Database Schema

Key entities: User, Team, Tournament, Match with relationships and enums for sports categories, divisions, and match statuses.
