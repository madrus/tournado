import { expect, test } from '@playwright/test'

// Public Teams Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
  })

  test('should display teams page publicly', async ({ page }) => {
    // Navigate to teams page (public access)
    await page.goto('/teams')

    // Should be able to view teams page without authentication
    await expect(page).toHaveURL('/teams')

    // Should see the "Team toevoegen" button (exact Dutch text)
    await expect(page.getByRole('link', { name: 'Team toevoegen' })).toBeVisible()
  })

  test('should allow public team registration', async ({ page }) => {
    await page.goto('/teams')

    // Click "Team toevoegen" button (public team registration)
    await page.getByRole('link', { name: 'Team toevoegen' }).click()

    // Should navigate to new team page
    await expect(page).toHaveURL('/teams/new')

    // Should see team registration form (public access)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('[name="clubName"]')).toBeVisible()
    await expect(page.locator('[name="teamName"]')).toBeVisible()
  })

  test('should display existing teams publicly', async ({ page }) => {
    await page.goto('/teams')

    // Should show teams list or empty state message
    // This is public viewing of teams
    const teamsContainer = page.locator('[data-testid="teams-layout"]')
    await expect(teamsContainer).toBeVisible()
  })
})
