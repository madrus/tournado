import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type EditIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
  [key: string]: unknown // Allow extra props
}

export function EditIcon({
  className = '',
  size = 24,
  weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Edit',
  ...props
}: Readonly<EditIconProps>): JSX.Element {
  // Authentic path from Google Material Symbols SVG file
  const path =
    'M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      data-testid={dataTestId}
      style={{ strokeWidth }}
      role='img'
      aria-label={ariaLabel}
      {...props}
    >
      <path d={path} />
    </svg>
  )
}
