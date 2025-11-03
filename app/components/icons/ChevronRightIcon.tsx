import { type JSX, type SVGProps } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ChevronRightIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const ChevronRightIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 600, // Default to bold
  'aria-label': ariaLabel = 'Chevron right',
  ...rest
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
    role='img'
    aria-label={ariaLabel}
    {...rest}
  >
    <path d='M9 18l6-6-6-6' />
  </svg>
)
