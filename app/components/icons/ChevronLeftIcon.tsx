import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ChevronLeftIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
}

export const ChevronLeftIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600, // Default to bold
  'data-testid': dataTestId,
}: Readonly<ChevronLeftIconProps>): JSX.Element => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    data-testid={dataTestId}
  >
    <path d='M15 18l-6-6 6-6' />
  </svg>
)
