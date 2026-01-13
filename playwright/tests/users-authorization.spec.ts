/**
 * Users Management Authorization E2E Tests
 *
 * Test Scenarios:
 * - Unauthenticated user redirect to signin
 * - ADMIN role access to users management
 * - PUBLIC role blocked from users management
 * - REFEREE role blocked from users management
 * - EDITOR role blocked from users management
 * - BILLING role blocked from users management
 * - MANAGER role blocked from users management
 *
 * Authentication: Tests multiple roles via loginAsRole helper
 * Viewport: Mobile (375x812)
 * Note: Only ADMIN role has users management access
 */
import { type Page, expect, test } from '@playwright/test'
import type { Role } from '@prisma/client'
import { adminPath } from '../../app/utils/adminRoutes'
import { loginAsRole } from '../helpers/session'

test.describe('Users Management Authorization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  // Test unauthenticated access
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Use empty storage state (no authentication)
    await page.context().clearCookies()

    await page.goto(adminPath('/users'))

    // Should redirect to signin with redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=/)
  })

  // Helper to test role access
  async function testRoleAccess(
    page: Page,
    role: Role,
    shouldAccess: boolean,
  ): Promise<void> {
    await loginAsRole(page, role)
    await page.goto(adminPath('/users'))

    if (shouldAccess) {
      // Should stay on users page
      await expect(page).toHaveURL(adminPath('/users'))
      // Verify users management content renders
      await expect(page.getByTestId('admin-users-page-content')).toBeVisible()
    } else {
      // Should redirect to unauthorized
      await expect(page).toHaveURL('/unauthorized')
    }
  }

  // Test ADMIN role - should have access
  test('ADMIN role users should access users management', async ({ page }) => {
    await testRoleAccess(page, 'ADMIN', true)
  })

  // Test all other roles - should be blocked
  test('PUBLIC role users should be blocked from users management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'PUBLIC', false)
  })

  test('REFEREE role users should be blocked from users management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'REFEREE', false)
  })

  test('EDITOR role users should be blocked from users management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'EDITOR', false)
  })

  test('BILLING role users should be blocked from users management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'BILLING', false)
  })

  test('MANAGER role users should be blocked from users management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'MANAGER', false)
  })
})
