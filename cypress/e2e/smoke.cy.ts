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
      password: faker.internet.password(),
    }

    cy.then(() => ({ email: loginForm.email })).as('user')

    cy.visitAndCheck('/')

    cy.findByRole('link', { name: /sign up/i }).click()

    cy.findByRole('textbox', { name: /email/i }).type(loginForm.email)
    cy.findByLabelText(/password/i).type(loginForm.password)
    cy.findByRole('button', { name: /create account/i }).click()

    cy.findByRole('link', { name: /teams/i }).click()
    cy.findByRole('button', { name: /logout/i }).click()
    cy.findByRole('link', { name: /log in/i })
  })

  describe('team creation', () => {
    beforeEach(() => {
      cy.login()
      cy.visitAndCheck('/')
      cy.findByRole('link', { name: /teams/i }).click()
      cy.findByText(/no teams yet/i)
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

      cy.findByRole('textbox', { name: /team name/i }).type(testTeam.teamName)
      cy.findByRole('textbox', { name: /team class/i }).type(testTeam.teamClass)
      cy.findByRole('button', { name: /save/i }).click()

      cy.findByRole('button', { name: /delete/i }).click()
      cy.findByText(/no teams yet/i)
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

      cy.findByRole('textbox', { name: /team name/i }).type(testTeam.teamName)
      cy.findByRole('textbox', { name: /team class/i }).type(testTeam.teamClass)
      cy.findByRole('button', { name: /save/i }).click()

      cy.findByRole('button', { name: /delete/i }).click()
      cy.findByText(/no teams yet/i)
    })
  })
})
