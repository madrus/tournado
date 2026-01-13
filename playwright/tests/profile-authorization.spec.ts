/**
 * Profile Page Authorization E2E Tests
 *
 * Test Scenarios:
 * - Unauthenticated user redirect to signin
 * - PUBLIC role access to profile
 * - REFEREE role access to profile
 * - EDITOR role access to profile
 * - BILLING role access to profile
 * - MANAGER role access to profile
 * - ADMIN role access to profile
 *
 * Authentication: Tests multiple roles via loginAsRole helper
 * Viewport: Mobile (375x812)
 * Note: All authenticated users should have access to their profile
 */
import { type Page, test } from '@playwright/test'
import { Role } from '@prisma/client'
import { loginAsRole } from '../helpers/session'
import { ProfilePage } from '../pages/ProfilePage'

test.describe('Profile Authorization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  // Test unauthenticated access
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    const profilePage = new ProfilePage(page)

    // Use empty storage state (no authentication)
    await page.context().clearCookies()

    await profilePage.goto()
    await profilePage.expectToBeRedirectedToSignin()
  })

  // Helper to test role access
  async function testRoleAccess(page: Page, role: Role): Promise<void> {
    const profilePage = new ProfilePage(page)

    await loginAsRole(page, role)
    await profilePage.goto()
    await profilePage.expectToBeOnProfilePage()
  }

  // Test all roles - all should have access to their profile
  test('PUBLIC role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.PUBLIC)
  })

  test('REFEREE role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.REFEREE)
  })

  test('EDITOR role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.EDITOR)
  })

  test('BILLING role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.BILLING)
  })

  test('MANAGER role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.MANAGER)
  })

  test('ADMIN role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, Role.ADMIN)
  })
})
