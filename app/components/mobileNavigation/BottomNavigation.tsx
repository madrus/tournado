import { JSX, useEffect, useState } from 'react'

import { useScrollDirection } from '~/hooks/useScrollDirection'
import { ANIMATION_CLASSES } from '~/utils/animationConstants'
import { breakpoints } from '~/utils/breakpoints'
import type { IconName } from '~/utils/iconUtils'

import NavigationItem from './NavigationItem'

function BottomNavigation(): JSX.Element {
  // Detect scroll direction (same hook as AppBar)
  const { showHeader } = useScrollDirection()

  // Track if we're on mobile (under MD breakpoint) for animations
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(breakpoints.showBottomNav())
    }

    // Set initial state
    checkMobile()

    // Listen for changes
    const mediaQuery = window.matchMedia(breakpoints.queries.mobile)
    mediaQuery.addEventListener('change', checkMobile)

    return () => mediaQuery.removeEventListener('change', checkMobile)
  }, [])

  // Define navigation items - can be expanded in the future
  const navigationItems: Array<{ to: string; icon: IconName; label: string }> = [
    { to: '/', icon: 'trophy', label: 'Home' },
    { to: '/teams', icon: 'apparel', label: 'Teams' },
    { to: '/about', icon: 'pending', label: 'More' },
  ]

  return (
    <nav
      className={`fixed right-0 bottom-0 left-0 z-50 flex justify-between bg-emerald-800 p-3 text-white shadow-lg md:hidden ${
        isMobile
          ? showHeader
            ? ANIMATION_CLASSES.BOTTOM_NAV.BOUNCE
            : ANIMATION_CLASSES.BOTTOM_NAV.SLIDE_OUT
          : showHeader
            ? ANIMATION_CLASSES.BOTTOM_NAV.VISIBLE
            : ANIMATION_CLASSES.BOTTOM_NAV.HIDDEN
      }`}
      aria-label='Bottom navigation'
      role='navigation'
      data-testid='bottom-navigation'
    >
      {/* Navigation items spread across full width */}
      <div
        className='flex w-full justify-between px-3'
        data-testid='navigation-items-container'
      >
        {navigationItems.map(item => (
          <NavigationItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
