import { useEffect, useRef, useState } from 'react'

export function useScrollDirection() {
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingUp = currentScrollY < lastScrollY.current

      if (currentScrollY < 100) {
        // Near top - always show
        setShowHeader(true)
      } else if (scrollingUp) {
        // Scrolling up - show header
        setShowHeader(true)
      } else {
        // Scrolling down - hide header
        setShowHeader(false)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { showHeader }
}
