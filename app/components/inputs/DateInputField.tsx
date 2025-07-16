import { forwardRef, type JSX } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import {
  dateInputFieldVariants,
  textInputErrorVariants,
  textInputLabelTextVariants,
  textInputLabelVariants,
} from './inputs.variants'

type DateInputFieldProps = {
  name: string
  label: string
  readOnly?: boolean
  disabled?: boolean
  error?: string
  required?: boolean
  className?: string
  defaultValue?: string
  placeholder?: string
  min?: string
  max?: string
  color?: ColorAccent
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const DateInputField = forwardRef<HTMLInputElement, DateInputFieldProps>(
  (
    {
      name,
      label,
      readOnly = false,
      disabled = false,
      error,
      required = false,
      className = '',
      defaultValue,
      placeholder,
      min,
      max,
      color = 'emerald',
      onBlur,
      onChange,
    },
    ref
  ): JSX.Element => (
    <div className={className}>
      <label className={textInputLabelVariants()}>
        <span className={textInputLabelTextVariants()}>{label}</span>
        <input
          ref={ref}
          name={name}
          type='date'
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder || 'dd-mm-yyyy'}
          min={min}
          max={max}
          className={cn(
            dateInputFieldVariants({
              color,
              disabled: disabled || readOnly ? true : undefined,
              error: error ? true : undefined,
            })
          )}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          onBlur={onBlur}
          onChange={onChange}
          style={{
            colorScheme: 'light',
          }}
        />
      </label>
      {error ? (
        <div className={textInputErrorVariants()} id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  )
)

DateInputField.displayName = 'DateInputField'
