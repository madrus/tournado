import { JSX } from 'react'

import NavigationItem from './NavigationItem'

function BottomNavigation(): JSX.Element {
  // Define navigation items - can be expanded in the future
  const navigationItems = [
    { to: '/', icon: 'trophy', label: 'Home' },
    { to: '/teams', icon: 'apparel', label: 'Teams' },
    { to: '/about', icon: 'pending', label: 'More' },
  ]

  return (
    <div className='fixed right-0 bottom-0 left-0 z-50 flex justify-between bg-white p-3 shadow-lg md:hidden'>
      {/* Navigation items spread across full width */}
      <div className='flex w-full justify-between px-3'>
        {navigationItems.map(item => (
          <NavigationItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>
    </div>
  )
}

export default BottomNavigation
