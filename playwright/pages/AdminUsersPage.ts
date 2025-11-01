import { expect, Locator, Page } from '@playwright/test'

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

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/a7k9m2x5p8w1n4q6r3y8b5t1/users', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })
    await this.page.waitForTimeout(2000) // Wait for hydration/rendering
    await this.page.waitForFunction(() => document.body.children.length > 0)
  }

  async gotoUserDetail(userId: string): Promise<void> {
    await this.page.goto(`/a7k9m2x5p8w1n4q6r3y8b5t1/users/${userId}`, {
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

  // Verification methods
  async expectToBeOnUsersPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/a7k9m2x5p8w1n4q6r3y8b5t1\/users$/)
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
    await expect(this.layoutContainer).toBeVisible()
  }

  async expectToBeOnUserDetailPage(userId: string): Promise<void> {
    await expect(this.page).toHaveURL(`/a7k9m2x5p8w1n4q6r3y8b5t1/users/${userId}`)
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
