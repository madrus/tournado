import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type SuccessIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function SuccessIcon({
  className = '',
  size = 24,
  weight: _weight = 400,
  'aria-label': ariaLabel = 'Success',
}: Readonly<SuccessIconProps>): JSX.Element {
  // Circle success icon paths
  const circlePath =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  // Longer, thinner checkmark similar to CheckCircleIcon
  const checkPath = 'M8.5 12.5l2.5 2.5 4.5-4.5'

  // Thinner checkmark for better appearance
  const checkStrokeWidth = 1.8

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
    >
      {/* Circle background uses currentColor (intent color) */}
      <path d={circlePath} fill='currentColor' stroke='currentColor' strokeWidth='0' />
      {/* Checkmark in white with weight 600 */}
      <path d={checkPath} stroke='white' strokeWidth={checkStrokeWidth} fill='none' />
    </svg>
  )
}
