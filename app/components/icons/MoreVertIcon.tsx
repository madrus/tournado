import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

interface MoreVertIconProps {
  className?: string
  size?: number
  weight?: IconWeight
}

export function MoreVertIcon({
  className = '',
  size = 24,
  weight = 400,
}: MoreVertIconProps): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'M479.91-160q-24.24 0-41.41-17.26-17.17-17.26-17.17-41.5t17.26-41.41q17.27-17.16 41.5-17.16 24.24 0 41.41 17.26 17.17 17.26 17.17 41.5t-17.26 41.4Q504.14-160 479.91-160Zm0-261.33q-24.24 0-41.41-17.26-17.17-17.27-17.17-41.5 0-24.24 17.26-41.41 17.27-17.17 41.5-17.17 24.24 0 41.41 17.26 17.17 17.27 17.17 41.5 0 24.24-17.26 41.41-17.27 17.17-41.5 17.17Zm0-261.34q-24.24 0-41.41-17.26-17.17-17.26-17.17-41.5t17.26-41.4Q455.86-800 480.09-800q24.24 0 41.41 17.26 17.17 17.26 17.17 41.5t-17.26 41.41q-17.27 17.16-41.5 17.16Z'

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
