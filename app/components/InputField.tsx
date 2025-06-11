import { forwardRef } from 'react'

type InputFieldProps = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel'
  readOnly?: boolean
  error?: string
  required?: boolean
  className?: string
  defaultValue?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
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
    },
    ref
  ) => (
    <div className={className}>
      <label className='flex w-full flex-col gap-1'>
        <span className='font-medium'>{label}</span>
        <input
          ref={ref}
          name={name}
          type={type}
          readOnly={readOnly}
          required={required}
          defaultValue={defaultValue}
          className='h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
        />
      </label>
      {error ? (
        <div className='pt-1 text-red-700' id={`${name}-error`}>
          {error}
        </div>
      ) : null}
    </div>
  )
)

InputField.displayName = 'InputField'
