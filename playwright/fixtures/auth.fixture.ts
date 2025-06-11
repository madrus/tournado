import { test as base } from '@playwright/test'

import * as path from 'path'

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'auth.json')

// Extend base test with our fixtures
export const authTest = base.extend({
  // Override the context fixture to use stored auth state
  context: async ({ browser }, use) => {
    // Create a new context with the stored auth state
    const context = await browser.newContext({
      storageState: AUTH_FILE,
      viewport: { width: 1280, height: 720 },
      baseURL: 'http://localhost:5173',
    })

    await use(context)
    await context.close()
  },

  // Add page fixture with automatic waiting and language setup
  page: async ({ context }, use) => {
    const page = await context.newPage()

    // Set language properly to prevent switching during tests
    await page.addInitScript(() => {
      window.localStorage.setItem('i18nextLng', 'test')
      window.localStorage.setItem('playwrightTest', 'true')
    })

    // Override page.goto to add automatic waiting
    const originalGoto = page.goto.bind(page)
    page.goto = async (url: string, options?: Parameters<typeof originalGoto>[1]) => {
      const response = await originalGoto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
        ...options,
      })
      return response
    }

    await use(page)
  },
})
