import { type Locator, type Page, expect } from '@playwright/test'
import { adminPath } from '../../app/utils/adminRoutes'

export class AdminTournamentsPage {
  readonly page: Page
  readonly body: Locator
  readonly addButton: Locator
  readonly menuButton: Locator
  readonly menuDropdown: Locator
  readonly tournamentsLink: Locator
  readonly manageTournamentsPanel: Locator
  readonly form: Locator
  readonly nameInput: Locator
  readonly locationInput: Locator
  readonly startDateButton: Locator
  readonly endDateButton: Locator
  readonly divisionsHeading: Locator
  readonly categoriesHeading: Locator
  readonly saveButton: Locator
  readonly tournamentsContainer: Locator
  readonly calendar: Locator
  readonly firstDivisionLabel: Locator
  readonly secondDivisionLabel: Locator
  readonly jo8Label: Locator
  readonly jo10Label: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.body = page.locator('body')
    this.addButton = page.getByRole('link', { name: 'Toevoegen' })
    this.menuButton = page.getByRole('button', {
      name: /menu openen\/sluiten/i,
    })
    this.menuDropdown = page.getByTestId('user-menu-dropdown')
    this.tournamentsLink = page.locator('a').filter({ hasText: /toernooien/i })
    this.manageTournamentsPanel = page.getByRole('link', {
      name: 'Toernooien beheer',
    })
    this.form = page.locator('form')
    this.nameInput = page.getByRole('textbox', { name: /naam/i })
    this.locationInput = page.getByRole('textbox', { name: /locatie/i })
    this.startDateButton = page.getByRole('button', {
      name: /startdatum.*select date/i,
    })
    this.endDateButton = page.getByRole('button', {
      name: /einddatum.*select date/i,
    })
    this.divisionsHeading = page.getByRole('heading', { name: /divisies/i })
    this.categoriesHeading = page.getByRole('heading', {
      name: /categorieën/i,
    })
    this.saveButton = page.getByRole('button', { name: 'Opslaan' })
    this.tournamentsContainer = page.getByTestId('admin-tournaments-layout-container')
    this.calendar = page.getByRole('dialog', { name: 'calendar' })
    this.firstDivisionLabel = page
      .locator('label')
      .filter({ hasText: /eerste klasse/i })
    this.secondDivisionLabel = page
      .locator('label')
      .filter({ hasText: /tweede klasse/i })
    this.jo8Label = page.locator('label').filter({ hasText: /JO8/i })
    this.jo10Label = page.locator('label').filter({ hasText: /JO10/i })
    this.errorMessage = page.locator('[role="alert"], .error, .toast-error').first()
  }

  async navigate(): Promise<void> {
    await this.page.goto(adminPath('/tournaments'))
  }

  async navigateToNew(): Promise<void> {
    await this.page.goto(adminPath('/tournaments/new'))
  }

  async navigateToAdminHome(): Promise<void> {
    await this.page.goto(adminPath())
  }

  async expectPageToContainTournamentText(): Promise<void> {
    await expect(this.body).toContainText(/toernooi/i, { timeout: 15000 })
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click()
  }

  async expectToBeOnNewTournamentPage(): Promise<void> {
    await expect(this.page).toHaveURL(adminPath('/tournaments/new'))
  }

  async expectFormIsVisible(): Promise<void> {
    await expect(this.form).toBeVisible({ timeout: 15000 })
  }
}
