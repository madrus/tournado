import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type SuccessIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function SuccessIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Success',
  ...rest
}: Readonly<SuccessIconProps>): JSX.Element {
  // Circle success icon paths
  const circlePath =
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
  // Longer, thinner checkmark similar to CheckCircleIcon
  const checkPath = 'M8.5 12.5l2.5 2.5 4.5-4.5'

  // Calculate stroke width based on weight parameter
  // Weight 100-300: thin (1.2), 400-500: normal (1.8), 600-900: bold (2.4)
  const getStrokeWidth = (): number => {
    if (weight <= 300) return 1.2
    if (weight <= 500) return 1.8
    return 2.4
  }

  const checkStrokeWidth = getStrokeWidth()

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
      <path d={circlePath} fill='currentColor' stroke='currentColor' strokeWidth='0' />
      {/* Checkmark in white with weight 600 */}
      <path d={checkPath} stroke='white' strokeWidth={checkStrokeWidth} fill='none' />
    </svg>
  )
}
