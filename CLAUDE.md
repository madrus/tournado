# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tournado is a modern tournament management system built with React Router v7, Prisma, SQLite, and TypeScript. It's a full-stack web application with PWA capabilities for managing sports tournaments, teams, and matches.

## Key Technologies & Architecture

- **Framework**: React Router v7 (file-based routing with SSR)
- **Database**: Prisma ORM with SQLite
- **UI**: Radix UI components with Tailwind CSS v4
- **State Management**: Zustand
- **Code Quality**: Biome (formatting + linting)
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
pnpm test:docker    # Validate Docker builds and native dependencies (better-sqlite3)
```

### Code Quality

```bash
pnpm lint           # Run Biome check with auto-fix (format + lint)
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
- **Heading hierarchy**: AppBar's `pageTitle` serves as the primary `h1` heading (set via `handle.pageTitle` in routes). Page content uses `h2`/`h3` for section structure. This follows the SPA pattern where persistent chrome provides the main heading.

### State Management

- **Server state**: Handled via React Router loaders/actions
- **Client state**: Zustand stores in `app/stores/`
- **Form state**: Local component state with controlled inputs

### Testing Strategy

- **Unit tests**: Vitest with React Testing Library (\*.test.ts/tsx files)
- **E2E tests**: Playwright in `playwright/tests/` (\*.spec.ts files)
- **Docker tests**: `pnpm test:docker` - validates Docker builds and native dependencies
- **Coverage**: Comprehensive coverage thresholds (70% across all metrics)
- **Test separation**: Clear separation between unit and E2E test files

## Development Patterns

### Import Aliases

- `~/` maps to `app/` directory
- Use `~/components/`, `~/models/`, `~/utils/` for imports

### Module Organization & Import Patterns

**NO CROSS-FEATURE RE-EXPORTS**: Do not create central re-export hubs that aggregate exports from multiple features. Each feature should be imported from its own location.

**Barrel Files (index.ts) - ENCOURAGED**:

- **Barrel files are encouraged** for cleaner imports throughout the codebase
- **Example**: `~/features/firebase/components/FirebaseAuth/index.ts` can re-export components from the same directory
- **Benefits**: Shorter import paths, better organization, no tree-shaking issues with modern bundlers
- **Note for tests**: If you encounter circular dependency issues, prefer restructuring to eliminate the cycle. As a pragmatic workaround in tests only, you may use direct imports (e.g., `from '../FirebaseEmailSignIn'`), though this should be rare with properly structured barrel exports

**Type Organization**:

- **Shared types**: Generic, reusable types in `~/lib/lib.types` (IconProps, ColorAccent, Email, etc.)
- **Feature types**: Domain-specific types in feature modules (e.g., `~/features/teams/types`, `~/features/tournaments/types`)
- **Rule**: If a type is used ONLY within a feature, it belongs in that feature's types file

**Import Pattern Examples**:

```typescript
// ✅ CORRECT - Use barrel files for cleaner imports
import { FirebaseSignIn, FirebaseEmailSignIn } from '~/features/firebase/components/FirebaseAuth'
import { Team, TeamFormData } from '~/features/teams/types'
import { Tournament } from '~/features/tournaments/types'
import { IconProps, ColorAccent } from '~/lib/lib.types'

// ❌ WRONG - Cross-feature re-exports from a central location
// DO NOT create ~/lib/lib.types that re-exports Team, Tournament, etc.
import { Team, Tournament } from '~/lib/lib.types'
```

**Benefits of This Pattern**:

- **Explicit dependencies**: Import paths clearly show which feature code comes from
- **True isolation**: Features are self-contained and independently maintainable
- **No hidden coupling**: Prevents a central file from hiding dependencies between features
- **Better IDE support**: Jump-to-definition takes you to the feature module
- **Cleaner imports**: Barrel files within features keep imports concise
- **Easier refactoring**: Clear feature boundaries make changes safer

**Feature Module Structure**:

```
app/features/{feature}/
├── components/     # Feature-specific components
├── stores/         # Feature-specific state management
├── utils/          # Feature-specific utilities
├── hooks/          # Feature-specific React hooks
├── types.ts        # Feature-specific TypeScript types
└── validation.ts   # Feature-specific validation schemas
```

