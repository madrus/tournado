import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type UnfoldMoreIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

// Unfold more (expand both directions) icon
export function UnfoldMoreIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Unfold more',
}: UnfoldMoreIconProps): JSX.Element {
  // Convert weight to stroke-width (optional, for consistency)
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
      role='img'
      aria-label={ariaLabel}
    >
      <path d='M480-120 300-300l58-58 122 122 122-122 58 58-180 180ZM358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z' />
    </svg>
  )
}
