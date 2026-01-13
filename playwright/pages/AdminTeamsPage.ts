import { type Locator, type Page, expect } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'
import { waitForTournamentInDatabase } from '../helpers/database'
import { BasePage } from './BasePage'

export class AdminTeamsPage extends BasePage {
	constructor(protected override page: Page) {
		super(page)
	}

	// Locators
	get layoutContainer(): Locator {
		return this.page.getByTestId('admin-teams-page-content')
	}

	get createTeamContainer(): Locator {
		return this.page.getByTestId('admin-new-team-container')
	}

	get pageTitle(): Locator {
		return this.page.getByRole('heading', { name: /^Teams beheer$/i })
	}

	get createTeamButton(): Locator {
		return this.page.getByRole('link', { name: /toevoegen/i })
	}

	get teamsTable(): Locator {
		return this.page.locator('table')
	}

	get bodyContent(): Locator {
		return this.page.locator('body')
	}

	// Form field locators
	get tournamentCombo(): Locator {
		return this.page.getByRole('combobox', {
			name: /toernooi.*select option/i,
		})
	}

	get divisionCombo(): Locator {
		return this.page.getByRole('combobox', {
			name: /teamklasse.*select option/i,
		})
	}

	get categoryCombo(): Locator {
		return this.page.getByRole('combobox', {
			name: /categorie.*select option/i,
		})
	}

	get clubNameInput(): Locator {
		return this.page.getByRole('textbox', { name: /clubnaam/i })
	}

	get teamNameInput(): Locator {
		return this.page.getByRole('textbox', { name: /teamnaam/i })
	}

	get leaderNameInput(): Locator {
		return this.page.getByRole('textbox', { name: /naam teamleider/i })
	}

	get leaderEmailInput(): Locator {
		return this.page.getByRole('textbox', { name: /e-mail teamleider/i })
	}

	get leaderPhoneInput(): Locator {
		return this.page.getByRole('textbox', { name: /telefoon teamleider/i })
	}

	get privacyCheckbox(): Locator {
		return this.page.getByRole('checkbox', { name: /privacybeleid/i })
	}

	get saveButton(): Locator {
		return this.page.getByRole('button', { name: 'Opslaan' })
	}

	// Navigation methods
	async goto(): Promise<void> {
		await this.page.goto(adminPath('/teams'), {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await this.layoutContainer.waitFor({ state: 'visible', timeout: 10000 })
	}

	async gotoCreateTeam(): Promise<void> {
		await this.page.goto(adminPath('/teams/new'), {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await this.createTeamContainer.waitFor({ state: 'visible', timeout: 10000 })
	}

	async clickCreateTeam(): Promise<void> {
		await this.createTeamButton.click()
		await this.page.waitForLoadState('networkidle')
	}

	// Tournament selection helper - ensures database consistency before UI interaction
	async selectTournamentWithRetry(
		tournamentName: string,
		maxRetries = 5, // Increased for CI
	): Promise<void> {
		// Extract just the tournament name part (before " - ") for database search
		const nameForDbSearch = tournamentName.split(' - ')[0]
		await waitForTournamentInDatabase(nameForDbSearch, 20, 1000) // More CI-friendly params

		// Step 2: Now that we know the tournament exists in DB, try to select it in UI
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				// Force a navigation to refresh the root loader and get fresh tournament data
				await this.page.goto(this.page.url(), { waitUntil: 'networkidle' })
				await this.page.waitForTimeout(1000) // Longer wait for CI

				const combo = this.page.getByRole('combobox', {
					name: /toernooi.*select option/i,
				})
				await combo.click()

				const option = this.page.getByRole('option', {
					// Playwright string name matching is substring & case-insensitive by default.
					name: tournamentName,
				})
				await expect(option).toBeVisible({ timeout: 5000 }) // Increased timeout

				await option.click()
				return // Success!
			} catch (_error) {
				if (attempt === maxRetries) {
					throw new Error(
						`Tournament "${tournamentName}" exists in database but not found in UI after ${maxRetries} attempts. This indicates a data loading issue between database and UI.`,
					)
				}
				await this.page.waitForTimeout(1000) // Longer retry delay for CI
			}
		}
	}

	// Verification methods
	async expectToBeOnAdminTeamsPage(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/teams'))
		await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
		await expect(this.layoutContainer).toBeVisible()
	}

	async expectToBeOnCreateTeamPage(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/teams/new'))
		await expect(this.createTeamContainer).toBeVisible()
	}

	async expectAdminTeamsInterface(): Promise<void> {
		await expect(this.layoutContainer).toBeVisible({ timeout: 15000 })
		await expect(this.bodyContent).toContainText(/team/i)
	}

	async expectPageLoaded(): Promise<void> {
		await expect(this.layoutContainer).toBeVisible()
	}

	async expectToBeOnTeamFormPage(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/teams/new'))
		await expect(this.page.locator('form')).toBeVisible()
	}

	async expectTeamCreationFormVisible(): Promise<void> {
		await expect(this.page.locator('form')).toBeVisible({ timeout: 15000 })
		await expect(this.clubNameInput).toBeVisible({ timeout: 15000 })
	}

	// Form interaction methods
	async selectDivision(divisionName: string): Promise<void> {
		await expect(this.divisionCombo).toBeVisible()
		await this.divisionCombo.click()

		const divisionDropdown = this.page.locator('[data-radix-select-content]').last()
		await expect(divisionDropdown).toBeVisible({ timeout: 3000 })

		const divisionOption = divisionDropdown.getByRole('option', {
			name: new RegExp(divisionName, 'i'),
		})
		await expect(divisionOption).toBeVisible({ timeout: 3000 })
		await divisionOption.click()
	}

	async selectCategory(categoryName: string): Promise<void> {
		await expect(this.categoryCombo).toBeVisible()
		await this.categoryCombo.click()

		const categoryDropdown = this.page.locator('[data-radix-select-content]').last()
		await expect(categoryDropdown).toBeVisible({ timeout: 3000 })

		const categoryOption = categoryDropdown.getByRole('option', {
			name: new RegExp(categoryName, 'i'),
		})
		await expect(categoryOption).toBeVisible({ timeout: 3000 })
		await categoryOption.click()
	}

	async fillTeamInformation(data: {
		clubName: string
		teamName: string
		leaderName: string
		leaderEmail: string
		leaderPhone: string
	}): Promise<void> {
		await this.clubNameInput.fill(data.clubName)
		await this.teamNameInput.fill(data.teamName)
		await this.leaderNameInput.fill(data.leaderName)
		await this.leaderEmailInput.fill(data.leaderEmail)
		await this.leaderPhoneInput.fill(data.leaderPhone)
	}

	async acceptPrivacyPolicy(): Promise<void> {
		await expect(this.privacyCheckbox).toBeVisible()
		await this.privacyCheckbox.check()
		await expect(this.privacyCheckbox).toBeChecked()
	}

	async submitTeamForm(): Promise<string | undefined> {
		await Promise.all([
			this.page.waitForURL(/\/teams\/[^/]+$/, { timeout: 15000 }),
			this.saveButton.click(),
		])
		const urlMatch = this.page.url().match(/\/teams\/([^/]+)$/)
		expect(urlMatch).not.toBeNull()
		return urlMatch?.[1]
	}
}
