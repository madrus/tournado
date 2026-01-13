/**
 * Custom hook for consistent window access patterns with SSR safety
 *
 * Provides a standardized way to check for window availability and access
 * window properties safely across server and client environments.
 */
import { useEffect, useState } from 'react'

/**
 * Hook to safely check if we're in a browser environment
 *
 * @returns boolean indicating if window is available
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely access window with SSR protection
 *
 * @returns window object or null if not available
 */
export function useSafeWindow(): Window | null {
  const isClient = useIsClient()
  return isClient ? window : null
}

/**
 * Hook to safely get window dimensions with SSR protection
 *
 * @returns object with width and height, or null dimensions on server
 */
export function useWindowDimensions(): {
  width: number | null
  height: number | null
} {
  const [dimensions, setDimensions] = useState<{
    width: number | null
    height: number | null
  }>({
    width: null,
    height: null,
  })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial dimensions
    updateDimensions()

    // Listen for changes
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return dimensions
}

/**
 * Utility function to safely execute window-dependent code
 *
 * @param handler - callback function to execute if window is available
 * @returns result of callback or null if window unavailable
 */
export function withWindow<T>(handler: (window: Window) => T): T | null {
  if (typeof window === 'undefined') return null
  return handler(window)
}
