import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

interface WarningIconProps {
  className?: string
  size?: number
  weight?: IconWeight
}

export function WarningIcon({
  className = '',
  size = 24,
  weight = 400,
}: WarningIconProps): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'm40-120 440-760 440 760H40Zm115.33-66.67h649.34L480-746.67l-324.67 560ZM482.78-238q14.22 0 23.72-9.62 9.5-9.61 9.5-23.83 0-14.22-9.62-23.72-9.61-9.5-23.83-9.5-14.22 0-23.72 9.62-9.5 9.62-9.5 23.83 0 14.22 9.62 23.72 9.62 9.5 23.83 9.5Zm-33.45-114H516v-216h-66.67v216ZM480-466.67Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 -960 960 960'
        className='fill-current'
        style={{
          width: `${size}px`,
          height: `${size}px`,
          strokeWidth,
        }}
      >
        <path d={path} />
      </svg>
    </div>
  )
}
