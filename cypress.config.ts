import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges
      const port = process.env.PORT ?? (isDev ? '3000' : '8811')
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
        screenshotOnRunFailure: !process.env.CI,
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
