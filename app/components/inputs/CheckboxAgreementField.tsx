import { forwardRef } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import { CheckIcon } from '~/components/icons'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import {
  checkboxAgreementFieldVariants,
  checkboxAgreementInputVariants,
} from './inputs.variants'

export type CheckboxAgreementFieldProps = {
  name: string
  checked: boolean
  label: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  className?: string
  labelClassName?: string
  inputClassName?: string
  language?: string // add language prop
  color?: ColorAccent // add color prop
}

export const CheckboxAgreementField = forwardRef<
  HTMLInputElement,
  CheckboxAgreementFieldProps
>(
  (
    {
      name,
      checked,
      label,
      description,
      error,
      required = false,
      disabled = false,
      onChange,
      onBlur,
      className = '',
      labelClassName = '',
      inputClassName = '',
      language = 'en', // default to 'en'
      color = 'slate',
    },
    ref
  ) => (
    <div className={className}>
      {description ? (
        <p className={cn('mb-2', getLatinTextClass(language))}>{description}</p>
      ) : null}
      <label
        className={cn(
          checkboxAgreementFieldVariants({ color, error: !!error, disabled }),
          labelClassName
        )}
      >
        <div className='relative mt-0.5 flex-shrink-0'>
          <input
            ref={ref}
            type='checkbox'
            name={name}
            checked={checked}
            onChange={event => onChange(event.target.checked)}
            onBlur={onBlur}
            className={cn(
              checkboxAgreementInputVariants({ color, error: !!error, disabled }),
              inputClassName
            )}
            required={required}
            disabled={disabled}
          />
          {checked ? (
            <CheckIcon
              className='text-primary-foreground pointer-events-none absolute top-0.5 left-0.5 h-4 w-4'
              size={16}
            />
          ) : null}
        </div>
        <span
          className={cn(
            'text-foreground text-lg leading-6 font-normal',
            getLatinTextClass(language)
          )}
        >
          {label}
        </span>
      </label>
      {error ? <ErrorMessage panelColor={color}>{error}</ErrorMessage> : null}
    </div>
  )
)

CheckboxAgreementField.displayName = 'CheckboxAgreementField'
