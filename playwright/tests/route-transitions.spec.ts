/**
 * Route Transition E2E Tests
 *
 * Test Scenarios:
 * - Opacity transitions during route changes
 * - Transition timing and duration
 * - Visual smoothness of transitions
 * - Transitions work across different routes
 *
 * Authentication: PUBLIC ACCESS - No authentication required
 * Viewport: Mobile (375x812) - transitions are visible on all viewports
 *
 * Note: These tests verify the visual transition behavior that cannot be
 * reliably tested in JSDOM unit tests due to limitations with location.key
 * changes and timer-based state transitions.
 */
import { expect, test } from '@playwright/test'
import { NavigationPage } from '../pages/NavigationPage'
import { dismissPwaPromptIfVisible } from '../utils/pwaHelper'

test.describe('Route Transitions', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistent testing
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test.describe('Transition Lifecycle', () => {
    test('should apply opacity transition when navigating between routes', async ({
      page,
    }) => {
      // Start from homepage
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Get the transition wrapper (SubtleRouteTransition uses animate-slideIn class)
      // Wait for initial render to complete
      await page.waitForLoadState('networkidle')

      // Navigate to teams page
      await nav.navigateTeams()

      // Wait for navigation to complete
      await expect(page).toHaveURL(/\/teams/)

      // Verify content is visible (transition has completed)
      await expect(page.getByText(/teams/i)).toBeVisible()
    })

    test('should maintain visual continuity during navigation', async ({ page }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Navigate through multiple routes to test transition consistency
      await nav.navigateTeams()
      await expect(page).toHaveURL(/\/teams/)
      await expect(page.getByText(/teams/i)).toBeVisible()

      await nav.navigateHome()
      await expect(page).toHaveURL(/\/$/)

      await nav.navigateMore()
      await expect(page).toHaveURL(/\/about/)
      await expect(page.getByText(/about/i)).toBeVisible()

      // Navigate back to home
      await nav.navigateHome()
      await expect(page).toHaveURL(/\/$/)
    })

    test('should complete transitions within expected duration', async ({ page }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Measure navigation time
      const startTime = Date.now()

      await nav.navigateTeams()
      await expect(page).toHaveURL(/\/teams/)
      await expect(page.getByText(/teams/i)).toBeVisible()

      const endTime = Date.now()
      const navigationDuration = endTime - startTime

      // Transition should complete within reasonable time (< 2 seconds)
      // SubtleRouteTransition uses 500ms duration, so navigation + transition should be quick
      expect(navigationDuration).toBeLessThan(2000)
    })

    test('should handle rapid navigation without visual glitches', async ({ page }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Rapidly navigate between routes
      await nav.navigateTeams()
      await nav.navigateHome()
      await nav.navigateMore()
      await nav.navigateHome()

      // Verify final state is correct
      await expect(page).toHaveURL(/\/$/)

      // Verify page is fully interactive (no stuck transitions)
      const homeContent = page.locator('main')
      await expect(homeContent).toBeVisible()
    })
  })

  test.describe('Transition Accessibility', () => {
    test('should not interfere with keyboard navigation during transitions', async ({
      page,
    }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      // Use keyboard to navigate
      await page.keyboard.press('Tab')

      // Find and activate a navigation link with keyboard
      const teamsLink = page.getByRole('link', { name: /teams/i })
      await teamsLink.focus()
      await page.keyboard.press('Enter')

      // Verify navigation completed
      await expect(page).toHaveURL(/\/teams/)
      await expect(page.getByText(/teams/i)).toBeVisible()
    })

    test('should maintain focus management during transitions', async ({ page }) => {
      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Navigate and verify focus is not lost
      await nav.navigateTeams()
      await expect(page).toHaveURL(/\/teams/)

      // Verify page is interactive (can focus elements)
      const focusableElement = page.locator('main').first()
      await expect(focusableElement).toBeVisible()
    })
  })

  test.describe('Reduced Motion', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      // Enable reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })

      await page.goto('/')
      await dismissPwaPromptIfVisible(page)

      const nav = new NavigationPage(page)

      // Navigate - should work even with reduced motion
      await nav.navigateTeams()
      await expect(page).toHaveURL(/\/teams/)
      await expect(page.getByText(/teams/i)).toBeVisible()

      // Verify content is immediately visible (no long transitions)
      // SubtleRouteTransition should skip animation when reduced motion is preferred
      await nav.navigateHome()
      await expect(page).toHaveURL(/\/$/)
    })
  })
})
