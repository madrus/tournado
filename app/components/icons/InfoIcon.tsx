import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type InfoIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function InfoIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Info',
  ...rest
}: Readonly<InfoIconProps>): JSX.Element {
  // Circle info icon paths
  const circlePath =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  const linePath = 'M12 11v6'
  const dotPath = 'M12 7h.01'

  // Calculate stroke width based on weight parameter
  // Weight 100-300: thin (1.5), 400-500: normal (2.5), 600-900: bold (3.0)
  const getStrokeWidth = (): number => {
    if (weight <= 300) return 1.5
    if (weight <= 500) return 2.5
    return 3.0
  }

  const contentStrokeWidth = getStrokeWidth()

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
      {/* Circle background uses currentColor (intent color) */}
      <path
        d={circlePath}
        fill='none'
        stroke='currentColor'
        strokeWidth={contentStrokeWidth - 0.5}
      />
      {/* Info content paths with currentColor */}
      <path
        d={linePath}
        stroke='currentColor'
        strokeWidth={contentStrokeWidth}
        fill='none'
      />
      <path
        d={dotPath}
        stroke='currentColor'
        strokeWidth={contentStrokeWidth}
        fill='none'
      />
    </svg>
  )
}
