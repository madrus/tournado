import * as fs from 'node:fs'
import * as path from 'node:path'
import { type Page, expect } from '@playwright/test'

export type TestUser = {
  email: string
  role: string
}

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'auth.json')

/**
 * Check if the current test is using stored authentication
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check if auth file exists
  if (!fs.existsSync(AUTH_FILE)) {
    return false
  }

  // Check if we can access authenticated content
  try {
    await page.goto('/')
    // Try to find user menu which only appears when authenticated
    await page.getByRole('button', { name: 'Toggle menu' }).waitFor({
      state: 'visible',
      timeout: 5000,
    })
    return true
  } catch {
    return false
  }
}

/**
 * Get basic test user information - for testing we just need to know we're authenticated
 * This is a simplified version that doesn't rely on sessionStorage
 */
export const getTestUser = async (_page: Page): Promise<TestUser> =>
  // Since we know we're using a stored auth state from global setup,
  // we can return basic test user info
  ({
    email: 'test-user@example.com',
    role: 'ADMIN',
  })

/**
 * Navigate to a page and verify authentication state
 */
export async function goToAuthenticatedPage(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await expect(page).toHaveURL(url)
  await page.waitForLoadState('networkidle')
}
