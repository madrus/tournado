# Commands Reference

All available pnpm commands for development, testing, building, and deployment.

## Development

```bash
pnpm setup          # Initial setup: generate Prisma client, migrate DB, seed data
pnpm dev            # Start dev server with HMR
pnpm dev:mocks      # Start dev server with MSW mocks enabled
```

## Building & Production

```bash
pnpm build          # Build for production (includes Prisma generation and React Router typegen)
pnpm start          # Start production server
pnpm start:mocks    # Start production server with mocks
```

## Testing

```bash
pnpm test:watch     # Run Vitest in watch mode
pnpm test:run       # Run all unit tests once
pnpm test:coverage  # Run tests with coverage report
pnpm test:e2e       # Run Playwright E2E tests in UI mode
pnpm test:e2e:run   # Run specific E2E test (teams.spec.ts) with HTML reporter
pnpm test:e2e:built # Build and run E2E tests against production build
pnpm test:docker    # Validate Docker builds and native dependencies (better-sqlite3)
```

## Code Quality

```bash
pnpm lint           # Run Biome check with auto-fix (format + lint)
pnpm typecheck      # Run React Router typegen + TypeScript checking
pnpm validate       # Run lint, typecheck, and test:run in parallel
```

## Database Operations

```bash
pnpm prisma:seed    # Seed database with test data
pnpm db:reset:local # Reset local database (destructive)
```

## Documentation

```bash
pnpm docs           # Start Docsify documentation server on port 3030
```
