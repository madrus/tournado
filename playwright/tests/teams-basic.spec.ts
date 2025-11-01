/**
 * Public Teams Basic UI E2E Tests
 *
 * Test Scenarios:
 * - Public teams page access and display
 * - Viewing teams list without authentication
 * - Public team registration access
 * - Team registration form visibility
 *
 * Authentication: PUBLIC ACCESS - No authentication required
 * Viewport: Mobile (375x812)
 */
import { expect, test } from '@playwright/test'

// Public Teams Basic UI Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams - Basic UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should display teams page publicly', async ({ page }) => {
    // Navigate to teams page (public access)
    await page.goto('/teams')

    // Should be able to view teams page without authentication
    await expect(page).toHaveURL('/teams')

    // Should see the "Toevoegen" button
    await expect(page.getByRole('link', { name: 'Toevoegen' })).toBeVisible()
  })

  test('should display existing teams publicly', async ({ page }) => {
    await page.goto('/teams')

    // Should show teams list or empty state message
    // This is public viewing of teams
    const teamsContainer = page.locator('[data-testid="teams-layout"]')
    await expect(teamsContainer).toBeVisible()
  })

  test('should allow public team registration', async ({ page }) => {
    await page.goto('/teams')

    // Click "Toevoegen" button (public team registration)
    await page.getByRole('link', { name: 'Toevoegen' }).click()

    // Should navigate to new team page
    await expect(page).toHaveURL('/teams/new')

    // Should see team registration form (public access)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('[name="clubName"]')).toBeVisible()
    await expect(page.locator('[name="name"]')).toBeVisible()
  })
})
