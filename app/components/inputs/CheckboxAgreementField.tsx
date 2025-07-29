import { forwardRef, type ReactNode } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import { CheckIcon } from '~/components/icons'
import { type ColorAccent } from '~/lib/lib.types'
import { INPUT_LABEL_SPACING, STATUS_ICON_CONTAINER_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import {
  checkboxAgreementCheckmarkVariants,
  checkboxAgreementFieldVariants,
  checkboxAgreementInputVariants,
} from './inputs.variants'

/**
 * CheckboxAgreementField with inline status icon support
 *
 * The statusIcon prop renders validation status (success/error/neutral) inline
 * with the field description, providing better accessibility and preventing layout
 * shifts when description text wraps to multiple lines. The status icon is positioned
 * in a fixed-width container to maintain consistent alignment.
 *
 * This component uses items-end alignment to ensure the status icon aligns with
 * the bottom of the description text for optimal visual hierarchy.
 */

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
  statusIcon?: ReactNode // Status icon (success/error) rendered inline with description
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
      statusIcon,
    },
    ref
  ) => (
    <div className={className}>
      {description ? (
        <div className={`${INPUT_LABEL_SPACING} flex items-end justify-between gap-2`}>
          <div
            className={cn('text-foreground font-medium', getLatinTextClass(language))}
          >
            {description}
          </div>
          {/* Status icon container with fixed width to prevent layout shifts */}
          <div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div>
        </div>
      ) : null}
      <div
        className={cn(
          checkboxAgreementFieldVariants({ color, error: !!error, disabled }),
          labelClassName
        )}
      >
        <div className='relative flex-shrink-0'>
          <input
            ref={ref}
            type='checkbox'
            name={name}
            id={name}
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
              className={checkboxAgreementCheckmarkVariants({
                color,
                error: !!error,
                disabled,
              })}
              size={16}
            />
          ) : null}
        </div>
        <label
          htmlFor={name}
          className={cn(
            'text-foreground cursor-pointer text-lg leading-6 font-normal',
            getLatinTextClass(language)
          )}
        >
          {label}
        </label>
      </div>
      {error ? <ErrorMessage panelColor={color}>{error}</ErrorMessage> : null}
    </div>
  )
)

CheckboxAgreementField.displayName = 'CheckboxAgreementField'
