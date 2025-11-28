/**
 * Profile User Journey E2E Tests
 *
 * Test Scenarios:
 * - PUBLIC user accessing profile from menu navigation
 * - PUBLIC user direct URL navigation to profile
 * - Profile content visibility for authenticated users
 * - Unauthenticated user redirect to signin with redirectTo parameter
 *
 * Authentication: Tests PUBLIC role via loginAsRole helper
 * Viewport: Mobile (375x812) - inherited from page object defaults
 * Note: Tests complete user journey for profile access
 */
import { test } from '@playwright/test'

import { loginAsRole } from '../helpers/session'
import { HomePage } from '../pages/HomePage'
import { ProfilePage } from '../pages/ProfilePage'

test.describe('Profile - User Journey (PUBLIC Role)', () => {
	test('PUBLIC user can access profile from menu', async ({ page }) => {
		const homePage = new HomePage(page)
		const profilePage = new ProfilePage(page)

		await loginAsRole(page, 'PUBLIC')

		// Start at home page
		await homePage.goto()
		await page.waitForLoadState('networkidle')

		// Navigate to profile via menu
		await profilePage.navigateViaMenu()

		// Verify we're on profile page
		await profilePage.expectToBeOnProfilePage()
	})

	test('PUBLIC user can navigate directly to profile URL', async ({ page }) => {
		const profilePage = new ProfilePage(page)

		await loginAsRole(page, 'PUBLIC')

		// Navigate directly to profile
		await profilePage.goto()

		// Verify we're on profile page and content is visible
		await profilePage.expectToBeOnProfilePage()
		await profilePage.expectProfileContentVisible()
	})

	test('Unauthenticated user redirected to signin when accessing profile', async ({
		page,
	}) => {
		const profilePage = new ProfilePage(page)

		// Clear any existing cookies
		await page.context().clearCookies()

		// Try to access profile without authentication
		await profilePage.goto()

		// Should be redirected to signin with redirectTo parameter
		await profilePage.expectToBeRedirectedToSignin()
	})
})
