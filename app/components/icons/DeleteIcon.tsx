import type { JSX } from 'react'

import type { IconVariant, IconWeight } from '~/lib/lib.types'

type DeleteIconProps = {
  className?: string
  size?: number
  variant?: IconVariant
  weight?: IconWeight
  'data-testid'?: string
  'aria-label'?: string
}

export const DeleteIcon = ({
  className = '',
  size = 24,
  variant: _variant = 'outlined',
  weight = 400,
  'data-testid': dataTestId,
  'aria-label': ariaLabel = 'Delete',
}: Readonly<DeleteIconProps>): JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={`inline-block ${className}`}
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    data-testid={dataTestId}
    role='img'
    aria-label={ariaLabel}
  >
    <path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
  </svg>
)
