/* eslint-disable no-console */
import { expect, test } from '@playwright/test'

// Menu Toggle Tests - USES USER AUTHENTICATION from user-auth.json
test.describe('Menu Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // Mobile viewport
  })

  test('should open mobile menu when toggle button is clicked', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Verify the toggle button exists
    const toggleButton = page.getByRole('button', { name: 'Toggle menu' })
    await expect(toggleButton).toBeVisible({ timeout: 10000 })

    // Verify menu is initially closed
    const menuDropdown = page.locator('[data-testid="user-menu-dropdown"]')
    await expect(menuDropdown).not.toBeVisible()

    console.log('- about to click toggle button...')

    // Click the toggle button
    await toggleButton.click()

    console.log('- toggle button clicked, waiting for menu...')

    // Verify menu opens
    await expect(menuDropdown).toBeVisible({ timeout: 5000 })

    console.log('- menu should be visible now!')

    // Verify menu contains user information (Dutch text for Playwright tests)
    await expect(menuDropdown).toContainText(/ingelogd als|signed in/i)
  })

  test('should display menu content for authenticated user', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const toggleButton = page.getByRole('button', { name: 'Toggle menu' })
    const menuDropdown = page.locator('[data-testid="user-menu-dropdown"]')

    // Open menu
    await toggleButton.click()
    await expect(menuDropdown).toBeVisible()

    console.log('- menu opened, checking authenticated user content...')

    // Verify menu shows authenticated user content (Dutch)
    await expect(menuDropdown).toContainText(/ingelogd als|signed in/i)

    // Verify menu contains typical navigation items (Dutch)
    await expect(menuDropdown).toContainText(/teams/i)

    console.log('- authenticated user menu content verified!')
  })
})
