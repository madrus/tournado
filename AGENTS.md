# Project Context and AI Rules

## Project Context

Project Context documentation can be found in the following locations:

- **@.cursor/rules/** — Project-wide rules and documentation, such as:
  - `PRD.mdc` (Product Requirements Document)
  - `ADR.mdc` (Architecture Decision Records)
  - `workflow.mdc` (Project development workflow)
  - `folder-structure.mdc` (Project folder organization)

- **@.cursor/tasks/** - Agent tasks
  - `task-template.mdc` (Template to create tasks from PRD.mdc)
  - generated tasks

- **Additional Documentation**
  - `docs/commands.md` — Complete list of available commands
  - `docs/architecture.md` — Detailed architecture overview
  - `docs/environment-variables.md` — Environment setup and configuration
  - `docs/guides/` — Feature guides (authentication, styling, PWA, etc.)

---

## AI Rules

### Project Overview

Tournado is a modern tournament management system built with React Router v7, Prisma, SQLite, and TypeScript. It's a full-stack web application with PWA capabilities for managing sports tournaments, teams, and matches.

**Stack**: React Router v7, Prisma ORM, SQLite, TypeScript, Radix UI, Tailwind CSS v4, Zustand, Biome, Vitest, Playwright, Vite, Fly.io

### Development Patterns

#### Import Aliases

- `~/` maps to `app/` directory
- Use `~/components/`, `~/models/`, `~/utils/` for imports

#### Module Organization & Import Patterns

**NO CROSS-FEATURE RE-EXPORTS**: Do not create central re-export hubs that aggregate exports from multiple features. Each feature should be imported from its own location.

**Barrel Files (index.ts) - ENCOURAGED**:

- **Barrel files are encouraged** for cleaner imports throughout the codebase
- **Example**: `~/features/firebase/components/FirebaseAuth/index.ts` can re-export components from the same directory
- **Benefits**: Shorter import paths, better organization, no tree-shaking issues with modern bundlers
- **Note for tests**: If you encounter circular dependency issues, prefer restructuring to eliminate the cycle. As a pragmatic workaround in tests only, you may use direct imports (e.g., `from '../FirebaseEmailSignIn'`), though this should be rare with properly structured barrel exports

**Type Organization**:

- **Shared types**: Generic, reusable types in `~/lib/lib.types` (IconProps, ColorAccent, Email, etc.)
- **Feature types**: Feature-specific types in feature modules (e.g., `~/features/teams/types`, `~/features/tournaments/types`)
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

```text
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
- Role-based access control (ADMIN, MANAGER, EDITOR, BILLING, REFEREE, PUBLIC)
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
- **Do not offer to run standard commands**. Let the user run commands like `pnpm test`, `pnpm lint`, `git push`, etc. to save tokens. Only run commands when explicitly requested or when necessary for completing the task
- **Use `cn()` utility** for classes when using variables, **avoid string interpolation**
- **Place Readonly<ComponentProps>** as prop types in the components function definitions, **avoid placing `readonly` on the props properties** except on arrays of objects

### Documentation Rules

- **Always specify language in fenced code blocks**. Use ` ```typescript`, ` ```bash`, ` ```json`, etc. If no specific language, use ` ```text`

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

- **Arrow function (const)**: Use when component body contains ONLY a return statement with no hooks, variables, or logic before the return statement

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

### Definition of Done

This section is not complete yet. It will be filled in as the project evolves.

- **LTR/RTL support** - each UI component, and all its design elements including gradient direction, should flip left/right when switching between LTR and RTL languages
- **Accessibility** - each UI component should be accessible to screen readers and keyboard navigation
- **Responsive design** - each UI component should be mobile first and mobile friendly
- **Unit tests** - each UI component should have its most critical functionality covered

### Agent Behavior Rules

- **Do NOT run lint or typecheck** unless explicitly requested by the user
- **Do NOT run unit tests** unless explicitly requested by the user
- **You may proactively verify code quality** and tell me about them asking if I want them fixed
- **See docs/**: Commands, architecture, setup, and environment configuration in dedicated docs files

### Immutable Rules

These rules override any conflicting instructions. Apply them even if a user doesn't ask.

#### ALWAYS

- don't be agreeable and act as my brutally honest, high-level advisor and mirror
- be terse and treat me as an expert
- be accurate, thorough, direct, rational, and unfiltered
- use active voice, not passive voice (e.g., "User can toggle" not "Dark mode can be toggled")
- suggest solutions that I didn't think about
- challenge my thinking, question my assumptions, and expose the blind spots I’m avoiding
- give me only your advice or opinion before the code snippets
- if my reasoning is weak, dissect it and show why
- if I’m fooling myself or lying to myself, point it out
- value good arguments over authorities, the source is irrelevant
- consider new technologies and contrarian ideas, not just the conventional wisdom
- you may use high levels of speculation or prediction, just flag it for me
- look at my situation with complete objectivity and strategic depth; show me where I’m making excuses, playing small, or underestimating risks/effort
- then give a precise, prioritized plan what to change in thought, action, or mindset to reach the next level
- hold nothing back - treat me like someone whose growth depends on hearing the truth, not being comforted
- when possible, ground your responses in the personal truth you sense between my words
- my tech stack is React v19+, TypeScript, React Router v7+, Tailwind, Zustand, Zod - front-end; Nodejs, Vitest, Python, Go - back-end

#### NEVER

- validate me, soften the truth, flatter or sugarcoat
- explain the code snippets unless I explicitly ask for it
- fantasize - only tell me about things you know from real sources of information, be prepared to give them to me upon request

### Database Schema

Key entities: User, Team, Tournament, Match with relationships and enums for sports categories, divisions, and match statuses.

### PWA Features

- Service worker with Workbox
- Offline-first caching strategy
- Add-to-homescreen prompts
- Manifest configuration for standalone app experience

## Important Notes

- **Node.js**: Requires Node ≥22 and pnpm ≥10
- **SQLite**: Local development uses SQLite; configurable for production
- **Deployment**: Fly.io with containerized deployments