### Authentication

- Firebase Authentication with Google OAuth and Email/Password
- Session cookie bridging for SSR compatibility
- Environment separation (CI uses dummy values, development/staging share `tournado-dev`, production uses `tournado-prod`)
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
- **No semicolons**. Do not add semicolons to new code. Biome will automatically remove them from existing code during formatting

### Version Pinning and Hardcoding

- **NEVER hardcode version numbers** in Dockerfiles, scripts, or configuration files
- When copying/referencing dependencies, use wildcards or dynamic resolution (e.g., `better-sqlite3@*` not `better-sqlite3@12.4.6`)
- If you find yourself typing an exact version number, immediately ask: "What breaks when this upgrades?"
- **Red flags**: Any string matching patterns like `@\d+\.\d+\.\d+`, `v1.2.3`, `node-v127`, etc.
- **Exception**: package.json and lock files where version pinning is intentional

### Solution Review Protocol

Before presenting any solution, pause and challenge it with these questions:

1. **Upgrade path**: Will this break on version bumps? (dependencies, Node.js, base images)
2. **Maintenance burden**: What manual steps are needed when dependencies/config change?
3. **Hardcoded assumptions**: What values should be dynamic/configurable?
4. **Edge cases**: What happens when [environment/version/config] changes?
5. **Cross-environment**: Does this work in dev, staging, and production?

### Defensive Architecture Principles

- **Assume change**: Dependencies upgrade, environments vary, configurations differ
- **Design for unknown**: Use patterns/wildcards over exact matches
- **Document why**: If you must hardcode something, explain why with a comment
- **Future-proof first**: Don't optimize for "works now", optimize for "still works in 6 months"
- **Test the upgrade path**: Mentally simulate upgrading a dependency - does your solution break?

### When to Self-Challenge

Trigger self-review when you write:

- Exact version numbers (`12.4.6`, `v127`, `node-22`) outside package.json
- Environment-specific paths that could vary
- Hardcoded configuration values that might change
- Solutions that fix immediate errors without considering maintenance

**Key principle**: If your solution requires manual edits during routine maintenance (version upgrades, environment changes), it's not robust enough. Redesign before presenting.

### React Component Definitions

- **Arrow function (const)**: Use when component body contains ONLY a return statement with no hooks, variables, or logic

   ```typescript
   // ✅ CORRECT - Only a return statement
   export const Badge = ({ children, color }: Props): JSX.Element => (
     <span className={cn(badgeVariants({ color }))}>{children}</span>
   )
   ```

- **Function declaration**: Use when component has ANY of the following:
   - React hooks (useState, useEffect, useTranslation, etc.)
   - Local variables or constants
   - Conditional logic before return
   - Multiple statements

   ```typescript
   // ✅ CORRECT - Has hooks and logic
   export function UserDetailCard({ user }: Props): JSX.Element {
     const [isOpen, setIsOpen] = useState(false)
     const { t } = useTranslation()

     return <div>...</div>
   }

   // ❌ WRONG - Should use function declaration
   export const UserDetailCard = ({ user }: Props): JSX.Element => {
     const [isOpen, setIsOpen] = useState(false)
     const { t } = useTranslation()

     return <div>...</div>
   }
   ```

### Claude Behavior Rules

- **Do NOT run lint or typecheck** unless explicitly requested by the user
- **Do NOT run unit tests** unless explicitly requested by the user
- **You may proactively verify code quality** and tell me about them asking if I want them fixed

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

## Environment Setup

### Firebase Project Configuration

The application uses 3 Firebase project configurations across 4 contexts:

| Context                 | Firebase Project   | Purpose                           |
| ----------------------- | ------------------ | --------------------------------- |
| **CI (GitHub Actions)** | `ci-dummy-project` | Dummy values for testing          |
| **Development (Local)** | `tournado-dev`     | Local development                 |
| **Staging**             | `tournado-dev`     | Testing and acceptance deployment |
| **Production**          | `tournado-prod`    | Live application                  |

**Key Point**: Local development and Staging share the same Firebase project (`tournado-dev`) but serve different purposes. They differ in configuration method (`.env` vs Fly.io secrets), DATABASE_URL, and BASE_URL values.

### Automated Environment Setup

