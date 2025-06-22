import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type BlockIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
}

export function BlockIcon({
  className = '',
  size = 24,
  weight = 400,
}: BlockIconProps): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-66.67q58.68 0 113-19.5 54.33-19.5 98.33-56.5L222.67-691.33q-36.34 44.66-56.17 98.78-19.83 54.11-19.83 112.55 0 139.58 96.87 236.46 96.88 96.87 236.46 96.87Zm256.67-122q35.66-44 56.16-98.33 20.5-54.32 20.5-113 0-139.58-96.87-236.46-96.88-96.87-236.46-96.87-58.44 0-112.55 19.83-54.12 19.83-98.78 56.83l468 468Z'

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
