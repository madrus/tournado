import { forwardRef, Ref, useRef } from 'react'

import * as Select from '@radix-ui/react-select'

import { type ColorAccent } from '~/lib/lib.types'
import { getDropdownItemColorClasses, getInputColorClasses } from '~/styles/inputStyles'
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
  onChange: (value: string) => void
  onBlur?: (value: string) => void
  options: ComboFieldOption[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  selectRef?: Ref<HTMLButtonElement>
  className?: string
  color?: ColorAccent
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
      color = 'emerald',
    },
    ref
  ) => {
    // Track if a selection was just made to prevent double onBlur calls
    const justSelectedRef = useRef(false)

    // Normalize value to always be a string
    const normalizedValue = value ?? ''
    // Ensure the value is always present in the options, or fallback to ''
    const safeValue =
      normalizedValue === '' || options.some(opt => opt.value === normalizedValue)
        ? normalizedValue
        : ''

    return (
      <div
        className={cn('mb-4', className)}
        ref={ref}
        data-testid={name ? `${name}-combo-field` : 'combo-field'}
      >
        <label className='text-foreground-light flex w-full flex-col gap-1'>
          <span className='text-foreground-light font-medium'>{label}</span>
          <Select.Root
            value={safeValue}
            onValueChange={newValue => {
              justSelectedRef.current = true
              onChange(newValue)
              // Reset the flag after a short delay
              setTimeout(() => {
                justSelectedRef.current = false
              }, 10)
            }}
            disabled={disabled}
          >
            <Select.Trigger
              ref={selectRef}
              aria-label={`${label} - select option`}
              className={cn(
                'bg-input text-input-foreground flex h-12 w-full items-center justify-between rounded-md border-2 px-3 py-2 text-lg',
                'transition-all duration-300 ease-in-out focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                getInputColorClasses(color, disabled, error),
                safeValue === '' ? 'text-foreground-lighter' : ''
              )}
              aria-invalid={!!error || undefined}
              aria-errormessage={error ? `${name}-error` : undefined}
            >
              <div className='flex-1 truncate text-left'>
                <Select.Value placeholder={placeholder || 'Selecteer een optie'} />
              </div>
              <Select.Icon asChild>
                {renderIcon('expand_more', { className: 'w-5 h-5 text-gray-400' })}
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className='z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg'
                position='popper'
                sideOffset={4}
                style={{ minWidth: 'var(--radix-select-trigger-width)' }}
                onCloseAutoFocus={() => {
                  // This handles the case where user opens dropdown but closes without selecting
                  // Only trigger if no selection was made AND value is empty
                  if (!justSelectedRef.current && safeValue === '') {
                    onBlur?.(safeValue)
                  }
                }}
              >
                <Select.Viewport className='p-1'>
                  {options.map(opt => (
                    <Select.Item
                      key={opt.value}
                      value={opt.value}
                      className={cn(
                        'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none select-none',
                        getDropdownItemColorClasses(color),
                        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                      )}
                    >
                      <Select.ItemText>{opt.label}</Select.ItemText>
                      <Select.ItemIndicator className='absolute right-2 flex h-3.5 w-3.5 items-center justify-center'>
                        {renderIcon('check', { className: 'w-4 h-4' })}
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {/* Hidden native select for form submission */}
          <select
            name={name}
            value={safeValue}
            onChange={() => undefined} // Controlled by Radix UI Select
            required={required}
            disabled={disabled}
            aria-hidden='true'
            tabIndex={-1}
            style={{
              position: 'absolute',
              border: 0,
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              wordWrap: 'normal',
            }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {error ? (
          <div className='text-error-foreground pt-1 text-sm' id={`${name}-error`}>
            {error}
          </div>
        ) : null}
      </div>
    )
  }
)

ComboField.displayName = 'ComboField'
