import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type SearchIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export const SearchIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Search',
}: Readonly<SearchIconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    className={`inline-block ${className}`}
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    fill='none'
    data-testid={dataTestId}
    role='img'
    aria-label={ariaLabel}
  >
    <circle cx='11' cy='11' r='8' />
    <path d='m21 21-4.35-4.35' />
  </svg>
)
