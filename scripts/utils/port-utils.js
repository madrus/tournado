/**
 * Port detection utilities for E2E testing
 */
import { createConnection } from 'net'

/**
 * Check if a port is in use
 * @param {number} port - Port number to check
 * @param {string} host - Host to check (default: localhost)
 * @returns {Promise<boolean>} - True if port is in use, false otherwise
 */
export function isPortInUse(port, host = 'localhost') {
  return new Promise(resolve => {
    const socket = createConnection({ port, host }, () => {
      socket.end()
      resolve(true)
    })

    socket.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * Check if a server is responding on the specified URL
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} - True if server responds, false otherwise
 */
export async function isServerResponding(url, timeout = 5000) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      signal: controller.signal,
      method: 'HEAD',
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Check if a server is a test server by checking for test-specific indicators
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} - True if server appears to be a test server
 */
export async function isTestServer(url, timeout = 5000) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Check for test-specific headers or content
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'x-test-check': 'true',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return false
    }

    // Check for test-specific indicators in response headers
    const playwrightHeader = response.headers.get('x-playwright-test')
    const testEnvHeader = response.headers.get('x-test-env')

    // Check if this is a test environment based on headers or content
    if (playwrightHeader === 'true' || testEnvHeader === 'true') {
      return true
    }

    // As a fallback, check if the page content indicates test environment
    const html = await response.text()

    // Look for test database indicators in the HTML
    const hasTestIndicators =
      html.includes('data-test.db') ||
      html.includes('PLAYWRIGHT') ||
      html.includes('test-environment') ||
      html.includes('firebase-mock')

    return hasTestIndicators
  } catch (error) {
    return false
  }
}

/**
 * Check if the development server is running and responding
 * @param {number} port - Port to check (default: 5174)
 * @returns {Promise<{port: number, isRunning: boolean, isResponding: boolean, isTestServer: boolean, url: string}>}
 */
export async function checkDevServer(port = 5174) {
  const url = `http://localhost:${port}`

  const isRunning = await isPortInUse(port)
  const isResponding = isRunning ? await isServerResponding(url) : false
  const isTest = isResponding ? await isTestServer(url) : false

  return {
    port,
    isRunning,
    isResponding,
    isTestServer: isTest,
    url,
  }
}
