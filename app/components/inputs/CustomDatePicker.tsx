import { forwardRef, type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as Popover from '@radix-ui/react-popover'

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import {
  calendarContainerVariants,
  calendarDayVariants,
  calendarHeaderVariants,
  calendarWeekdayVariants,
  datePickerButtonVariants,
  datePickerIconVariants,
  datePickerTextVariants,
  textInputErrorVariants,
  textInputLabelTextVariants,
  textInputLabelVariants,
} from '~/components/inputs/inputs.variants'
import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

type CustomDatePickerProps = {
  name: string
  label: string
  readOnly?: boolean
  error?: string
  required?: boolean
  className?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  min?: string
  max?: string
  color?: ColorAccent
  noPast?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
}

type CalendarProps = {
  selectedDate: Date | undefined
  onSelect: (date: Date) => void
  locale: string
  minDate?: Date
  maxDate?: Date
  noPast?: boolean
  color?: ColorAccent
}

// Custom Calendar Component
function Calendar({
  selectedDate,
  onSelect,
  locale,
  minDate,
  maxDate,
  noPast = false,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get month name in current locale
  const monthName = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth))

  // Get weekday names in current locale
  const weekdays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i + 1) // January 1, 2024 was a Monday
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date))
  }

  // Calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7 // Make Monday = 0
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = []

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day))
  }

  const goToPrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))

  const goToNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))

  const isToday = (date: Date) => date.toDateString() === today.toDateString()

  const isSelected = (date: Date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString()

  const isDisabled = (date: Date) => {
    const effectiveMinDate = noPast ? today : minDate
    if (effectiveMinDate && date < effectiveMinDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  return (
    <div className={calendarContainerVariants()} role='dialog' aria-label='calendar'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <button
          type='button'
          onClick={goToPrevMonth}
          aria-label='previous month'
          className='text-brand-500 hover:bg-brand-100 hover:text-brand-700 rounded-full p-1 font-bold transition-colors'
        >
          <ChevronLeftIcon className='h-5 w-5' size={20} />
        </button>

        <h2 className={calendarHeaderVariants()}>{monthName}</h2>

        <button
          type='button'
          onClick={goToNextMonth}
          aria-label='next month'
          className='text-brand-500 hover:bg-brand-100 hover:text-brand-700 rounded-full p-1 font-bold transition-colors'
        >
          <ChevronRightIcon className='h-5 w-5' size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className='mb-2 grid grid-cols-7 gap-1'>
        {weekdays.map((weekday, index) => (
          <div key={index} className={calendarWeekdayVariants()}>
            {weekday}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className='p-2' />
          }

          const disabled = isDisabled(date)
          const isCurrentDay = isToday(date)
          const selected = isSelected(date)
          const isPastDate = noPast && date < today

          // Determine the state for the CVA variant - priority order matters
          let dayState: 'default' | 'today' | 'selected' | 'disabled' | 'past' =
            'default'
          if (disabled) dayState = 'disabled'
          else if (selected) dayState = 'selected'
          else if (isCurrentDay) dayState = 'today'
          else if (isPastDate) dayState = 'past'

          return (
            <button
              key={date.toISOString()}
              type='button'
              disabled={disabled}
              aria-label={`${date.getDate()} ${monthName}`}
              onClick={() => !disabled && onSelect(date)}
              className={calendarDayVariants({ state: dayState })}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(
  (
    {
      name,
      label,
      readOnly = false,
      error,
      required = false,
      className = '',
      value,
      defaultValue,
      placeholder,
      min,
      max,
      color = 'slate',
      noPast = false,
      onChange,
      onBlur,
    },
    ref
  ): JSX.Element => {
    const { i18n } = useTranslation()
    // Use controlled value if provided, otherwise fall back to defaultValue for uncontrolled mode
    const isControlled = value !== undefined
    const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(
      (isControlled ? value : defaultValue)
        ? new Date(isControlled ? value! : defaultValue!)
        : undefined
    )
    const selectedDate = isControlled
      ? value
        ? new Date(value)
        : undefined
      : internalSelectedDate
    const [isOpen, setIsOpen] = useState(false)

    const handleDateSelect = (date: Date) => {
      // Update internal state only for uncontrolled mode
      if (!isControlled) {
        setInternalSelectedDate(date)
      }
      setIsOpen(false)

      // Create synthetic event for onChange handler
      if (onChange) {
        // Use local date formatting to avoid timezone issues
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const formattedDate = `${year}-${month}-${day}` // yyyy-mm-dd format
        const syntheticEvent = {
          target: { name, value: formattedDate },
          currentTarget: { name, value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    // Format display value using locale
    const displayValue = selectedDate
      ? new Intl.DateTimeFormat(i18n.language, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(selectedDate)
      : ''

    return (
      <div className={className}>
        <label className={textInputLabelVariants()}>
          <span className={textInputLabelTextVariants()}>{label}</span>

          <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
              <button
                type='button'
                disabled={readOnly}
                aria-label={`${label} - select date`}
                onBlur={onBlur}
                className={cn(
                  datePickerButtonVariants({
                    color,
                    disabled: readOnly ? true : undefined,
                    error: error ? true : undefined,
                  }),
                  !readOnly && 'cursor-pointer'
                )}
                aria-invalid={error ? true : undefined}
                aria-errormessage={error ? `${name}-error` : undefined}
              >
                <span
                  className={datePickerTextVariants({
                    state: displayValue ? 'selected' : 'placeholder',
                  })}
                >
                  {displayValue || placeholder || 'Select date'}
                </span>
                <CalendarIcon className={datePickerIconVariants()} size={20} />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content align='start' sideOffset={4} className='z-[9999]'>
                <Calendar
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  locale={i18n.language}
                  minDate={min ? new Date(min) : undefined}
                  maxDate={max ? new Date(max) : undefined}
                  noPast={noPast}
                  color={color}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Hidden input for form submission */}
          <input
            ref={ref}
            type='hidden'
            name={name}
            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
            required={required}
          />
        </label>

        {error ? (
          <div className={textInputErrorVariants()} id={`${name}-error`}>
            {error}
          </div>
        ) : null}
      </div>
    )
  }
)

CustomDatePicker.displayName = 'CustomDatePicker'
