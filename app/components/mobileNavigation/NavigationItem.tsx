import { JSX } from 'react'
import { Link, useLocation } from 'react-router'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import { IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { normalizePathname } from '~/utils/routeUtils'
import { getLatinTextClass } from '~/utils/rtlUtils'

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

  // Responsive icon sizing: Use proper media query hook that updates on resize
  const isMobileBreakpoint = useMediaQuery('(max-width: 767px)')
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
      <span
        className={cn(
          navigationLabelVariants({ color, active: isActive }),
          getLatinTextClass()
        )}
      >
        {label}
      </span>
    </Link>
  )
}

export default NavigationItem
