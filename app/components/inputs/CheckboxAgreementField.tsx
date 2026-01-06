import { forwardRef } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import { CheckMarkIcon } from '~/components/icons'
import { FieldStatusIcon } from '~/components/shared/FieldStatusIcon'
import { LabelWithStatusIcon } from '~/components/shared/LabelWithStatusIcon'
import type { ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

import {
	checkboxAgreementCheckmarkVariants,
	checkboxAgreementFieldVariants,
	checkboxAgreementInputVariants,
} from './inputs.variants'

/**
 * CheckboxAgreementField with inline status icon support
 *
 * The statusIcon prop renders validation status (success/error/neutral) inline
 * with the field description, providing better accessibility and preventing layout
 * shifts when description text wraps to multiple lines. The status icon is positioned
 * in a fixed-width container to maintain consistent alignment.
 *
 * This component uses items-end alignment to ensure the status icon aligns with
 * the bottom of the description text for optimal visual hierarchy.
 */

export type CheckboxAgreementFieldProps = {
	name: string
	checked: boolean
	label: string
	description?: string
	error?: string
	required?: boolean
	disabled?: boolean
	onChange: (checked: boolean) => void
	onBlur?: () => void
	className?: string
	labelClassName?: string
	inputClassName?: string
	color?: ColorAccent
}

export const CheckboxAgreementField = forwardRef<
	HTMLInputElement,
	CheckboxAgreementFieldProps
>(
	(
		{
			name,
			checked,
			label,
			description,
			error,
			required = false,
			disabled = false,
			onChange,
			onBlur,
			className = '',
			labelClassName = '',
			inputClassName = '',
			color = 'slate',
		},
		ref,
	) => {
		// Helper function to determine field status for status icons
		const getFieldStatus = (): 'success' | 'error' | 'neutral' => {
			if (disabled) return 'neutral'
			const hasValue = checked
			const hasError = Boolean(error)

			// For required fields: show error if empty, success if filled
			if (required) {
				if (hasValue && !hasError) return 'success'
				if (hasError) return 'error'
				return 'neutral'
			}

			// For optional fields: only show success if filled, never show error for being empty
			if (hasValue && !hasError) return 'success'
			return 'neutral'
		}

		const statusIcon = <FieldStatusIcon status={getFieldStatus()} />

		return (
			<div className={className}>
				{description ? (
					<LabelWithStatusIcon label={description} statusIcon={statusIcon} />
				) : statusIcon ? (
					// Only render container if there's actually an icon to show
					<div className='mb-2 flex justify-end'>
						<div className='w-6 shrink-0'>{statusIcon}</div>
					</div>
				) : null}
				<div
					className={cn(
						checkboxAgreementFieldVariants({ color, error: !!error, disabled }),
						labelClassName,
					)}
				>
					<div className='relative flex shrink-0 items-center justify-center'>
						<input
							ref={ref}
							type='checkbox'
							name={name}
							id={name}
							checked={checked}
							onChange={(event) => onChange(event.target.checked)}
							onBlur={onBlur}
							className={cn(
								checkboxAgreementInputVariants({
									color,
									error: !!error,
									disabled,
								}),
								inputClassName,
							)}
							required={required}
							disabled={disabled}
						/>
						{checked ? (
							<CheckMarkIcon
								className={checkboxAgreementCheckmarkVariants({
									color,
									error: !!error,
									disabled,
								})}
								size={18}
							/>
						) : null}
					</div>
					<label
						htmlFor={name}
						className={cn(
							'cursor-pointer font-normal text-foreground text-lg leading-6',
							getLatinTextClass(),
						)}
					>
						{label}
					</label>
				</div>
				{error ? <ErrorMessage panelColor={color}>{error}</ErrorMessage> : null}
			</div>
		)
	},
)

CheckboxAgreementField.displayName = 'CheckboxAgreementField'
