import { forwardRef, type JSX } from 'react'

type InputFieldProps = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  readOnly?: boolean
  error?: string
  required?: boolean
  className?: string
  defaultValue?: string
  placeholder?: string
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

export const TextInputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      name,
      label,
      type = 'text',
      readOnly = true,
      error,
      required = false,
      className = '',
      defaultValue,
      placeholder,
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
          defaultValue={defaultValue}
          placeholder={placeholder}
          className='placeholder:text-foreground-lighter h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
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
