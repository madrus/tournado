import { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

interface TrophyIconProps {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
}

export function TrophyIcon({
  className = '',
  size = 24,
  variant = 'outlined',
  weight = 400,
}: TrophyIconProps): JSX.Element {
  // Authentic paths from downloaded Google Material Symbols SVG files
  const outlinedPath =
    'M292-120v-66.67h154.67v-140q-52.34-11-93.17-44.83T296-456q-74.33-8.33-125.17-61.83Q120-571.33 120-645.33V-688q0-27.67 19.5-47.17t47.17-19.5h96V-840h394.66v85.33h96q27.67 0 47.17 19.5T840-688v42.67q0 74-50.83 127.5Q738.33-464.33 664-456q-16.67 50.67-57.5 84.5t-93.17 44.83v140H668V-120H292Zm-9.33-406.67V-688h-96v42.67q0 42.66 27 75.16t69 43.5ZM480-390q54.67 0 92.67-38.33 38-38.34 38-93v-252H349.33v252q0 54.66 38 93Q425.33-390 480-390Zm197.33-136.67q42-11 69-43.5t27-75.16V-688h-96v161.33ZM480-582Z'
  const filledPath =
    'M292-120v-66.67h154.67v-140q-52.34-11-93.17-44.83T296-456q-74.33-8.33-125.17-61.83Q120-571.33 120-645.33V-688q0-27.67 19.5-47.17t47.17-19.5h96V-840h394.66v85.33h96q27.67 0 47.17 19.5T840-688v42.67q0 74-50.83 127.5Q738.33-464.33 664-456q-16.67 50.67-57.5 84.5t-93.17 44.83v140H668V-120H292Zm-9.33-406.67V-688h-96v42.67q0 42.66 27 75.16t69 43.5Zm394.66 0q42-11 69-43.5t27-75.16V-688h-96v161.33Z'

  const path = variant === 'filled' ? filledPath : outlinedPath

  // Convert weight to stroke-width for outlined icons
  const strokeWidth =
    variant === 'outlined' && weight > 400
      ? weight === 600
        ? 1.5
        : weight === 500
          ? 1.25
          : 1
      : undefined

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
        viewBox='0 -960 960 960'
        className='fill-current'
        style={{
          width: `${size}px`,
          height: `${size}px`,
          strokeWidth,
        }}
      >
        <path d={path} />
      </svg>
    </div>
  )
}
