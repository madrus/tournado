import { JSX } from 'react'

import type { IconWeight } from '~/lib/lib.types'

type PersonIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
  [key: string]: unknown // Allow extra props
}

export function PersonIcon({
  className = '',
  size = 24,
  weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Person',
  ...props
}: Readonly<PersonIconProps>): JSX.Element {
  // Authentic path from downloaded Google Material Symbols SVG file
  const path =
    'M480-480.67q-66 0-109.67-43.66Q326.67-568 326.67-634t43.66-109.67Q414-787.33 480-787.33t109.67 43.66Q633.33-700 633.33-634t-43.66 109.67Q546-480.67 480-480.67ZM160-160v-100q0-36.67 18.5-64.17T226.67-366q65.33-30.33 127.66-45.5 62.34-15.17 125.67-15.17t125.33 15.5q62 15.5 127.28 45.3 30.54 14.42 48.96 41.81Q800-296.67 800-260v100H160Zm66.67-66.67h506.66V-260q0-14.33-8.16-27-8.17-12.67-20.5-19-60.67-29.67-114.34-41.83Q536.67-360 480-360t-111 12.17Q314.67-335.67 254.67-306q-12.34 6.33-20.17 19-7.83 12.67-7.83 27v33.33ZM480-547.33q37 0 61.83-24.84Q566.67-597 566.67-634t-24.84-61.83Q517-720.67 480-720.67t-61.83 24.84Q393.33-671 393.33-634t24.84 61.83Q443-547.33 480-547.33Zm0-86.67Zm0 407.33Z'

  // Convert weight to stroke-width
  const strokeWidth =
    weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 -960 960 960'
      className={`inline-block fill-current ${className}`}
      data-testid={dataTestId}
      style={{ strokeWidth }}
      role='img'
      aria-label={ariaLabel}
      {...props}
    >
      <path d={path} />
    </svg>
  )
}
