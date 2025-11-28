import type { JSX } from 'react'

import type { Category, Division } from '~/db.server'
import { getCurrentCategoryLabel, getCurrentDivisionLabel } from '~/lib/lib.helpers'

import { ToggleChip } from './ToggleChip'
import type { ToggleChipColorVariant } from './toggleChip.variants'

type ToggleChipGroupProps = {
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
	 * Whether the group is disabled
	 */
	disabled?: boolean
	/**
	 * The color scheme for all chips in the group
	 */
	color: ToggleChipColorVariant
	/**
	 * Optional className for the container
	 */
	className?: string
}

/**
 * ToggleChipGroup component - provides field-level validation for groups of toggle chips
 *
 * This is a virtual group that doesn't add visual styling, but provides:
 * - Field-level validation (red cross if none selected, green checkmark if at least one selected)
 * - Consistent interface for managing groups of toggle chips
 * - Integration with existing FieldStatusIcon component
 */
export function ToggleChipGroup({
	items,
	type,
	selectedValues,
	onToggle,
	disabled = false,
	color,
	className,
}: Readonly<ToggleChipGroupProps>): JSX.Element {
	// Grid layout constant
	const GRID_LAYOUT = 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'

	// Helper functions for label and test-id generation
	const getLabel = (item: string): string => {
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
			{/* Toggle Chips Grid - unchanged visual layout */}
			<div className={GRID_LAYOUT}>
				{items.map((item) => (
					<ToggleChip
						key={item}
						value={item}
						label={getLabel(item)}
						selected={selectedValues.includes(item)}
						disabled={disabled}
						color={color}
						onToggle={onToggle}
						data-testid={getTestId(item)}
					/>
				))}
			</div>
		</div>
	)
}
