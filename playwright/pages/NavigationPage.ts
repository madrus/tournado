import { expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Navigation functionality
 * Provides methods for interacting with bottom navigation and homepage navigation
 */
export class NavigationPage extends BasePage {
  /**
   * Navigate to home page using bottom navigation
   */
  async navigateHome(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible({ timeout: 10000 })
    await this.homeNavButton.click()
    await expect(this.page).toHaveURL('/')
  }

  /**
   * Navigate to teams page using bottom navigation
   */
  async navigateTeams(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible({ timeout: 10000 })
    await this.teamsNavButton.click()
    await expect(this.page).toHaveURL('/teams')
  }

  /**
   * Navigate to more/about page using bottom navigation
   */
  async navigateMore(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible({ timeout: 10000 })
    await this.moreNavButton.click()
    await expect(this.page).toHaveURL('/about')
  }

  /**
   * Check if bottom navigation is visible
   */
  async expectBottomNavigationVisible(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible({ timeout: 10000 })
  }

  /**
   * Check if bottom navigation is hidden (desktop view)
   */
  async expectBottomNavigationHidden(): Promise<void> {
    await expect(this.bottomNavigation).not.toBeVisible()
  }

  /**
   * Verify all navigation items are present
   */
  async expectAllNavigationItemsPresent(): Promise<void> {
    await expect(this.bottomNavigation).toBeVisible()
    await expect(this.homeNavButton).toBeVisible()
    await expect(this.teamsNavButton).toBeVisible()
    await expect(this.moreNavButton).toBeVisible()
  }
}
