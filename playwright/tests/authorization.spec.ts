import { expect, test } from '@playwright/test'

import { loginAsRole } from '../helpers/session'

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
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering
    await expect(page).toHaveURL('/auth/signin')
    await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible()

    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByRole('button', { name: 'Registreren' })).toBeVisible()
  })

  test('should redirect PUBLIC role users to unauthorized when accessing admin panels', async ({
    page,
  }) => {
    await loginAsRole(page, 'PUBLIC')

    // Try to access admin panel as PUBLIC user
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Should be redirected to unauthorized page
    await expect(page).toHaveURL('/unauthorized')
  })

  test('should redirect PUBLIC role users to unauthorized when accessing admin teams', async ({
    page,
  }) => {
    await loginAsRole(page, 'PUBLIC')

    // Try to access admin teams as PUBLIC user
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

    // Should be redirected to unauthorized page
    await expect(page).toHaveURL('/unauthorized')
  })
})
