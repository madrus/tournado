import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type WarningIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function WarningIcon({
  className = '',
  size = 24,
  weight: _weight = 400,
  'aria-label': ariaLabel = 'Warning',
  ...rest
}: Readonly<WarningIconProps>): JSX.Element {
  // Lucide triangle-alert SVG paths
  const trianglePath =
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'
  const linePath = 'M12 9v4'
  const dotPath = 'M12 17h.01'

  // Triangle should match dialog background, exclamation should be weight 600
  const exclamationStrokeWidth = 2.5 // weight 600

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`inline-block ${className}`}
      role='img'
      aria-label={ariaLabel}
      {...rest}
    >
      {/* Triangle background matches dialog background (transparent, inherited from parent) */}
      <path
        d={trianglePath}
        fill='currentColor'
        stroke='currentColor'
        strokeWidth='0'
      />
      {/* Exclamation mark in white with weight 600 */}
      <path
        d={linePath}
        stroke='white'
        strokeWidth={exclamationStrokeWidth}
        fill='none'
      />
      <path
        d={dotPath}
        stroke='white'
        strokeWidth={exclamationStrokeWidth}
        fill='none'
      />
    </svg>
  )
}
