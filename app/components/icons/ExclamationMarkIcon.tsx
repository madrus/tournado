import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type ExclamationMarkIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function ExclamationMarkIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Exclamation',
}: Readonly<ExclamationMarkIconProps>): JSX.Element {
  const paths = ['M12 8v4', 'M12 16h.01']
  const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2.25 : 2

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`inline-block ${className}`}
      role='img'
      aria-label={ariaLabel}
    >
      {paths.map((d, idx) => (
        <path key={idx} d={d} stroke='currentColor' />
      ))}
    </svg>
  )
}
