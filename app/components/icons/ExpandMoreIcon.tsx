import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

// Chevron down (expand_more) icon
export function ExpandMoreIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Expand more',
}: {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}): JSX.Element {
  // Material Symbols expand_more path
  const path = 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z'

  // Convert weight to stroke-width (optional, for consistency)
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
      role='img'
      aria-label={ariaLabel}
    >
      <path d={path} />
    </svg>
  )
}
