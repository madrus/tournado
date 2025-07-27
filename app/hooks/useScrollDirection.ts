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
const OVERSCROLL_TOLERANCE = 50 // Max pixels beyond content to allow
const BOUNCE_SAFETY_TIMEOUT = 5000 // Max time to keep bounce state active (ms)

/**
 * Hook to detect scroll direction and control header visibility
 *
 * @param threshold - Minimum scroll distance in pixels to trigger direction change
 * @returns Object containing showHeader boolean state
 */
export function useScrollDirection(threshold = DEFAULT_SCROLL_THRESHOLD): {
  showHeader: boolean
} {
  const isClient = useIsClient()

  // Initialize isMobile to false to avoid hydration mismatches
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)
  const windowHeightRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const lastTouchY = useRef<number | null>(null)
  const isTouching = useRef<boolean>(false)
  const isBouncingBottom = useRef<boolean>(false)
  const bounceTimeoutRef = useRef<number | null>(null)
  const isMountedRef = useRef<boolean>(true)

  // Synchronous mobile detection to minimize flash
  useLayoutEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    // Set initial state synchronously before paint
    checkMobile()

    // Add listener for changes
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  const updateDocumentHeight = useCallback(() => {
    if (isMountedRef.current) {
      documentHeightRef.current = getDocumentHeight()
      windowHeightRef.current = window?.innerHeight || 0
    }
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

    // Use cached document and window heights for performance
    const maxScrollY = Math.max(0, documentHeightRef.current - windowHeightRef.current)

    // If there's not enough content to scroll, always show header
    if (maxScrollY <= 0) {
      setShowHeader(true)
      lastY.current = y
      return
    }

    // If we're bouncing at the bottom, ignore scroll direction changes
    if (isBouncingBottom.current) {
      lastY.current = y
      return
    }

    // More lenient overscroll handling - allow slight overscroll
    if (y > maxScrollY + OVERSCROLL_TOLERANCE) {
      lastY.current = y
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

  // Touch event handlers for bounce detection
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 0) return

    isTouching.current = true
    lastTouchY.current = event.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isMobile || lastTouchY.current === null || event.touches.length === 0) return

      const currentY = event.touches[0].clientY
      const deltaY = currentY - lastTouchY.current
      lastTouchY.current = currentY

      const y = getScrollY()
      const maxScrollY = Math.max(
        0,
        documentHeightRef.current - windowHeightRef.current
      )

      // At bottom and dragging up (deltaY < 0 means dragging up)
      if (y >= maxScrollY - 5 && deltaY < 0) {
        isBouncingBottom.current = true

        // Clear any existing timeout
        if (bounceTimeoutRef.current) {
          clearTimeout(bounceTimeoutRef.current)
        }

        // Set safety timeout to prevent stuck bounce state
        bounceTimeoutRef.current = window.setTimeout(() => {
          isBouncingBottom.current = false
          bounceTimeoutRef.current = null
        }, BOUNCE_SAFETY_TIMEOUT)
      } else {
        isBouncingBottom.current = false

        // Clear timeout when not bouncing
        if (bounceTimeoutRef.current) {
          clearTimeout(bounceTimeoutRef.current)
          bounceTimeoutRef.current = null
        }
      }
    },
    [isMobile]
  )

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false
    lastTouchY.current = null
    isBouncingBottom.current = false

    // Clear bounce timeout on touch end
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current)
      bounceTimeoutRef.current = null
    }
  }, [])

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

    // Add touch event listeners for bounce detection
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      // Mark component as unmounted to prevent memory leaks
      isMountedRef.current = false

      // Clean up debounced function on unmount
      debouncedUpdateDocumentHeight.cancel()
      window.removeEventListener('resize', debouncedUpdateDocumentHeight)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      // Clear bounce timeout
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current)
        bounceTimeoutRef.current = null
      }
    }
  }, [
    debouncedUpdateDocumentHeight,
    onScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isClient,
  ])

  return { showHeader }
}
