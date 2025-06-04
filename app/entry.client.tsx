import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

// Simple conditional logic - avoiding hydration mismatch
const isDevelopment = import.meta.env.DEV
const strictModeDisabled = import.meta.env.VITE_DISABLE_STRICT_MODE === 'true'
const useStrictMode = isDevelopment && !strictModeDisabled

// Suppress hydration warnings for known browser extension attributes
if (isDevelopment) {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error
  // eslint-disable-next-line no-console
  console.error = (...args) => {
    const message = args[0]
    if (
      typeof message === 'string' &&
      (message.includes('cz-shortcut-listen') ||
        message.includes('data-new-gr-c-s-check-loaded') ||
        message.includes('data-gr-ext-installed') ||
        message.includes('browser extension'))
    ) {
      // Suppress hydration warnings caused by browser extensions
      return
    }
    originalConsoleError.apply(console, args)
  }
}

startTransition(() => {
  hydrateRoot(
    document,
    useStrictMode ? (
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    ) : (
      <HydratedRouter />
    )
  )
})
