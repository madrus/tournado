/* eslint-disable react/jsx-no-leaked-render */
import { forwardRef, Ref } from 'react'

import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'

export type ComboFieldOption = {
  value: string
  label: string
}

export type ComboFieldProps = {
  name: string
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void
  options: ComboFieldOption[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  selectRef?: Ref<HTMLSelectElement>
  className?: string
}

export const ComboField = forwardRef<HTMLDivElement, ComboFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      onBlur,
      options,
      placeholder,
      error,
      required = false,
      disabled = false,
      selectRef,
      className = '',
    },
    ref
  ) => {
    // Normalize value to always be a string
    const normalizedValue = value ?? ''
    // Ensure the value is always present in the options, or fallback to ''
    const safeValue =
      normalizedValue === '' || options.some(opt => opt.value === normalizedValue)
        ? normalizedValue
        : ''
    return (
      <div className={cn('mb-4', className)} ref={ref}>
        <label className='text-foreground-light flex w-full flex-col gap-1'>
          <span className='text-foreground-light font-medium'>{label}</span>
          <div className='relative'>
            <select
              ref={selectRef}
              name={name}
              value={safeValue}
              required={required}
              disabled={disabled}
              className={cn(
                'h-12 w-full appearance-none rounded-md border-2 border-emerald-700/30 bg-white px-0 ps-3 pe-6 text-lg leading-6',
                safeValue === '' ? 'text-foreground-lighter' : '',
                disabled ? 'cursor-not-allowed opacity-50' : ''
              )}
              aria-invalid={!!error || undefined}
              aria-errormessage={error ? `${name}-error` : undefined}
              onChange={onChange}
              onBlur={onBlur}
            >
              {placeholder && (
                <option value='' className='text-foreground-lighter'>
                  {placeholder}
                </option>
              )}
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2 text-gray-400'>
              {renderIcon('expand_more', { className: 'w-5 h-5' })}
            </span>
          </div>
        </label>
        {error ? (
          <div className='pt-1 text-sm text-red-700' id={`${name}-error`}>
            {error}
          </div>
        ) : null}
      </div>
    )
  }
)

ComboField.displayName = 'ComboField'
