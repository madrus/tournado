/**
 * Admin Authorization E2E Tests
 *
 * Test Scenarios:
 * - Admin panel access for ADMIN users
 * - Admin teams page access and management interface
 * - Admin team creation form access
 * - Admin menu options in user dropdown
 * - Admin-specific navigation and content visibility
 *
 * Authentication: Uses global auth from auth.json (ADMIN role)
 * Viewport: Mobile (375x812)
 */
import { test } from '@playwright/test'

import { AdminPanelPage } from '../pages/AdminPanelPage'
import { AdminTeamsPage } from '../pages/AdminTeamsPage'

// Admin Authorization Tests - run under admin-authenticated project
test.describe('Admin Authorization', () => {
	test.beforeEach(async ({ page }) => {
		// Set mobile viewport for consistency
		await page.setViewportSize({ width: 375, height: 812 })
	})

	test.describe('Admin User - Full Access', () => {
		test('should have access to admin panel', async ({ page }) => {
			// Admin users should be able to access the admin panel
			const adminPanel = new AdminPanelPage(page)
			await adminPanel.goto()
			await adminPanel.expectToBeOnAdminPanel()
			await adminPanel.expectHeaderVisible()
		})

		test('should be able to access admin teams page', async ({ page }) => {
			// Navigate to admin teams page
			const adminTeams = new AdminTeamsPage(page)
			await adminTeams.goto()
			await adminTeams.expectToBeOnAdminTeamsPage()
		})

		test('should be able to access admin team creation', async ({ page }) => {
			const adminTeams = new AdminTeamsPage(page)
			await adminTeams.gotoCreateTeam()
			await adminTeams.expectToBeOnCreateTeamPage()
			await adminTeams.expectTeamCreationFormVisible()
		})

		test('should have admin menu options in user dropdown', async ({ page }) => {
			// Navigate to admin panel
			const adminPanel = new AdminPanelPage(page)
			await adminPanel.goto()
			await adminPanel.expectToBeOnAdminPanel()
			await adminPanel.openUserMenu()
			await adminPanel.expectUserMenuVisible()
			await adminPanel.expectUserMenuTournamentsVisible()
			await adminPanel.expectSignOutVisible()
		})
	})
})
