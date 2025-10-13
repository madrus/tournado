import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ArrowDownIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export const ArrowDownIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Arrow down',
}: Readonly<ArrowDownIconProps>): JSX.Element => (
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
    <path d='M12 5v14M19 12l-7 7-7-7' />
  </svg>
)
