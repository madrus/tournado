---
name: fullstack-dev-workflow
description: Systematic development workflow for building modern web applications with TypeScript, React, and React Router v7. Use this skill when developing features or working on web app projects to ensure consistent code quality, proper architecture, and comprehensive testing. Triggers on tasks like feature development, component creation, API integration, or when setting up new projects.
---

# Full-Stack Development Workflow

A systematic approach to building web applications with quality gates and architectural best practices.

## Tech Stack

Primary stack:

- **TypeScript, React, Vite**
- **React Router v7** (SSR with loaders/actions)
- **TailwindCSS** (styling)
- **Zustand** (UI state management)
- **Vitest + React Testing Library** (unit tests)
- **Playwright** (e2e tests)
- **Biome** (linting/formatting)

## Project Architecture

### Project Rules Override

If the repo provides its own rules (AGENTS.md, .cursor/rules, CLAUDE.md, etc.), follow those over this skill.

### Standard Folder Structure

```text
app/
├── routes/               # RR7 routes (flat structure)
├── i18n/                 # Internationalization
├── services/             # API setup, clients
├── components/           # Shared UI components
├── hooks/                # Shared hooks
├── stores/               # Shared state
├── lib/                  # Configured instances, constants
├── models/               # Data models and domain logic
├── utils/                # Pure helper functions
├── styles/               # Global styles
└── features/
    └── [feature-name]/  # Feature-specific code
        ├── components/
        ├── hooks/
        ├── stores/
        ├── lib/
        └── utils/
test/                    # Route tests, MSW mocks
playwright/              # E2E tests
```

### Existing Projects

When working in an existing project:

- **Adapt** to the existing folder structure if reasonable
- **Suggest migration** plan if structure differs significantly from standards
- Propose incremental improvements rather than wholesale refactoring

## Development Approach

### Planning Before Implementation

For **tasks and features**:

1. Present a clear implementation plan
2. Outline component structure, state management, and API integration
3. Get approval before proceeding

For **small actions** (bug fixes, minor refactors):

- Proceed without extensive planning
- Explain changes concisely

### Component Architecture

**File Organization:**

- Separate concerns: types, hooks, components
- Group related components in feature folders
- Keep shared components in `common/components/`

**Code Placement:**

- Business logic → custom hooks and utility functions
- No direct API calls in components → use custom hooks or service layers
- Component files focus on UI rendering and event handling

### State Management with Zustand

**Store Organization:**

- One store per UI page/route
- Shared stores for: auth, feature toggles, global UI state
- See `references/zustand-pattern.md` for standard store template

**Store Location:**

- Page-specific stores → `features/[feature]/stores/`
- Shared stores → `app/stores/`

### API Integration

**Integration Patterns:**

- NO direct fetch/API calls in components
- Use custom hooks for data fetching
- Prefer `fetch` or Tanstack Query
- Service layer in `app/services/` for API client setup

**Example Structure:**

```typescript
// app/services/api-client.ts
export const apiClient = {
	/* configured fetch/axios */
}

// features/todos/hooks/useTodos.ts
export function useTodos() {
	// Tanstack Query or custom hook logic
}

// features/todos/components/TodoList.tsx
export function TodoList() {
	const { data } = useTodos() // No direct API calls
}
```

### React Router v7 Patterns

**Route Organization:**

- Flat route structure in `app/routes/`
- Routes import client-side components from `features/` or `common/`
- Loaders and actions live in SSR route components

**Example:**

```typescript
// app/routes/todos.tsx (SSR component with loader/action)
export async function loader() { /* ... */ }
export async function action() { /* ... */ }

export default function TodosRoute() {
  return <TodosPage /> // Imports from features/
}
```

### Error Handling

**UI Errors:**

- Use Error Boundary components for UI crashes
- Place boundaries at appropriate component levels

**API Errors:**

- Show user-friendly messages via toaster (no technical details)
- Log full error details to console (future: Sentry integration)
- Handle loading/error states in data-fetching hooks

**Loading States:**

- Only implement if performance issues arise
- Use suspense boundaries when appropriate

## Quality Gates

### Testing Strategy

**What to Test:**

- All critical functionality (except auth if mocking is complex)
- Business logic in hooks and utils
- Component integration with state/props
- API integration patterns

**What NOT to Test:**

- Simple presentational components without logic
- Third-party library internals
- Over-mocked scenarios that don't reflect real usage

### Unit Testing (Vitest + RTL)

**Standards:**

- NO direct node access (no `process`, `fs`, etc.)
- NO `any` types - all code must be properly typed
- Use MSW for API mocking
- Test user interactions, not implementation details

**Coverage:**

- Target: 80% overall coverage
- Every file should have tests for critical paths
- Focus on business logic and user-facing behavior

**Example Test Structure:**

```typescript
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

describe('TodoList', () => {
  it('allows users to add a todo', async () => {
    const user = userEvent.setup()
    render(<TodoList />)

    await user.type(screen.getByRole('textbox'), 'New todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getByText('New todo')).toBeInTheDocument()
  })
})
```

### Integration Testing (Playwright)

**When to Run:**

- Before creating PR
- Before moving to next major task
- For critical user flows

**Scope:**

- End-to-end user journeys
- Cross-page navigation
- Authentication flows (if implemented)
- Critical business processes

### Pre-Completion Checklist

Before reporting a feature as **done**, ensure:

✅ **Code Quality:**

- [ ] Biome linting passes (run: `pnpm lint`)
- [ ] TypeScript type checking passes (run: `pnpm typecheck`)
- [ ] No `any` types introduced or implied

✅ **Testing:**

- [ ] Unit tests written for critical paths
- [ ] All unit tests pass (run: `pnpm test:run`)
- [ ] Coverage meets 80% or justified exceptions documented

✅ **Architecture:**

- [ ] Follows folder structure conventions
- [ ] State management uses Zustand patterns
- [ ] API calls abstracted in hooks/services
- [ ] Error handling implemented

### Pre-Commit Checklist

Before committing:

✅ **Build:**

- [ ] Production build succeeds (run: `pnpm build`)
- [ ] No build warnings or errors

### Pre-PR Checklist

Before creating a pull request or moving to next major task:

✅ **Integration:**

- [ ] Playwright e2e tests pass (run: `pnpm test:e2e`)
- [ ] Manual testing of critical user flows completed

## Decision Making & Communication

### When to Ask Permission

**Always ask before:**

- Major architectural changes
- Changing state management approach
- Modifying API integration patterns
- Large refactors affecting multiple features

**Proceed without asking for:**

- Following established patterns
- Bug fixes within existing architecture
- Adding tests
- Code formatting/linting fixes

### Running Checks

**Auto-run TypeScript typecheck** on any code change.
Do not run lint, tests, or build unless explicitly requested by the developer.
If it is useful, list the relevant commands as next-step suggestions without offering to run them.

### Explanation Depth

**Minimal explanation for:**

- Small refactors
- Following existing patterns
- Standard implementations

**Detailed explanation for:**

- New patterns or approaches
- Performance optimizations
- Complex business logic
- Architectural decisions

## Resources

### references/zustand-pattern.md

Standard Zustand store template with SSR support, persistence, and DevTools integration. See this file for the complete pattern to follow when creating new stores.
