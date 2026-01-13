import type { JSX, SVGProps } from 'react'
import type { IconVariant, IconWeight } from '~/lib/lib.types'

type HomeIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function HomeIcon({
  className = '',
  size = 24,
  variant = 'outlined',
  weight = 400,
  'aria-label': ariaLabel = 'Home',
  ...rest
}: Readonly<HomeIconProps>): JSX.Element {
  // Authentic paths from downloaded Google Material Symbols SVG files
  const outlinedPath =
    'M226.67-186.67h140v-246.66h226.66v246.66h140v-380L480-756.67l-253.33 190v380ZM160-120v-480l320-240 320 240v480H526.67v-246.67h-93.34V-120H160Zm320-352Z'
  const filledPath = 'M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z'

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
  const { style, ...restProps } = rest
  const combinedStyle = strokeWidth !== undefined ? { ...style, strokeWidth } : style

  return (
    <svg
      {...restProps}
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      role='img'
      aria-label={ariaLabel}
      style={combinedStyle}
    >
      <path d={path} />
    </svg>
  )
}
