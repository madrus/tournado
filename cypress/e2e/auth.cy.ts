import { faker } from '@faker-js/faker'

describe('Authentication', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    // Force test language for tests
    cy.window().then(win => {
      console.log('Before setting language:', {
        currentLanguage: win.localStorage.getItem('i18nextLng'),
        navigatorLanguage: win.navigator.language,
      })

      win.localStorage.setItem('i18nextLng', 'test')
      // Reload the page to ensure language change takes effect
      win.location.reload()
    })
  })

  afterEach(() => {
    cy.window().then(win => {
      console.log('After test:', {
        currentLanguage: win.localStorage.getItem('i18nextLng'),
        navigatorLanguage: win.navigator.language,
      })
    })

    cy.cleanupUser({ failOnNonZeroExit: false })
  })

  it('should redirect to admin route after successful authentication without redirectTo', () => {
    // Create a test user in the database with admin role
    const testUser = {
      email: 'admin-redirect-test@example.com',
      firstName: 'Admin',
      lastName: 'User',
    }

    cy.then(() => ({ email: testUser.email })).as('user')

    // Create the user in the database with admin role
    cy.exec(
      `pnpm exec tsx ./cypress/support/create-user.ts "${testUser.email}" "${testUser.firstName}" "${testUser.lastName}" "ADMIN"`
    )

    // Navigate directly to signin page without redirectTo parameter
    cy.visitAndCheck('/auth/signin')

    // Verify no redirectTo parameter in URL
    cy.url().should('not.include', 'redirectTo')

    // Sign in
    cy.findByRole('textbox', { name: /email/i }).type(testUser.email)
    cy.findByLabelText(/password/i).type('myreallystrongpassword')
    cy.findByRole('button', { name: /sign in/i }).click()

    // Should be redirected to admin route (the default redirect)
    cy.url().should('include', '/a7k9m2x5p8w1n4q6r3y8b5t1')

    // Verify user is authenticated by checking for their email in the admin panel
    cy.contains(testUser.email).should('exist')
    cy.contains('Admin Panel').should('exist')
  })

  it('should allow you to register and sign in', () => {
    const signinForm = {
      email: `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    }

    cy.then(() => ({ email: signinForm.email })).as('user')

    cy.visitAndCheck('/teams')

    // First click the toggle menu button
    cy.findByRole('button', { name: 'Toggle menu' }).click()

    // Wait for the mobile menu to be visible
    cy.dataCy('mobile-user-menu-overlay').should('be.visible')

    // Then find and click the sign in link within the mobile menu
    cy.findByRole('link', { name: /sign in/i })
      .should('be.visible')
      .click()

    // Wait for navigation to signin page (redirectTo will be added automatically by the AppBar)
    cy.url().should('include', '/signin')

    // Now find and click the sign up link on the sign in page
    cy.findByRole('link', { name: /sign up/i })
      .should('be.visible')
      .click()

    // Wait for navigation to signup page
    cy.url().should('include', '/signup')

    // Wait for page to settle before interacting with form
    cy.wait(500)

    // Fill out the registration form - using aliases and separate commands for stability
    cy.findByRole('textbox', { name: /email/i }).should('be.visible').as('emailField')

    cy.get('@emailField').clear().type(signinForm.email, { delay: 10 })

    cy.findByRole('textbox', { name: /first name/i })
      .should('be.visible')
      .as('firstNameField')

    cy.get('@firstNameField').clear().type(signinForm.firstName, { delay: 10 })

    cy.findByRole('textbox', { name: /last name/i })
      .should('be.visible')
      .as('lastNameField')

    cy.get('@lastNameField').clear().type(signinForm.lastName, { delay: 10 })

    cy.findByLabelText(/password/i)
      .should('be.visible')
      .as('passwordField')

    cy.get('@passwordField').clear().type(signinForm.password, { delay: 10 })

    // Submit the form
    cy.findByRole('button', { name: /create account/i })
      .should('be.visible')
      .should('be.enabled')
      .click()

    // After successful signup, we should be automatically signed in and redirected to teams
    cy.url().should('include', '/teams')

    // Verify user is signed in by checking for their email somewhere in the UI
    cy.contains(signinForm.email).should('exist')
  })

  it('should handle authentication with existing account', () => {
    // Create a test user fixture in the database
    const testUser = {
      email: 'auth-test-user@example.com',
      firstName: 'Auth',
      lastName: 'Tester',
    }

    cy.then(() => ({ email: testUser.email })).as('user')

    // Create the user in the database first
    cy.exec(
      `pnpm exec tsx ./cypress/support/create-user.ts "${testUser.email}" "${testUser.firstName}" "${testUser.lastName}"`
    )

    // Test 1: Sign in from homepage - should redirect back to homepage
    cy.visitAndCheck('/')

    cy.findByRole('button', { name: 'Toggle menu' }).click()
    cy.dataCy('mobile-user-menu-overlay').should('be.visible')
    cy.findByRole('link', { name: /sign in/i }).click()

    // Verify we're on signin page with correct redirectTo parameter
    cy.url().should('include', '/auth/signin')
    cy.url().should('include', 'redirectTo=%2F') // Should redirect back to homepage

    // Sign in with our fixture user
    cy.findByRole('textbox', { name: /email/i }).type(testUser.email)
    cy.findByLabelText(/password/i).type('myreallystrongpassword')
    cy.findByRole('button', { name: /sign in/i }).click()

    // Should be redirected back to homepage (where we started)
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Verify user is authenticated by checking for their email in the UI
    cy.contains(testUser.email).should('exist')

    // Test 2: Test that authenticated user can access protected routes
    cy.visit('/teams/new')
    cy.url().should('include', '/teams/new')

    // Verify the form is accessible (proving authentication worked)
    cy.findByRole('combobox', { name: /tournament/i }).should('exist')

    // Test 3: Sign out and test signin from a different page
    cy.clearCookies() // Simple signout for testing

    // Visit teams page and sign in from there
    cy.visitAndCheck('/teams')
    cy.findByRole('button', { name: 'Toggle menu' }).click()
    cy.dataCy('mobile-user-menu-overlay').should('be.visible')
    cy.findByRole('link', { name: /sign in/i }).click()

    // Verify redirectTo parameter points to teams page
    cy.url().should('include', 'redirectTo=%2Fteams')

    // Sign in again
    cy.findByRole('textbox', { name: /email/i }).type(testUser.email)
    cy.findByLabelText(/password/i).type('myreallystrongpassword')
    cy.findByRole('button', { name: /sign in/i }).click()

    // Should be redirected back to teams page (where we started)
    cy.url().should('include', '/teams')
  })
})
