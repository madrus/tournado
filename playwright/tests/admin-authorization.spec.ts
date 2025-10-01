import { expect, test } from '@playwright/test'

// Admin Authorization Tests - run under admin-authenticated project
test.describe('Admin Authorization', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test.describe('Admin User - Full Access', () => {
    test('should have access to admin panel', async ({ page }) => {
      // Admin users should be able to access the admin panel
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Wait for page to load and content to render
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Wait for hydration/rendering

      // Wait for content to actually appear
      await page.waitForFunction(() => document.body.children.length > 0)

      // Should not be redirected away
      await expect(page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1/)

      // Should see specific admin content (Beheerpaneel heading)
      await expect(page.locator('h1').filter({ hasText: 'Beheerpaneel' })).toBeVisible({
        timeout: 15000,
      })
    })

    test('should be able to access admin teams page', async ({ page }) => {
      // Navigate to admin teams page
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')

      // Wait for page to load and content to render
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Wait for hydration/rendering

      // Wait for content to actually appear
      await page.waitForFunction(() => document.body.children.length > 0)

      // Admin should see team management interface
      await expect(page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams/)

      // Should see teams management heading
      await expect(page.getByRole('heading', { name: 'Teams beheer' })).toBeVisible({
        timeout: 15000,
      })
    })

    test('should be able to access admin team creation', async ({ page }) => {
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams/new')

      // Wait for page to load and content to render
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Wait for hydration/rendering

      // Wait for content to actually appear
      await page.waitForFunction(() => document.body.children.length > 0)

      // Should see admin team creation form
      await expect(page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/teams\/new/)

      // Should have form elements (look for form instead of specific button)
      await expect(page.locator('form')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('[name="clubName"]')).toBeVisible({ timeout: 15000 })
    })

    test('should have admin menu options in user dropdown', async ({ page }) => {
      // Navigate to admin panel
      await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1')

      // Wait for page to load and content to render
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Wait for hydration/rendering

      // Open user menu
      await page.getByRole('button', { name: /menu openen\/sluiten/i }).click()
      await expect(page.getByTestId('user-menu-dropdown')).toBeVisible({
        timeout: 5000,
      })

      // Admin menu should have tournaments management option
      await expect(
        page.getByTestId('user-menu-dropdown').getByText('Toernooien')
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Uitloggen' })).toBeVisible()
    })
  })
})
