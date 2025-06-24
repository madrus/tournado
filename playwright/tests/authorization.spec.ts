import { expect, test } from '@playwright/test'

import { createRegularUser } from '../helpers/database'

test.describe('Authorization - Role-based Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
  })

  test.describe('Regular User - Admin Panel Access', () => {
    // These tests need fresh authentication with regular users
    test.use({ storageState: { cookies: [], origins: [] } })

    let regularUser: { email: string; role: string }

    test.beforeEach(async ({ page }) => {
      regularUser = await createRegularUser()

      await page.goto('/auth/signin')

      // Use deliberate field filling to prevent clearing issues
      await page.locator('#email').click()
      await page.locator('#email').clear()
      await page.locator('#email').pressSequentially(regularUser.email, { delay: 50 })

      await page.locator('#password').click()
      await page.locator('#password').clear()
      await page
        .locator('#password')
        .pressSequentially('MyReallyStr0ngPassw0rd!!!', { delay: 50 })

      // Ensure form is ready and fields are properly filled
      await expect(page.locator('#email')).toHaveValue(regularUser.email)
      await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

      // Wait for the login button to be enabled and ready
      const loginButton = page.getByRole('button', { name: 'Inloggen' })
      await expect(loginButton).toBeEnabled()

      // Wait for any loading states to complete before submission
      await page.waitForLoadState('networkidle')

      // Additional wait to ensure form is stable before submission
      await page.waitForTimeout(500)

      // Re-verify fields just before submission to catch any clearing
      await expect(page.locator('#email')).toHaveValue(regularUser.email)
      await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

      await Promise.all([
        page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 }), // Increased timeout for CI
        loginButton.click(),
      ])
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })
    })

    test('should have access to admin panel', async ({ page }) => {
      // Regular users can access the admin panel
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Should stay on admin panel (not be redirected)
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    })

    test('should have access to admin teams page', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

      // Regular user can access admin teams page
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
    })

    test('should have access to admin team creation', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')

      // Regular user can access admin team creation page
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')
    })

    test('should be redirected from team editing (admin only)', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/some-team-id')

      // Regular user should be redirected to unauthorized page for team editing
      await expect(page).toHaveURL('/unauthorized')
    })

    test('should be redirected from tournament creation (admin only)', async ({
      page,
    }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/new')

      // Regular user should be redirected to unauthorized page for tournament creation
      await expect(page).toHaveURL('/unauthorized')
    })
  })

  test.describe('Public Access - No Authentication Required', () => {
    // These tests should run without authentication
    test.use({ storageState: { cookies: [], origins: [] } })

    test('should allow access to public teams page', async ({ page }) => {
      // Public teams page should be accessible without authentication
      await page.goto('/teams')

      await expect(page).toHaveURL('/teams')
      await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
    })

    test('should redirect to signin when accessing protected routes', async ({
      page,
    }) => {
      // Try to access admin panel without authentication
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Should be redirected to signin page
      await expect(page).toHaveURL(/\/auth\/signin/)
      await expect(page).toHaveURL(/redirectTo=/)
    })

    test('should allow access to signup and signin pages', async ({ page }) => {
      await page.goto('/auth/signin')
      await expect(page).toHaveURL('/auth/signin')
      await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible()

      await page.goto('/auth/signup')
      await expect(page).toHaveURL('/auth/signup')
      await expect(page.getByRole('button', { name: 'Account aanmaken' })).toBeVisible()
    })
  })
})
