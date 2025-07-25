import { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type PendingIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export function PendingIcon({
  className = '',
  size = 24,
  variant = 'outlined',
  weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Pending',
}: PendingIconProps): JSX.Element {
  // Authentic paths from downloaded Google Material Symbols SVG files
  const outlinedPath =
    'M270.74-426.67q22.26 0 37.76-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75t-37.83-15.5q-22.26 0-37.76 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75t37.83 15.5Zm209.34 0q22.25 0 37.75-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75-15.57-15.5-37.83-15.5-22.25 0-37.75 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75 15.57 15.5 37.83 15.5Zm208.67 0q22.25 0 37.75-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75t-37.83-15.5q-22.26 0-37.76 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75t37.84 15.5ZM480.18-80q-82.83 0-155.67-31.5-72.84-31.5-127.18-85.83Q143-251.67 111.5-324.56T80-480.33q0-82.88 31.5-155.78Q143-709 197.33-763q54.34-54 127.23-85.5T480.33-880q82.88 0 155.78 31.5Q709-817 763-763t85.5 127Q880-563 880-480.18q0 82.83-31.5 155.67Q817-251.67 763-197.46q-54 54.21-127 85.84Q563-80 480.18-80Zm.15-66.67q139 0 236-97.33t97-236.33q0-139-96.87-236-96.88-97-236.46-97-138.67 0-236 96.87-97.33 96.88-97.33 236.46 0 138.67 97.33 236 97.33 97.33 236.33 97.33ZM480-480Z'
  const filledPath =
    'M270.74-426.67q22.26 0 37.76-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75t-37.83-15.5q-22.26 0-37.76 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75t37.83 15.5Zm209.34 0q22.25 0 37.75-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75-15.57-15.5-37.83-15.5-22.25 0-37.75 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75 15.57 15.5 37.83 15.5Zm208.67 0q22.25 0 37.75-15.58 15.5-15.57 15.5-37.83 0-22.25-15.58-37.75t-37.83-15.5q-22.26 0-37.76 15.58-15.5 15.57-15.5 37.83 0 22.25 15.58 37.75t37.84 15.5ZM480.18-80q-82.83 0-155.67-31.5-72.84-31.5-127.18-85.83Q143-251.67 111.5-324.56T80-480.33q0-82.88 31.5-155.78Q143-709 197.33-763q54.34-54 127.23-85.5T480.33-880q82.88 0 155.78 31.5Q709-817 763-763t85.5 127Q880-563 880-480.18q0 82.83-31.5 155.67Q817-251.67 763-197.46q-54 54.21-127 85.84Q563-80 480.18-80Z'

  const path = variant === 'filled' ? filledPath : outlinedPath

  // Convert weight to stroke-width for outlined icons
  const strokeWidth =
    variant === 'outlined' && weight > 400
      ? weight === 600
        ? 1.5
        : weight === 500
          ? 1.25
          : 1
      : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
      data-testid={dataTestId}
      role='img'
      aria-label={ariaLabel}
    >
      <path d={path} />
    </svg>
  )
}
