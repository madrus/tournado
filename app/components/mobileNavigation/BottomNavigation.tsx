import { JSX } from 'react'

import type { IconName } from '~/utils/iconUtils'

import NavigationItem from './NavigationItem'

function BottomNavigation(): JSX.Element {
  // Define navigation items - can be expanded in the future
  const navigationItems: Array<{ to: string; icon: IconName; label: string }> = [
    { to: '/', icon: 'trophy', label: 'Home' },
    { to: '/teams', icon: 'apparel', label: 'Teams' },
    { to: '/about', icon: 'pending', label: 'More' },
  ]

  return (
    <nav
      className='fixed right-0 bottom-0 left-0 z-50 flex justify-between bg-emerald-800 p-3 text-white shadow-lg md:hidden'
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
