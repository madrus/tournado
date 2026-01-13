import * as Select from '@radix-ui/react-select'
import { type JSX, type ReactNode, forwardRef, useRef, useState } from 'react'
import { ErrorMessage } from '~/components/ErrorMessage'
import { AnimatedArrowIcon } from '~/components/icons'
import type { ColorAccent } from '~/lib/lib.types'
import { useSettingsStore } from '~/stores/useSettingsStore'
import { INPUT_LABEL_SPACING, STATUS_ICON_CONTAINER_WIDTH } from '~/styles/constants'
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

/**
 * ComboField with inline status icon support
 *
 * The statusIcon prop renders validation status (success/error/neutral) inline
 * with the field label, providing better accessibility and preventing layout
 * shifts when labels wrap to multiple lines. The status icon is positioned
 * in a fixed-width container to maintain consistent alignment.
 */

export type Option = {
	value: string
	label: string
}

type ComboFieldProps = {
	name?: string
	label?: string
	options: Option[]
	value: string
	onChange: (value: string) => void
	placeholder?: string
	error?: string
	disabled?: boolean
	required?: boolean
	className?: string
	color?: ColorAccent
	compact?: boolean
	statusIcon?: ReactNode // Status icon (success/error) rendered inline with label
	onBlur?: () => void
	valueClassName?: string
	getOptionTextClassName?: (option: Option) => string
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
			compact = false,
			statusIcon,
			onBlur,
			valueClassName,
			getOptionTextClassName,
		},
		selectRef,
	): JSX.Element => {
		const triggerRef = useRef<HTMLButtonElement>(null)
		const justSelectedRef = useRef(false)
		const [isOpen, setIsOpen] = useState(false)
		const isRTL = useSettingsStore((state) => state.isRTL)

		// Ensure value is always a string
		const safeValue = value || ''
		const direction = isRTL ? 'rtl' : 'ltr'

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

		// Extract the select content to conditionally wrap with label
		const selectContent = (
			<>
				<div className='relative'>
					<Select.Root
						value={safeValue}
						onValueChange={(newValue) => {
							justSelectedRef.current = true
							onChange(newValue)
							// Reset the flag after a short delay
							setTimeout(() => {
								justSelectedRef.current = false
							}, 10)
						}}
						onOpenChange={setIsOpen}
						disabled={disabled}
					>
						<Select.Trigger
							ref={(node) => {
								if (typeof selectRef === 'function') selectRef(node)
								else if (selectRef) {
									;(
										selectRef as React.MutableRefObject<HTMLButtonElement | null>
									).current = node
								}
								triggerRef.current = node
							}}
							aria-label={label ? `${label} - select option` : 'Select option'}
							className={cn(
								comboFieldTriggerVariants({
									color,
									compact,
									disabled: disabled ? true : undefined,
									error: error ? true : undefined,
								}),
								safeValue === '' ? 'text-foreground' : '',
							)}
							aria-invalid={!!error || undefined}
							aria-errormessage={error && name ? `${name}-error` : undefined}
							dir={direction}
						>
							<div
								className={cn(
									comboFieldValueVariants({
										state: safeValue === '' ? 'placeholder' : 'value',
									}),
									safeValue === '' ? '' : valueClassName,
								)}
							>
								<Select.Value placeholder={placeholder || 'Selecteer een optie'} />
							</div>
							{!disabled ? (
								<Select.Icon className='text-foreground'>
									<AnimatedArrowIcon
										isOpen={isOpen}
										className='h-6 w-6'
										aria-label={isOpen ? 'Collapse options' : 'Expand options'}
									/>
								</Select.Icon>
							) : (
								<div className='h-6 w-6' aria-hidden='true' />
							)}
						</Select.Trigger>

						<Select.Portal>
							<Select.Content
								className={comboFieldContentVariants({ color })}
								position='popper'
								sideOffset={4}
								onCloseAutoFocus={handleCloseAutoFocus}
								style={{ width: 'var(--radix-select-trigger-width)' }}
								data-radix-select-content
								dir={direction}
							>
								<Select.Viewport className='max-h-60 overflow-auto p-1'>
									{options.map((opt) => (
										<Select.Item
											key={opt.value}
											value={opt.value}
											className={comboFieldItemVariants({
												color,
												compact,
											})}
										>
											<Select.ItemText>
												<span className={cn(getOptionTextClassName?.(opt))}>
													{opt.label}
												</span>
											</Select.ItemText>
											<Select.ItemIndicator className='absolute end-2 flex h-3.5 w-3.5 items-center justify-center'>
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
						visibility: 'hidden',
						opacity: 0,
						pointerEvents: 'none',
						zIndex: -1,
					}}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</>
		)

		// Conditionally render with or without label wrapper
		if (label) {
			return (
				<div
					className={cn(className)}
					data-testid={name ? `${name}-combo-field` : 'combo-field'}
				>
					<div className={textInputLabelVariants()}>
						<div
							className={`${INPUT_LABEL_SPACING} flex items-center justify-between gap-2`}
						>
							<p className={textInputLabelTextVariants()}>{label}</p>
							{/* Status icon container with fixed width to prevent layout shifts */}
							<div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div>
						</div>
						{selectContent}
					</div>
					{error ? (
						<ErrorMessage panelColor={color} id={name ? `${name}-error` : undefined}>
							{error}
						</ErrorMessage>
					) : null}
				</div>
			)
		}

		// No label - return select directly
		return (
			<div
				className={cn(className)}
				data-testid={name ? `${name}-combo-field` : 'combo-field'}
			>
				{selectContent}
				{error ? (
					<ErrorMessage panelColor={color} id={name ? `${name}-error` : undefined}>
						{error}
					</ErrorMessage>
				) : null}
			</div>
		)
	},
)

ComboField.displayName = 'ComboField'
