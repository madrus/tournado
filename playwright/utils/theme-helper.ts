import { type Page, expect } from '@playwright/test'

type WindowWithThemeStore = typeof window & {
  useSettingsStore?: {
    getState: () => {
      setTheme: (theme: string) => void
    }
  }
}

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
    {
      timeout: 1000,
    },
  )

  // Check if theme was overridden by React hydration or theme store
  const currentClass = await page.locator('html').getAttribute('class')

  // If theme was reset, try using the theme store directly
  if (!currentClass?.includes(theme)) {
    await page.evaluate(t => {
      // Try to access theme store or settings
      const w = window as WindowWithThemeStore
      if (w.useSettingsStore) {
        w.useSettingsStore.getState().setTheme(t)
      }
      // Force theme application
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(t)
    }, theme)

    await page.waitForFunction(
      t => document.documentElement.classList.contains(t),
      theme,
      {
        timeout: 1000,
      },
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
  theme: 'dark' | 'light',
): Promise<void> {
  // Wait for the gradient container to be present
  await page.waitForSelector('[data-testid="app-layout-gradient"]', {
    timeout: 5000,
  })

  const { background, backgroundImage, htmlClass } = await page.evaluate(() => {
    const gradientContainer = document.querySelector(
      '[data-testid="app-layout-gradient"]',
    )
    if (!gradientContainer) {
      return {
        background: '',
        backgroundImage: '',
        htmlClass: document.documentElement.className ?? '',
      }
    }

    const styles = window.getComputedStyle(gradientContainer)
    return {
      background: styles.background,
      backgroundImage: styles.backgroundImage,
      htmlClass: document.documentElement.className ?? '',
    }
  })

  const hasDarkClass = /\bdark\b/.test(htmlClass)
  const gradientValue = backgroundImage || background

  if (theme === 'dark') {
    expect(hasDarkClass).toBeTruthy()
    expect(gradientValue).toContain('linear-gradient')
  } else {
    expect(hasDarkClass).toBeFalsy()
    expect(gradientValue).toContain('linear-gradient')
    // For light theme, verify the gradient contains light colors
    expect(gradientValue).toMatch(
      /rgb\(\s*(2[2-4][0-9]|25[0-5])\s*,\s*(2[2-4][0-9]|25[0-5])\s*,\s*(2[2-4][0-9]|25[0-5])/,
    )
  }
}
