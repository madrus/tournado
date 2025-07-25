import { JSX, useEffect } from 'react'

import { useScrollDirection } from '~/hooks/useScrollDirection'
import type { IconName } from '~/utils/iconUtils'

import NavigationItem from './NavigationItem'

function BottomNavigation(): JSX.Element {
  // Detect scroll direction (same hook as AppBar)
  const { showHeader } = useScrollDirection()

  // Inject bounce keyframes once
  useEffect(() => {
    const styleId = 'shared-bounce-keyframes'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `@keyframes appBarBounce{0%{transform:translateY(-100%);}80%{transform:translateY(3%);}100%{transform:translateY(0);} } @keyframes appBarSlideOut{0%{transform:translateY(0);}100%{transform:translateY(-100%);} } @keyframes bottomNavBounce{0%{transform:translateY(100%);}80%{transform:translateY(-3%);}100%{transform:translateY(0);} } @keyframes bottomNavSlideOut{0%{transform:translateY(0);}100%{transform:translateY(100%);} }`
      document.head.appendChild(style)
    }
  }, [])

  // Use shared animation logic
  const animation = showHeader
    ? 'bottomNavBounce 1s cubic-bezier(0.34,1.56,0.64,1) forwards'
    : 'bottomNavSlideOut 0.5s ease-out forwards'

  // Define navigation items - can be expanded in the future
  const navigationItems: Array<{ to: string; icon: IconName; label: string }> = [
    { to: '/', icon: 'trophy', label: 'Home' },
    { to: '/teams', icon: 'apparel', label: 'Teams' },
    { to: '/about', icon: 'pending', label: 'More' },
  ]

  return (
    <nav
      className='fixed right-0 bottom-0 left-0 z-50 flex justify-between bg-emerald-800 p-3 text-white shadow-lg md:hidden'
      style={{
        transform: showHeader ? 'translateY(0)' : undefined,
        animation,
      }}
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
