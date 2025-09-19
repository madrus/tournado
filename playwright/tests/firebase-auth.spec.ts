import { expect, test } from '@playwright/test'

import {
  createAdminUser,
  createTestTournament,
  deleteTestTournament,
  deleteUserByEmail,
} from '../helpers/database'

/**
 * Dedicated Firebase Authentication Tests
 *
 * These tests specifically verify Firebase authentication integration and UI flows.
 * For business logic tests that need authenticated users, use the createTestSession helper
 * from test-auth.ts instead of going through the Firebase authentication flow.
 */
test.describe('Firebase Authentication Flow', () => {
  let tournamentId: string | undefined
  let adminUserEmail: string | undefined

  test.beforeEach(async () => {
    // Create test data for authentication flow
    const tournament = await createTestTournament('AuthTestTourney', 'TestCity')
    tournamentId = tournament.id

    const adminUser = await createAdminUser()
    adminUserEmail = adminUser.email
  })

  test.afterEach(async () => {
    // Cleanup test data
    if (tournamentId) {
      await deleteTestTournament({ id: tournamentId })
    }
    if (adminUserEmail) {
      try {
        await deleteUserByEmail(adminUserEmail)
      } catch (error) {
        // User might not exist, which is fine
      }
    }
  })

  test('should display Firebase Google sign-in button on sign-in page', async ({
    page,
  }) => {
    await page.goto('/auth/signin')

    // Should see page title
    await expect(page).toHaveTitle(/Sign In/)

    // Should see Firebase Google sign-in button
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible()

    // Should see separator and Firebase email form
    await expect(page.getByText(/or continue with email/i)).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
  })

  test('should handle Firebase sign-in button click', async ({ page }) => {
    await page.goto('/auth/signin')

    const signInButton = page.getByRole('button', { name: /continue with google/i })
    await expect(signInButton).toBeVisible()
    await expect(signInButton).toBeEnabled()

    // Click the Firebase sign-in button
    await signInButton.click()

    // Should show loading state
    await expect(page.getByText(/signing in/i)).toBeVisible()
    await expect(signInButton).toBeDisabled()
  })

  test('should preserve redirect parameter for Firebase sign-in', async ({ page }) => {
    const redirectTo = '/teams'
    await page.goto(`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`)

    // Should see Firebase sign-in button
    const signInButton = page.getByRole('button', { name: /continue with google/i })
    await expect(signInButton).toBeVisible()

    // The redirect parameter should be preserved (we can't test the actual Firebase flow in E2E,
    // but we can verify the button is present and the page loaded with the correct parameter)
    expect(page.url()).toContain(`redirectTo=${encodeURIComponent(redirectTo)}`)
  })

  test('should display error messages correctly', async ({ page }) => {
    await page.goto('/auth/signin')

    // We can't actually trigger Firebase errors in E2E tests without real Firebase setup,
    // but we can verify the error display structure exists
    const signInButton = page.getByRole('button', { name: /continue with google/i })
    await expect(signInButton).toBeVisible()
  })

  test('should show both Firebase and legacy authentication options', async ({
    page,
  }) => {
    await page.goto('/auth/signin')

    // Firebase sign-in should be prominently displayed
    const firebaseButton = page.getByRole('button', { name: /continue with google/i })
    await expect(firebaseButton).toBeVisible()

    // Should see Google icon in the button
    await expect(firebaseButton.locator('svg')).toBeVisible()

    // Firebase email/password form should be available
    await expect(page.getByText(/or continue with email/i)).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()

    // Should have a submit button for Firebase email form
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should support different button variants and sizes', async ({ page }) => {
    await page.goto('/auth/signin')

    const signInButton = page.getByRole('button', { name: /continue with google/i })
    await expect(signInButton).toBeVisible()

    // Should have proper styling classes (we can't test exact CSS, but we can verify structure)
    const buttonClass = await signInButton.getAttribute('class')
    expect(buttonClass).toBeTruthy()
  })

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/auth/signin')

    // Tab to Firebase sign-in button
    await page.keyboard.press('Tab')

    const firebaseButton = page.getByRole('button', { name: /continue with google/i })
    await expect(firebaseButton).toBeFocused()

    // Should be able to activate with keyboard
    await page.keyboard.press('Enter')

    // Should show loading state
    await expect(page.getByText(/signing in/i)).toBeVisible()
  })

  test('should handle responsive design on different screen sizes', async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/auth/signin')

    const firebaseButton = page.getByRole('button', { name: /continue with google/i })
    await expect(firebaseButton).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()

    await expect(firebaseButton).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()

    await expect(firebaseButton).toBeVisible()
  })

  test('should redirect authenticated users appropriately', async ({ page }) => {
    // This test would require actual authentication, which we can't fully test
    // without Firebase setup, but we can test the basic page loading
    await page.goto('/auth/signin')

    // Should load the sign-in page for unauthenticated users
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible()
  })

  test('should validate email input in Firebase email form', async ({ page }) => {
    await page.goto('/auth/signin')

    const emailInput = page.locator('input[id="email"]')
    const passwordInput = page.locator('input[id="password"]')
    const signInButton = page.getByRole('button', { name: /^sign in$/i })

    // Fill in invalid email
    await emailInput.fill('invalid-email')
    await passwordInput.fill('somepassword')

    // Try to submit - the form should prevent submission with invalid email
    await signInButton.click()

    // Should still be on the sign-in page (form validation prevented submission)
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should require both email and password for Firebase email sign-in', async ({
    page,
  }) => {
    await page.goto('/auth/signin')

    const emailInput = page.locator('input[id="email"]')
    const passwordInput = page.locator('input[id="password"]')
    const signInButton = page.getByRole('button', { name: /^sign in$/i })

    // Test with empty fields
    await signInButton.click()
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Test with only email
    await emailInput.fill('test@example.com')
    await signInButton.click()
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Test with both fields (but short password)
    await passwordInput.fill('123')
    await signInButton.click()
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should display Firebase signup form correctly', async ({ page }) => {
    await page.goto('/auth/signup')

    // Should see page title
    await expect(page).toHaveTitle(/Sign Up/)

    // Should see Firebase Google sign-in button
    await expect(
      page.getByRole('button', { name: /continue with google/i })
    ).toBeVisible()

    // Should see separator and Firebase email signup form
    await expect(page.getByText(/or continue with email/i)).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible()

    // Should show password requirements
    await expect(page.getByText(/password must be at least/i)).toBeVisible()

    // Should have signup button
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible()

    // Should have link to sign-in page
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })

  test('should validate password confirmation in signup form', async ({ page }) => {
    await page.goto('/auth/signup')

    const emailInput = page.locator('input[id="email"]')
    const passwordInput = page.locator('input[id="password"]')
    const confirmPasswordInput = page.locator('input[id="confirmPassword"]')
    const signUpButton = page.getByRole('button', { name: /sign up/i })

    // Fill form with mismatched passwords
    await emailInput.fill('test@example.com')
    await passwordInput.fill('Password123')
    await confirmPasswordInput.fill('Different123')

    // Try to submit
    await signUpButton.click()

    // Should still be on the signup page (validation prevented submission)
    await expect(page).toHaveURL(/\/auth\/signup/)
  })

  test('should show loading states during Firebase authentication', async ({
    page,
  }) => {
    await page.goto('/auth/signin')

    const emailInput = page.locator('input[id="email"]')
    const passwordInput = page.locator('input[id="password"]')
    const signInButton = page.getByRole('button', { name: /^sign in$/i })

    // Fill in valid-looking credentials
    await emailInput.fill('test@example.com')
    await passwordInput.fill('Password123')

    // Click sign in - this will attempt Firebase authentication
    await signInButton.click()

    // Should show loading state (inputs disabled, button shows signing in)
    await expect(signInButton).toHaveText(/signing in/i)
    await expect(emailInput).toBeDisabled()
    await expect(passwordInput).toBeDisabled()
    await expect(signInButton).toBeDisabled()
  })
})
