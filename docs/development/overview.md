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

- **Authentication**: Email/password authentication with cookie-based sessions
- **Database**: SQLite with Prisma ORM
- **UI Components**: Role-based context menus and responsive navigation
- **Styling**: Tailwind CSS for modern UI
- **Testing**: Playwright for E2E tests and Vitest for unit tests
- **Type Safety**: Full TypeScript support
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

3. Format code:

```sh
pnpm format
```

4. Type checking:

```sh
pnpm typecheck
```

## Code Style

- Use Prettier for code formatting
- Follow ESLint rules
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
