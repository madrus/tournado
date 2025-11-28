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
import { AdminTournamentsPage } from '../pages/AdminTournamentsPage'

test.describe('Tournaments Management Authorization Tests', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
	})

	// Test unauthenticated access
	test('should redirect unauthenticated users to signin', async ({ page }) => {
		const tournamentsPage = new AdminTournamentsPage(page)
		await page.context().clearCookies()
		await tournamentsPage.navigate()
		await tournamentsPage.expectToBeRedirectedToSignin()
		await expect(page).toHaveURL(/redirectTo=/)
	})

	type TestRoleAccessProps = Readonly<{
		page: Page
		role: Role
		shouldAccess: boolean
	}>

	// Helper to test role access
	async function testRoleAccess(props: Readonly<TestRoleAccessProps>): Promise<void> {
		const { page, role, shouldAccess } = props
		await loginAsRole(page, role)
		const tournamentsPage = new AdminTournamentsPage(page)
		await tournamentsPage.navigate()

		if (shouldAccess) {
			await tournamentsPage.expectToBeOnAdminTournamentsPage()
			await tournamentsPage.expectContentVisible()
		} else {
			await tournamentsPage.expectRedirectToUnauthorized()
		}
	}

	// Test ADMIN role - should have access
	test('ADMIN role users should access tournaments management', async ({ page }) => {
		await testRoleAccess({ page, role: 'ADMIN', shouldAccess: true })
	})

	// Test MANAGER role - should have access
	test('MANAGER role users should access tournaments management', async ({ page }) => {
		await testRoleAccess({ page, role: 'MANAGER', shouldAccess: true })
	})

	// Test all other roles - should be blocked
	test('PUBLIC role users should be blocked from tournaments management', async ({
		page,
	}) => {
		await testRoleAccess({ page, role: 'PUBLIC', shouldAccess: false })
	})

	test('REFEREE role users should be blocked from tournaments management', async ({
		page,
	}) => {
		await testRoleAccess({ page, role: 'REFEREE', shouldAccess: false })
	})

	test('EDITOR role users should be blocked from tournaments management', async ({
		page,
	}) => {
		await testRoleAccess({ page, role: 'EDITOR', shouldAccess: false })
	})

	test('BILLING role users should be blocked from tournaments management', async ({
		page,
	}) => {
		await testRoleAccess({ page, role: 'BILLING', shouldAccess: false })
	})
})
