import { forwardRef, type JSX } from 'react'

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
      onBlur,
      onChange,
    },
    ref
  ): JSX.Element => (
    <div className={className}>
      <label className='text-foreground-light flex w-full flex-col gap-1'>
        <span className='text-foreground-light font-medium'>{label}</span>
        <input
          ref={ref}
          name={name}
          type='date'
          readOnly={readOnly}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          min={min}
          max={max}
          className='placeholder:text-foreground-lighter h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none'
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          onBlur={onBlur}
          onChange={onChange}
        />
      </label>
      {error ? (
        <div className='pt-1 text-sm text-red-700' id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  )
)

DateInputField.displayName = 'DateInputField'
