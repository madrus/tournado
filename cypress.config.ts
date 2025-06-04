import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8811',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
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
        screenshotOnRunFailure: !process.env.CI,
        // Add longer timeout for CI environments
        defaultCommandTimeout: process.env.CI ? 10000 : 4000,
        pageLoadTimeout: process.env.CI ? 30000 : 15000,
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
