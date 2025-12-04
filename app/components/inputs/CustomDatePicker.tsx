import * as Popover from '@radix-ui/react-popover'
import { forwardRef, type JSX, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ErrorMessage } from '~/components/ErrorMessage'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import {
	calendarContainerVariants,
	calendarDayVariants,
	calendarWeekdayVariants,
	datePickerButtonVariants,
	datePickerIconVariants,
	datePickerTextVariants,
	textInputLabelTextVariants,
	textInputLabelVariants,
} from '~/components/inputs/inputs.variants'
import type { ColorAccent } from '~/lib/lib.types'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { INPUT_LABEL_SPACING, STATUS_ICON_CONTAINER_WIDTH } from '~/styles/constants'
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
	statusIcon?: React.ReactNode
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
	const isRTL = useSettingsStore((state) => state.isRTL)

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

	let _emptyCellCounter = 0

	return (
		<div className={calendarContainerVariants()} role='dialog' aria-label='calendar'>
			{/* Header */}
			<div className='mb-4 flex items-center justify-between'>
				<button
					type='button'
					onClick={goToPrevMonth}
					aria-label='previous month'
					className={cn(
						'flex h-8 w-8 items-center justify-center rounded-full text-brand-500 transition-colors hover:bg-brand-100 hover:text-brand-700',
					)}
				>
					<ChevronLeftIcon
						className={cn('h-5 w-5', isRTL ? 'latin-text' : '')}
						size={20}
						stroke='currentColor'
						fill='none'
					/>
				</button>

				<h2 className='flex h-8 items-center gap-1 text-foreground leading-none'>
					<span className='flex items-center'>
						{new Intl.DateTimeFormat(locale, { month: 'long' }).format(currentDate)}
					</span>
					<span className={cn('latin-text', 'text-[16px]!', 'flex items-center')}>
						{currentDate.getFullYear()}
					</span>
				</h2>

				<button
					type='button'
					onClick={goToNextMonth}
					aria-label='next month'
					className={cn(
						'flex h-8 w-8 items-center justify-center rounded-full text-brand-500 transition-colors hover:bg-brand-100 hover:text-brand-700',
					)}
				>
					<ChevronRightIcon
						className={cn('h-5 w-5', isRTL ? 'latin-text' : '')}
						size={20}
						stroke='currentColor'
						fill='none'
					/>
				</button>
			</div>

			{/* Weekday headers */}
			<div className='mb-2 grid grid-cols-7 gap-1'>
				{weekdays.map((weekday) => (
					<div key={weekday} className={calendarWeekdayVariants()}>
						{weekday}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className='grid grid-cols-7 gap-1'>
				{calendarDays.map((date) => {
					if (!date) {
						_emptyCellCounter++
						return <div key={`empty-`} className='p-2' />
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
							className={cn(
								calendarDayVariants({ state: dayState }),
								isRTL ? 'latin-text' : '',
								'text-[16px]!',
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
			color = 'slate',
			noPast = false,
			statusIcon,
			onChange,
			onBlur,
		},
		ref,
	): JSX.Element => {
		const { i18n } = useTranslation()
		const isRTL = useSettingsStore((state) => state.isRTL)

		// Use controlled value if provided, otherwise fall back to defaultValue for uncontrolled mode
		const isControlled = value !== undefined
		const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(
			() => {
				const initialValue = isControlled ? value : defaultValue
				return initialValue ? new Date(initialValue) : undefined
			},
		)
		const selectedDate = isControlled
			? value
				? new Date(value)
				: undefined
			: internalSelectedDate
		const [isOpen, setIsOpen] = useState(false)
		const [hasInteracted, setHasInteracted] = useState(false)
		const containerRef = useRef<HTMLDivElement>(null)

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

		// Handle blur events
		const handleBlur = (event: React.FocusEvent) => {
			// Mark as interacted
			setHasInteracted(true)

			// Check if the focus is moving to an element inside our container
			const relatedTarget = event.relatedTarget as Element | null
			if (
				containerRef.current &&
				relatedTarget &&
				containerRef.current.contains(relatedTarget)
			) {
				// Focus is moving within the component, don't trigger blur validation
				return
			}

			// Focus is moving outside the component, trigger validation
			onBlur?.()
		}

		// Handle calendar open/close state changes
		const handleOpenChange = (open: boolean) => {
			setIsOpen(open)

			// Mark as interacted when user opens the calendar
			if (open) {
				setHasInteracted(true)
			}

			// If user closes calendar without selecting anything and has interacted,
			// check if focus has truly left the component before triggering validation
			if (!open && hasInteracted && !selectedDate) {
				// Use requestAnimationFrame to check focus after the DOM updates
				requestAnimationFrame(() => {
					const activeElement = document.activeElement
					const focusIsWithinContainer =
						containerRef.current &&
						activeElement &&
						containerRef.current.contains(activeElement)

					// Only trigger validation if focus has truly left the component
					if (!focusIsWithinContainer) {
						onBlur?.()
					}
				})
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
					<div
						className={`${INPUT_LABEL_SPACING} flex items-center justify-between gap-2`}
					>
						<p className={textInputLabelTextVariants()}>{label}</p>
						{/* Status icon container with fixed width to prevent layout shifts */}
						<div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div>
					</div>

					<div className='relative'>
						<div ref={containerRef}>
							<Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
								<Popover.Trigger asChild>
									<button
										type='button'
										disabled={readOnly}
										aria-label={`${label} - select date`}
										onBlur={handleBlur}
										className={cn(
											datePickerButtonVariants({
												color,
												disabled: readOnly ? true : undefined,
												error: error ? true : undefined,
											}),
											!readOnly && 'cursor-pointer',
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
									<Popover.Content
										align='start'
										dir={isRTL ? 'rtl' : 'ltr'}
										sideOffset={4}
										className='z-[9999]'
									>
										<Calendar
											selectedDate={selectedDate}
											onSelect={handleDateSelect}
											locale={i18n.language}
											minDate={min ? new Date(min) : undefined}
											maxDate={max ? new Date(max) : undefined}
											noPast={noPast}
										/>
									</Popover.Content>
								</Popover.Portal>
							</Popover.Root>
						</div>
					</div>

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
					<ErrorMessage panelColor={color} id={`${name}-error`}>
						{error}
					</ErrorMessage>
				) : null}
			</div>
		)
	},
)

CustomDatePicker.displayName = 'CustomDatePicker'
