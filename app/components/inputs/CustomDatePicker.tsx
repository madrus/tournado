import { forwardRef, type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as Popover from '@radix-ui/react-popover'

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

type CustomDatePickerProps = {
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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

type CalendarProps = {
  selectedDate: Date | undefined
  onSelect: (date: Date) => void
  locale: string
  minDate?: Date
  maxDate?: Date
}

// Custom Calendar Component
function Calendar({ selectedDate, onSelect, locale, minDate, maxDate }: CalendarProps) {
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
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  return (
    <div className='w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <button
          type='button'
          onClick={goToPrevMonth}
          className='rounded-full p-1 font-bold text-emerald-600 transition-colors hover:bg-emerald-100'
        >
          <ChevronLeftIcon className='h-5 w-5' size={20} />
        </button>

        <h2 className='text-lg font-semibold text-gray-900'>{monthName}</h2>

        <button
          type='button'
          onClick={goToNextMonth}
          className='rounded-full p-1 font-bold text-emerald-600 transition-colors hover:bg-emerald-100'
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

          return (
            <button
              key={date.toISOString()}
              type='button'
              disabled={disabled}
              onClick={() => !disabled && onSelect(date)}
              className={cn(
                'relative p-2 text-sm transition-colors',
                'focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                !selected && 'hover:bg-emerald-100',
                disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                isCurrentDay && !selected && 'rounded-full bg-emerald-100 font-bold',
                selected && 'rounded-full bg-red-400 font-bold text-white',
                !isCurrentDay && !selected && 'rounded-full text-gray-900'
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
      defaultValue,
      placeholder,
      min,
      max,
      onChange,
    },
    ref
  ): JSX.Element => {
    const { i18n } = useTranslation()
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      defaultValue ? new Date(defaultValue) : undefined
    )
    const [isOpen, setIsOpen] = useState(false)

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date)
      setIsOpen(false)

      // Create synthetic event for onChange handler
      if (onChange) {
        const formattedDate = date.toISOString().split('T')[0] // yyyy-mm-dd format
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
                className={cn(
                  'placeholder:text-foreground-lighter flex h-12 w-full items-center justify-between rounded-md border-2 border-emerald-700/30 bg-white px-3 text-left text-lg leading-6 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none',
                  readOnly && 'cursor-not-allowed opacity-50',
                  !readOnly && 'cursor-pointer hover:border-emerald-500'
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
          <div className='pt-1 text-sm text-red-700' id={`${name}-error`}>
            {error}
          </div>
        ) : null}
      </div>
    )
  }
)

CustomDatePicker.displayName = 'CustomDatePicker'
