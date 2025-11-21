import { type FocusEvent, forwardRef, type JSX, type ReactNode } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import type { ColorAccent } from '~/lib/lib.types'
import { INPUT_LABEL_SPACING, STATUS_ICON_CONTAINER_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'

import {
	textInputFieldVariants,
	textInputLabelTextVariants,
	textInputLabelVariants,
} from './inputs.variants'

/**
 * TextAreaInputField with inline status icon support
 *
 * The statusIcon prop renders validation status (success/error/neutral) inline
 * with the field label, providing better accessibility and preventing layout
 * shifts when labels wrap to multiple lines. The status icon is positioned
 * in a fixed-width container to maintain consistent alignment.
 */

type TextAreaInputFieldProps = {
	name: string
	label: string
	rows?: number
	maxLength?: number
	readOnly?: boolean
	disabled?: boolean
	error?: string
	required?: boolean
	className?: string
	labelClassName?: string
	value?: string
	defaultValue?: string
	placeholder?: string
	color?: ColorAccent
	statusIcon?: ReactNode // Status icon (success/error) rendered inline with label
	onChange?: (value: string) => void
	onFocus?: (focusEvent: FocusEvent<HTMLTextAreaElement>) => void
	onBlur?: (focusEvent: FocusEvent<HTMLTextAreaElement>) => void
}

export const TextAreaInputField = forwardRef<HTMLTextAreaElement, TextAreaInputFieldProps>(
	(
		{
			name,
			label,
			rows = 3,
			maxLength,
			readOnly = false,
			disabled = false,
			error,
			required = false,
			className = '',
			labelClassName,
			value,
			defaultValue,
			placeholder,
			color = 'slate',
			statusIcon,
			onChange,
			onFocus,
			onBlur,
		},
		ref,
	): JSX.Element => (
		<div className={className}>
			<label className={textInputLabelVariants()}>
				<div
					className={cn(
						INPUT_LABEL_SPACING,
						'flex items-center justify-between gap-2',
						labelClassName,
					)}
				>
					<span className={textInputLabelTextVariants()}>{label}</span>
					{/* Status icon container with fixed width to prevent layout shifts */}
					{statusIcon ? <div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div> : null}
				</div>
				<div className='relative'>
					<textarea
						ref={ref}
						name={name}
						rows={rows}
						maxLength={maxLength}
						readOnly={readOnly}
						disabled={disabled}
						required={required}
						value={value}
						defaultValue={defaultValue}
						placeholder={placeholder}
						className={cn(
							textInputFieldVariants({
								color,
								disabled: disabled ? true : undefined,
								error: error ? true : undefined,
							}),
							'h-auto resize-none py-3',
							className,
						)}
						aria-invalid={error ? true : undefined}
						aria-errormessage={error ? `${name}-error` : undefined}
						onChange={
							onChange ? (textareaEvent) => onChange(textareaEvent.target.value) : undefined
						}
						onFocus={onFocus}
						onBlur={onBlur}
					/>
				</div>
			</label>
			{error ? (
				<ErrorMessage panelColor={color} id={`${name}-error`}>
					{error}
				</ErrorMessage>
			) : null}
		</div>
	),
)

TextAreaInputField.displayName = 'TextAreaInputField'
