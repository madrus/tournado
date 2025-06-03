import { JSX } from 'react'

import NavigationItem from './NavigationItem'

function MobileNavigation(): JSX.Element {
  // Define navigation items - can be expanded in the future
  const navigationItems = [
    { to: '/', icon: 'home', label: 'Home' },
    // Add more items here as needed, for example:
    // { to: '/teams', icon: 'group', label: 'Teams' },
    // { to: '/profile', icon: 'person', label: 'Profile' },
  ]

  return (
    <div className='fixed right-0 bottom-0 left-0 z-50 flex justify-between bg-white p-3 shadow-lg md:hidden'>
      {/* Left section for initial navigation items */}
      <div className='ml-4 flex space-x-8'>
        {navigationItems.map(item => (
          <NavigationItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div>

      {/* Right section can be added later for additional items */}
      {/* <div className='flex space-x-8 mr-4'>
        {rightNavigationItems.map((item) => (
          <NavigationItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </div> */}
    </div>
  )
}

export default MobileNavigation
