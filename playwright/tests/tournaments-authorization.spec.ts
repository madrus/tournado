/**
 * Tournaments Management Authorization E2E Tests
 *
 * Test Scenarios:
 * - Unauthenticated user redirect to signin
 * - ADMIN role access to tournaments management
 * - MANAGER role access to tournaments management
 * - PUBLIC role blocked from tournaments management
 * - REFEREE role blocked from tournaments management
 * - EDITOR role blocked from tournaments management
 * - BILLING role blocked from tournaments management
 *
 * Authentication: Tests multiple roles via loginAsRole helper
 * Viewport: Mobile (375x812)
 * Note: Only ADMIN and MANAGER roles have tournaments management access
 */
import { expect, type Page, test } from '@playwright/test'
import type { Role } from '@prisma/client'

import { loginAsRole } from '../helpers/session'

test.describe('Tournaments Management Authorization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  // Test unauthenticated access
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Use empty storage state (no authentication)
    await page.context().clearCookies()

    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

    // Should redirect to signin with redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=/)
  })

  // Helper to test role access
  async function testRoleAccess(page: Page, role: Role, shouldAccess: boolean) {
    await loginAsRole(page, role)
    await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')

    if (shouldAccess) {
      // Should stay on tournaments page
      await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
      // Verify tournaments management content renders
      await expect(page.getByTestId('admin-tournaments-page-content')).toBeVisible()
    } else {
      // Should redirect to unauthorized
      await expect(page).toHaveURL('/unauthorized')
    }
  }

  // Test ADMIN role - should have access
  test('ADMIN role users should access tournaments management', async ({ page }) => {
    await testRoleAccess(page, 'ADMIN', true)
  })

  // Test MANAGER role - should have access
  test('MANAGER role users should access tournaments management', async ({ page }) => {
    await testRoleAccess(page, 'MANAGER', true)
  })

  // Test all other roles - should be blocked
  test('PUBLIC role users should be blocked from tournaments management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'PUBLIC', false)
  })

  test('REFEREE role users should be blocked from tournaments management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'REFEREE', false)
  })

  test('EDITOR role users should be blocked from tournaments management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'EDITOR', false)
  })

  test('BILLING role users should be blocked from tournaments management', async ({
    page,
  }) => {
    await testRoleAccess(page, 'BILLING', false)
  })
})
