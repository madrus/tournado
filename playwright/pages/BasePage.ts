import { Locator, Page } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  protected get userMenuButton(): Locator {
    return this.page.locator('button[aria-haspopup="menu"]').first()
  }

  protected get bottomNavigation(): Locator {
    return this.page.locator('[data-testid="bottom-navigation"]')
  }

  protected get teamsNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-teams"]')
  }

  protected get homeNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-home"]')
  }

  protected get moreNavButton(): Locator {
    return this.bottomNavigation.locator('[data-testid="nav-more"]')
  }
}
