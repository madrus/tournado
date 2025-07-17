import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type TuneIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function TuneIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Tune',
}: TuneIconProps): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'M431.33-120v-230H498v82h342v66.67H498V-120h-66.67ZM120-201.33V-268h244.67v66.67H120Zm178-164v-81.34H120v-66.66h178V-596h66.67v230.67H298Zm133.33-81.34v-66.66H840v66.66H431.33Zm164-163.33v-230H662v81.33h178V-692H662v82h-66.67ZM120-692v-66.67h408.67V-692H120Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
      role='img'
      aria-label={ariaLabel}
    >
      <path d={path} />
    </svg>
  )
}
