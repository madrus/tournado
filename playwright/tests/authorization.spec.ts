import { expect, test } from '@playwright/test'

// Public Authorization Tests - NO AUTHENTICATION REQUIRED
// These tests verify public access and redirection behavior for unauthenticated users
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authorization - Public Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
  })

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
