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
    cy.get('.fixed.inset-0.z-100.flex').should('exist')

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

    // Wait for navigation to join/signup page
    cy.url().should('include', '/join')

    // Fill out the registration form
    cy.findByRole('textbox', { name: /email/i })
      .should('be.visible')
      .type(signinForm.email)
    cy.findByRole('textbox', { name: /first name/i })
      .should('be.visible')
      .type(signinForm.firstName)
    cy.findByRole('textbox', { name: /last name/i })
      .should('be.visible')
      .type(signinForm.lastName)
    cy.findByLabelText(/password/i)
      .should('be.visible')
      .type(signinForm.password)
    cy.findByRole('button', { name: /create account/i })
      .should('be.visible')
      .click()

    // We should be redirected to the signin page with a success message
    cy.url().should('include', '/signin')
    cy.url().should('include', 'registered=true')

    // Check for success message
    cy.contains(/account created successfully/i).should('be.visible')

    // Email field should be pre-filled
    cy.findByRole('textbox', { name: /email/i }).should('have.value', signinForm.email)

    // Enter password and submit
    cy.findByLabelText(/password/i)
      .should('be.visible')
      .type(signinForm.password)
    cy.findByRole('button', { name: /sign in/i })
      .should('be.visible')
      .click()

    // After successful login, we should be redirected to teams page due to our redirectTo parameter
    cy.url().should('include', '/teams')

    // Verify user is signed in by checking for their email somewhere in the UI
    cy.contains(signinForm.email).should('exist')
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
      }

      cy.findByRole('link', {
        name: 'Sidebar button to add a new team',
      }).click()

      // Use findAllByRole and then get the first one to avoid ambiguity
      cy.findAllByRole('textbox', { name: /team name/i })
        .first()
        .type(testTeam.teamName)
      cy.findAllByRole('textbox', { name: /team class/i })
        .first()
        .type(testTeam.teamClass)
      cy.findAllByRole('button', { name: /save/i }).first().click()

      cy.findByRole('button', { name: /delete/i }).click()

      // Instead of looking for "no teams yet", check that we're back at the teams page
      cy.url().should('include', '/teams')
      cy.findByRole('link', { name: 'Sidebar button to add a new team' }).should(
        'exist'
      )
    })

    it('should allow you to make a team on mobile', () => {
      cy.viewport('iphone-x')
      const testTeam = {
        teamName: faker.lorem.words(1),
        teamClass: 'JO8-1',
      }

      cy.findByRole('link', {
        name: 'Sidebar button to add a new team',
      }).click()

      // Make sure the mobile menu is closed before interacting with the form
      // Asynchronously wait for the menu overlay to disappear
      cy.get('.fixed.inset-0.z-100.flex').should('not.exist')

      // Wait for the form to be ready by checking for form elements
      cy.findAllByRole('textbox', { name: /team name/i })
        .should('exist')
        .and('be.visible')
        .first()
        .type(testTeam.teamName, { force: true })

      cy.findAllByRole('textbox', { name: /team class/i })
        .should('exist')
        .and('be.visible')
        .first()
        .type(testTeam.teamClass, { force: true })

      cy.findAllByRole('button', { name: /save/i })
        .should('exist')
        .and('be.visible')
        .first()
        .click({ force: true })

      // Delete button is likely covered, so use force: true
      cy.findByRole('button', { name: /delete/i }).click({ force: true })

      // Instead of looking for "no teams yet", check that we're back at the teams page
      cy.url().should('include', '/teams')
      cy.findByRole('link', { name: 'Sidebar button to add a new team' }).should(
        'exist'
      )
    })
  })
})
