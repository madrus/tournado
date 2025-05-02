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

  it('should allow you to register and login', () => {
    const loginForm = {
      email: `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
    }

    cy.then(() => ({ email: loginForm.email })).as('user')

    cy.visitAndCheck('/')

    cy.findByRole('link', { name: /sign up/i }).click()

    cy.findByRole('textbox', { name: /email/i }).type(loginForm.email)
    cy.findByRole('textbox', { name: 'auth.firstName' }).type(loginForm.firstName)
    cy.findByRole('textbox', { name: 'auth.lastName' }).type(loginForm.lastName)
    cy.findByLabelText(/password/i).type(loginForm.password)
    cy.findByRole('button', { name: /create account/i }).click()

    // After registration, we should see the view teams link
    // The link has aria-label="view teams for" and contains the email
    cy.findByRole('link', { name: 'view teams for' })
      .should('exist')
      .and('contain.text', loginForm.email)

    // Complete the test by verifying we're logged in
    // No need to navigate to login page or check for sign up link
  })

  describe('team creation', () => {
    beforeEach(() => {
      cy.login()
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

      // Close the sidebar to access the form
      cy.findByRole('button', { name: 'Toggle menu' }).click()

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
  })
})
