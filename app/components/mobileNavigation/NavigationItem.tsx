import { JSX } from 'react'
import { Link, useLocation } from 'react-router'

import { IconName, renderIcon } from '~/utils/iconUtils'
import { normalizePathname } from '~/utils/route-utils'

import {
  navigationIconVariants,
  navigationItemVariants,
  type NavigationItemVariants,
  navigationLabelVariants,
} from './navigationItem.variants'

type NavigationItemProps = {
  to: string
  icon: IconName
  label: string
  color?: NavigationItemVariants['color']
}

function NavigationItem({
  to,
  icon,
  label,
  color = 'brand',
}: NavigationItemProps): JSX.Element {
  const location = useLocation()

  // Robust route matching that handles trailing slashes and query params
  const isActive = normalizePathname(location.pathname) === normalizePathname(to)

  return (
    <Link
      to={to}
      className={navigationItemVariants({ color, active: isActive })}
      aria-label={`Navigate to ${label}`}
      data-testid={`nav-${label.toLowerCase()}`}
    >
      {renderIcon(icon, {
        size: 36,
        variant: isActive ? 'filled' : 'outlined',
        weight: isActive ? 700 : 400,
        className: navigationIconVariants({ color, active: isActive }),
        'data-testid': 'nav-icon',
      })}
      <span className={navigationLabelVariants({ color, active: isActive })}>
        {label}
      </span>
    </Link>
  )
}

export default NavigationItem
