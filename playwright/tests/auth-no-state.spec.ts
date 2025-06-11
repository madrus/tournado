import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { createAdminUser } from '../helpers/database'

// This test file runs without stored auth state to test actual authentication
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Language is handled by global config - no need to override here
    // The i18n config will use Dutch for Playwright tests
  })

  test('should allow you to register and sign in', async ({ page }) => {
    const signinForm = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`,
      password: 'MyReallyStr0ngPassw0rd!!!',
    }

    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')

    // Screenshot: Signup page loaded
    await page.screenshot({
      path: 'playwright-results/01-signup-page.png',
      fullPage: true,
    })

    // Use more explicit field interaction for firstName (has been problematic)
    await page.locator('#firstName').click()
    await page.locator('#firstName').clear()
    await page.locator('#firstName').pressSequentially(signinForm.firstName)

    // Fill other fields normally
    await page.locator('#lastName').fill(signinForm.lastName)
    await page.locator('#email').fill(signinForm.email)
    await page.locator('#password').fill(signinForm.password)

    // Verify all fields before submission
    await expect(page.locator('#firstName')).toHaveValue(signinForm.firstName)
    await expect(page.locator('#lastName')).toHaveValue(signinForm.lastName)

    // Screenshot: Form filled out
    await page.screenshot({
      path: 'playwright-results/02-form-filled.png',
      fullPage: true,
    })

    // Submit with proper wait - using Dutch text "Account aanmaken"
    await Promise.all([
      page.waitForURL('/auth/signin'),
      page.getByRole('button', { name: 'Account aanmaken' }).click(),
    ])

    // Screenshot: After signup redirect
    await page.screenshot({
      path: 'playwright-results/03-after-signup.png',
      fullPage: true,
    })

    // Continue with sign-in
    await page.locator('#email').fill(signinForm.email)
    await page.locator('#password').fill(signinForm.password)

    // Screenshot: Sign-in form filled
    await page.screenshot({
      path: 'playwright-results/04-signin-filled.png',
      fullPage: true,
    })

    // Click sign in button using Dutch text "Inloggen"
    await page.getByRole('button', { name: 'Inloggen' }).click()

    await expect(page).toHaveURL('/')

    // Screenshot: After successful sign-in
    await page.screenshot({
      path: 'playwright-results/05-signed-in.png',
      fullPage: true,
    })

    // Verify signed in
    await page.getByRole('button', { name: 'Toggle menu' }).click()

    // Screenshot: Menu opened
    await page.screenshot({
      path: 'playwright-results/06-menu-opened.png',
      fullPage: true,
    })

    await expect(page.getByText(signinForm.email)).toBeVisible({ timeout: 5000 })
  })

  test('should handle authentication with existing account', async ({ page }) => {
    // Create a test user fixture in the database first
    const testUser = await createAdminUser()

    // Test 1: Sign in from homepage - should redirect back to homepage
    await page.goto('/')

    await page.getByRole('button', { name: 'Toggle menu' }).click()

    // Wait for the mobile menu overlay to become visible
    // The overlay might re-render if language changes, so we need to be patient
    await expect(page.locator('[data-testid="mobile-user-menu-overlay"]')).toBeVisible({
      timeout: 10000,
    })

    // Click "Inloggen" link (Dutch for "Sign In")
    await page.getByRole('link', { name: 'Inloggen' }).click()

    // Verify we're on signin page with correct redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=%2F/) // Should redirect back to homepage

    // Sign in with our fixture user
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill('MyReallyStr0ngPassw0rd!!!')
    await page.getByRole('button', { name: 'Inloggen' }).click()

    // Should be redirected back to homepage (where we started)
    await expect(page).toHaveURL('/')

    // Verify user is authenticated by checking for their email in the UI (might be hidden in menu)
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByText(testUser.email)).toBeVisible({ timeout: 5000 })

    // Test 2: Sign out functionality - using Dutch text "Uitloggen"
    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // Should redirect to homepage and show signed out state
    await expect(page).toHaveURL('/')

    // Verify user is signed out - the email should no longer be visible in the menu
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('[data-testid="mobile-user-menu-overlay"]')).toBeVisible({
      timeout: 10000,
    })
    // User email should no longer be visible since they're signed out
    await expect(page.getByText(testUser.email)).not.toBeVisible()
  })
})
