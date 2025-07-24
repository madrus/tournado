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
  /** Icon size in pixels. Defaults to responsive sizing (32px mobile, 36px desktop) */
  iconSize?: number
}

function NavigationItem({
  to,
  icon,
  label,
  color = 'brand',
  iconSize,
}: NavigationItemProps): JSX.Element {
  const location = useLocation()

  // Robust route matching that handles trailing slashes and query params
  const isActive = normalizePathname(location.pathname) === normalizePathname(to)

  // Responsive icon sizing: Use CSS-based detection that matches Tailwind breakpoints
  // Check if we're in a mobile context by testing if a CSS media query matches
  const isMobileBreakpoint =
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 767px)').matches
      : false

  // Default to 36px for desktop/testing, 32px for mobile breakpoint
  const responsiveIconSize = iconSize ?? (isMobileBreakpoint ? 32 : 36)

  return (
    <Link
      to={to}
      className={navigationItemVariants({ color, active: isActive })}
      aria-label={`Navigate to ${label}`}
      data-testid={`nav-${label.toLowerCase()}`}
    >
      {renderIcon(icon, {
        size: responsiveIconSize,
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
