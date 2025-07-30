import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type UnfoldLessIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

// Unfold less (collapse both directions) icon
export function UnfoldLessIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Unfold less',
}: UnfoldLessIconProps): JSX.Element {
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
      <path d='m356-160-56-56 180-180 180 180-56 56-124-124-124 124Zm124-404L300-744l56-56 124 124 124-124 56 56-180 180Z' />
    </svg>
  )
}
