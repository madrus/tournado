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
  expect(menuLabels).toContain('auth.signin')

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
  role: 'PUBLIC', // or 'TOURNAMENT_MANAGER', 'REFEREE', etc.
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
5. **Test Responsive Design**: Verify both mobile and desktop menu versions

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
