/**
 * Mobile Menu Toggle Functionality E2E Tests
 *
 * Test Scenarios:
 * - Mobile menu toggle button visibility and interaction
 * - Menu opening and closing functionality
 * - Menu content display for authenticated users
 * - User information display in menu
 * - Navigation items presence in menu
 *
 * Authentication: Uses user auth from user-auth.json (regular user)
 * Viewport: Mobile (375x812)
 */
import { expect, test } from '@playwright/test'
import { MobileMenuPage } from '../pages/MobileMenuPage'

// Menu Toggle Tests - USES USER AUTHENTICATION from user-auth.json
test.describe('Menu Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // Mobile viewport
  })

  test('should open mobile menu when toggle button is clicked', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mobileMenuPage = new MobileMenuPage(page)

    await mobileMenuPage.expectMenuClosed()

    await mobileMenuPage.openMenu()

    await mobileMenuPage.expectMenuOpen()

    await expect(mobileMenuPage.menuDropdown).toContainText(/ingelogd als/i)
  })

  test('should display menu content for authenticated user', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const mobileMenuPage = new MobileMenuPage(page)

    await mobileMenuPage.openMenu()

    await expect(mobileMenuPage.menuDropdown).toContainText(/ingelogd als/i)
    await expect(mobileMenuPage.menuDropdown).toContainText(/teams/i)
  })
})
