import { type JSX, type SVGProps } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type ScoreboardIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function ScoreboardIcon({
  className = '',
  size = 24,
  variant = 'outlined',
  weight = 400,
  'aria-label': ariaLabel = 'Scoreboard',
  ...rest
}: Readonly<ScoreboardIconProps>): JSX.Element {
  // Scoreboard icon path from your SVG file
  const outlinedPath =
    'M620-360q-17 0-28.5-11.5T580-400v-160q0-17 11.5-28.5T620-600h100q17 0 28.5 11.5T760-560v160q0 17-11.5 28.5T720-360H620Zm20-60h60v-120h-60v120Zm-440 60v-100q0-17 11.5-28.5T240-500h80v-40H200v-60h140q17 0 28.5 11.5T380-560v60q0 17-11.5 28.5T340-460h-80v40h120v60H200Zm250-160v-60h60v60h-60Zm0 140v-60h60v60h-60ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h120v-80h80v80h240v-80h80v80h120q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h290v-60h60v60h290v-480H510v60h-60v-60H160v480Zm0 0v-480 480Z'
  const filledPath = outlinedPath // Using same path as your SVG is already filled

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
