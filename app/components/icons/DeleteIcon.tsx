import { type JSX, type SVGProps } from 'react'

import type { IconWeight } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type DeleteIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
} & SVGProps<SVGSVGElement>

export const DeleteIcon = ({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'Delete',
  ...rest
}: Readonly<DeleteIconProps>): JSX.Element => (
  <svg
    {...rest} /* rest props here should be passed before all other props */
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    className={cn('inline-block', className)}
    stroke='currentColor'
    strokeWidth={weight / 200}
    strokeLinecap='round'
    strokeLinejoin='round'
    role='img'
    aria-label={ariaLabel}
  >
    <path d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
  </svg>
)
