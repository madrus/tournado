import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type CheckIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
}

export function CheckIcon({
  className = '',
  size = 24,
  weight = 400,
}: CheckIconProps): JSX.Element {
  // Convert weight to stroke-width for simple check mark
  const strokeWidth = weight === 600 ? 2.5 : weight === 500 ? 2 : 2

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      className={`inline-block ${className}`}
      style={{ strokeWidth }}
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
  )
}
