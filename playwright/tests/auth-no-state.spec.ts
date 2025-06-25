import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { createAdminUser } from '../helpers/database'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'

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
    const loginPage = new LoginPage(page)
    const homePage = new HomePage(page)

    // Generate test user data
    const testUser = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: `${faker.person
        .firstName()
        .toLowerCase()
        .replace(/[^a-z]/g, '')}${faker.person
        .lastName()
        .toLowerCase()
        .replace(/[^a-z]/g, '')}@example.com`,
      password: 'MyReallyStr0ngPassw0rd!!!',
    }

    // Go to signup page
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
    await page.locator('#firstName').pressSequentially(testUser.firstName)

    // Fill other fields normally
    await page.locator('#lastName').fill(testUser.lastName)
    await page.locator('#email').fill(testUser.email)
    await page.locator('#password').fill(testUser.password)

    // Verify all fields before submission
    await expect(page.locator('#firstName')).toHaveValue(testUser.firstName)
    await expect(page.locator('#lastName')).toHaveValue(testUser.lastName)

    // Screenshot: Form filled out
    await page.screenshot({
      path: 'playwright-results/02-form-filled.png',
      fullPage: true,
    })

    // Submit signup
    await page.getByRole('button', { name: 'Account aanmaken' }).click()
    await page.waitForURL('/auth/signin')

    // Screenshot: After signup redirect
    await page.screenshot({
      path: 'playwright-results/03-after-signup.png',
      fullPage: true,
    })

    // Now login with the created user
    await loginPage.login(testUser.email, testUser.password)

    // Verify we're redirected to admin panel
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Verify user is authenticated
    await loginPage.verifyAuthentication()
  })

  test('should handle authentication with existing account', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const testUser = await createAdminUser()

    // Test sign in from homepage
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await page.getByRole('link', { name: 'Inloggen' }).click()

    // Login with test user
    await loginPage.login(testUser.email, 'MyReallyStr0ngPassw0rd!!!')

    // Verify authentication and redirect
    await expect(page).toHaveURL('/a7k9m2x5p8w1n4q6r3y8b5t1')
    await loginPage.verifyAuthentication()

    // Test sign out
    // Check if menu is already open, if not, open it
    const userDropdown = page.getByTestId('user-menu-dropdown')
    const isDropdownVisible = await userDropdown.isVisible().catch(() => false)

    if (!isDropdownVisible) {
      await page.getByRole('button', { name: 'Toggle menu' }).click()
    }

    await page.getByRole('button', { name: 'Uitloggen' }).click()
    await expect(page).toHaveURL('/')
  })
})
