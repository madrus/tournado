import { forwardRef, type JSX, useRef } from 'react'

import * as Select from '@radix-ui/react-select'

import { ErrorMessage } from '~/components/ErrorMessage'
import { type ColorAccent } from '~/lib/lib.types'
import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'

import {
  comboFieldContentVariants,
  comboFieldItemVariants,
  comboFieldTriggerVariants,
  comboFieldValueVariants,
  textInputLabelTextVariants,
  textInputLabelVariants,
} from './inputs.variants'

export type Option = {
  value: string
  label: string
}

type ComboFieldProps = {
  name?: string
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  color?: ColorAccent
  onBlur?: () => void
}

export const ComboField = forwardRef<HTMLButtonElement, ComboFieldProps>(
  (
    {
      name,
      label,
      options,
      value,
      onChange,
      placeholder,
      error,
      disabled = false,
      required = false,
      className = '',
      color = 'emerald',
      onBlur,
    },
    selectRef
  ): JSX.Element => {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const justSelectedRef = useRef(false)

    // Ensure value is always a string
    const safeValue = value || ''

    // Handle blur when dropdown closes
    const handleCloseAutoFocus = (event: Event) => {
      // Prevent default auto focus behavior when closing
      event.preventDefault()
      // Manually blur the trigger to ensure onBlur is called
      if (triggerRef.current) {
        triggerRef.current.blur()
      }
      // Explicitly call the onBlur callback since native blur() doesn't trigger React's synthetic event
      if (onBlur) {
        onBlur()
      }
    }

    return (
      <div
        className={cn(className)}
        data-testid={name ? `${name}-combo-field` : 'combo-field'}
      >
        <label className={textInputLabelVariants()}>
          <span className={textInputLabelTextVariants()}>{label}</span>
          <div className='relative'>
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
                ref={node => {
                  if (typeof selectRef === 'function') selectRef(node)
                  else if (selectRef) {
                    ;(
                      selectRef as React.MutableRefObject<HTMLButtonElement | null>
                    ).current = node
                  }
                  triggerRef.current = node
                }}
                aria-label={`${label} - select option`}
                className={cn(
                  comboFieldTriggerVariants({
                    color,
                    disabled: disabled ? true : undefined,
                    error: error ? true : undefined,
                  }),
                  safeValue === '' ? 'text-foreground' : ''
                )}
                aria-invalid={!!error || undefined}
                aria-errormessage={error && name ? `${name}-error` : undefined}
              >
                <div
                  className={comboFieldValueVariants({
                    state: safeValue === '' ? 'placeholder' : 'value',
                  })}
                >
                  <Select.Value placeholder={placeholder || 'Selecteer een optie'} />
                </div>
                <Select.Icon className='text-foreground ml-1'>
                  {renderIcon('expand_more', {
                    className: 'h-6 w-6',
                    'data-testid': 'icon-expand_more',
                  })}
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  className={comboFieldContentVariants({ color })}
                  position='popper'
                  sideOffset={4}
                  onCloseAutoFocus={handleCloseAutoFocus}
                  style={{ width: 'var(--radix-select-trigger-width)' }}
                >
                  <Select.Viewport className='max-h-60 overflow-auto p-1'>
                    {options.map(opt => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className={comboFieldItemVariants({ color })}
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
          </div>

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
          <ErrorMessage panelColor={color} id={name ? `${name}-error` : undefined}>
            {error}
          </ErrorMessage>
        ) : null}
      </div>
    )
  }
)

ComboField.displayName = 'ComboField'
