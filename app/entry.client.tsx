import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

// Simple conditional logic - avoiding hydration mismatch
const isDevelopment = import.meta.env.DEV
const strictModeDisabled = import.meta.env.VITE_DISABLE_STRICT_MODE === 'true'
const useStrictMode = isDevelopment && !strictModeDisabled

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
