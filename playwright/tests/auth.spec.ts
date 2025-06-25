import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { createAdminUser } from '../helpers/database'
import { createValidTestEmail } from '../helpers/test-utils'

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
      email: createValidTestEmail(),
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

    // Continue with sign-in - use deliberate field filling to prevent clearing issues
    await page.locator('#email').click()
    await page.locator('#email').clear()
    await page.locator('#email').pressSequentially(signinForm.email, { delay: 50 })

    await page.locator('#password').click()
    await page.locator('#password').clear()
    await page
      .locator('#password')
      .pressSequentially(signinForm.password, { delay: 50 })

    // Screenshot: Sign-in form filled
    await page.screenshot({
      path: 'playwright-results/04-signin-filled.png',
      fullPage: true,
    })

    // Ensure form is ready and fields are properly filled
    await expect(page.locator('#email')).toHaveValue(signinForm.email)
    await expect(page.locator('#password')).toHaveValue(signinForm.password)

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Re-verify fields just before submission to catch any clearing
    await expect(page.locator('#email')).toHaveValue(signinForm.email)
    await expect(page.locator('#password')).toHaveValue(signinForm.password)

    // Click sign in button using Dutch text "Inloggen"
    await Promise.all([
      page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 }), // Increased timeout for CI
      loginButton.click(),
    ])

    // Double-check we're on the correct page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

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

    await expect(
      page.getByTestId('user-menu-dropdown').getByText(signinForm.email)
    ).toBeVisible({ timeout: 5000 })
  })

  test('should handle authentication with existing account', async ({ page }) => {
    // Create a test user fixture in the database first
    const testUser = await createAdminUser()

    // Test 1: Sign in from homepage - should redirect back to homepage
    await page.goto('/')

    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('[data-testid="user-menu-dropdown"]')).toBeVisible({
      timeout: 10000,
    })
    // Click "Inloggen" link (Dutch for "Sign In")
    await page.getByRole('link', { name: 'Inloggen' }).click()

    // Verify we're on signin page with correct redirectTo parameter
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page).toHaveURL(/redirectTo=%2F/) // Should redirect back to homepage

    // Sign in with our fixture user - use more deliberate field filling
    await page.locator('#email').click()
    await page.locator('#email').clear()
    await page.locator('#email').pressSequentially(testUser.email, { delay: 50 })

    await page.locator('#password').click()
    await page.locator('#password').clear()
    await page
      .locator('#password')
      .pressSequentially('MyReallyStr0ngPassw0rd!!!', { delay: 50 })

    // Ensure form is ready and fields are properly filled
    await expect(page.locator('#email')).toHaveValue(testUser.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Re-verify fields just before submission to catch any clearing
    await expect(page.locator('#email')).toHaveValue(testUser.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    // Highlight the button to make click more visible
    await loginButton.highlight()
    await page.waitForTimeout(500) // Pause to make highlight visible

    // Screenshot: Just before clicking login button
    await page.screenshot({
      path: 'playwright-results/before-login-click.png',
      fullPage: true,
    })

    // Click the login button and wait for navigation to complete
    console.log('- clicking login button...')
    await Promise.all([
      page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 }), // Increased timeout for CI
      (async () => {
        console.log('- about to click login button')
        await loginButton.click({ force: true })
        console.log('- login button clicked')
        await page.waitForTimeout(1000) // Give time to see the click effect
      })(),
    ])
    console.log('- navigation completed to admin panel')

    // Screenshot: After successful login
    await page.screenshot({
      path: 'playwright-results/after-login-success.png',
      fullPage: true,
    })

    // Double-check we're on the correct page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

    // Wait for the page to fully load and auth store to hydrate
    await page.waitForLoadState('networkidle')

    // Verify user is authenticated by checking for their email in the UI (might be hidden in menu)
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(
      page.getByTestId('user-menu-dropdown').getByText(testUser.email)
    ).toBeVisible({ timeout: 5000 })

    // Test 2: Sign out functionality - using Dutch text "Uitloggen"
    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // Should redirect to homepage and show signed out state
    await expect(page).toHaveURL('/')

    // Wait a moment for the page to settle after sign out
    await page.waitForLoadState('networkidle')

    // Verify user is signed out - the email should no longer be visible in the menu
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('[data-testid="user-menu-dropdown"]')).toBeVisible({
      timeout: 10000,
    })
    // User email should no longer be visible since they're signed out
    await expect(page.getByText(testUser.email)).not.toBeVisible()
  })

  test('should redirect to teams page when accessing signin while already authenticated', async ({
    page,
  }) => {
    // Create and sign in a user
    const user = await createAdminUser()

    await page.goto('/auth/signin')

    // Use deliberate field filling to prevent clearing issues
    await page.locator('#email').click()
    await page.locator('#email').clear()
    await page.locator('#email').pressSequentially(user.email, { delay: 50 })

    await page.locator('#password').click()
    await page.locator('#password').clear()
    await page
      .locator('#password')
      .pressSequentially('MyReallyStr0ngPassw0rd!!!', { delay: 50 })

    // Ensure form is ready and fields are properly filled
    await expect(page.locator('#email')).toHaveValue(user.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Re-verify fields just before submission to catch any clearing
    await expect(page.locator('#email')).toHaveValue(user.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    await Promise.all([
      page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 }), // Increased timeout for CI
      loginButton.click(),
    ])
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

    // Try to access signin page while authenticated
    await page.goto('/auth/signin')

    // Should be redirected to Admin Panel (default redirect)
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
  })

  test('should redirect to homepage when signing out from teams page', async ({
    page,
  }) => {
    // Create and sign in a user
    const user = await createAdminUser()

    await page.goto('/auth/signin')

    // Use deliberate field filling to prevent clearing issues
    await page.locator('#email').click()
    await page.locator('#email').clear()
    await page.locator('#email').pressSequentially(user.email, { delay: 50 })

    await page.locator('#password').click()
    await page.locator('#password').clear()
    await page
      .locator('#password')
      .pressSequentially('MyReallyStr0ngPassw0rd!!!', { delay: 50 })

    // Ensure form is ready and fields are properly filled
    await expect(page.locator('#email')).toHaveValue(user.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Re-verify fields just before submission to catch any clearing
    await expect(page.locator('#email')).toHaveValue(user.email)
    await expect(page.locator('#password')).toHaveValue('MyReallyStr0ngPassw0rd!!!')

    await Promise.all([
      page.waitForURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 30000 }), // Increased timeout for CI
      loginButton.click(),
    ])
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 10000 })

    // Navigate to teams page
    await page.goto('/teams')
    await expect(page).toHaveURL('/teams')

    // Sign out from teams page - using Dutch text "Uitloggen"
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('[data-testid="user-menu-dropdown"]')).toBeVisible({
      timeout: 10000,
    })
    await page.getByRole('button', { name: 'Uitloggen' }).click()

    // Should redirect to homepage (not stay on teams page)
    await expect(page).toHaveURL('/')

    // Wait a moment for the page to settle after sign out
    await page.waitForLoadState('networkidle')

    // Verify user is signed out - email should no longer be visible
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.locator('[data-testid="user-menu-dropdown"]')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByText(user.email)).not.toBeVisible()
  })
})
