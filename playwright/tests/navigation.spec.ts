import { expect, test } from '@playwright/test'

// Navigation Tests - PUBLIC ACCESS (no authentication needed for bottom navigation)
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistent testing
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use English for Playwright tests
  })

  test.describe('Bottom Navigation - Public', () => {
    test('should allow navigation via bottom navigation', async ({ page }) => {
      // Start from homepage
      await page.goto('/')

      // Navigate to teams using bottom navigation
      const bottomNav = page.locator('[data-testid="bottom-navigation"]')
      await expect(bottomNav).toBeVisible({ timeout: 10000 })

      const teamsNavButton = bottomNav.locator('[data-testid="nav-teams"]')
      await expect(teamsNavButton).toBeVisible({ timeout: 5000 })
      await teamsNavButton.click()

      // Should navigate to teams page (public view)
      await expect(page).toHaveURL('/teams')

      // Navigate back to home
      await bottomNav.locator('[data-testid="nav-home"]').click()
      await expect(page).toHaveURL('/')

      // Navigate to more/about
      await bottomNav.locator('[data-testid="nav-more"]').click()
      await expect(page).toHaveURL('/about')
    })

    test('should show all navigation items are functional', async ({ page }) => {
      await page.goto('/')

      // Test that all navigation items exist and are clickable
      const bottomNav = page.locator('[data-testid="bottom-navigation"]')
      await expect(bottomNav).toBeVisible()

      // Verify all navigation items are present
      await expect(bottomNav.locator('[data-testid="nav-home"]')).toBeVisible()
      await expect(bottomNav.locator('[data-testid="nav-teams"]')).toBeVisible()
      await expect(bottomNav.locator('[data-testid="nav-more"]')).toBeVisible()

      // Test navigation functionality
      await bottomNav.locator('[data-testid="nav-teams"]').click()
      await expect(page).toHaveURL('/teams')

      await bottomNav.locator('[data-testid="nav-home"]').click()
      await expect(page).toHaveURL('/')

      await bottomNav.locator('[data-testid="nav-more"]').click()
      await expect(page).toHaveURL('/about')
    })
  })

  test.describe('Homepage Navigation - Public', () => {
    test('should navigate via homepage view teams button', async ({ page }) => {
      await page.goto('/')

      // Use the homepage "Teams bekijken" button (Dutch interface)
      await page.getByRole('link', { name: 'Teams bekijken' }).click()

      await expect(page).toHaveURL('/teams')
    })
  })

  test.describe('Responsive Navigation', () => {
    test('should hide bottom navigation on desktop', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      // Bottom navigation should be hidden on desktop (has md:hidden class)
      await expect(page.locator('[data-testid="bottom-navigation"]')).not.toBeVisible()
    })

    test('should show bottom navigation on mobile', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/')

      // Bottom navigation should be visible on mobile
      await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible()
    })
  })
})
