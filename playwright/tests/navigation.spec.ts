/**
 * Navigation E2E Tests
 *
 * Test Scenarios:
 * - Bottom navigation functionality (home, teams, more/about)
 * - PWA update prompt handling during navigation
 * - Homepage view teams button navigation
 * - Responsive navigation visibility (mobile vs desktop)
 * - All navigation items are present and clickable
 *
 * Authentication: PUBLIC ACCESS - No authentication required
 * Viewport: Mobile (375x812) and Desktop (1280x720) for responsive tests
 */
import { test } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { NavigationPage } from '../pages/NavigationPage'
import { dismissPwaPromptIfVisible } from '../utils/pwaHelper'

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
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Navigate to teams
      await nav.navigateTeams()

      // Navigate back to home
      await nav.navigateHome()

      // Navigate to more/about
      await nav.navigateMore()
    })

    test('should show all navigation items are functional', async ({ page }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Verify all navigation items are present
      await nav.expectAllNavigationItemsPresent()

      // Test navigation functionality
      await nav.navigateTeams()
      await nav.navigateHome()
      await nav.navigateMore()
    })
  })

  test.describe('Homepage Navigation - Public', () => {
    test('should navigate via homepage view teams button', async ({ page }) => {
      const homePage = new HomePage(page)

      await homePage.goto()
      await dismissPwaPromptIfVisible(page)

      // Use the homepage view teams button
      await homePage.clickViewTeamsButton()
    })
  })

  test.describe('Responsive Navigation', () => {
    test('should hide bottom navigation on desktop', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      const nav = new NavigationPage(page)

      // Bottom navigation should be hidden on desktop (has md:hidden class)
      await nav.expectBottomNavigationHidden()
    })

    test('should show bottom navigation on mobile', async ({ page }) => {
      await page.goto('/')

      const nav = new NavigationPage(page)

      // Bottom navigation should be visible on mobile
      await nav.expectBottomNavigationVisible()
    })
  })
})
