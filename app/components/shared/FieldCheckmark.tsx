import { type JSX } from 'react'

import { CheckIcon } from '~/components/icons'
import { type ColorAccent } from '~/lib/lib.types'

import { fieldCheckmarkVariants } from './panel.variants'

type FieldCheckmarkProps = {
  /** Whether to show the checkmark */
  show: boolean
  /** Color variant for the checkmark background */
  color?: ColorAccent
  /** Additional CSS classes */
  className?: string
}

export function FieldCheckmark({
  show,
  color = 'primary',
  className,
}: FieldCheckmarkProps): JSX.Element | null {
  if (!show) return null

  return (
    <div className={fieldCheckmarkVariants({ color, className })}>
      <CheckIcon className='text-primary-foreground h-4 w-4' size={16} />
    </div>
  )
}
