# Testing

## Overview

The project uses a comprehensive testing strategy with multiple testing tools:

- **Cypress**: End-to-end testing
- **Vitest**: Unit testing
- **Testing Library**: Component testing utilities

## Running Tests

### All Tests

```sh
pnpm test
```

### End-to-End Tests

```sh
# Run E2E tests in development mode
pnpm test:e2e:dev

# Run E2E tests in headless mode
pnpm test:e2e
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

When running E2E tests via `pnpm test:e2e` or `pnpm test:e2e:dev`, the system automatically:

1. Removes any existing test database
2. Creates a fresh test database using `prisma migrate deploy`
3. Seeds the test database with initial data
4. Sets `DATABASE_URL` environment variable to point to the test database

This ensures every test run starts with a clean, predictable database state without affecting your development data.

## Test Structure

```
cypress/
  ├── e2e/           # End-to-end tests
  ├── fixtures/      # Test fixtures
  └── support/       # Cypress support files
      ├── commands.ts           # Custom Cypress commands
      ├── create-user-test.ts   # Test user creation (uses test DB)
      └── delete-user-test.ts   # Test user cleanup (uses test DB)
```

## Writing Tests

### E2E Tests

Use Cypress for testing user flows and critical paths:

```ts
describe('Authentication', () => {
   it('should allow users to sign in', () => {
      cy.visit('/signin')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password')
      cy.get('button[type="submit"]').click()
      cy.url().should('include', '/dashboard')
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
// Sign in as a test user
cy.signin()

// Clean up test user
afterEach(() => {
   cy.cleanupUser()
})
```

## Best Practices

1. Write tests for critical user flows
2. Keep tests isolated and independent
3. Use meaningful test descriptions
4. Follow the testing pyramid principle
5. Mock external dependencies
6. Clean up after tests
