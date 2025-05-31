# Overview

## Project Structure

The project follows a standard Remix application structure:

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
- **Styling**: Tailwind CSS for modern UI
- **Testing**: Cypress for E2E tests and Vitest for unit tests
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

## Development Workflow

1. Start the development server:

```sh
pnpm dev
```

2. Run tests:

```sh
# Run all tests
pnpm test

# Run E2E tests
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
- Follow the Remix conventions for routes and loaders

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
