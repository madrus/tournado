import { type FocusEvent, forwardRef, type JSX, type ReactNode } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

import {
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
  statusIcon?: ReactNode
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
      statusIcon,
      onChange,
      onFocus,
      onBlur,
    },
    ref
  ): JSX.Element => (
    <div className={className}>
      <label className={textInputLabelVariants()}>
        <div className='mb-1 flex items-center justify-between gap-2'>
          <span className={textInputLabelTextVariants()}>{label}</span>
          <div className='w-6 flex-shrink-0'>{statusIcon}</div>
        </div>
        <div className='relative'>
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
        </div>
      </label>
      {error ? (
        <ErrorMessage panelColor={color} id={`${name}-error`}>
          {error}
        </ErrorMessage>
      ) : null}
    </div>
  )
)

TextInputField.displayName = 'TextInputField'
