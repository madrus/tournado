import { JSX } from 'react'

import type { IconProps } from '~/lib/lib.types'

type SuccessIconProps = IconProps

export function SuccessIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Success',
  'aria-hidden': ariaHidden,
}: Readonly<SuccessIconProps>): JSX.Element {
  // Lucide check SVG path
  const path = 'M20 6 9 17l-5-5'

  // Convert weight to stroke-width for Lucide style
  const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2.25 : 2

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`inline-block ${className}`}
      role='img'
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      <path d={path} />
    </svg>
  )
}
