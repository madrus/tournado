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

import { useIsClient } from './useIsomorphicWindow'

// Constants for scroll direction detection
const DEFAULT_SCROLL_THRESHOLD = 20 // Minimum pixels to trigger direction change
const SHOW_THRESHOLD = 10 // Lower threshold for showing header (more sensitive)
const DEBOUNCE_DELAY = 100 // Milliseconds to debounce resize events
const OVERSCROLL_TOLERANCE = 50 // Max pixels beyond content to allow
const BOUNCE_SAFETY_TIMEOUT = 800 // Max time to keep bounce state active (ms)
const BOUNCE_VELOCITY_THRESHOLD = 15 // Minimum velocity for intentional bounce
const BOUNCE_DRAG_THRESHOLD = 30 // Minimum drag distance for bounce detection

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
  const touchStartY = useRef<number | null>(null)
  const touchVelocity = useRef<number>(0)
  const lastTouchTime = useRef<number>(0)
  const isTouching = useRef<boolean>(false)
  const isBouncingBottom = useRef<boolean>(false)
  const bounceTimeoutRef = useRef<number | null>(null)
  const bounceSettleTimeoutRef = useRef<number | null>(null)
  const isMountedRef = useRef<boolean>(true)
  const isIOS = useRef<boolean>(false)

  // Synchronous mobile detection to minimize flash
  useLayoutEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
      // Detect iOS for bounce behavior handling
      isIOS.current = /iPad|iPhone|iPod/.test(navigator.userAgent)
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
    const currentlyVisible = showHeader

    // Use different thresholds for hiding vs showing
    const activeThreshold = currentlyVisible && diff > 0 ? threshold : SHOW_THRESHOLD
    if (absDiff < activeThreshold) return

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
  // Shared function to reset bounce state
  const resetBounceState = useCallback(() => {
    isBouncingBottom.current = false
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current)
      bounceTimeoutRef.current = null
    }
    if (bounceSettleTimeoutRef.current) {
      clearTimeout(bounceSettleTimeoutRef.current)
      bounceSettleTimeoutRef.current = null
    }
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 0) return

    isTouching.current = true
    lastTouchY.current = event.touches[0].clientY
    touchStartY.current = event.touches[0].clientY
    touchVelocity.current = 0
    lastTouchTime.current = Date.now()
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isMobile || lastTouchY.current === null || event.touches.length === 0) return

      const currentY = event.touches[0].clientY
      const deltaY = currentY - lastTouchY.current
      const currentTime = Date.now()
      const timeDiff = currentTime - lastTouchTime.current

      // Calculate velocity (pixels per millisecond)
      if (timeDiff > 0) {
        touchVelocity.current = Math.abs(deltaY) / timeDiff
      }

      lastTouchY.current = currentY
      lastTouchTime.current = currentTime

      const y = getScrollY()
      const maxScrollY = Math.max(
        0,
        documentHeightRef.current - windowHeightRef.current
      )

      // Only trigger bounce on iOS with specific conditions
      if (isIOS.current && y >= maxScrollY - 5 && deltaY < 0) {
        const totalDragDistance = Math.abs((touchStartY.current || currentY) - currentY)
        const hasHighVelocity = touchVelocity.current > BOUNCE_VELOCITY_THRESHOLD
        const hasSufficientDrag = totalDragDistance > BOUNCE_DRAG_THRESHOLD

        // Only consider it a bounce if it's a deliberate, sustained drag
        if (hasHighVelocity && hasSufficientDrag) {
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
        }
      } else if (!isIOS.current) {
        // For non-iOS devices, reset bounce state more aggressively
        resetBounceState()
      }
    },
    [isMobile, resetBounceState]
  )

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false
    lastTouchY.current = null
    touchStartY.current = null
    touchVelocity.current = 0

    // On iOS, don't immediately reset bounce state as momentum scrolling continues
    // Instead, wait for scroll momentum to settle
    if (isIOS.current && isBouncingBottom.current) {
      // Give iOS momentum scrolling time to settle
      bounceSettleTimeoutRef.current = window.setTimeout(() => {
        // Check if we're still at the bottom after momentum settles
        const y = getScrollY()
        const maxScrollY = Math.max(
          0,
          documentHeightRef.current - windowHeightRef.current
        )

        // Only reset if we're no longer at the bottom
        if (y < maxScrollY - 10) {
          resetBounceState()
        }
      }, 300) // Wait 300ms for momentum to settle
    } else {
      // For non-iOS or non-bouncing states, reset immediately
      resetBounceState()
    }
  }, [resetBounceState])

  // Reset bounce state when page loses focus to prevent stuck state
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      resetBounceState()
    }
  }, [resetBounceState])

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

    // Add listeners to reset bounce state when interaction is interrupted
    document.addEventListener('visibilitychange', handleVisibilityChange, {
      passive: true,
    })
    window.addEventListener('blur', resetBounceState, { passive: true })

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
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', resetBounceState)

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      // Clear bounce timeouts
      if (bounceTimeoutRef.current) {
        clearTimeout(bounceTimeoutRef.current)
        bounceTimeoutRef.current = null
      }
      if (bounceSettleTimeoutRef.current) {
        clearTimeout(bounceSettleTimeoutRef.current)
        bounceSettleTimeoutRef.current = null
      }
    }
  }, [
    debouncedUpdateDocumentHeight,
    onScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleVisibilityChange,
    resetBounceState,
    isClient,
  ])

  return { showHeader }
}
