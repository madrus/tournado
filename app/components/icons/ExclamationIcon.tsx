import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type ExclamationIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function ExclamationIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Error',
}: Readonly<ExclamationIconProps>): JSX.Element {
  // Lucide circle-alert paths (circular version)
  const paths = ['M12 8v4', 'M12 16h.01']

  // Convert weight to stroke-width for Lucide style
  const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2.25 : 2

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='white'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`inline-block ${className}`}
      role='img'
      aria-label={ariaLabel}
    >
      <circle cx='12' cy='12' r='10' stroke='white' />
      {paths.map((path, index) => (
        <path key={index} d={path} stroke='currentColor' />
      ))}
    </svg>
  )
}
