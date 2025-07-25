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
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)

  const updateDocumentHeight = useCallback(() => {
    documentHeightRef.current = getDocumentHeight()
  }, [])

  // Memoized debounced resize handler to avoid excessive recalculations
  const debouncedUpdateDocumentHeight = useMemo(
    () => debounce(updateDocumentHeight, 100),
    [updateDocumentHeight]
  )

  const onScroll = useCallback(() => {
    const y = getScrollY()
    const diff = y - lastY.current

    // Prevent overscroll bounce from affecting header visibility
    const maxScrollY = Math.max(
      0,
      documentHeightRef.current - (window?.innerHeight || 0)
    )

    // If there's not enough content to scroll, always show header
    if (maxScrollY <= 0) {
      setShowHeader(true)
      lastY.current = y // Fix: update lastY to prevent drift
      return
    }

    // Ignore scroll events outside valid range (overscroll/bounce)
    // Do NOT update lastY.current with invalid positions to prevent drift
    if (y < 0 || y > maxScrollY) {
      return
    }

    // Cache Math.abs calculation for performance
    const absDiff = Math.abs(diff)
    if (absDiff < threshold) return

    setShowHeader(diff <= 0) // up => show, down => hide

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
