import { useEffect, useRef, useState } from 'react'

// Detect scroll direction globally (works even if the scrollable container is not window)
export function useScrollDirection(threshold = 20): { showHeader: boolean } {
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const lastY = useRef(0)

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

    const onScroll = () => {
      const y = getScrollY()
      const diff = y - lastY.current

      // Prevent overscroll bounce from affecting header visibility
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
      const maxScrollY = documentHeight - window.innerHeight

      // Ignore scroll events outside valid range (overscroll/bounce)
      if (y < 0 || y > maxScrollY) return

      if (Math.abs(diff) < threshold) return

      setShowHeader(diff <= 0) // up => show, down => hide

      lastY.current = y
    }

    // Initialize lastY to current scroll position on mount
    lastY.current = getScrollY()

    // Listen on both window and document to capture most scroll situations
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [threshold])

  return { showHeader }
}
