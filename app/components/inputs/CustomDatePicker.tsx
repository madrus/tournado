import { forwardRef, type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as Popover from '@radix-ui/react-popover'

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import { type ColorAccent } from '~/lib/lib.types'
import { getCalendarColorClasses, getInputColorClasses } from '~/styles/input.styles'
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
  color: ColorAccent
  noPast?: boolean
}

// Custom Calendar Component
function Calendar({
  selectedDate,
  onSelect,
  locale,
  minDate,
  maxDate,
  color,
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

  const calendarColors = getCalendarColorClasses(color)

  return (
    <div
      className='w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg'
      role='dialog'
      aria-label='calendar'
    >
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <button
          type='button'
          onClick={goToPrevMonth}
          aria-label='previous month'
          className={cn(
            'rounded-full p-1 font-bold transition-colors',
            calendarColors.navButton
          )}
        >
          <ChevronLeftIcon className='h-5 w-5' size={20} />
        </button>

        <h2 className='text-lg font-semibold text-gray-900'>{monthName}</h2>

        <button
          type='button'
          onClick={goToNextMonth}
          aria-label='next month'
          className={cn(
            'rounded-full p-1 font-bold transition-colors',
            calendarColors.navButton
          )}
        >
          <ChevronRightIcon className='h-5 w-5' size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className='mb-2 grid grid-cols-7 gap-1'>
        {weekdays.map((weekday, index) => (
          <div
            key={index}
            className='p-2 text-center text-sm font-medium text-gray-500'
          >
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

          return (
            <button
              key={date.toISOString()}
              type='button'
              disabled={disabled}
              aria-label={`${date.getDate()} ${monthName}`}
              onClick={() => !disabled && onSelect(date)}
              className={cn(
                'relative rounded-full p-2 text-sm transition-colors',
                'focus:ring-2 focus:outline-none',
                !selected && !disabled && calendarColors.hover,
                disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                isPastDate && 'bg-gray-50',
                isCurrentDay && !selected && cn('font-bold', calendarColors.today),
                selected && 'bg-brand-light font-bold text-white',
                !isCurrentDay && !selected && 'text-gray-900'
              )}
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
      color = 'emerald',
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
        <label className='text-foreground-light flex w-full flex-col gap-1'>
          <span className='text-foreground-light font-medium'>{label}</span>

          <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
              <button
                type='button'
                disabled={readOnly}
                aria-label={`${label} - select date`}
                onBlur={onBlur}
                className={cn(
                  'placeholder:text-foreground-lighter bg-input text-input-foreground flex h-12 w-full items-center justify-between rounded-md border-2 px-3 text-left text-lg leading-6',
                  'transition-all duration-300 ease-in-out focus:outline-none',
                  readOnly && 'cursor-not-allowed opacity-50',
                  !readOnly && 'cursor-pointer',
                  getInputColorClasses(color, readOnly, error)
                )}
                aria-invalid={error ? true : undefined}
                aria-errormessage={error ? `${name}-error` : undefined}
              >
                <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                  {displayValue || placeholder || 'Select date'}
                </span>
                <CalendarIcon className='h-5 w-5 text-gray-400' size={20} />
              </button>
            </Popover.Trigger>

            <Popover.Content align='start' sideOffset={4} className='z-50'>
              <Calendar
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                locale={i18n.language}
                minDate={min ? new Date(min) : undefined}
                maxDate={max ? new Date(max) : undefined}
                color={color}
                noPast={noPast}
              />
            </Popover.Content>
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
          <div className='text-error-foreground pt-1 text-sm' id={`${name}-error`}>
            {error}
          </div>
        ) : null}
      </div>
    )
  }
)

CustomDatePicker.displayName = 'CustomDatePicker'
