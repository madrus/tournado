# Overview

## Project Structure

The project follows a standard React Router v7 application structure:

```
app/
  ├── components/    # Reusable UI components
  ├── layouts/       # Layout components for nested routes
  ├── models/        # Database models and server-side logic
  ├── routes/        # Application routes
  ├── styles/        # Global styles
  └── utils/         # Utility functions
```

## Key Features

- **Authentication**: Email/password authentication with cookie-based sessions (all users redirect to admin panel post-login)
- **Tournament Management**: Complete tournament CRUD with mobile-optimized swipe-to-delete functionality
- **Team Management**: Comprehensive team creation and management system
- **State Management**: Zustand stores with SSR-safe hydration and persistence
- **Database**: SQLite with Prisma ORM
- **UI Components**: Role-based context menus and responsive navigation
- **Styling**: Tailwind CSS for modern UI
- **Testing**: Vitest for unit tests (584 tests) and Playwright for E2E tests
- **Type Safety**: Full TypeScript support with Prisma enum integration
- **Routing**: React Router v7 with advanced prefetching and route protection

## Architecture

### Routing System

The application uses React Router v7 (evolution of Remix) with:

- File-based routing with explicit configuration in `app/routes.ts`
- Nested layouts for shared UI components
- Advanced route protection and role-based access control
- Intelligent prefetching strategies for optimal performance

For detailed routing information, see [Routing Documentation](routing.md).

### UI Components & Role-Based Access Control

The application implements a comprehensive role-based access control system through UI components:

- **Context Menu**: Adaptive navigation menu that changes based on user roles
- **AppBar Component**: Main navigation header with authentication-aware menu items
- **Responsive Design**: Mobile and desktop optimized interfaces
- **Language Support**: Multi-language interface with persistent language selection

For detailed UI component information, see [UI Components Documentation](ui-components.md).

### Type System

The application implements a centralized type system with strong typing patterns:

- **Centralized Types**: All shared types consolidated in `app/lib/lib.types.ts`
- **Type Conversion Utilities**: Helper functions for database-to-strict-type conversions
- **Template Literal Types**: Enforced patterns for enhanced type safety
- **Database Compatibility**: Seamless integration between database strings and strict types

For detailed type system information, see [Type System Documentation](type-system.md).

### State Management

The application uses a hybrid state management approach with Zustand for client state:

- **Auth Store**: Manages authentication state with sessionStorage persistence
- **Language Persistence**: Reactive cookie and localStorage system for SSR compatibility
- **Hydration Safety**: Component-level hydration to avoid side effects during module loading
- **SSR Compatibility**: Proper server-side storage mocking and hydration skipping

For detailed state management information, see [State Management Documentation](state-management.md).

## Development Workflow

1. Start the development server:

```sh
pnpm dev
```

2. Run tests:

```sh
# Run all tests
pnpm test

# Run E2E tests (Playwright)
pnpm test:e2e:dev

# Run unit tests
pnpm test:unit
```

3. Type checking:

```sh
pnpm typecheck
```

## Current Tasks

- RBAC Hardening (Phase 2): see `docs/development/RBAC.hardening.md`
- Mobile Wrapper (Capacitor): see `docs/development/PRD.details.md#mobile-wrapper`

## Session Notes

- 2025-09-04: `docs/development/session-notes/2025-09-04.md`

## Code Style

- Use Biome for code formatting and linting (`pnpm lint`)
- Write TypeScript with strict mode enabled
- Use functional components with hooks
- Follow the React Router v7 conventions for routes and loaders

## Docker Testing

```sh
docker build -t tournado:test .
docker run -p 3000:8080 tournado:test
```

## Database Migrations

1. Check the current state of your local database: `npx prisma migrate status`
2. Apply new migration: `npx prisma migrate dev`
3. Verify the state of the database: `sqlite3 prisma/data.db ".tables"`
4. Check the database: `npx prisma db pull`
5. Check schema: `sqlite3 prisma/data.db ".schema"`
6. If the database is not in the desired state, we can reset it: `npx prisma migrate reset --force`

## CI/CD Slack Notifications

This project uses a GitHub Actions workflow to send notifications to Slack about CI/CD events such as build results, workflow successes, and failures.

### How it works

- The workflow is defined in `.github/workflows/slack.yml`.
- It triggers on every push to the `main` and `dev` branches.
- After each workflow run, a message is sent to a designated Slack channel using an incoming webhook.
- The message includes:
   - The build result (success or failure)
   - The branch name
   - The GitHub actor who triggered the workflow
   - The commit message
   - Direct links to the commit and the workflow run

### Example Slack Message

```
*GitHub Action build result*: success on branch dev by alice
https://github.com/your-org/your-repo/commit/abc123

GitHub Action build result: success on branch `dev`
Triggered by: alice
Commit message: Update dependencies
View Commit | View Workflow Run
```

### How to configure

1. **Create a Slack Incoming Webhook**
   - Go to your Slack workspace settings and add a new [Incoming Webhook](https://api.slack.com/messaging/webhooks).
   - Choose the channel where you want to receive notifications.
   - Copy the generated webhook URL.
2. **Add the webhook to GitHub**
   - Go to your repository's **Settings > Secrets and variables > Actions**.
   - Add a new secret named `SLACK_WEBHOOK_URL` and paste the webhook URL.
3. **(Optional) Customize the workflow**
   - Edit `.github/workflows/slack.yml` to change the message format or notification conditions as needed.

### Notes

- Only the webhook method is used for notifications (no bot user required).
- If you need more advanced Slack features (threads, message updates, etc.), you can add a bot user and update the workflow accordingly.
