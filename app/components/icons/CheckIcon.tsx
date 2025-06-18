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
    <div
      className={`inline-block ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        style={{
          width: `${size}px`,
          height: `${size}px`,
          strokeWidth,
        }}
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
      </svg>
    </div>
  )
}
