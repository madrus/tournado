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

  // Wait for theme class to be applied
  await page.waitForFunction(
    t => document.documentElement.classList.contains(t),
    theme,
    { timeout: 1000 }
  )

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

    await page.waitForFunction(
      t => document.documentElement.classList.contains(t),
      theme,
      { timeout: 1000 }
    )
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
  const { backgroundColor, htmlClass } = await page.evaluate(() => {
    const bodyColor = window.getComputedStyle(document.body).backgroundColor
    const htmlColor = window.getComputedStyle(document.documentElement).backgroundColor

    return {
      backgroundColor:
        bodyColor && bodyColor !== 'rgba(0, 0, 0, 0)' && bodyColor !== 'transparent'
          ? bodyColor
          : htmlColor,
      htmlClass: document.documentElement.className ?? '',
    }
  })

  const hasDarkClass = /\bdark\b/.test(htmlClass)

  if (theme === 'dark') {
    // Dark theme should not have white background
    expect(hasDarkClass).toBeTruthy()
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)')
  } else {
    // Light theme should have a bright background
    expect(hasDarkClass).toBeFalsy()
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      const match = backgroundColor.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/)
      expect(match).not.toBeNull()
      const [, r, g, b] = match!
      const channels = [Number(r), Number(g), Number(b)]
      channels.forEach(channel => {
        expect(Number.isNaN(channel)).toBeFalsy()
        expect(channel).toBeGreaterThanOrEqual(220)
      })
    }
  }
}
