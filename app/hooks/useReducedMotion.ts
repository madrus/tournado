/**
 * Hook to detect user's preference for reduced motion
 *
 * Respects the prefers-reduced-motion CSS media query for accessibility.
 * Users with vestibular disorders may prefer reduced motion to avoid discomfort.
 */
import { useEffect, useState } from 'react'

/**
 * Hook to check if user prefers reduced motion
 *
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to get appropriate animation class based on motion preferences
 *
 * @param regularClass - Class to use when animations are enabled
 * @param reducedClass - Class to use when reduced motion is preferred
 * @returns appropriate CSS class based on user preference
 */
export function useMotionSafeClass(regularClass: string, reducedClass: string): string {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ? reducedClass : regularClass
}
