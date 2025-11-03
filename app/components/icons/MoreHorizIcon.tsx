import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type MoreHorizIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function MoreHorizIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'More horizontal options',
  ...rest
}: Readonly<MoreHorizIconProps>): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'M218.57-421.33q-24.24 0-41.4-17.26Q160-455.86 160-480.09q0-24.24 17.26-41.41 17.26-17.17 41.5-17.17t41.41 17.26q17.16 17.27 17.16 41.5 0 24.24-17.26 41.41-17.26 17.17-41.5 17.17Zm261.34 0q-24.24 0-41.41-17.26-17.17-17.27-17.17-41.5 0-24.24 17.26-41.41 17.27-17.17 41.5-17.17 24.24 0 41.41 17.26 17.17 17.27 17.17 41.5 0 24.24-17.26 41.41-17.27 17.17-41.5 17.17Zm261.33 0q-24.24 0-41.41-17.26-17.16-17.27-17.16-41.5 0-24.24 17.26-41.41 17.26-17.17 41.5-17.17t41.4 17.26Q800-504.14 800-479.91q0 24.24-17.26 41.41-17.26 17.17-41.5 17.17Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
  const { style, ...restProps } = rest
  const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

  return (
    <svg
      {...restProps}
      width={size}
      height={size}
      viewBox='-960 0 960 960'
      className={`inline-block fill-current ${className}`}
      role='img'
      aria-label={ariaLabel}
      style={combinedStyle}
    >
      <path d={path} />
    </svg>
  )
}
