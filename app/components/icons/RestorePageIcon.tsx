import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type RestorePageIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export const RestorePageIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight: _weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Restore page',
}: Readonly<RestorePageIconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox='0 -960 960 960'
    fill='currentColor'
    className={`inline-block ${className}`}
    data-testid={dataTestId}
    role='img'
    aria-label={ariaLabel}
  >
    <path d='M480-250q78 0 134-56t56-134q0-78-56-134t-134-56q-38 0-71 14t-59 38v-62h-60v170h170v-60h-72q17-18 41-29t51-11q54 0 92 38t38 92q0 54-38 92t-92 38q-44 0-77-25.5T356-400h-62q14 65 65.5 107.5T480-250ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-446L526-800H240v640Zm0 0v-640 640Z' />
  </svg>
)
