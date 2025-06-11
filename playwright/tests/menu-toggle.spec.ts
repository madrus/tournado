/* eslint-disable no-console */
import { expect, test } from '@playwright/test'

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
    const menuOverlay = page.locator('[data-testid="mobile-user-menu-overlay"]')
    await expect(menuOverlay).not.toBeVisible()

    console.log('About to click toggle button...')

    // Click the toggle button
    await toggleButton.click()

    console.log('Toggle button clicked, waiting for menu...')

    // Verify menu opens
    await expect(menuOverlay).toBeVisible({ timeout: 5000 })

    console.log('Menu should be visible now!')
  })

  test('should close mobile menu when overlay is clicked', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open menu first
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    const menuOverlay = page.locator('[data-testid="mobile-user-menu-overlay"]')
    await expect(menuOverlay).toBeVisible()

    // Click overlay to close
    await menuOverlay.click()
    await expect(menuOverlay).not.toBeVisible()
  })
})
