import { type JSX } from 'react'

import { CloseIcon } from '~/components/icons'
import { type ColorAccent } from '~/lib/lib.types'

import { fieldErrorIconVariants } from './field.variants'

type FieldErrorIconProps = {
  /** Whether to show the error icon */
  show: boolean
  /** Color variant for the error icon background - should match panel color */
  color?: ColorAccent
  /** Additional CSS classes */
  className?: string
}

export function FieldErrorIcon({
  show,
  color = 'primary',
  className,
}: FieldErrorIconProps): JSX.Element | null {
  if (!show) return null

  return (
    <div className={fieldErrorIconVariants({ color, className })}>
      <CloseIcon className='h-4 w-4 text-white' size={16} />
    </div>
  )
}
