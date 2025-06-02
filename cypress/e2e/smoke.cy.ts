import { faker } from '@faker-js/faker'

describe('smoke tests', () => {
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
    cy.get('.fixed.inset-0.z-30.flex').should('exist')

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

  it('should allow you to sign in with existing account', () => {
    const signinForm = {
      email: `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    }

    cy.then(() => ({ email: signinForm.email })).as('user')

    // First create a user account
    cy.exec(
      `pnpm exec tsx ./cypress/support/create-user.ts "${signinForm.email}"`
    ).then(() => {
      // Clear any existing session to test signin flow
      cy.clearCookies()

      cy.visitAndCheck('/teams')

      // First click the toggle menu button
      cy.findByRole('button', { name: 'Toggle menu' }).click()

      // Wait for the mobile menu to be visible
      cy.get('.fixed.inset-0.z-30.flex').should('exist')

      // Then find and click the sign in link within the mobile menu
      cy.findByRole('link', { name: /sign in/i })
        .should('be.visible')
        .click()

      // Wait for navigation to signin page
      cy.url().should('include', '/signin')

      // Wait for page to settle before interacting with form
      cy.wait(500)

      // Fill out the signin form
      cy.findByRole('textbox', { name: /email/i })
        .should('be.visible')
        .clear()
        .type(signinForm.email, { delay: 10 })

      cy.findByLabelText(/password/i)
        .should('be.visible')
        .clear()
        .type('myreallystrongpassword', { delay: 10 }) // This is the default password from create-user.ts

      // Submit the signin form
      cy.findByRole('button', { name: /sign in/i })
        .should('exist')
        .should('be.visible')
        .should('be.enabled')
        .click()

      // After successful signin, we should be redirected to teams page
      cy.url().should('include', '/teams')

      // Verify user is signed in by checking for their email somewhere in the UI
      cy.contains(signinForm.email).should('exist')
    })
  })

  describe('team creation', () => {
    beforeEach(() => {
      cy.signin()
      cy.visitAndCheck('/')
      cy.findByRole('link', { name: /teams/i }).click()

      // Use a more specific selector for the "new team" button
      cy.findByRole('link', { name: 'Sidebar button to add a new team' }).should(
        'exist'
      )
    })

    it('should allow you to make a team on desktop', () => {
      cy.viewport(1280, 720)
      const testTeam = {
        teamName: faker.lorem.words(1),
        teamClass: 'JO8-1',
        clubName: faker.company.name(),
        teamLeaderName: faker.person.fullName(),
        teamLeaderPhone: faker.phone.number(),
        teamLeaderEmail: faker.internet.email(),
      }

      cy.findByRole('link', {
        name: 'Sidebar button to add a new team',
      }).click()

      // Select a tournament (first available option)
      cy.findByRole('combobox', { name: /tournament/i }).select(1) // Select the first tournament option (index 0 is the placeholder)

      // Fill out team information
      cy.findAllByRole('textbox', { name: /club name/i })
        .first()
        .type(testTeam.clubName)

      cy.findAllByRole('textbox', { name: /team name/i })
        .first()
        .type(testTeam.teamName)

      cy.findAllByRole('textbox', { name: /team class/i })
        .first()
        .type(testTeam.teamClass)

      // Fill out team leader information
      cy.findAllByRole('textbox', { name: /team leader name/i })
        .first()
        .type(testTeam.teamLeaderName)

      cy.findAllByRole('textbox', { name: /team leader phone/i })
        .first()
        .type(testTeam.teamLeaderPhone)

      cy.findAllByRole('textbox', { name: /team leader email/i })
        .first()
        .type(testTeam.teamLeaderEmail)

      // Accept privacy agreement
      cy.findByRole('checkbox', { name: /privacy policy/i }).check()

      // Submit the form
      cy.findAllByRole('button', { name: /save/i }).first().click()

      // After saving, we should be redirected to the team detail page
      cy.url().should('include', `/teams/`)
      cy.url().should('not.include', '/teams/new')

      // Now we can find the delete button on the team detail page
      cy.findByRole('button', { name: /delete/i }).click()

      // After deletion, we should be back at the teams page
      cy.url().should('include', '/teams')
      cy.url().should('not.include', `/teams/`)
      cy.findByRole('link', { name: 'Sidebar button to add a new team' }).should(
        'exist'
      )
    })

    it('should allow you to make a team on mobile', () => {
      // Use a more realistic mobile viewport with sufficient height
      cy.viewport(375, 812) // iPhone X dimensions
      const testTeam = {
        teamName: faker.lorem.words(1),
        teamClass: 'JO8-1',
        clubName: faker.company.name(),
        teamLeaderName: faker.person.fullName(),
        teamLeaderPhone: faker.phone.number(),
        teamLeaderEmail: faker.internet.email(),
      }

      cy.findByRole('link', {
        name: 'Sidebar button to add a new team',
      }).click()

      // Wait for navigation to complete
      cy.url().should('include', '/teams/new')

      // Close the mobile sidebar by clicking on the overlay
      // Note: Using force: true due to Cypress layering issue that doesn't exist in real mobile usage
      cy.get('.fixed.inset-0.z-20').click({ force: true })

      // Wait a moment for the sidebar to close
      cy.wait(500)

      // Select a tournament (first available option)
      cy.findByRole('combobox', { name: /tournament/i })
        .should('be.visible')
        .select(1) // Select the first tournament option (index 0 is the placeholder)

      // Fill out team information
      cy.findAllByRole('textbox', { name: /club name/i })
        .should('exist')
        .first()
        .type(testTeam.clubName)

      cy.findAllByRole('textbox', { name: /team name/i })
        .should('exist')
        .first()
        .type(testTeam.teamName)

      cy.findAllByRole('textbox', { name: /team class/i })
        .should('exist')
        .first()
        .type(testTeam.teamClass)

      // Fill out team leader information
      cy.findAllByRole('textbox', { name: /team leader name/i })
        .should('exist')
        .first()
        .type(testTeam.teamLeaderName)

      cy.findAllByRole('textbox', { name: /team leader phone/i })
        .should('exist')
        .first()
        .type(testTeam.teamLeaderPhone)

      cy.findAllByRole('textbox', { name: /team leader email/i })
        .should('exist')
        .first()
        .type(testTeam.teamLeaderEmail)

      // Accept privacy agreement
      cy.findByRole('checkbox', { name: /privacy policy/i })
        .should('exist')
        .check()

      // Scroll to ensure the save button is visible and submit the form
      cy.findAllByRole('button', { name: /save/i })
        .should('exist')
        .first()
        .scrollIntoView()
        .should('be.visible')
        .click()

      // After saving, we should be redirected to the team detail page
      cy.url().should('include', `/teams/`)
      cy.url().should('not.include', '/teams/new')

      // Now we can find the delete button on the team detail page
      cy.findByRole('button', { name: /delete/i }).click()

      // After deletion, we should be back at the teams page
      cy.url().should('include', '/teams')
      cy.url().should('not.include', `/teams/`)
      cy.findByRole('link', { name: 'Sidebar button to add a new team' }).should(
        'exist'
      )
    })
  })
})
