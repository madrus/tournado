import { type JSX } from 'react'

import { CheckIcon, CloseIcon } from '~/components/icons'

import { fieldCheckmarkVariants, fieldErrorIconVariants } from './field.variants'

type FieldStatusIconProps = {
  /** The field validation status */
  status: 'success' | 'error' | 'neutral'
  /** Additional CSS classes */
  className?: string
  /** Field type for positioning - defaults to 'input' */
  fieldType?: 'input' | 'checkbox'
}

export function FieldStatusIcon({
  status,
  className,
  fieldType = 'input',
}: FieldStatusIconProps): JSX.Element | null {
  if (status === 'neutral') return null

  if (status === 'success') {
    return (
      <div
        className={fieldCheckmarkVariants({ color: 'emerald', fieldType, className })}
        data-testid='field-status-success'
      >
        <CheckIcon className='h-4 w-4 text-white' size={16} />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className={fieldErrorIconVariants({ color: 'red', fieldType, className })}
        data-testid='field-status-error'
      >
        <CloseIcon className='h-4 w-4 text-white' size={16} />
      </div>
    )
  }

  return null
}
