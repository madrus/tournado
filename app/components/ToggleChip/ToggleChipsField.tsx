import { type JSX, useCallback } from 'react'

import { ErrorMessage } from '~/components/ErrorMessage'
import { FieldStatusIcon } from '~/components/shared/FieldStatusIcon'
import { LabelWithStatusIcon } from '~/components/shared/LabelWithStatusIcon'
import type { Category, Division } from '~/db.server'
import { getCurrentCategoryLabel, getCurrentDivisionLabel } from '~/lib/lib.helpers'

import { ToggleChip } from './ToggleChip'
import type { ToggleChipColorVariant } from './toggleChip.variants'

export type ToggleChipsFieldProps = {
	/**
	 * Array of items to display as toggle chips
	 */
	items: string[]
	/**
	 * Type of items - determines how labels are generated
	 */
	type: 'divisions' | 'categories'
	/**
	 * Array of currently selected values
	 */
	selectedValues: string[]
	/**
	 * Callback when an item is toggled
	 */
	onToggle: (value: string) => void
	/**
	 * The label text to display above the chips
	 */
	label: string
	/**
	 * Error message to display below the chips
	 */
	error?: string
	/**
	 * Whether the field is required
	 */
	required?: boolean
	/**
	 * Whether the field is disabled
	 */
	disabled?: boolean
	/**
	 * The color scheme for all chips in the group
	 */
	color: ToggleChipColorVariant
	/**
	 * Additional className for the container
	 */
	className?: string
}

/**
 * ToggleChipsField component - a complete form field with label, validation, and toggle chips
 *
 * This component provides a consistent interface for toggle chip fields with:
 * - Label with status icon showing validation state
 * - Grid of toggle chips for selection
 * - Error message display
 * - Internal validation logic
 *
 * Follows the same pattern as CheckboxAgreementField for consistency.
 */
export function ToggleChipsField({
	items,
	type,
	selectedValues,
	onToggle,
	label,
	error,
	required = false,
	disabled = false,
	color,
	className,
}: ToggleChipsFieldProps): JSX.Element {
	// Grid layout constant
	const GRID_LAYOUT = 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'

	// Helper function to determine field status for status icons
	const getFieldStatus = useCallback((): 'success' | 'error' | 'neutral' => {
		if (disabled) return 'neutral'
		const hasValue = selectedValues.length > 0
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
	}, [disabled, selectedValues.length, error, required])

	// Helper functions for label and test-id generation
	const getItemLabel = (item: string): string => {
		if (type === 'divisions') {
			return getCurrentDivisionLabel(item as Division)
		} else {
			return getCurrentCategoryLabel(item as Category)
		}
	}

	const getTestId = (item: string): string => {
		// Convert plural type to singular for test IDs
		const singularType =
			type === 'categories' ? 'category' : type === 'divisions' ? 'division' : type
		return `${singularType}-${item.toLowerCase()}`
	}

	return (
		<div className={className}>
			{/* Label with Status Icon */}
			<LabelWithStatusIcon
				label={label}
				statusIcon={<FieldStatusIcon status={getFieldStatus()} />}
			/>

			{/* Toggle Chips Grid */}
			<div className={GRID_LAYOUT}>
				{items.map((item) => (
					<ToggleChip
						key={item}
						value={item}
						label={getItemLabel(item)}
						selected={selectedValues.includes(item)}
						disabled={disabled}
						color={color}
						onToggle={onToggle}
						data-testid={getTestId(item)}
					/>
				))}
			</div>

			{/* Error Message */}
			{error ? <ErrorMessage panelColor={color}>{error}</ErrorMessage> : null}
		</div>
	)
}
