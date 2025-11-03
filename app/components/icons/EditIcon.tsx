import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type EditIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function EditIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Edit',
  ...rest
}: Readonly<EditIconProps>): JSX.Element {
  // Authentic path from Google Material Symbols SVG file
  const path =
    'M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z'

  // Convert weight to stroke-width
  // Maps IconWeight to SVG stroke-width: 400 and below = none, 500 = 1.25, 600 = 1.5, others (700, 800) = 1
  const getStrokeWidth = (w: IconWeight): number | undefined => {
    if (w <= 400) return undefined
    if (w === 600) return 1.5
    if (w === 500) return 1.25
    return 1
  }
  const strokeWidth = getStrokeWidth(weight)

  const { style, ...restProps } = rest
  const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

  return (
    <svg
      {...restProps}
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={cn('inline-block fill-current', className)}
      role='img'
      aria-label={ariaLabel}
      style={combinedStyle}
    >
      <path d={path} />
    </svg>
  )
}
