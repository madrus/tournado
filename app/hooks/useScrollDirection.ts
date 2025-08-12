import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { breakpoints } from '~/utils/breakpoints'
import { debounce, getDocumentHeight, getScrollY } from '~/utils/domUtils'

import { useBounceDetection } from './useBounceDetection'
import { useIsClient } from './useIsomorphicWindow'

// Constants for scroll direction detection
const DEFAULT_SCROLL_THRESHOLD = 20 // Minimum pixels to trigger direction change
const SHOW_THRESHOLD = 10 // Lower threshold for showing header (more sensitive)
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
  const isClient = useIsClient()

  // Initialize isMobile to false to avoid hydration mismatches
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)
  const windowHeightRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const [isIOS, setIsIOS] = useState<boolean>(false)
  const lastDirectionChangeRef = useRef<number>(0)

  // Initialize bounce detection hook
  const bounceDetection = useBounceDetection(
    isIOS,
    isMobile,
    documentHeightRef,
    windowHeightRef
  )

  // Synchronous mobile detection to minimize flash
  useLayoutEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
      // Detect iOS for bounce behavior handling
      // Note: User agent detection can be unreliable due to spoofing
      // Fallback: iOS devices typically have touch support and webkit
      const hasIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const hasWebkitTouch =
        'ontouchstart' in window && /webkit/i.test(navigator.userAgent)
      const hasMacOSUserAgent =
        /Macintosh/.test(navigator.userAgent) && 'ontouchstart' in window

      setIsIOS(
        hasIOSUserAgent ||
          hasMacOSUserAgent ||
          (hasWebkitTouch && breakpoints.isMobile())
      )
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
    const now = Date.now()

    // Simple boundary check - don't process negative scroll positions
    if (y < 0) {
      return
    }

    // Use cached heights for performance; on iOS recalc to account for toolbar resize
    const maxScrollY = isIOS
      ? Math.max(0, getDocumentHeight() - (window?.innerHeight || 0))
      : Math.max(0, documentHeightRef.current - windowHeightRef.current)

    // If there's not enough content to scroll, always show header
    if (maxScrollY <= 0) {
      setShowHeader(true)
      lastY.current = y
      return
    }

    // Check if movement is significant enough
    const absDiff = Math.abs(diff)
    const currentlyVisible = showHeader

    // Detect unrealistic scroll jumps (likely browser overscroll behavior)
    const isNearBottom = y >= maxScrollY - 50
    const isUnrealisticJump = absDiff > 50 // More than 50px in one frame

    if (isNearBottom && isUnrealisticJump) {
      lastY.current = y
      return
    }

    // At exact bottom, prevent all state changes to avoid flicker
    const isAtExactBottom = y >= maxScrollY - 60
    if (isAtExactBottom) {
      // When near bottom, maintain current state to prevent bounce-induced flicker
      // Only allow bars to hide (not show) when bouncing near bottom
      if (showHeader && diff > 0) {
        // Allow hiding when scrolling down near bottom
        setShowHeader(false)
      }
      // Prevent showing bars when bouncing near bottom
      lastY.current = y
      return
    }

    // Use different thresholds for hiding vs showing
    const activeThreshold = currentlyVisible && diff > 0 ? threshold : SHOW_THRESHOLD
    if (absDiff < activeThreshold) return

    // Update header visibility based on scroll direction
    const shouldShow = diff <= 0 // up = show, down = hide

    // iOS-specific: Light anti-flicker throttling
    if (isIOS && isMobile && shouldShow !== showHeader) {
      const timeSinceLastChange = now - lastDirectionChangeRef.current

      // Only throttle if changes are happening too rapidly (< 100ms apart)
      if (timeSinceLastChange < 100) {
        lastY.current = y
        return
      }

      lastDirectionChangeRef.current = now
    }

    setShowHeader(shouldShow)

    // Always update lastY to prevent state getting stuck
    lastY.current = y
  }, [
    isMobile,
    setShowHeader,
    bounceDetection.isBouncingBottom,
    bounceDetection.resetBounceState,
    threshold,
    isIOS,
    showHeader,
  ])

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

    // Add touch event listeners for bounce detection
    window.addEventListener('touchstart', bounceDetection.handleTouchStart, {
      passive: true,
    })
    window.addEventListener('touchmove', bounceDetection.handleTouchMove, {
      passive: true,
    })
    window.addEventListener('touchend', bounceDetection.handleTouchEnd, {
      passive: true,
    })

    // Add listeners to reset bounce state when interaction is interrupted
    document.addEventListener(
      'visibilitychange',
      bounceDetection.handleVisibilityChange,
      {
        passive: true,
      }
    )
    window.addEventListener('blur', bounceDetection.resetBounceState, { passive: true })

    return () => {
      // Mark component as unmounted to prevent memory leaks
      isMountedRef.current = false

      // Clean up debounced function on unmount
      debouncedUpdateDocumentHeight.cancel()
      window.removeEventListener('resize', debouncedUpdateDocumentHeight)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', bounceDetection.handleTouchStart)
      window.removeEventListener('touchmove', bounceDetection.handleTouchMove)
      window.removeEventListener('touchend', bounceDetection.handleTouchEnd)
      document.removeEventListener(
        'visibilitychange',
        bounceDetection.handleVisibilityChange
      )
      window.removeEventListener('blur', bounceDetection.resetBounceState)

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      // Clear bounce timeouts
      bounceDetection.cleanup()
    }
  }, [
    debouncedUpdateDocumentHeight,
    onScroll,
    bounceDetection.handleTouchStart,
    bounceDetection.handleTouchMove,
    bounceDetection.handleTouchEnd,
    bounceDetection.handleVisibilityChange,
    bounceDetection.resetBounceState,
    bounceDetection.cleanup,
    isClient,
  ])

  return { showHeader }
}
