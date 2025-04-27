/* eslint-disable no-console */
/**
 * This script runs the Cypress tests against the mock server.
 * It's used by Fly.io to run the tests in a production environment.
 * The reason to create is that the package.json script runs
 * with an error that the server is already stopped.
 */
import { execSync, spawn } from 'child_process'
import waitOn from 'wait-on'

// Set environment variables
process.env.PORT = '8811'
process.env.CYPRESS_INTERNAL_ENV = 'production'

// Start the mock server
console.log('Starting mock server...')
const server = spawn('pnpm', ['start:mocks'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
})

// Wait for the server to be ready
waitOn({
  resources: ['http://localhost:8811'],
  timeout: 30000,
})
  .then(() => {
    console.log('Server is ready, running Cypress tests...')

    try {
      // Run Cypress tests
      execSync('cypress run --config video=false', {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env },
      })
    } catch (error) {
      console.error('Cypress tests failed:', error.message)
    } finally {
      // Kill the server process
      console.log('Tests completed, shutting down server...')
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${server.pid} /F /T`)
      } else {
        server.kill('SIGINT')
      }
      process.exit(0)
    }
  })
  .catch(error => {
    console.error('Server failed to start:', error.message)
    server.kill('SIGINT')
    process.exit(1)
  })
