# Testing

## Overview

The project uses a comprehensive testing strategy with multiple testing tools:

- **Playwright**: End-to-end testing
- **Vitest**: Unit testing with AI-powered MCP integration
- **Testing Library**: Component testing utilities
- **MCP Vitest Server**: Advanced AI-assisted testing workflows

### 🚀 AI-Powered Testing with MCP

The project includes a sophisticated **Model Context Protocol (MCP) server** that enables AI-assisted testing workflows:

- **3 Core Tools**: Execute tests, analyze coverage, and health checks
- **3 Intelligent Resources**: Persistent test data, coverage reports, and summaries
- **167 tests** across 12 test suites with comprehensive coverage analysis
- **Smart project detection** - works from any directory
- **Real-time integration** with AI development tools like Cursor

[📖 **Detailed MCP Documentation**](vitest_mcp.md) - Complete guide to AI-assisted testing capabilities

## Running Tests

### All Tests

```sh
pnpm test
```

### End-to-End Tests

```sh
# Run E2E tests in development mode
pnpm test:e2e:dev

# Run E2E tests in headless mode (starts server)
pnpm test:e2e:all
```

### Unit Tests

```sh
# Run unit tests
pnpm test:unit

# Run unit tests in watch mode
pnpm test:unit:watch
```

## Database Isolation

### Separate Test Database

E2E tests use a completely separate SQLite database to ensure isolation from development data:

- **Development database**: `prisma/data.db`
- **Test database**: `prisma/data-test.db` (automatically managed)

### Automatic Test Database Setup

When running E2E tests via `pnpm test:e2e:all` or `pnpm test:e2e:dev`, the system automatically:

1. Removes any existing test database
2. Creates a fresh test database using `prisma migrate deploy`
3. Seeds the test database with initial data
4. Sets `DATABASE_URL` environment variable to point to the test database

This ensures every test run starts with a clean, predictable database state without affecting your development data.

## Test Structure

```
playwright/
  ├── tests/         # End-to-end tests
  ├── fixtures/      # Test fixtures
  ├── helpers/       # Playwright helper functions
  │   ├── database.ts          # Database operations for tests
  │   └── global-setup.ts      # Global authentication setup
  └── pages/         # Page object models
```

## Writing Tests

### E2E Tests

Use Playwright for testing user flows and critical paths:

```ts
import { expect, test } from '@playwright/test'

test.describe('Authentication', () => {
   test('should allow users to sign in', async ({ page }) => {
      await page.goto('/auth/signin')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('password')
      await page.getByRole('button', { name: 'Inloggen' }).click()
      await expect(page).toHaveURL('/')
   })
})
```

### Unit Tests

Use Vitest for testing individual components and utilities:

```ts
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Button } from './Button'

test('renders button with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

## Test Utilities

### Authentication Helpers

```ts
import { cleanupUser, createAdminUser } from '../helpers/database'

// Create and use test users
test('admin feature', async ({ page }) => {
   const user = await createAdminUser()
   // Test logic here...
   await cleanupUser(user.email)
})

// Tests can also use pre-authenticated state via projects:
// - admin-authenticated: Uses global auth state
// - public-no-auth: No authentication
// - auth-flows: For testing login/signup flows
```

## Best Practices

1. Write tests for critical user flows
2. Keep tests isolated and independent
3. Use meaningful test descriptions
4. Follow the testing pyramid principle
5. Mock external dependencies
6. Clean up after tests
