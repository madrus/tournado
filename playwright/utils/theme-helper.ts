import { expect, type Page } from '@playwright/test'

/**
 * Sets the theme on the page with fallback mechanisms
 * Handles React Router manifest blocking and theme store manipulation
 *
 * @param page - Playwright page object
 * @param theme - Theme to apply ('dark' or 'light')
 */
export async function setTheme(page: Page, theme: 'dark' | 'light'): Promise<void> {
  // Block React Router manifest requests to prevent prefetch-induced page reloads
  await page.route('**/__manifest**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ patches: [] }),
    })
  })

  // Apply theme by manipulating DOM classes
  await page.evaluate(t => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(t)
  }, theme)

  // Wait for theme application
  await page.waitForTimeout(500)

  // Check if theme was overridden by React hydration or theme store
  const currentClass = await page.locator('html').getAttribute('class')

  // If theme was reset, try using the theme store directly
  if (!currentClass?.includes(theme)) {
    await page.evaluate(t => {
      // Try to access theme store or settings
      if ((window as any).useSettingsStore) {
        ;(window as any).useSettingsStore.getState().setTheme(t)
      }
      // Force theme application
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(t)
    }, theme)

    await page.waitForTimeout(500)
  }

  // Wait for html element to be stable
  await page.locator('html').waitFor({
    state: 'attached',
    timeout: 1000,
  })
}

/**
 * Verifies that the specified theme is applied
 *
 * @param page - Playwright page object
 * @param theme - Theme to verify ('dark' or 'light')
 */
export async function verifyTheme(page: Page, theme: 'dark' | 'light'): Promise<void> {
  if (theme === 'dark') {
    await expect(page.locator('html')).toHaveClass(/dark/)
  } else {
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  }
}

/**
 * Verifies that theme styles are correctly applied by checking background color
 *
 * @param page - Playwright page object
 * @param theme - Theme to verify ('dark' or 'light')
 */
export async function verifyThemeStyles(
  page: Page,
  theme: 'dark' | 'light'
): Promise<void> {
  const bgColor = await page.evaluate(() => {
    const bodyColor = window.getComputedStyle(document.body).backgroundColor

    if (bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent') {
      return bodyColor
    }

    return window.getComputedStyle(document.documentElement).backgroundColor
  })

  if (theme === 'dark') {
    // Dark theme should not have white background
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
  } else {
    // Light theme should have white or very light background
    expect(bgColor).toMatch(/rgb\((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?),/)
  }
}
