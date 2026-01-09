import { expect, type Locator, type Page } from '@playwright/test'

import { adminPath } from '../../app/utils/adminRoutes'

import { BasePage } from './BasePage'

export class AdminUsersPage extends BasePage {
	constructor(protected override page: Page) {
		super(page)
	}

	// Locators
	get layoutContainer(): Locator {
		return this.page.getByTestId('admin-users-page-content')
	}

	get pageTitle(): Locator {
		return this.page.getByRole('heading', { name: /^Gebruikers beheer$/i })
	}

	get usersTable(): Locator {
		return this.page.locator('table')
	}

	get pageHeading(): Locator {
		return this.page.getByRole('heading', {
			level: 1,
			name: /gebruikers beheer/i,
		})
	}

	get firstActionButton(): Locator {
		return this.page.getByRole('button').first()
	}

	get bodyContent(): Locator {
		return this.page.locator('body')
	}

	// User detail page locators
	get userDetailCard(): Locator {
		return this.page.getByTestId('user-detail-card')
	}

	get displayNameInput(): Locator {
		return this.page.getByTestId('input-displayName')
	}

	get roleCombobox(): Locator {
		return this.page.getByTestId('select-role')
	}

	get deactivateButton(): Locator {
		return this.page.getByRole('button', { name: /deactiveren/i })
	}

	get reactivateButton(): Locator {
		return this.page.getByRole('button', { name: /reactiveren/i })
	}

	get confirmButton(): Locator {
		return this.page.getByTestId('confirm-button')
	}

	get auditLogList(): Locator {
		return this.page.getByTestId('audit-log-list')
	}

	// Table row locators
	get tableRows(): Locator {
		return this.page.locator('table tbody tr')
	}

	getTableRow(index: number): Locator {
		return this.tableRows.nth(index)
	}

	getFirstUserRow(): Locator {
		return this.tableRows.first()
	}

	getRoleCell(row: Locator): Locator {
		return row.locator('td').nth(1)
	}

	// Navigation methods
	async goto(): Promise<void> {
		await this.page.goto(adminPath('/users'), {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await this.page.waitForTimeout(2000) // Wait for hydration/rendering
		await this.page.waitForFunction(() => document.body.children.length > 0)
	}

	async gotoUserDetail(userId: string): Promise<void> {
		await this.page.goto(adminPath(`/users/${userId}`), {
			waitUntil: 'networkidle',
			timeout: 30000,
		})
		await this.page.waitForTimeout(2000) // Wait for hydration/rendering
		await this.page.waitForFunction(() => document.body.children.length > 0)
	}

	// Interaction methods
	async clickUserRow(userEmail: string): Promise<void> {
		const row = this.page.getByText(userEmail).first()
		await row.click()
		await this.page.waitForLoadState('networkidle')
	}

	async updateDisplayName(newName: string): Promise<void> {
		await this.displayNameInput.clear()
		await this.displayNameInput.fill(newName)
		await this.displayNameInput.blur()
		await this.page.waitForLoadState('networkidle')
	}

	async changeUserRole(newRole: string): Promise<void> {
		await this.roleCombobox.selectOption(newRole)
		await this.page.waitForLoadState('networkidle')
	}

	async deactivateUser(): Promise<void> {
		await this.deactivateButton.click()
		await this.confirmButton.click()
		await this.page.waitForLoadState('networkidle')
	}

	async reactivateUser(): Promise<void> {
		await this.reactivateButton.click()
		await this.confirmButton.click()
		await this.page.waitForLoadState('networkidle')
	}

	// Table row interaction methods
	async clickFirstUserRow(): Promise<void> {
		const firstRow = this.getFirstUserRow()
		await expect(firstRow).toBeVisible()
		await firstRow.click()
		await this.page.waitForLoadState('networkidle')
	}

	async navigateToFirstUser(): Promise<void> {
		await this.clickFirstUserRow()
	}

	async getTableRowCount(): Promise<number> {
		return await this.tableRows.count()
	}

	async getRoleTextFromRow(row: Locator): Promise<string | null> {
		const roleCell = this.getRoleCell(row)
		return await roleCell.textContent()
	}

	async findNonAdminRow(): Promise<Locator | null> {
		const rowCount = await this.getTableRowCount()

		for (let i = 0; i < rowCount; i++) {
			const row = this.getTableRow(i)
			const roleText = await this.getRoleTextFromRow(row)

			if (!roleText?.includes('ADMIN')) {
				return row
			}
		}

		return null
	}

	async findAdminRow(): Promise<Locator | null> {
		const rowCount = await this.getTableRowCount()

		for (let i = 0; i < rowCount; i++) {
			const row = this.getTableRow(i)
			const roleText = await this.getRoleTextFromRow(row)

			if (roleText?.includes('ADMIN')) {
				return row
			}
		}

		return null
	}

	async navigateToRow(row: Locator): Promise<void> {
		await row.click()
		await this.page.waitForLoadState('networkidle')
	}

	async isDeactivateButtonVisible(): Promise<boolean> {
		return await this.deactivateButton.isVisible()
	}

	async isReactivateButtonVisible(): Promise<boolean> {
		return await this.reactivateButton.isVisible()
	}

	async isEitherDeactivateOrReactivateVisible(): Promise<boolean> {
		const deactivateVisible = await this.isDeactivateButtonVisible()
		const reactivateVisible = await this.isReactivateButtonVisible()
		return deactivateVisible || reactivateVisible
	}

	// Verification methods
	async expectToBeOnUsersPage(): Promise<void> {
		await expect(this.page).toHaveURL(adminPath('/users'))
		await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
		await expect(this.layoutContainer).toBeVisible()
	}

	async expectToBeOnUserDetailPage(userId: string): Promise<void> {
		await expect(this.page).toHaveURL(adminPath(`/users/${userId}`))
		await expect(this.userDetailCard).toBeVisible({ timeout: 15000 })
	}

	async expectUsersInterface(): Promise<void> {
		await expect(this.layoutContainer).toBeVisible({ timeout: 15000 })
		await expect(this.bodyContent).toContainText(/gebruiker/i)
	}

	async expectUserInList(userEmail: string): Promise<void> {
		await expect(this.page.getByText(userEmail)).toBeVisible()
	}

	async expectDisplayNameUpdated(displayName: string): Promise<void> {
		await expect(this.displayNameInput).toHaveValue(displayName)
	}

	async expectRoleUpdated(role: string): Promise<void> {
		await expect(this.roleCombobox).toHaveValue(role)
	}

	async expectUserDeactivated(): Promise<void> {
		await expect(this.reactivateButton).toBeVisible()
		await expect(this.deactivateButton).not.toBeVisible()
	}

	async expectUserActivated(): Promise<void> {
		await expect(this.deactivateButton).toBeVisible()
		await expect(this.reactivateButton).not.toBeVisible()
	}

	async expectAuditLogVisible(): Promise<void> {
		await expect(this.auditLogList).toBeVisible()
	}

	async expectPageLoaded(): Promise<void> {
		await expect(this.layoutContainer).toBeVisible()
	}
}
