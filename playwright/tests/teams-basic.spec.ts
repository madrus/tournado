/**
 * Public Teams Basic UI E2E Tests
 *
 * Test Scenarios:
 * - Public teams page access and display
 * - Viewing teams list without authentication
 * - Public team registration access
 * - Team registration form visibility
 *
 * Authentication: PUBLIC ACCESS - No authentication required
 * Viewport: Mobile (375x812)
 */
import { expect, test } from '@playwright/test'
import { TeamsPage } from '../pages/TeamsPage'

// Public Teams Basic UI Tests - NO AUTHENTICATION REQUIRED
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Public Teams - Basic UI', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
	})

	test('should display teams page publicly', async ({ page }) => {
		const teamsPage = new TeamsPage(page)
		await teamsPage.goto()
		await teamsPage.expectToBeOnTeamsPage()
		await expect(teamsPage.addTeamButton).toBeVisible()
	})

	test('should display existing teams publicly', async ({ page }) => {
		const teamsPage = new TeamsPage(page)
		await teamsPage.goto()
		await expect(teamsPage.teamsContainer).toBeVisible()
	})

	test('should allow public team registration', async ({ page }) => {
		const teamsPage = new TeamsPage(page)
		await teamsPage.goto()
		await teamsPage.gotoNewTeam()
		await teamsPage.expectToBeOnNewTeamPage()

		await expect(teamsPage.registrationForm).toBeVisible()
		await expect(teamsPage.clubNameField).toBeVisible()
		await expect(teamsPage.teamNameField).toBeVisible()
	})
})
