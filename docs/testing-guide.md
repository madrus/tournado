# Testing Guide

## Element Selection Best Practices

When writing tests, follow this order of preference for selecting elements:

1. **By Role** (best)

   ```typescript
   // Buttons
   cy.findByRole('button', { name: /log in/i })
   cy.findByRole('button', { name: /save/i })

   // Links
   cy.findByRole('link', { name: /notes/i })
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
   cy.findByText(/log in/i)
   cy.findByText(/no notes yet/i)
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
   cy.findByTestId('login-button')
   ```

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
cy.findByRole('button', { name: /log in/i }).click()
```

### Navigation Testing

```typescript
// Click navigation links
cy.findByRole('link', { name: /notes/i }).click()
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
it('should allow user to log in', () => {
  // Arrange
  cy.visit('/login')

  // Act
  cy.findByRole('textbox', { name: /email/i }).type('user@example.com')
  cy.findByLabelText(/password/i).type('password123')
  cy.findByRole('button', { name: /log in/i }).click()

  // Assert
  cy.findByRole('link', { name: /notes/i }).should('be.visible')
})
```
