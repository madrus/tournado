import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type CheckIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export function CheckIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Check mark',
  ...rest
}: Readonly<CheckIconProps>): JSX.Element {
  // Convert weight to stroke-width for simple check mark
  const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2 : 2

  const { style, ...restProps } = rest
  const combinedStyle = { ...style, strokeWidth }

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      className={`inline-block ${className}`}
      role='img'
      aria-label={ariaLabel}
      style={combinedStyle}
      {...restProps}
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
  )
}
