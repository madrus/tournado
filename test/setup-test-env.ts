/* eslint-disable id-blacklist */
/* eslint-disable no-console */
import '@testing-library/jest-dom/vitest'

import { afterEach, beforeEach, vi } from 'vitest'

// React Router 7 doesn't need installGlobals
// The globals are automatically installed when using react-router

// Custom console handling during tests to show clean error messages
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Custom console.error that shows clean error messages without stack traces
  console.error = vi.fn((...args) => {
    // Check if this is an Error object or route error
    const firstArg = args[0]

    if (firstArg instanceof Error) {
      // For Error objects, just show the message
      originalConsoleError(`[Test Error Caught]: ${firstArg.message}`)
    } else if (
      typeof firstArg === 'object' &&
      firstArg !== null &&
      'status' in firstArg
    ) {
      // For route errors, show status and statusText
      const { status, statusText, data } = firstArg
      const errorInfo = data
        ? `${status} ${statusText} - ${data}`
        : `${status} ${statusText}`
      originalConsoleError(`[Route Error Caught]: ${errorInfo}`)
    } else {
      // For other cases, show the first argument only
      originalConsoleError(`[Console Error]: ${String(firstArg)}`)
    }
  })

  // Keep warnings suppressed to reduce noise
  console.warn = vi.fn()
})

afterEach(() => {
  // Restore original console functions after each test
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})
