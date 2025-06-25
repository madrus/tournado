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
})
