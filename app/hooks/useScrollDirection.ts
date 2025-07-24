import { useEffect, useRef, useState } from 'react'

// Detect scroll direction globally (works even if the scrollable container is not window)
export function useScrollDirection(threshold = 20): { showHeader: boolean } {
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const lastY = useRef<number>(0)
  const documentHeightRef = useRef<number>(0)

  useEffect(() => {
    const getScrollY = () => {
      if (typeof window === 'undefined') return 0
      return (
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      )
    }

    const updateDocumentHeight = () => {
      if (typeof window === 'undefined') return
      const height = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
      documentHeightRef.current = height
    }

    const onScroll = () => {
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
        return
      }

      // Ignore scroll events outside valid range (overscroll/bounce)
      if (y < 0 || y > maxScrollY) return

      if (Math.abs(diff) < threshold) return

      setShowHeader(diff <= 0) // up => show, down => hide

      lastY.current = y
    }

    // Initialize document height and scroll position
    updateDocumentHeight()
    lastY.current = getScrollY()

    // Update document height on resize
    window.addEventListener('resize', updateDocumentHeight, { passive: true })

    // Use only window scroll listener to avoid redundant calls
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', updateDocumentHeight)
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  return { showHeader }
}
