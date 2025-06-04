import '@testing-library/cypress/add-commands'

import { registerCommands } from './commands'

registerCommands()

// Ensure KeyboardEvent is defined for CI environments
if (typeof window !== 'undefined' && typeof window.KeyboardEvent === 'undefined') {
  // @ts-ignore - Simple polyfill for CI environments
  window.KeyboardEvent = Event
}

Cypress.on('uncaught:exception', err => {
  // Cypress and React Hydrating the document don't get along
  // for some unknown reason. Hopefully we figure out why eventually
  // so we can remove this.
  if (
    /hydrat/i.test(err.message) ||
    /Minified React error #418/.test(err.message) ||
    /Minified React error #423/.test(err.message)
  ) {
    return false
  }

  // Handle KeyboardEvent related errors in CI
  if (
    /KeyboardEvent is not defined/i.test(err.message) ||
    /Cannot read property 'KeyboardEvent'/i.test(err.message)
  ) {
    return false
  }
})
