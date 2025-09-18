import { expect, test } from '@playwright/test'

import { createSessionCookie, TestUsers } from '../helpers/test-auth'

/**
 * Example: Business Logic Tests with Fast Authentication
 *
 * This file demonstrates how to use the test-auth helper for business logic tests
 * that need authenticated users but don't need to test Firebase authentication itself.
 *
 * Benefits:
 * - Much faster than going through Firebase auth flow
 * - More reliable (no Firebase dependencies)
 * - Easier to test different role scenarios
 * - Isolates business logic from authentication logic
 */
test.describe('Business Logic with Authentication', () => {
  test('should allow admin user to access admin panel', async ({ page }) => {
    // Create authenticated admin session (bypasses Firebase)
    const { user, cookie } = await TestUsers.admin()

    // Set the session cookie
    await page.context().addCookies([createSessionCookie(cookie)])

    // Navigate directly to admin panel
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Verify admin has access
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await expect(page.locator('nav')).toBeVisible()

    // Verify user info is displayed correctly
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()
  })

  test('should allow manager user to access admin panel', async ({ page }) => {
    const { user, cookie } = await TestUsers.manager()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()
  })

  test('should allow editor user to access admin panel (read-only)', async ({
    page,
  }) => {
    const { user, cookie } = await TestUsers.editor()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Editor should have access to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()

    // But should not see create/edit buttons (read-only permissions)
    // Note: These selectors would need to be updated based on actual UI
    await expect(
      page.getByRole('button', { name: /nieuw toernooi/i })
    ).not.toBeVisible()
    await expect(page.getByRole('button', { name: /bewerken/i })).not.toBeVisible()
  })

  test('should allow billing user to access admin panel (read-only)', async ({
    page,
  }) => {
    const { user, cookie } = await TestUsers.billing()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Billing should have access to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()

    // Should have read-only access like editor
    await expect(
      page.getByRole('button', { name: /nieuw toernooi/i })
    ).not.toBeVisible()
  })

  test('should allow referee user to access admin panel', async ({ page }) => {
    const { user, cookie } = await TestUsers.referee()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()
  })

  test('should redirect public user away from admin panel', async ({ page }) => {
    const { cookie } = await TestUsers.public()
    await page.context().addCookies([createSessionCookie(cookie)])

    // Try to access admin panel
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Should be redirected away from admin panel
    await expect(page).not.toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    // Likely redirected to unauthorized page or homepage
    await expect(page).toHaveURL(/\/(unauthorized|$)/)
  })

  test('should redirect unauthenticated user to signin', async ({ page }) => {
    // Don't set any authentication cookie

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Should be redirected to signin with redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page.url()).toContain('redirectTo=')
  })

  test('should test role-based permissions efficiently', async ({ page }) => {
    // Test multiple roles quickly without Firebase overhead
    const roles = ['admin', 'manager', 'editor', 'billing', 'referee'] as const

    for (const role of roles) {
      const { user, cookie } = await TestUsers[role]()

      // Clear existing cookies and set new session
      await page.context().clearCookies()
      await page.context().addCookies([createSessionCookie(cookie)])

      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // All these roles should have admin panel access
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
      await expect(page.getByText(`${user.firstName} ${user.lastName}`)).toBeVisible()
    }
  })
})

test.describe('Teams Page Access Control', () => {
  test('should allow public user to view teams page', async ({ page }) => {
    const { cookie } = await TestUsers.public()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/teams')

    await expect(page).toHaveURL('/teams')
    // Should see teams listing
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should allow unauthenticated user to view teams page', async ({ page }) => {
    // No authentication
    await page.goto('/teams')

    await expect(page).toHaveURL('/teams')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should allow admin to view teams page', async ({ page }) => {
    const { cookie } = await TestUsers.admin()
    await page.context().addCookies([createSessionCookie(cookie)])

    await page.goto('/teams')

    await expect(page).toHaveURL('/teams')
    // Admin might see additional controls
    await expect(page.locator('h1')).toBeVisible()
  })
})
