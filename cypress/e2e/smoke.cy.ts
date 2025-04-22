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

    cy.findByRole('link', { name: /notes/i }).click()
    cy.findByRole('button', { name: /logout/i }).click()
    cy.findByRole('link', { name: /log in/i })
  })

  it('should allow you to make a note', () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    }
    cy.login()

    cy.visitAndCheck('/')

    cy.findByRole('link', { name: /notes/i }).click()
    cy.findByText(/no notes yet/i)

    cy.findByRole('link', { name: /create note/i }).click()

    cy.findByRole('textbox', { name: /title/i }).type(testNote.title)
    cy.findByRole('textbox', { name: /body/i }).type(testNote.body)
    cy.findByRole('button', { name: /save/i }).click()

    cy.findByRole('button', { name: /delete/i }).click()

    cy.findByText(/no notes yet/i)
  })
})
