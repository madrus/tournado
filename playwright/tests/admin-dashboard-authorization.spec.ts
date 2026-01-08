/**
 * Admin Dashboard Authorization E2E Tests
 *
 * Test Scenarios:
 * - Unauthenticated user redirect to signin
 * - ADMIN role access to dashboard
 * - MANAGER role access to dashboard
 * - REFEREE role access to dashboard
 * - EDITOR role access to dashboard
 * - BILLING role access to dashboard
 * - PUBLIC role blocked from dashboard
 *
 * Authentication: Tests multiple roles via loginAsRole helper
 * Viewport: Mobile (375x812)
 * Note: Uses helper to dynamically test all role-based access
 */
import { expect, type Page, test } from '@playwright/test'
import type { Role } from '@prisma/client'

import { adminPath } from '../../app/utils/adminRoutes'
import { loginAsRole } from '../helpers/session'

test.describe('Admin Dashboard Authorization Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
	})

	// Test unauthenticated access
	test('should redirect unauthenticated users to signin', async ({ page }) => {
		// Use empty storage state (no authentication)
		await page.context().clearCookies()

		await page.goto(adminPath())

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
		await page.goto(adminPath())

		if (shouldAccess) {
			// Should stay on admin dashboard
			await expect(page).toHaveURL(adminPath())
			// Verify admin dashboard content renders
			await expect(page.getByTestId('admin-dashboard-container')).toBeVisible()
		} else {
			// Should redirect to unauthorized
			await expect(page).toHaveURL('/unauthorized')
		}
	}

	// Test roles with access - ADMIN, MANAGER, REFEREE, EDITOR, BILLING
	test('ADMIN role users should access admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'ADMIN', true)
	})

	test('MANAGER role users should access admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'MANAGER', true)
	})

	test('REFEREE role users should access admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'REFEREE', true)
	})

	test('EDITOR role users should access admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'EDITOR', true)
	})

	test('BILLING role users should access admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'BILLING', true)
	})

	// Test roles without access - PUBLIC only
	test('PUBLIC role users should be blocked from admin dashboard', async ({ page }) => {
		await testRoleAccess(page, 'PUBLIC', false)
	})
})
