# Testing Guide

## Element Selection Best Practices

When writing tests, follow this order of preference for selecting elements:

1. **By Role** (best)

   ```typescript
   // Buttons
   cy.findByRole('button', { name: /sign in/i })
   cy.findByRole('button', { name: /save/i })

   // Links
   cy.findByRole('link', { name: /teams/i })
   cy.findByRole('link', { name: /sign up/i })

   // Form inputs
   cy.findByRole('textbox', { name: /email/i })
   cy.findByRole('textbox', { name: /title/i })
   cy.findByRole('checkbox', { name: /remember me/i })
   ```

2. **By Label Text**

   ```typescript
   cy.findByLabelText(/email/i)
   cy.findByLabelText(/password/i)
   ```

3. **By Placeholder Text**

   ```typescript
   cy.findByPlaceholderText(/enter your email/i)
   ```

4. **By Text Content**

   ```typescript
   cy.findByText(/sign in/i)
   cy.findByText(/no teams yet/i)
   ```

5. **By Display Value**

   ```typescript
   cy.findByDisplayValue('john@example.com')
   ```

6. **By Alt Text**

   ```typescript
   cy.findByAltText('Logo')
   ```

7. **By Title**

   ```typescript
   cy.findByTitle('Close')
   ```

8. **By Test ID** (last resort)

   ```typescript
   cy.findByTestId('signin-button')
   ```

## Test Organization Structure

### File Location Guidelines

To maintain a clean and organized codebase, follow these guidelines for test file placement:

#### Component Tests

- **Location**: `app/components/__tests__/`
- **Pattern**: `ComponentName.test.tsx`
- **Purpose**: Unit tests for React components

```text
app/components/
├── AppBar.tsx
├── TeamForm.tsx
└── __tests__/
    ├── AppBar.test.tsx
    ├── TeamForm.test.tsx
    └── ...
```

#### Route Tests

- **Location**: `test/routes/`
- **Pattern**: `routeName.test.tsx`
- **Purpose**: Unit tests for route components and their logic
- **Why separate**: Avoids interference with file-based routing system

```text
test/
├── routes/
│   ├── index.test.tsx          # Tests for app/routes/_index.tsx
│   ├── about.test.tsx          # Tests for app/routes/about.tsx
│   └── teams-index.test.tsx    # Tests for app/routes/teams/_index.tsx
├── setup-test-env.ts
└── prisma-test.ts
```

#### Utility Tests

- **Location**: `app/utils/__tests__/`
- **Pattern**: `utilityName.test.ts`
- **Purpose**: Unit tests for utility functions

#### Model Tests

- **Location**: `app/models/__tests__/` (when needed)
- **Pattern**: `modelName.test.ts`
- **Purpose**: Unit tests for database models and server functions

### Route Testing Examples

#### Role-Based Routing Tests

Routes that handle role-based logic should be thoroughly tested for all user scenarios:

```typescript
// test/routes/index.test.tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test, describe } from 'vitest'

import type { User } from '@prisma/client'
import IndexPage from '~/routes/_index'

describe('Home Page (_index)', () => {
  describe('View Teams Button Routing', () => {
    test('should route to public teams page for non-authenticated users', () => {
      mockUser = null

      render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')
      expect(viewTeamsButton).toHaveAttribute('href', '/teams')
    })

    test('should route to admin teams page for admin users', () => {
      mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'ADMIN',
        // ... other properties
      }

      render(
        <MemoryRouter>
          <IndexPage />
        </MemoryRouter>
      )

      const viewTeamsButton = screen.getByTestId('view-teams-button')
      expect(viewTeamsButton).toHaveAttribute('href', '/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
    })
  })
})
```

#### Testing All User Roles

Create comprehensive test matrices for role-based functionality:

```typescript
test('should route based on user role with comprehensive test matrix', () => {
  const testCases = [
    {
      scenario: 'null user (not authenticated)',
      user: null,
      expectedHref: '/teams',
    },
    {
      scenario: 'PUBLIC role user',
      user: { role: 'PUBLIC', /* ... */ },
      expectedHref: '/teams',
    },
    {
      scenario: 'ADMIN role user',
      user: { role: 'ADMIN', /* ... */ },
      expectedHref: '/a7k9m2x5p8w1n4q6r3y8b5t1/teams',
    },
  ]

  testCases.forEach(({ scenario, user, expectedHref }) => {
    mockUser = user

    const { unmount } = render(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    )

    const viewTeamsButton = screen.getByTestId('view-teams-button')
    expect(viewTeamsButton, `Failed for scenario: ${scenario}`).toHaveAttribute('href', expectedHref)

    unmount()
  })
})
```

#### Mock Setup for Route Tests

Route tests often require mocking React Router hooks and other dependencies:

```typescript
// Mock useLoaderData
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useLoaderData: () => mockLoaderData(mockUser),
  }
})

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock components that might interfere with testing
vi.mock('~/components/PrefetchLink', () => ({
  ActionLink: ({ to, children, className }) => (
    <a href={to} className={className} data-testid="view-teams-button">
      {children}
    </a>
  ),
}))
```

### Best Practices for Route Testing

1. **Test Role-Based Logic**: Ensure all user roles are handled correctly
2. **Mock External Dependencies**: Mock hooks, translation, and complex components
3. **Use Test IDs Sparingly**: Only when semantic queries aren't sufficient
4. **Test Consistency**: Verify route logic matches related components (like AppBar)
5. **Clear Test Scenarios**: Use descriptive test names and failure messages
6. **Proper Cleanup**: Use `unmount()` when testing multiple scenarios