**Prerequisites**:

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Install GitHub CLI (for secrets management)
brew install gh
gh auth login

# Install Fly CLI (for deployment)
curl -L https://fly.io/install.sh | sh
fly auth login
```

**Setup Scripts**:

```bash
# Configure CI environment (automated - dummy Firebase values)
chmod +x setup-github-secrets.sh
./setup-github-secrets.sh

# Configure Fly.io environments (run individual commands due to auth/timeout issues)
# Use template as reference: docs/templates/setup-flyio-secrets.sh.template
# See docs/environment-variables.md for complete command-by-command instructions

# For staging (run each command individually in terminal):
fly auth login
flyctl secrets set SESSION_SECRET="$(openssl rand -hex 32)" --app tournado-staging
flyctl secrets set SUPER_ADMIN_EMAILS="your-email@domain.com" --app tournado-staging
# ... (continue with other secrets one-by-one via flyctl commands)

# Verify all secrets are configured
fly secrets list --app tournado-staging
```

**Important**: Fly.io script automation can fail due to authentication token expiration and deployment timeouts. Individual command execution is more reliable for Fly.io environments.

**Verification**: Use `fly secrets list --app [app-name]` to verify all 15 expected environment variables are set.

### Local Development Setup

Ensure your `.env` file has the required variables for local development:

**Note**: Local development and Staging deployment share the same Firebase project (`tournado-dev`).

```bash
# Core application
SESSION_SECRET="your-local-session-secret"
SUPER_ADMIN_EMAILS="your-email@domain.com"

# Firebase Client (shared with Staging deployment)
VITE_FIREBASE_API_KEY="[from tournado-dev project]"
VITE_FIREBASE_AUTH_DOMAIN="tournado-dev.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tournado-dev"
VITE_FIREBASE_STORAGE_BUCKET="tournado-dev.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="[from tournado-dev]"
VITE_FIREBASE_APP_ID="[from tournado-dev]"
VITE_FIREBASE_MEASUREMENT_ID=""

# Firebase Admin (shared with Staging deployment)
FIREBASE_ADMIN_PROJECT_ID="tournado-dev"
FIREBASE_ADMIN_CLIENT_EMAIL="[service-account-email]"
FIREBASE_ADMIN_PRIVATE_KEY="[service-account-private-key]"

# Local development specific settings
EMAIL_FROM="Local Dev <dev@example.com>"
BASE_URL="http://localhost:5173"
RESEND_API_KEY="[your-resend-key]"  # Optional for local development
```

### Environment Variable Reference

For complete environment variable documentation, see:

- **[Environment Variables Reference](docs/environment-variables.md)** - Complete catalog with security considerations
- **[Authentication Guide](docs/development/authentication.md)** - Firebase configuration and setup
- **[E2E Testing Strategy](docs/testing/e2e-firebase-strategy.md)** - Testing approach and Firebase bypass

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

## Be Sober and Terse

- don't be agreeable and act as my brutally honest, high-level advisor and mirror
- be terse and treat me as an expert
- be accurate, thorough, direct, rational, and unfiltered
- suggest solutions that I didn't think about
- challenge my thinking, question my assumptions, and expose the blind spots I’m avoiding
- don’t validate me; don’t soften the truth; don’t flatter; don’t sugarcoat
- give me only your advice or opinion before the code snippets
- if my reasoning is weak, dissect it and show why
- if I’m fooling myself or lying to myself, point it out
- do not explain the code snippets unless I explicitely ask for it
- do not fantasize, only tell me about things you know from real sources of information
- value good arguments over authorities, the source is irrelevant
- consider new technologies and contrarian ideas, not just the conventional wisdom
- you may use high levels of speculation or prediction, just flag it for me
- look at my situation with complete objectivity and strategic depth; show me where I’m making excuses, playing small, or underestimating risks/effort
- then give a precise, prioritized plan what to change in thought, action, or mindset to reach the next level
- hold nothing back. Treat me like someone whose growth depends on hearing the truth, not being comforted
- when possible, ground your responses in the personal truth you sense between my words
- my tech stack is React v19+, TypeScript, React Router v7+, Tailwind, Zustand, Zod - front-end; Nodejs, Vitest, Python, Go - - back-end
