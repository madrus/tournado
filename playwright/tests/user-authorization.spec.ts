/**
 * Regular User Authorization E2E Tests
 *
 * Test Scenarios:
 * - Regular user access to admin panel (allowed)
 * - Regular user access to admin teams page (allowed)
 * - Regular user access to admin team creation (allowed)
 * - Team editing restriction (admin only)
 * - Tournament creation restriction (admin only)
 * - User sign out and redirect behavior
 *
 * Authentication: Uses cached user auth (non-admin user)
 * Viewport: Mobile (375x812)
 * Note: Tests both allowed and restricted access for regular users
 */
import { test } from '@playwright/test'

import { AdminPanelPage } from '../pages/AdminPanelPage'

// User Authorization Tests - USES CACHED USER AUTHENTICATION
// These tests verify what regular (non-admin) users can and cannot access
test.describe('User Authorization - Regular User Access', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('should have access to admin panel', async ({ page }) => {
    const adminPanel = new AdminPanelPage(page)

    // Regular users can access the admin panel
    await adminPanel.goto()

    // Should stay on admin panel (not be redirected)
    await adminPanel.expectToBeOnAdminPanel()
  })

  test('should have access to admin teams page', async ({ page }) => {
    const adminPanel = new AdminPanelPage(page)

    await adminPanel.gotoAdminTeams()

    // Regular user can access admin teams page
    await adminPanel.expectToBeOnAdminTeams()
  })

  test('should have access to admin team creation', async ({ page }) => {
    const adminPanel = new AdminPanelPage(page)

    await adminPanel.gotoAdminTeamNew()

    // Regular user can access admin team creation page
    await adminPanel.expectToBeOnAdminTeamNew()
  })

  test('should be redirected from team editing (admin only)', async ({ page }) => {
    const adminPanel = new AdminPanelPage(page)

    await adminPanel.gotoTeamEdit('some-team-id')

    // Regular user should be redirected to unauthorized page for team editing
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should be redirected from tournament creation (admin only)', async ({
    page,
  }) => {
    const adminPanel = new AdminPanelPage(page)

    await adminPanel.gotoTournamentNew()

    // Regular user should be redirected to unauthorized page for tournament creation
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should sign out user and redirect to home page', async ({ page }) => {
    const adminPanel = new AdminPanelPage(page)

    // Navigate to admin panel (user can access it)
    await adminPanel.goto()

    // Open user menu and sign out
    await adminPanel.openUserMenu()
    await adminPanel.clickSignOut()

    // Verify redirect to home page (not login page)
    await adminPanel.expectToBeOnHomePage()

    // Wait for page to settle and verify user is signed out
    await page.waitForLoadState('networkidle')

    // Verify user is signed out by checking menu shows login option
    await adminPanel.openUserMenu()

    // Should see login link instead of user email
    await adminPanel.expectLoginLinkVisible()
  })
})
