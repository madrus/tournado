import { faker } from '@faker-js/faker'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof signin}
       * @memberof Chainable
       * @example
       *    cy.signin()
       * @example
       *    cy.signin({ email: 'whatever@example.com' })
       */
      signin: typeof signin

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       * @example
       *    cy.cleanupUser({ failOnNonZeroExit: false })
       */
      cleanupUser: typeof cleanupUser

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck

      /**
       * Get element by data-cy attribute
       *
       * @returns {typeof dataCy}
       * @memberof Chainable
       * @example
       *    cy.dataCy('bottom-navigation')
       * @example
       *    cy.dataCy('submit-button').click()
       */
      dataCy: typeof dataCy

      /**
       * Click a specific bottom navigation item
       *
       * @returns {typeof clickBottomNav}
       * @memberof Chainable
       * @example
       *    cy.clickBottomNav('home')
       * @example
       *    cy.clickBottomNav('teams')
       * @example
       *    cy.clickBottomNav('more')
       */
      clickBottomNav: typeof clickBottomNav

      /**
       * Get the bottom navigation container
       *
       * @returns {typeof getBottomNav}
       * @memberof Chainable
       * @example
       *    cy.getBottomNav().should('be.visible')
       */
      getBottomNav: typeof getBottomNav
    }
  }
}

function signin({
  email = faker.internet.email({ provider: 'example.com' }),
}: {
  email?: string
} = {}) {
  cy.then(() => ({ email })).as('user')
  cy.exec(`pnpm exec tsx ./cypress/support/create-user.ts "${email}"`).then(
    ({ stdout }) => {
      const cookieValue = stdout
        .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, '$<cookieValue>')
        .trim()
      cy.setCookie('__session', cookieValue)
    }
  )
  return cy.get('@user')
}

function cleanupUser({
  email,
  failOnNonZeroExit,
}: { email?: string; failOnNonZeroExit?: boolean } = {}) {
  if (email) {
    deleteUserByEmail(email, failOnNonZeroExit)
  } else {
    cy.get('@user').then(user => {
      const email = (user as { email?: string }).email
      if (email) {
        deleteUserByEmail(email, failOnNonZeroExit)
      }
    })
  }
  cy.clearCookie('__session')
}

function deleteUserByEmail(email: string, failOnNonZeroExit = true) {
  cy.exec(`pnpm exec tsx ./cypress/support/delete-user.ts "${email}"`, {
    failOnNonZeroExit,
  })
  cy.clearCookie('__session')
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime = 1000) {
  cy.visit(url)
  cy.location('pathname').should('contain', url).wait(waitTime)
}

/**
 * Custom command to select elements by data-cy attribute
 * This provides a clean API for Cypress-specific test selectors
 */
function dataCy(value: string) {
  return cy.get(`[data-cy="${value}"]`)
}

/**
 * Get the bottom navigation container using semantic selector
 */
function getBottomNav() {
  return cy.findByRole('navigation', { name: /bottom navigation/i })
}

/**
 * Click a specific bottom navigation item by name
 * Uses semantic selectors for best accessibility testing
 */
function clickBottomNav(navItem: 'home' | 'teams' | 'more') {
  return getBottomNav().within(() => {
    cy.findByRole('link', { name: new RegExp(`navigate to ${navItem}`, 'i') }).click()
  })
}

export const registerCommands = () => {
  Cypress.Commands.add('signin', signin)
  Cypress.Commands.add('cleanupUser', cleanupUser)
  Cypress.Commands.add('visitAndCheck', visitAndCheck)
  Cypress.Commands.add('dataCy', dataCy)
  Cypress.Commands.add('getBottomNav', getBottomNav)
  Cypress.Commands.add('clickBottomNav', clickBottomNav)
}
