import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { debounce, getDocumentHeight, getScrollY } from '~/utils/dom-utils'

// Detect scroll direction globally (works even if the scrollable container is not window)
export function useScrollDirection(threshold = 20): { showHeader: boolean } {
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)

  // Handle resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // Match lg breakpoint
    }

    checkMobile() // Initial check
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const updateDocumentHeight = useCallback(() => {
    documentHeightRef.current = getDocumentHeight()
  }, [])

  // Memoized debounced resize handler to avoid excessive recalculations
  const debouncedUpdateDocumentHeight = useMemo(
    () => debounce(updateDocumentHeight, 100),
    [updateDocumentHeight]
  )

  const onScroll = useCallback(() => {
    if (!isMobile) {
      setShowHeader(true)
      return
    }

    const y = getScrollY()
    const diff = y - lastY.current

    // Calculate document boundaries
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

    // CRITICAL BUG FIX: Ignore overscroll completely to prevent flickering
    if (y < 0 || y > maxScrollY) {
      // Don't update lastY or state during overscroll - this prevents flickering!
      return
    }

    // Check if movement is significant enough
    const absDiff = Math.abs(diff)
    if (absDiff < threshold) return

    // Update header visibility based on scroll direction
    setShowHeader(diff <= 0) // up = show, down = hide

    // Update lastY only with valid positions
    lastY.current = y
  }, [threshold])

  // Initialize document height calculation synchronously to avoid layout shifts
  useLayoutEffect(() => {
    // Initialize document height and scroll position before first paint
    updateDocumentHeight()
    lastY.current = getScrollY()
  }, [updateDocumentHeight])

  useEffect(() => {
    // Update document height on resize with debouncing for performance
    window.addEventListener('resize', debouncedUpdateDocumentHeight, { passive: true })

    // Use only window scroll listener to avoid redundant calls
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      // Clean up debounced function on unmount
      debouncedUpdateDocumentHeight.cancel()
      window.removeEventListener('resize', debouncedUpdateDocumentHeight)
      window.removeEventListener('scroll', onScroll)
    }
  }, [debouncedUpdateDocumentHeight, onScroll])

  return { showHeader }
}
