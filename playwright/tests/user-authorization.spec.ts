/**
 * Regular User Authorization E2E Tests
 *
 * Test Scenarios:
 * - Regular user access to admin panel (should be blocked)
 * - Regular user access to admin teams page (should be blocked)
 * - Regular user access to admin team creation (should be blocked)
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
  let adminPanel: AdminPanelPage

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })
    adminPanel = new AdminPanelPage(page)
  })

  test('should be redirected from admin panel', async () => {
    // Regular users must be redirected when trying to access the admin panel
    await adminPanel.goto()

    // Should land on unauthorized page
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should be redirected from admin teams page', async () => {
    await adminPanel.gotoAdminTeams()

    // Regular users must be redirected when trying to access admin teams
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should be redirected from admin team creation', async () => {
    await adminPanel.gotoAdminTeamNew()

    // Regular users must be redirected when trying to create admin teams
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should be redirected from team editing (admin only)', async ({ page }) => {
    await adminPanel.gotoTeamEdit('some-team-id')

    // Regular user should be redirected to unauthorized page for team editing
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should be redirected from tournament creation (admin only)', async () => {
    await adminPanel.gotoTournamentNew()

    // Regular user should be redirected to unauthorized page for tournament creation
    await adminPanel.expectToBeOnUnauthorizedPage()
  })

  test('should sign out user and redirect to home page', async ({ page }) => {
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
