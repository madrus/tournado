import { forwardRef, type JSX } from 'react'

type InputFieldProps = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  readOnly?: boolean
  error?: string
  required?: boolean
  className?: string
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onBlur?: (focusEvent: React.FocusEvent<HTMLInputElement>) => void
}

export const TextInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      readOnly = false,
      error,
      required = false,
      className = '',
      value = '',
      placeholder,
      onChange,
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
          required={required}
          value={value}
          placeholder={placeholder}
          className='placeholder:text-foreground-lighter h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          onChange={
            onChange ? inputEvent => onChange(inputEvent.target.value) : undefined
          }
          onBlur={onBlur}
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

TextInputField.displayName = 'TextInputField'
