import { faker } from '@faker-js/faker'

describe('Navigation', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    // Force test language for tests
    cy.window().then(win => {
      win.localStorage.setItem('i18nextLng', 'test')
      win.location.reload()
    })
  })

  afterEach(() => {
    cy.cleanupUser({ failOnNonZeroExit: false })
  })

  describe('Bottom Navigation', () => {
    beforeEach(() => {
      const userEmail = `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`
      cy.then(() => ({ email: userEmail })).as('user')

      // Create user and sign in for navigation tests
      cy.exec(`pnpm exec tsx ./cypress/support/create-user.ts "${userEmail}"`)
      cy.signin({ email: userEmail })
    })

    it('should allow navigation via bottom navigation', () => {
      // Start from homepage
      cy.visitAndCheck('/')

      // Strategy 1: PREFERRED - Using semantic selector with accessible name
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        cy.findByRole('link', { name: /navigate to teams/i }).click()
      })

      // Should navigate to teams page
      cy.url().should('include', '/teams')
      cy.findByRole('link', { name: /add team/i }).should('exist')

      // Test navigation back to home using different strategies
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        // Strategy 2: By exact label text
        cy.findByRole('link', { name: /navigate to home/i }).click()
      })

      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Strategy 3: Test the "More" navigation
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        cy.findByRole('link', { name: /navigate to more/i }).click()
      })

      cy.url().should('include', '/about')
    })

    // Additional test demonstrating all targeting strategies
    it('should distinguish between navigation items using different strategies', () => {
      cy.visitAndCheck('/')

      // STRATEGY 1: By accessible name (BEST PRACTICE)
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        // Test each navigation item by accessible name
        cy.findByRole('link', { name: /navigate to home/i }).should('exist')
        cy.findByRole('link', { name: /navigate to teams/i }).should('exist')
        cy.findByRole('link', { name: /navigate to more/i }).should('exist')
      })

      // STRATEGY 2: By data-cy attribute (FALLBACK)
      cy.dataCy('bottom-navigation').within(() => {
        cy.dataCy('nav-home').should('exist')
        cy.dataCy('nav-teams').should('exist')
        cy.dataCy('nav-more').should('exist')
      })

      // STRATEGY 3: By href attribute (URL-based)
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        cy.get('a[href="/"]').should('exist') // Home
        cy.get('a[href="/teams"]').should('exist') // Teams
        cy.get('a[href="/about"]').should('exist') // More/About
      })

      // STRATEGY 4: By visible text content
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        cy.contains('Home').should('exist')
        cy.contains('Teams').should('exist')
        cy.contains('More').should('exist')
      })

      // STRATEGY 5: Combined approach - most robust
      cy.findByRole('navigation', { name: /bottom navigation/i }).within(() => {
        // Click Teams using the most reliable selector
        cy.findByRole('link', { name: /navigate to teams/i })
          .should('have.attr', 'href', '/teams')
          .click()
      })

      cy.url().should('include', '/teams')
    })

    // Test using custom commands (cleanest approach)
    it('should navigate using custom commands', () => {
      cy.visitAndCheck('/')

      // Test all navigation items using custom commands
      cy.clickBottomNav('teams')
      cy.url().should('include', '/teams')

      cy.clickBottomNav('home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.clickBottomNav('more')
      cy.url().should('include', '/about')

      // Test that bottom navigation is visible
      cy.getBottomNav().should('be.visible')
    })

    it('should show navigation items are functional', () => {
      // Test that navigation works correctly - this is what users care about
      cy.visitAndCheck('/')

      // Verify all navigation items are present and functional
      cy.getBottomNav().within(() => {
        // Test that each navigation item exists and is clickable
        cy.dataCy('nav-home').should('be.visible')
        cy.dataCy('nav-teams').should('be.visible')
        cy.dataCy('nav-more').should('be.visible')
      })

      // Test navigation functionality (user behavior)
      cy.clickBottomNav('teams')
      cy.url().should('include', '/teams')

      cy.clickBottomNav('home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      cy.clickBottomNav('more')
      cy.url().should('include', '/about')

      // This is what matters - can users navigate successfully?
    })
  })

  describe('Homepage Navigation', () => {
    beforeEach(() => {
      const userEmail = `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`
      cy.then(() => ({ email: userEmail })).as('user')

      cy.exec(`pnpm exec tsx ./cypress/support/create-user.ts "${userEmail}"`)
      cy.signin({ email: userEmail })
    })

    it('should navigate via homepage view teams button', () => {
      cy.visitAndCheck('/')

      // Use the homepage "view teams" button
      cy.findByRole('link', { name: /view teams/i }).click()

      cy.url().should('include', '/teams')
      cy.findByRole('link', { name: /add team/i }).should('exist')
    })
  })

  describe('Responsive Navigation', () => {
    it('should hide bottom navigation on desktop', () => {
      const userEmail = `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`
      cy.then(() => ({ email: userEmail })).as('user')

      cy.exec(`pnpm exec tsx ./cypress/support/create-user.ts "${userEmail}"`)
      cy.signin({ email: userEmail })

      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.visitAndCheck('/')

      // Bottom navigation should be hidden on desktop (has md:hidden class)
      cy.dataCy('bottom-navigation').should('not.be.visible')
    })

    it('should show bottom navigation on mobile', () => {
      const userEmail = `${faker.person.firstName().toLowerCase()}${faker.person.lastName().toLowerCase()}@example.com`
      cy.then(() => ({ email: userEmail })).as('user')

      cy.exec(`pnpm exec tsx ./cypress/support/create-user.ts "${userEmail}"`)
      cy.signin({ email: userEmail })

      // Test mobile viewport
      cy.viewport('iphone-x')
      cy.visitAndCheck('/')

      // Bottom navigation should be visible on mobile
      cy.dataCy('bottom-navigation').should('be.visible')
    })
  })
})
