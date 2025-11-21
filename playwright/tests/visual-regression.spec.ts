/**
 * UI Structure and Theme E2E Tests
 *
 * Test Scenarios:
 * - Tournaments list page structure and content
 * - Teams list page structure and content
 * - Dark mode theme application and styling
 * - Light mode theme verification
 * - Tournament form structure and field validation
 * - Team form structure
 * - Date picker enablement after basic info is filled
 * - ActionLinkPanel components on homepage
 * - Navigation links functionality
 * - Responsive design (mobile 375x812 vs desktop 1280x720)
 *
 * Authentication: Uses global auth from auth.json
 * Viewport: Desktop (1280x720) by default, mobile for responsive tests
 * Note: Uses structural/functional tests instead of pixel-perfect screenshots
 */
import { expect, test } from '@playwright/test'

import { HomePage } from '../pages/HomePage'
import { TeamFormPage } from '../pages/TeamFormPage'
import { TeamsListPage } from '../pages/TeamsListPage'
import { TournamentFormPage } from '../pages/TournamentFormPage'
import { TournamentsListPage } from '../pages/TournamentsListPage'
import { setTheme, verifyTheme, verifyThemeStyles } from '../utils/theme-helper'

// Structural and Functional Tests - More reliable than pixel-perfect screenshots
test.describe('UI Structure and Theme Tests', () => {
	test.beforeEach(async ({ page }) => {
		// Set desktop viewport for consistent testing
		await page.setViewportSize({ width: 1280, height: 720 })
	})

	test.describe('Tournaments List Page Structure', () => {
		test('should have correct structure and elements', async ({ page }) => {
			const tournamentsPage = new TournamentsListPage(page)
			await tournamentsPage.goto()
			await tournamentsPage.waitForPageLoad()

			await expect(tournamentsPage.heading).toBeVisible()
			await expect(tournamentsPage.addButton).toBeVisible()
			await expect(tournamentsPage.container).toBeVisible()
		})

		test('should display tournaments content', async ({ page }) => {
			const tournamentsPage = new TournamentsListPage(page)
			await tournamentsPage.goto()
			await page.waitForLoadState('networkidle')

			// Should see tournaments-related content
			const bodyText = await page.locator('body').textContent()
			expect(bodyText).toMatch(/tournament|toernooi/i)

			// Page should not be empty
			expect(bodyText?.length).toBeGreaterThan(100)
		})
	})

	test.describe('Teams List Page Structure', () => {
		test('should have correct structure and elements', async ({ page }) => {
			const teamsPage = new TeamsListPage(page)
			await teamsPage.goto()
			await teamsPage.waitForPageLoad()

			await expect(teamsPage.heading).toBeVisible()
			await expect(teamsPage.container).toBeVisible()
		})

		test('should display teams content', async ({ page }) => {
			const teamsPage = new TeamsListPage(page)
			await teamsPage.goto()
			await page.waitForLoadState('networkidle')

			// Should see teams-related content
			const bodyText = await page.locator('body').textContent()
			expect(bodyText).toMatch(/team/i)

			// Page should not be empty
			expect(bodyText?.length).toBeGreaterThan(50)
		})
	})

	test.describe('Dark Mode Theme Functionality', () => {
		test('should apply dark theme correctly on tournaments page', async ({ page }) => {
			await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
			await page.waitForLoadState('networkidle')

			await setTheme(page, 'dark')
			await verifyTheme(page, 'dark')
			await verifyThemeStyles(page, 'dark')
		})

		test('should apply light theme correctly on teams page', async ({ page }) => {
			await page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
			await page.waitForLoadState('networkidle')

			await setTheme(page, 'light')
			await verifyTheme(page, 'light')
			await verifyThemeStyles(page, 'light')
		})
	})

	test.describe('Form Structure and Panel Progression', () => {
		test('should have correct tournament form structure', async ({ page }) => {
			const tournamentFormPage = new TournamentFormPage(page)
			await tournamentFormPage.goto()
			await tournamentFormPage.waitForPageLoad()

			await expect(tournamentFormPage.form).toBeVisible()
			await expect(tournamentFormPage.nameInput).toBeVisible()
			await expect(tournamentFormPage.locationInput).toBeVisible()
			await expect(tournamentFormPage.startDateButton).toBeVisible()
		})

		test('should enable date picker after filling basic info', async ({ page }) => {
			const tournamentFormPage = new TournamentFormPage(page)
			await tournamentFormPage.goto()
			await tournamentFormPage.waitForPageLoad()

			await tournamentFormPage.nameInput.fill('Test Tournament')
			await tournamentFormPage.locationInput.fill('Test Location')

			await page.waitForTimeout(1000)

			await expect(tournamentFormPage.startDateButton).toBeEnabled()

			await tournamentFormPage.startDateButton.click()
			await expect(tournamentFormPage.calendar).toBeVisible({
				timeout: 5000,
			})
		})

		test('should have correct team form structure', async ({ page }) => {
			const teamFormPage = new TeamFormPage(page)
			await teamFormPage.goto()
			await teamFormPage.waitForPageLoad()

			await expect(teamFormPage.form).toBeVisible()
			await expect(teamFormPage.clubNameInput).toBeVisible()
			await expect(teamFormPage.nameInput).toBeVisible()
		})
	})

	test.describe('ActionLinkPanel Components', () => {
		test('should display ActionLinkPanel components on homepage', async ({ page }) => {
			const homePage = new HomePage(page)
			await homePage.goto()
			await homePage.waitForPageLoad()

			await expect(homePage.viewTeamsLink).toBeVisible()
			await expect(homePage.actionLinks.first()).toBeVisible()
		})

		test('should have working navigation links', async ({ page }) => {
			const homePage = new HomePage(page)
			await homePage.goto()
			await homePage.waitForPageLoad()

			await homePage.viewTeamsLink.click()
			await expect(page).toHaveURL(/\/teams/)
		})
	})

	test.describe('Responsive Design Structure', () => {
		test('should handle mobile viewport correctly', async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 812 })
			const tournamentsPage = new TournamentsListPage(page)
			await tournamentsPage.goto()
			await tournamentsPage.waitForPageLoad()

			await expect(tournamentsPage.heading).toBeVisible()
			await expect(tournamentsPage.container).toBeVisible()
		})

		test('should handle desktop viewport correctly', async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 720 })
			const teamsPage = new TeamsListPage(page)
			await teamsPage.goto()
			await teamsPage.waitForPageLoad()

			await expect(teamsPage.heading).toBeVisible()
			await expect(teamsPage.container).toBeVisible()
		})
	})
})
