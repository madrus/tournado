import { type JSX, type SVGProps } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type CloseIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const CloseIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 400,
  'aria-label': ariaLabel = 'Close',
  ...rest
}: Readonly<CloseIconProps>): JSX.Element => (
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
    <path d='M6 18L18 6M6 6l12 12' />
  </svg>
)
