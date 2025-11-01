/**
 * Regular User Authorization E2E Tests
 *
 * Test Scenarios:
 * - Regular user access to admin panel (allowed)
 * - Regular user access to admin teams page (allowed)
 * - Regular user access to admin team creation (allowed)
 * - Team editing restriction (admin only)
 * - Tournament creation restriction (admin only)
 * - User sign out and redirect behavior
 *
 * Authentication: Uses cached user auth (non-admin user)
 * Viewport: Mobile (375x812)
 * Note: Tests both allowed and restricted access for regular users
 */
import { expect, test } from '@playwright/test'

// User Authorization Tests - USES CACHED USER AUTHENTICATION
// These tests verify what regular (non-admin) users can and cannot access
test.describe('User Authorization - Regular User Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
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

  test('should sign out user and redirect to home page', async ({ page }) => {
    // Navigate to admin panel (user can access it)
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Wait for page to load and content to render
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for hydration/rendering

    // Open user menu and sign out
    await page.getByRole('button', { name: /menu openen\/sluiten/i }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // Verify redirect to home page (not login page)
    await expect(page).toHaveURL('/', { timeout: 5000 })

    // Wait for page to settle and verify user is signed out
    await page.waitForLoadState('networkidle')

    // Verify user is signed out by checking menu shows login option
    await page.getByRole('button', { name: /menu openen\/sluiten/i }).click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({ timeout: 5000 })

    // Should see login link instead of user email
    await expect(page.getByRole('link', { name: 'Inloggen' })).toBeVisible()
  })
})
