import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { breakpoints } from '~/utils/breakpoints'
import { debounce, getDocumentHeight, getScrollY } from '~/utils/dom-utils'

import { useIsClient } from './useIsomorphicWindow'

// Constants for scroll direction detection
const DEFAULT_SCROLL_THRESHOLD = 20 // Minimum pixels to trigger direction change
const DEBOUNCE_DELAY = 100 // Milliseconds to debounce resize events

/**
 * Hook to detect scroll direction and control header visibility
 *
 * @param threshold - Minimum scroll distance in pixels to trigger direction change
 * @returns Object containing showHeader boolean state
 */
export function useScrollDirection(threshold = DEFAULT_SCROLL_THRESHOLD): {
  showHeader: boolean
} {
  // Initialize isMobile to false to avoid race condition with SSR
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const isClient = useIsClient()

  // Handle resize and initial mobile check
  useEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    // Set initial state after mount
    checkMobile()

    // Add listener for changes
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  const updateDocumentHeight = useCallback(() => {
    documentHeightRef.current = getDocumentHeight()
  }, [])

  /**
   * Memoized debounced resize handler to avoid excessive recalculations
   * Updates document height when window is resized
   */
  const debouncedUpdateDocumentHeight = useMemo(
    () => debounce(updateDocumentHeight, DEBOUNCE_DELAY),
    [updateDocumentHeight]
  )

  /**
   * Handles scroll events to determine header visibility
   * Only applies scroll-based hiding on mobile devices (under MD breakpoint)
   * Uses requestAnimationFrame for better performance on lower-end devices
   */
  const handleScrollDirection = useCallback(() => {
    // Always show header on desktop/tablet (MD and above)
    if (!isMobile) {
      setShowHeader(true)
      return
    }

    const y = getScrollY()
    const diff = y - lastY.current

    // Simple boundary check - don't process negative scroll positions
    if (y < 0) {
      return
    }

    // Calculate document boundaries only when needed
    const maxScrollY = Math.max(
      0,
      documentHeightRef.current - (window?.innerHeight || 0)
    )

    // If there's not enough content to scroll, always show header
    if (maxScrollY <= 0) {
      setShowHeader(true)
      lastY.current = y
      return
    }

    // More lenient overscroll handling - allow slight overscroll
    if (y > maxScrollY + 50) {
      return
    }

    // Check if movement is significant enough
    const absDiff = Math.abs(diff)
    if (absDiff < threshold) return

    // Update header visibility based on scroll direction
    const shouldShow = diff <= 0 // up = show, down = hide
    setShowHeader(shouldShow)

    // Always update lastY to prevent state getting stuck
    lastY.current = y
  }, [threshold, isMobile])

  /**
   * Throttled scroll handler using requestAnimationFrame
   * Ensures scroll handling runs at optimal frame rate
   */
  const onScroll = useCallback(() => {
    if (rafRef.current) return // Skip if frame already scheduled

    rafRef.current = requestAnimationFrame(() => {
      handleScrollDirection()
      rafRef.current = null
    })
  }, [handleScrollDirection])

  // Initialize document height calculation synchronously to avoid layout shifts
  useLayoutEffect(() => {
    // Initialize document height and scroll position before first paint
    updateDocumentHeight()
    lastY.current = getScrollY()
  }, [updateDocumentHeight])

  useEffect(() => {
    if (!isClient) return

    // Update document height on resize with debouncing for performance
    window.addEventListener('resize', debouncedUpdateDocumentHeight, { passive: true })

    // Use only window scroll listener to avoid redundant calls
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      // Clean up debounced function on unmount
      debouncedUpdateDocumentHeight.cancel()
      window.removeEventListener('resize', debouncedUpdateDocumentHeight)
      window.removeEventListener('scroll', onScroll)

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [debouncedUpdateDocumentHeight, onScroll, isClient])

  return { showHeader }
}
