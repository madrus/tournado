# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tournado is a modern tournament management system built with React Router v7, Prisma, SQLite, and TypeScript. It's a full-stack web application with PWA capabilities for managing sports tournaments, teams, and matches.

## Key Technologies & Architecture

- **Framework**: React Router v7 (file-based routing with SSR)
- **Database**: Prisma ORM with SQLite
- **UI**: Radix UI components with Tailwind CSS v4
- **State Management**: Zustand
- **Testing**: Vitest (unit) + Playwright (E2E) with custom MCP server
- **Build**: Vite with PWA support
- **Deployment**: Fly.io with containerized deployments

## Essential Commands

### Development

```bash
pnpm setup          # Initial setup: generate Prisma client, migrate DB, seed data
pnpm dev            # Start dev server with HMR
pnpm dev:mocks      # Start dev server with MSW mocks enabled
```

### Building & Production

```bash
pnpm build          # Build for production (includes Prisma generation and React Router typegen)
pnpm start          # Start production server
pnpm start:mocks    # Start production server with mocks
```

### Testing

```bash
pnpm test:watch     # Run Vitest in watch mode
pnpm test:run       # Run all unit tests once
pnpm test:coverage  # Run tests with coverage report
pnpm test:e2e       # Run Playwright E2E tests in UI mode
pnpm test:e2e:run   # Run specific E2E test (teams.spec.ts) with HTML reporter
pnpm test:e2e:built # Build and run E2E tests against production build
```

### Code Quality

```bash
pnpm lint           # Format with Prettier + run ESLint
pnpm typecheck      # Run React Router typegen + TypeScript checking
pnpm validate       # Run lint, typecheck, and test:run in parallel
```

### Database Operations

```bash
pnpm prisma:seed    # Seed database with test data
pnpm db:reset:local # Reset local database (destructive)
```

### Documentation

```bash
pnpm docs           # Start Docsify documentation server on port 3030
```

## Architecture Overview

### Route Structure

- **File-based routing**: Routes defined in `app/routes/` with React Router v7
- **Nested layouts**: Uses React Router's nested routing capabilities
- **Protected routes**: Authentication handled via session middleware
- **Route groups**: Organized by feature (auth, teams, admin areas)

### Data Layer

- **Models**: Server-side data access in `app/models/` (user.server.ts, team.server.ts, tournament.server.ts)
- **Database**: Prisma schema defines User, Team, Tournament, Match entities with enums for roles, divisions, categories
- **Loaders/Actions**: React Router loader/action pattern for data fetching and mutations

### Component Architecture

- **Shared components**: Reusable UI components in `app/components/`
- **Feature components**: Organized by domain (teams, navigation, auth, etc.)
- **Form handling**: Custom form components with validation
- **Error boundaries**: Layered error handling with fallback UIs

### State Management

- **Server state**: Handled via React Router loaders/actions
- **Client state**: Zustand stores in `app/stores/`
- **Form state**: Local component state with controlled inputs

### Testing Strategy

- **Unit tests**: Vitest with React Testing Library (\*.test.ts/tsx files)
- **E2E tests**: Playwright in `playwright/tests/` (\*.spec.ts files)
- **Coverage**: Comprehensive coverage thresholds (70% across all metrics)
- **Test separation**: Clear separation between unit and E2E test files

## Development Patterns

### Import Aliases

- `~/` maps to `app/` directory
- Use `~/components/`, `~/models/`, `~/utils/` for imports

### Authentication

- Session-based auth with bcrypt password hashing
- Role-based access control (ADMIN, MANAGER, REFEREE, PUBLIC)
- Auth state managed via React Router loaders

### Styling Standards

- **Tailwind CSS v4**: Primary styling framework with utility classes
- **CVA (Class Variance Authority)**: Standard for component variants and conditional styling
- **Semantic color classes**: Always use the semantic color classes from `app/styles/tailwind.css` if the colors fall under ColorAccent type
- **Component styling pattern**: Use CVA variants for consistent, maintainable component styling

### Code Quality Rules

- **Avoid direct Node access**. Prefer using the methods from Testing Library
- **Avoid "any" as type**. Always use strong typing

### Database Schema

Key entities: User, Team, Tournament, Match with relationships and enums for sports categories, divisions, and match statuses.

### PWA Features

- Service worker with Workbox
- Offline-first caching strategy
- Add-to-homescreen prompts
- Manifest configuration for standalone app experience

## Important Notes

- **Node.js**: Requires Node ≥22 and pnpm ≥10
- **Environment**: Uses .env files for configuration (see .env.example)
- **Database**: SQLite for development, configurable for production
- **Deployment**: Configured for Fly.io with Dockerfile
- **MCP Integration**: Features production-ready Vitest MCP server for AI-assisted testing

## Documentation System

### Overview

- **Location**: The `docs/` folder contains comprehensive project documentation
- **Dual Format**: Serves as both an Obsidian Vault and a Docsify documentation site
- **Docsify Setup**: Uses `_sidebar.md` file to define navigation structure for the web interface
- **Access**: Run `pnpm docs` to serve documentation at `http://localhost:3030`

### File Naming Convention

- **Regular content files**: Use kebab-case (lowercase with hyphens) for all new files
   - Examples: `daily-template.md`, `project-notes.md`, `meeting-summary.md`
- **System/rule files**: Use ALL CAPS for configuration and rule files
   - Examples: `CLAUDE.md`, `TAGS.md`, `README.md`

### Documentation Navigation Rules

When creating or modifying any content in the docs vault, you MUST:

1. **Update `docs/_sidebar.md`** whenever you create a new .md file in the docs/ directory or subdirectories
2. **Maintain logical organization** in the sidebar - group related files together and use appropriate nesting
3. **Use descriptive titles** in the sidebar that may differ from the filename for better navigation
4. **Test navigation** by running `pnpm docs` to ensure the new file is accessible via Docsify

### Tagging System Rules

When creating or modifying any content in the docs vault, you MUST:

1. **Always reference `TAGS.md`** as the source of truth for the tagging system
2. **Apply appropriate hashtags** to all created content following the rules in `TAGS.md`
3. **Keep `TAGS.md` updated** when introducing new tag categories or rules
4. **Use consistent tagging** across all files to maintain organization and discoverability
5. **Follow file naming conventions** as specified above
6. **Place tags at the bottom** of the document (move existing tags to bottom if there is text below them)
7. **DO NOT add tags to ALL CAPS system files** (these are configuration files and should remain untagged)
