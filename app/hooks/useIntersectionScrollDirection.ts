/**
 * Alternative scroll direction detection using IntersectionObserver API
 *
 * This approach can be more performant than scroll event listeners
 * as it doesn't fire on every scroll event, only when intersection changes.
 *
 * Note: This is experimental and may not provide the same granular control
 * as the traditional scroll-based approach.
 */
import { useEffect, useRef, useState } from 'react'

import { breakpoints } from '~/utils/breakpoints'

import { useIsClient } from './useIsomorphicWindow'

/**
 * Hook to detect scroll direction using IntersectionObserver
 *
 * Creates sentinel elements at different scroll positions to detect
 * when user scrolls past certain thresholds.
 *
 * @returns Object containing showHeader boolean state
 */
export function useIntersectionScrollDirection(): { showHeader: boolean } {
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const isClient = useIsClient()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Handle mobile detection
  useEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  // Create sentinel element and observer
  useEffect(() => {
    if (!isClient || !isMobile) {
      setShowHeader(true)
      return
    }

    // Create a sentinel element at the top of the page
    const sentinel = document.createElement('div')
    sentinel.style.position = 'absolute'
    sentinel.style.top = '0'
    sentinel.style.left = '0'
    sentinel.style.width = '1px'
    sentinel.style.height = '1px'
    sentinel.style.pointerEvents = 'none'
    sentinel.style.visibility = 'hidden'

    document.body.appendChild(sentinel)
    sentinelRef.current = sentinel

    // Create intersection observer
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // When sentinel goes out of view (user scrolled down past threshold)
          // hide the header. When it comes back into view, show it.
          setShowHeader(entry.isIntersecting)
        })
      },
      {
        root: null, // Use viewport as root
        rootMargin: '-100px 0px 0px 0px', // Trigger when 100px from top
        threshold: [0, 1], // Trigger when fully out/in view
      }
    )

    observer.observe(sentinel)
    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (sentinelRef.current && document.body.contains(sentinelRef.current)) {
        document.body.removeChild(sentinelRef.current)
        sentinelRef.current = null
      }
    }
  }, [isClient, isMobile])

  return { showHeader }
}

/**
 * Enhanced version that uses multiple sentinels for better direction detection
 *
 * This creates sentinels at different positions to better detect scroll direction
 * rather than just presence at a threshold.
 *
 * Performance Considerations:
 * - Creates 4 DOM elements and 4 IntersectionObserver instances
 * - Monitor performance impact on content-heavy pages with many DOM elements
 * - Consider reducing sentinel count or using single-sentinel approach if performance issues arise
 * - IntersectionObserver is generally more performant than scroll events, but multiple instances may offset benefits
 */
export function useEnhancedIntersectionScrollDirection(): { showHeader: boolean } {
  const [showHeader, setShowHeader] = useState<boolean>(true)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const isClient = useIsClient()
  const lastScrollY = useRef<number>(0)
  const lastDirection = useRef<'up' | 'down'>('up')

  useEffect(() => {
    if (!isClient) return

    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isClient])

  useEffect(() => {
    if (!isClient || !isMobile) {
      setShowHeader(true)
      return
    }

    // Create multiple sentinels for direction detection
    const sentinels: HTMLDivElement[] = []
    const observers: IntersectionObserver[] = []

    // Create sentinels at different scroll positions
    const positions = [50, 150, 300, 500] // Different pixel positions

    positions.forEach(position => {
      const sentinel = document.createElement('div')
      sentinel.style.position = 'absolute'
      sentinel.style.top = `${position}px`
      sentinel.style.left = '0'
      sentinel.style.width = '1px'
      sentinel.style.height = '1px'
      sentinel.style.pointerEvents = 'none'
      sentinel.style.visibility = 'hidden'
      sentinel.dataset.position = position.toString()

      document.body.appendChild(sentinel)
      sentinels.push(sentinel)

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) {
              // Sentinel is out of view - determine direction based on intersection ratio history
              const currentScrollY = window.scrollY

              // Compare with last known scroll position for more reliable direction detection
              if (currentScrollY > (lastScrollY.current || 0)) {
                // Scrolling down - hide header
                if (lastDirection.current !== 'down') {
                  lastDirection.current = 'down'
                  setShowHeader(false)
                }
              } else if (currentScrollY < (lastScrollY.current || 0)) {
                // Scrolling up - show header
                if (lastDirection.current !== 'up') {
                  lastDirection.current = 'up'
                  setShowHeader(true)
                }
              }

              lastScrollY.current = currentScrollY
            } else {
              // Sentinel is in view - likely scrolling up
              if (lastDirection.current !== 'up') {
                lastDirection.current = 'up'
                setShowHeader(true)
              }
            }
          })
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: [0, 1],
        }
      )

      observer.observe(sentinel)
      observers.push(observer)
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
      sentinels.forEach(sentinel => {
        if (document.body.contains(sentinel)) {
          document.body.removeChild(sentinel)
        }
      })
    }
  }, [isClient, isMobile])

  return { showHeader }
}
