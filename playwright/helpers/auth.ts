import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import * as fs from 'fs'
import * as path from 'path'

export type TestUser = {
  email: string
  role: string
}

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'auth.json')

/**
 * Robust signin helper that handles field clearing issues and uses optimized timeouts
 */
export async function signInUser(
  page: Page,
  email: string,
  password: string = 'MyReallyStr0ngPassw0rd!!!'
): Promise<void> {
  // Navigate to signin page if not already there
  if (!page.url().includes('/auth/signin')) {
    await page.goto('/auth/signin')
  }

  // Use deliberate field filling to prevent clearing issues
  await page.locator('#email').click()
  await page.locator('#email').clear()
  await page.locator('#email').pressSequentially(email, { delay: 50 })

  await page.locator('#password').click()
  await page.locator('#password').clear()
  await page.locator('#password').pressSequentially(password, { delay: 50 })

  // Ensure form is ready and fields are properly filled
  await expect(page.locator('#email')).toHaveValue(email)
  await expect(page.locator('#password')).toHaveValue(password)

  // Wait for the login button to be enabled and ready
  const loginButton = page.getByRole('button', { name: 'Inloggen' })
  await expect(loginButton).toBeEnabled()

  // Wait for any loading states to complete before submission
  await page.waitForLoadState('networkidle')

  // Form stability wait to ensure no race conditions
  await page.waitForTimeout(300) // Reduced from 500ms

  // Re-verify fields just before submission to catch any clearing
  await expect(page.locator('#email')).toHaveValue(email)
  await expect(page.locator('#password')).toHaveValue(password)

  // Submit form and wait for redirect with optimized timeout
  await Promise.all([
    page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 15000 }), // Reduced from 30s
    loginButton.click(),
  ])

  // Verify we're on the correct page
  await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 5000 })
}

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
