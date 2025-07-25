import { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ApparelIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export function ApparelIcon({
  className = '',
  size = 24,
  variant = 'outlined',
  weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Apparel',
}: ApparelIconProps): JSX.Element {
  // Authentic paths from downloaded Google Material Symbols SVG files
  const outlinedPath =
    'm246.67-553.33-55.34 30.66q-14 8-29.66 4.34-15.67-3.67-22.34-17l-72.66-126q-8-14-4.34-26 3.67-12 17-20L308-840h66q10.33 0 16.5 6.17 6.17 6.16 6.17 16.5v16.66q0 36.34 23.83 60.17t60.17 23.83q36.33 0 59.83-23.83t23.5-60.17v-16.66q0-10.34 6.17-16.5 6.16-6.17 16.5-6.17h66l228.66 132.67q13.34 8 16.67 20 3.33 12-4 26l-73.33 126Q814-522 796.17-518.17q-17.84 3.84-30.17-3.5l-54.67-32.66v395q0 16.33-11.83 27.83T671.33-120H286q-16.33 0-27.83-11.5t-11.5-27.83v-394ZM313.33-666v479.33h331.34V-666L778-592l44-75.33L640-772h-12q-10.33 53-50.5 87.5T480.67-650q-56.67 0-97.17-34.5T332.67-772h-12l-182 104.67 44 75.33 130.66-74Zm167.34 186.33Z'
  const filledPath =
    'm246.67-553.33-55.34 30.66q-14 8-29.66 4.34-15.67-3.67-22.34-17l-72.66-126q-8-14-4.34-26 3.67-12 17-20L308-840h66q10.33 0 16.5 6.17 6.17 6.16 6.17 16.5v16.66q0 36.34 23.83 60.17t60.17 23.83q36.33 0 59.83-23.83t23.5-60.17v-16.66q0-10.34 6.17-16.5 6.16-6.17 16.5-6.17h66l228.66 132.67q13.34 8 16.67 20 3.33 12-4 26l-73.33 126Q814-522 796.17-518.17q-17.84 3.84-30.17-3.5l-54.67-32.66v395q0 16.33-11.83 27.83T671.33-120H286q-16.33 0-27.83-11.5t-11.5-27.83v-394Z'

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
