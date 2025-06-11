import { expect, Locator, Page } from '@playwright/test'

import { BasePage } from './BasePage'

export class HomePage extends BasePage {
  private baseUrl: string

  constructor(protected override page: Page) {
    super(page)
    this.baseUrl = 'http://localhost:5173'
  }

  // Locators
  get heroTitle(): Locator {
    return this.page.locator('h1').filter({ hasText: /tournado/i })
  }

  get heroDescription(): Locator {
    return this.page.locator('p').filter({ hasText: /manage your sports tournaments/i })
  }

  get viewTeamsButton(): Locator {
    return this.page.getByRole('link', { name: /view teams/i })
  }

  get featuresSection(): Locator {
    return this.page.locator('.bg-white').filter({ hasText: /features/i })
  }

  get featuresTitle(): Locator {
    return this.page.locator('h2').filter({ hasText: /features/i })
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })
    await this.page.waitForLoadState('domcontentloaded')
  }

  async clickViewTeams(): Promise<void> {
    await this.viewTeamsButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async navigateToTeamsViaBottomNav(): Promise<void> {
    await this.teamsNavButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async navigateToAboutViaBottomNav(): Promise<void> {
    await this.moreNavButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  // Verification methods
  async expectToBeOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL('/')
    await expect(this.heroTitle).toBeVisible()
    await expect(this.viewTeamsButton).toBeVisible()
  }

  async expectBottomNavigationVisible(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible({ timeout: 10000 })
    await expect(this.homeNavButton).toBeVisible()
    await expect(this.teamsNavButton).toBeVisible()
    await expect(this.moreNavButton).toBeVisible()
  }

  async expectBottomNavigationHidden(): Promise<void> {
    await expect(this.bottomNavigation).not.toBeVisible()
  }

  async expectHeroSectionVisible(): Promise<void> {
    await expect(this.heroTitle).toBeVisible()
    await expect(this.heroDescription).toBeVisible()
    await expect(this.viewTeamsButton).toBeVisible()
  }

  async expectFeaturesSectionVisible(): Promise<void> {
    await expect(this.featuresSection).toBeVisible()
    await expect(this.featuresTitle).toBeVisible()
  }
}
