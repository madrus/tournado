import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type MenuIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
}

export function MenuIcon({
  className = '',
  size = 24,
  weight = 400,
}: MenuIconProps): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path = 'M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
    >
      <path d={path} />
    </svg>
  )
}
