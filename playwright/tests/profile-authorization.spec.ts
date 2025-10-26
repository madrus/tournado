import { expect, test } from '@playwright/test'
import type { Role } from '@prisma/client'

test.describe('Profile Authorization Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  // Test unauthenticated access
  test('should redirect unauthenticated users to signin', async ({ page }) => {
    // Use empty storage state (no authentication)
    await page.context().clearCookies()

    await page.goto('/profile')

    // Should redirect to signin with redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=%2Fprofile/)
  })

  // Helper to test role access
  async function testRoleAccess(page: any, role: Role, shouldAccess: boolean) {
    const { createTestSession } = await import('../helpers/test-auth')
    const { cookie } = await createTestSession(role)

    const cookieMatch = cookie.match(/__session=([^;]+)/)
    if (!cookieMatch) throw new Error(`Failed to parse session cookie`)

    await page.context().addCookies([
      {
        name: '__session',
        value: cookieMatch[1],
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ])

    await page.goto('/profile')

    if (shouldAccess) {
      // Should stay on profile page
      await expect(page).toHaveURL('/profile')
      // Verify profile content renders
      await expect(page.getByText('Account Settings')).toBeVisible()
    } else {
      // Should redirect to unauthorized
      await expect(page).toHaveURL('/unauthorized')
    }
  }

  // Test all roles - all should have access to their profile
  test('PUBLIC role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'PUBLIC', true)
  })

  test('REFEREE role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'REFEREE', true)
  })

  test('EDITOR role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'EDITOR', true)
  })

  test('BILLING role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'BILLING', true)
  })

  test('MANAGER role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'MANAGER', true)
  })

  test('ADMIN role users should access profile page', async ({ page }) => {
    await testRoleAccess(page, 'ADMIN', true)
  })
})
