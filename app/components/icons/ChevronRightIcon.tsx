import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ChevronRightIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export const ChevronRightIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600, // Default to bold
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Chevron right',
}: Readonly<ChevronRightIconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={`inline-block ${className}`}
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    data-testid={dataTestId}
    role='img'
    aria-label={ariaLabel}
  >
    <path d='M9 18l6-6-6-6' />
  </svg>
)
