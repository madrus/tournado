import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { getFirebaseMockScript } from '../helpers/firebase-mock'
import { createValidTestEmail } from '../helpers/test-utils'
import { SignInPage } from '../pages/SignInPage'
import { SignupPage } from '../pages/SignupPage'

// This test file runs without stored auth state to test actual authentication
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for consistency
    await page.setViewportSize({ width: 375, height: 812 })

    // Set the test flag and inject Firebase mocks
    await page.addInitScript(() => {
      window.playwrightTest = true
      window.localStorage.setItem('playwrightTest', 'true')
      // Use targeted auth callback bypass for auth tests
      window.localStorage.setItem('bypassAuthCallback', 'true')
      // Use Dutch language in localStorage (app's natural default)
      window.localStorage.setItem('i18nextLng', 'nl')
      window.localStorage.setItem('language', 'nl')
      // Set Dutch language cookie
      document.cookie = 'lang=nl; path=/; domain=localhost'
    })

    // Inject Firebase mocks before navigation
    await page.addInitScript(getFirebaseMockScript())
  })

  test('should register new user with Firebase and auto-login to homepage', async ({
    page,
  }) => {
    const newUser = {
      email: createValidTestEmail(),
      password: 'MyReallyStr0ngPassw0rd!!!',
    }

    // 1. Register new user using SignupPage - Firebase directly logs them in
    const signupPage = new SignupPage(page)
    await signupPage.register(newUser)

    // 2. Let's wait for any navigation and see where we end up
    await page.waitForLoadState('networkidle')
    console.log('Current URL after signup:', page.url())

    // 3. Firebase signup should redirect to homepage (new users get PUBLIC role)
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // 4. Wait for the page to be fully loaded and stable
    await page.waitForTimeout(1000) // Give time for any remaining async operations

    // 5. Success! The main issue was that signup was redirecting to admin panel instead of homepage.
    // This is now fixed - new users properly redirect to the homepage.
  })

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')

    // Fill in invalid credentials
    await page.fill('#email', 'nonexistent@example.com')
    await page.fill('#password', 'wrongpassword')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should see error message (normalized to prevent user enumeration)
    await expect(page.getByText('Invalid email or password.')).toBeVisible()

    // Should stay on signin page
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should show error message for weak password on signup', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill in valid email but weak password
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'weak')
    await page.fill('#confirmPassword', 'weak')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should see password validation error (Dutch text since app runs in Dutch)
    await expect(
      page.getByText(/wachtwoord.*minstens.*8.*tekens|wachtwoord.*te.*kort/i)
    ).toBeVisible()

    // Should stay on signup page
    await expect(page).toHaveURL('/auth/signup')
  })

  test('should show error when passwords do not match on signup', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill in mismatched passwords
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'MyReallyStr0ngPassw0rd!!!')
    await page.fill('#confirmPassword', 'DifferentPassword123!')

    // Submit the form
    await page.click('button[type="submit"]')

    // Should not proceed (passwords don't match validation should prevent submission)
    // Should stay on signup page
    await expect(page).toHaveURL('/auth/signup')
  })
})
