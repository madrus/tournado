import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8811',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.spec.{js,jsx,ts,tsx}',
    env: {
      NODE_ENV: 'test',
      LANG: 'en',
    },
    // Add better retry configuration for CI
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges
      const port = process.env.PORT ?? (isDev ? '3000' : '8811')
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        // Reduce timeouts for faster local development
        defaultCommandTimeout: process.env.CI ? 10000 : 3000,
        pageLoadTimeout: process.env.CI ? 30000 : 10000,
        // Add performance optimizations
        video: false, // Disable video recording for faster tests
        screenshotOnRunFailure: process.env.CI ? true : false, // Only enable screenshots in CI
      }

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      on('task', {
        log: message => {
          console.log(message)
          return null
        },
      })

      // Completely disable server management in Cypress
      process.env.CYPRESS_INTERNAL_ENV = 'production'

      return { ...config, ...configOverrides }
    },
  },
})
