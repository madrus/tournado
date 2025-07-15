import { forwardRef, type JSX } from 'react'

import { type ColorAccent } from '~/lib/lib.types'
import { getInputColorClasses } from '~/styles/input.styles'
import { cn } from '~/utils/misc'

type DateInputFieldProps = {
  name: string
  label: string
  readOnly?: boolean
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
      <label className='text-foreground flex w-full flex-col gap-1'>
        <span className='text-foreground font-medium'>{label}</span>
        <input
          ref={ref}
          name={name}
          type='date'
          readOnly={readOnly}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder || 'dd-mm-yyyy'}
          min={min}
          max={max}
          className={cn(
            'placeholder:text-foreground-lighter bg-input text-input-foreground h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
            'transition-all duration-300 ease-in-out focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-70',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            getInputColorClasses(color, readOnly, error)
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
        <div className='text-error-foreground pt-1 text-sm' id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  )
)

DateInputField.displayName = 'DateInputField'
