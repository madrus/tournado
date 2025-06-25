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

    // Fill firstName using clean approach
    const firstNameField = page.locator('#firstName')
    await firstNameField.clear()
    await firstNameField.fill(signinForm.firstName)
    await firstNameField.blur()

    // Verify firstName was filled correctly
    const actualFirstName = await firstNameField.inputValue()
    if (actualFirstName !== signinForm.firstName) {
      console.log(
        `- firstName field mismatch. Expected: "${signinForm.firstName}", Got: "${actualFirstName}"`
      )
      throw new Error(
        `FirstName field truncated. Expected: "${signinForm.firstName}", Got: "${actualFirstName}"`
      )
    }
    console.log(`- firstName filled successfully: "${actualFirstName}"`)

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

    // Continue with sign-in - use clean fill approach
    const emailField = page.locator('#email')
    const passwordField = page.locator('#password')

    await emailField.clear()
    await emailField.fill(signinForm.email)
    await emailField.blur()

    // Verify email was filled correctly
    const actualEmail = await emailField.inputValue()
    if (actualEmail !== signinForm.email) {
      console.log(
        `- email field mismatch. Expected: "${signinForm.email}", Got: "${actualEmail}"`
      )
      throw new Error(
        `Email field truncated. Expected: "${signinForm.email}", Got: "${actualEmail}"`
      )
    }
    console.log(`- email filled successfully: "${actualEmail}"`)

    await passwordField.clear()
    await passwordField.fill(signinForm.password)
    await passwordField.blur()

    // Verify password was filled correctly
    const actualPassword = await passwordField.inputValue()
    if (actualPassword !== signinForm.password) {
      console.log(
        `- password field mismatch. Expected: "${signinForm.password}", Got: "${actualPassword}"`
      )
      throw new Error(
        `Password field truncated. Expected: "${signinForm.password}", Got: "${actualPassword}"`
      )
    }
    console.log(`- password filled successfully`)

    await page.waitForTimeout(100) // wait for any async effects

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

    // Click sign in button
    await loginButton.click()
    console.log('- login button clicked')

    // Double-check we're on the correct page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 3000 })

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

    // Sign in with our fixture user - use clean fill approach
    const emailField = page.locator('#email')
    const passwordField = page.locator('#password')

    await emailField.clear()
    await emailField.fill(testUser.email)
    await emailField.blur()

    // Verify email was filled correctly
    const actualEmail = await emailField.inputValue()
    if (actualEmail !== testUser.email) {
      console.log(
        `- email field mismatch. Expected: "${testUser.email}", Got: "${actualEmail}"`
      )
      throw new Error(
        `Email field truncated. Expected: "${testUser.email}", Got: "${actualEmail}"`
      )
    }
    console.log(`- email filled successfully: "${actualEmail}"`)

    await passwordField.clear()
    await passwordField.fill('MyReallyStr0ngPassw0rd!!!')
    await passwordField.blur()

    // Verify password was filled correctly
    const actualPassword = await passwordField.inputValue()
    if (actualPassword !== 'MyReallyStr0ngPassw0rd!!!') {
      console.log(
        `- password field mismatch. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
      throw new Error(
        `Password field truncated. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
    }
    console.log(`- password filled successfully`)

    await page.waitForTimeout(100) // wait for any async effects

    // Fields already verified after blur() - skip redundant verification

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Fields already verified after blur() - proceed with submission

    // Highlight the button to make click more visible
    await loginButton.highlight()
    await page.waitForTimeout(500) // Pause to make highlight visible

    // Screenshot: Just before clicking login button
    await page.screenshot({
      path: 'playwright-results/before-login-click.png',
      fullPage: true,
    })

    // Click sign in button
    await loginButton.click()
    console.log('- login button clicked')

    // Screenshot: After successful login
    await page.screenshot({
      path: 'playwright-results/after-login-success.png',
      fullPage: true,
    })

    // Double-check we're on the correct page
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 3000 })

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

    // Fill fields using clean approach
    const emailField = page.locator('#email')
    const passwordField = page.locator('#password')

    await emailField.clear()
    await emailField.fill(user.email)
    await emailField.blur()

    // Verify email was filled correctly
    const actualEmail = await emailField.inputValue()
    if (actualEmail !== user.email) {
      console.log(
        `- email field mismatch. Expected: "${user.email}", Got: "${actualEmail}"`
      )
      throw new Error(
        `Email field truncated. Expected: "${user.email}", Got: "${actualEmail}"`
      )
    }
    console.log(`- email filled successfully: "${actualEmail}"`)

    await passwordField.clear()
    await passwordField.fill('MyReallyStr0ngPassw0rd!!!')
    await passwordField.blur()

    // Verify password was filled correctly
    const actualPassword = await passwordField.inputValue()
    if (actualPassword !== 'MyReallyStr0ngPassw0rd!!!') {
      console.log(
        `- password field mismatch. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
      throw new Error(
        `Password field truncated. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
    }
    console.log(`- password filled successfully`)

    await page.waitForTimeout(100) // wait for any async effects

    // Fields already verified after blur() - skip redundant verification

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Fields already verified after blur() - proceed with submission

    // Click sign in button
    await loginButton.click()
    console.log('- login button clicked')

    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 3000 })

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

    // Fill fields using clean approach
    const emailField = page.locator('#email')
    const passwordField = page.locator('#password')

    await emailField.clear()
    await emailField.fill(user.email)
    await emailField.blur()

    // Verify email was filled correctly
    const actualEmail = await emailField.inputValue()
    if (actualEmail !== user.email) {
      console.log(
        `- email field mismatch. Expected: "${user.email}", Got: "${actualEmail}"`
      )
      throw new Error(
        `Email field truncated. Expected: "${user.email}", Got: "${actualEmail}"`
      )
    }
    console.log(`- email filled successfully: "${actualEmail}"`)

    await passwordField.clear()
    await passwordField.fill('MyReallyStr0ngPassw0rd!!!')
    await passwordField.blur()

    // Verify password was filled correctly
    const actualPassword = await passwordField.inputValue()
    if (actualPassword !== 'MyReallyStr0ngPassw0rd!!!') {
      console.log(
        `- password field mismatch. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
      throw new Error(
        `Password field truncated. Expected: "MyReallyStr0ngPassw0rd!!!", Got: "${actualPassword}"`
      )
    }
    console.log(`- password filled successfully`)

    await page.waitForTimeout(100) // wait for any async effects

    // Fields already verified after blur() - skip redundant verification

    // Wait for the login button to be enabled and ready
    const loginButton = page.getByRole('button', { name: 'Inloggen' })
    await expect(loginButton).toBeEnabled()

    // Wait for any loading states to complete before submission
    await page.waitForLoadState('networkidle')

    // Additional wait to ensure form is stable before submission
    await page.waitForTimeout(500)

    // Fields already verified after blur() - proceed with submission

    // Click sign in button
    await loginButton.click()
    console.log('- login button clicked')

    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1', { timeout: 3000 })

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
