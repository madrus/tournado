import type { JSX } from 'react'
import { CheckMarkIcon, CloseIcon } from '~/components/icons'
import { fieldCheckmarkVariants, fieldErrorIconVariants } from './field.variants'

type FieldStatusIconProps = {
  /** The field validation status */
  status: 'success' | 'error' | 'neutral'
  /** Additional CSS classes */
  className?: string
}

export function FieldStatusIcon({
  status,
  className,
}: FieldStatusIconProps): JSX.Element | null {
  if (status === 'neutral') return null

  if (status === 'success') {
    return (
      <CheckMarkIcon
        backgroundClassName={fieldCheckmarkVariants({
          color: 'emerald',
          className,
        })}
        backgroundProps={{ 'data-testid': 'field-status-success' }}
        className='text-white'
        size={16}
      />
    )
  }

  if (status === 'error') {
    return (
      <div
        className={fieldErrorIconVariants({ color: 'red', className })}
        data-testid='field-status-error'
      >
        <CloseIcon className='h-4 w-4 text-white' size={16} />
      </div>
    )
  }

  return null
}
