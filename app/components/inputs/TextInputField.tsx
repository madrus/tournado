import { type FocusEvent, forwardRef, type JSX } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { getInputColorClasses } from '~/styles/input.styles'
import { cn } from '~/utils/misc'

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
      color = 'emerald',
      onChange,
      onFocus,
      onBlur,
    },
    ref
  ): JSX.Element => (
    <div className={className}>
      <label className='text-foreground-light flex w-full flex-col gap-1'>
        <span className='text-foreground-light font-medium'>{label}</span>
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
            'placeholder:text-foreground-lighter bg-input text-input-foreground h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
            'transition-all duration-300 ease-in-out focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400',
            getInputColorClasses(color, disabled, error),
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
        <div className='text-error-foreground pt-1 text-sm' id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  )
)

TextInputField.displayName = 'TextInputField'
