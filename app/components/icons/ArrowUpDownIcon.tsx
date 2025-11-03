import { type JSX, type SVGProps } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ArrowUpDownIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const ArrowUpDownIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600,
  'aria-label': ariaLabel = 'Sort',
  ...rest
}: Readonly<ArrowUpDownIconProps>): JSX.Element => (
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
    role='img'
    aria-label={ariaLabel}
    {...rest}
  >
    <path d='M7 15l5 5 5-5M7 9l5-5 5 5' />
  </svg>
)
