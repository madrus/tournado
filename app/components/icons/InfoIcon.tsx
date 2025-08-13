import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type InfoIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function InfoIcon({
  className = '',
  size = 24,
  weight: _weight = 400,
  'aria-label': ariaLabel = 'Info',
}: Readonly<InfoIconProps>): JSX.Element {
  // Circle info icon paths
  const circlePath =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  const linePath = 'M12 11v6'
  const dotPath = 'M12 7h.01'

  // Info icon with weight 600 content
  const contentStrokeWidth = 2.5 // weight 600

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
      {/* Info content in white with weight 600 */}
      <path d={linePath} stroke='white' strokeWidth={contentStrokeWidth} fill='none' />
      <path d={dotPath} stroke='white' strokeWidth={contentStrokeWidth} fill='none' />
    </svg>
  )
}
