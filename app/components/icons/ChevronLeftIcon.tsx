import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type ChevronLeftIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const ChevronLeftIcon = ({
  className = '',
  size = 24,
  weight = 600, // Default to bold
  'aria-label': ariaLabel = 'Chevron left',
  ...rest
}: Readonly<ChevronLeftIconProps>): JSX.Element => (
  <svg
    {...rest}
    width={size}
    height={size}
    viewBox='0 0 24 24'
    className={`inline-block ${className}`}
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    role='img'
    aria-label={ariaLabel}
  >
    <path d='M15 18l-6-6 6-6' />
  </svg>
)