## Handling Server-Side Error Messages in Tests

When testing form submissions and other server interactions, it's crucial to correctly handle server-side error messages. In this project, server-side validation errors are managed as constants to ensure consistency between the backend and frontend tests.

For this purpose, we use the `TEST_TRANSLATIONS` object, which is defined in `app/lib/lib.constants.ts`.

### Purpose of `TEST_TRANSLATIONS`

- **Single Source of Truth**: This constant provides a single, reliable source for all server-side error message strings.
- **Decoupling from i18n**: It separates server-side messages, which are not typically translated on the client, from the standard i18n client-side translation workflow.
- **Test Stability**: Using this constant in tests prevents failures that could be caused by minor wording changes in error messages.

### How to Use in Unit Tests

Instead of hardcoding error strings in your assertions, import `TEST_TRANSLATIONS` and use the corresponding key.

#### Example

```typescript
import { TEST_TRANSLATIONS } from '~/lib/lib.constants'

it('should display a server-side error for a required field', async () => {
  // ... form setup and submission logic ...

  await waitFor(() => {
    // Assert that the specific error message from the constant is visible
    expect(
      screen.getByText(TEST_TRANSLATIONS['teams.form.errors.clubNameRequired']),
    ).toBeInTheDocument()
  })
})
```

By following this pattern, you ensure that your tests remain robust and aligned with the backend validation logic.

## UI Component Testing

### Role-Based Access Control

The application includes comprehensive unit tests for role-based UI components, particularly the context menu functionality. These tests ensure that users only see menu items appropriate for their role.

#### Context Menu Testing Example

```typescript
// Test for public users
it('should show correct menu items for public user', () => {
  render(
    <MemoryRouter>
      <AppBar authenticated={false} username="" user={null} />
    </MemoryRouter>
  )

  const menuItems = getDesktopMenuItems()
  const menuLabels = Array.from(menuItems).map(item => item.textContent)

  // Should see public items only
  expect(menuLabels).toContain('common.titles.teams')
  expect(menuLabels).toContain('common.titles.about')
  expect(menuLabels).toContain('common.auth.signIn')

  // Should NOT see admin or authenticated-only items
  expect(menuLabels).not.toContain('common.titles.adminPanel')
  expect(menuLabels).not.toContain('common.titles.profile')
})
```

#### Testing Different User Roles

```typescript
// Test admin-specific functionality
const adminUser: User = {
  id: 'admin-1',
  role: 'ADMIN',
  // ... other properties
}

it('should show Admin Panel for admin users', () => {
  render(<AppBar authenticated={true} user={adminUser} />)

  const menuLabels = getMenuLabels()
  expect(menuLabels).toContain('common.titles.adminPanel')
})

// Test non-admin authenticated users
const regularUser: User = {
  role: 'PUBLIC', // or 'MANAGER', 'REFEREE', 'ADMIN'
  // ... other properties
}

it('should hide Admin Panel for non-admin users', () => {
  render(<AppBar authenticated={true} user={regularUser} />)

  const menuLabels = getMenuLabels()
  expect(menuLabels).not.toContain('common.titles.adminPanel')
})
```

#### Key Testing Patterns for Role-Based Components

1. **Test All Role Scenarios**: Public, authenticated non-admin, and admin
2. **Verify Visibility**: Check both what should and shouldn't be visible
3. **Use Meaningful Data**: Create user objects with realistic role values
4. **Mock Authentication State**: Test both authenticated and unauthenticated states
5. **Test Responsive Design**: Verify the unified menu works across different viewport sizes

## Why This Order?

1. **Accessibility**: Using roles and labels ensures your app is accessible
2. **Resilience**: Tests are less likely to break with UI changes
3. **User Experience**: Tests reflect how users actually interact with the app
4. **Maintenance**: Easier to maintain and update tests

## Common Patterns

### Form Testing

```typescript
// Fill out a form
cy.findByRole('textbox', { name: /email/i }).type('user@example.com')
cy.findByLabelText(/password/i).type('password123')
cy.findByRole('button', { name: /sign in/i }).click()
```

### Navigation Testing

```typescript
// Click navigation links
cy.findByRole('link', { name: /teams/i }).click()
cy.findByRole('link', { name: /sign up/i }).click()
```

### Error Message Testing

```typescript
// Check for error messages
cy.findByText(/invalid email/i).should('be.visible')
```

## Best Practices

1. **Use Semantic Queries**
   - Prefer `findByRole` over `getByTestId`
   - Use `findByText` for visible text
   - Use `findByLabelText` for form labels

2. **Make Tests Resilient**
   - Use case-insensitive regex for text matching
   - Use partial text matching when appropriate
   - Avoid brittle selectors like CSS classes

3. **Test Accessibility**
   - Use roles to ensure proper ARIA attributes
   - Test keyboard navigation
   - Verify focus management

4. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test descriptions
   - Follow the Arrange-Act-Assert pattern

## Example Test

```typescript
it('should allow user to sign in', () => {
  // Arrange
  cy.visit('/signin')

  // Act
  cy.findByRole('textbox', { name: /email/i }).type('user@example.com')
  cy.findByLabelText(/password/i).type('password123')
  cy.findByRole('button', { name: /sign in/i }).click()

  // Assert
  cy.findByRole('link', { name: /teams/i }).should('be.visible')
})
```
