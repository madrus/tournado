import { JSX } from 'react'
import { Link, useLocation } from 'react-router'

import { IconName, renderIcon } from '~/utils/iconUtils'

type NavigationItemProps = {
  to: string
  icon: IconName
  label: string
}

function NavigationItem({ to, icon, label }: NavigationItemProps): JSX.Element {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className='flex flex-col items-center'
      aria-label={`Navigate to ${label}`}
      data-testid={`nav-${label.toLowerCase()}`}
    >
      {renderIcon(icon, {
        size: 36,
        variant: isActive ? 'filled' : 'outlined',
        weight: isActive ? 700 : 400,
        className: isActive ? 'text-brand' : 'text-primary-foreground',
        'data-testid': 'nav-icon',
      })}
      <span
        className={`mt-1 text-xs ${isActive ? 'text-brand font-bold' : 'text-primary-foreground'}`}
      >
        {label}
      </span>
    </Link>
  )
}

export default NavigationItem
