/**
 * General Authorization and Public Access E2E Tests
 *
 * Test Scenarios:
 * - Public access to teams page
 * - Protected route redirect to signin for unauthenticated users
 * - Signup and signin page accessibility
 * - PUBLIC role redirect to unauthorized for admin panels
 * - PUBLIC role redirect for admin teams access
 *
 * Authentication: PUBLIC ACCESS - No authentication required
 * Viewport: Mobile (375x812)
 * Note: Tests unauthenticated and PUBLIC role access patterns
 */
import { expect, test } from '@playwright/test'

import { loginAsRole } from '../helpers/session'
import { PublicPage } from '../pages/PublicPage'

// Public Authorization Tests - NO AUTHENTICATION REQUIRED
// These tests verify public access and redirection behavior for unauthenticated users
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authorization - Public Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should allow access to public teams page', async ({ page }) => {
    const publicPage = new PublicPage(page)
    await publicPage.navigateToTeams()

    await expect(page).toHaveURL('/teams')
    await expect(await publicPage.getAddTeamButton()).toBeVisible()
  })

  test('should redirect to signin when accessing protected routes', async ({
    page,
  }) => {
    const publicPage = new PublicPage(page)
    await publicPage.navigateToAdminPanel()

    // Should be redirected to signin page
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=/)
  })

  test('should allow access to signup and signin pages', async ({ page }) => {
    const publicPage = new PublicPage(page)
    await publicPage.navigateToSignin()
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-hydrated') === 'true'
    )
    await expect(page).toHaveURL('/auth/signin')
    await expect(await publicPage.getSigninButton()).toBeVisible()

    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-hydrated') === 'true'
    )
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByRole('button', { name: 'Registreren' })).toBeVisible()
  })

  test('should redirect PUBLIC role users to unauthorized when accessing admin panels', async ({
    page,
  }) => {
    await loginAsRole(page, 'PUBLIC')
    const publicPage = new PublicPage(page)

    // Try to access admin panel as PUBLIC user
    await publicPage.navigateToAdminPanel()

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
