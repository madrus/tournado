import { type FocusEvent, forwardRef, type JSX } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import {
  textInputErrorVariants,
  textInputFieldVariants,
  textInputLabelTextVariants,
  textInputLabelVariants,
} from './inputs.variants'

type InputFieldProps = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  readOnly?: boolean
  disabled?: boolean
  error?: string
  required?: boolean
  className?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  color?: ColorAccent
  onChange?: (value: string) => void
  onFocus?: (focusEvent: FocusEvent<HTMLInputElement>) => void
  onBlur?: (focusEvent: FocusEvent<HTMLInputElement>) => void
}

export const TextInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      readOnly = false,
      disabled = false,
      error,
      required = false,
      className = '',
      value,
      defaultValue,
      placeholder,
      color = 'slate',
      onChange,
      onFocus,
      onBlur,
    },
    ref
  ): JSX.Element => (
    <div className={className}>
      <label className={textInputLabelVariants()}>
        <span className={textInputLabelTextVariants()}>{label}</span>
        <input
          ref={ref}
          name={name}
          type={type}
          readOnly={readOnly}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={cn(
            textInputFieldVariants({
              color,
              disabled: disabled ? true : undefined,
              error: error ? true : undefined,
            }),
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          onChange={
            onChange ? inputEvent => onChange(inputEvent.target.value) : undefined
          }
          onFocus={onFocus}
          onBlur={onBlur}
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

TextInputField.displayName = 'TextInputField'
