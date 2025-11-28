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
 * TextInputField with inline status icon support
 *
 * The statusIcon prop renders validation status (success/error/neutral) inline
 * with the field label, providing better accessibility and preventing layout
 * shifts when labels wrap to multiple lines. The status icon is positioned
 * in a fixed-width container to maintain consistent alignment.
 */

type InputFieldProps = {
	name: string
	label: string
	type?: 'text' | 'email' | 'tel' | 'password'
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
	onFocus?: (focusEvent: FocusEvent<HTMLInputElement>) => void
	onBlur?: (focusEvent: FocusEvent<HTMLInputElement>) => void
}

export const TextInputField = forwardRef<HTMLInputElement, InputFieldProps>(
	(
		{
			name,
			label,
			type = 'text',
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
					className={`${INPUT_LABEL_SPACING} flex items-center justify-between gap-2`}
				>
					<span className={cn(textInputLabelTextVariants(), labelClassName)}>
						{label}
					</span>
					{/* Status icon container with fixed width to prevent layout shifts */}
					<div className={STATUS_ICON_CONTAINER_WIDTH}>{statusIcon}</div>
				</div>
				<div className='relative'>
					<input
						ref={ref}
						name={name}
						type={type}
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
							className,
						)}
						aria-invalid={error ? true : undefined}
						aria-errormessage={error ? `${name}-error` : undefined}
						onChange={
							onChange ? (inputEvent) => onChange(inputEvent.target.value) : undefined
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

TextInputField.displayName = 'TextInputField'
