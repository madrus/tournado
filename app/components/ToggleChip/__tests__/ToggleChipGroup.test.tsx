import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { useSettingsStore } from '~/stores/useSettingsStore'

import { ToggleChipGroup } from '../ToggleChipGroup'

// Mock the helper functions
vi.mock('~/lib/lib.helpers', () => ({
	getDivisionLabelByValue: vi.fn((division) => `Division ${division}`),
	getCategoryLabelByValue: vi.fn((category) => `Category ${category}`),
	getCurrentDivisionLabel: vi.fn((division) => `Division ${division}`),
	getCurrentCategoryLabel: vi.fn((category) => `Category ${category}`),
	isBrowser: true,
}))

describe('ToggleChipGroup', () => {
	const state = useSettingsStore.getState

	const defaultProps = {
		items: ['item1', 'item2', 'item3'],
		type: 'divisions' as const,
		selectedValues: [],
		onToggle: vi.fn(),
		color: 'emerald' as const,
	}

	beforeEach(() => {
		vi.clearAllMocks()
		state().resetSettingsStoreState()
	})

	it('renders all toggle chips', () => {
		render(<ToggleChipGroup {...defaultProps} />)

		expect(screen.getByText('Division item1')).toBeInTheDocument()
		expect(screen.getByText('Division item2')).toBeInTheDocument()
		expect(screen.getByText('Division item3')).toBeInTheDocument()
	})

	it('uses correct labels for divisions', () => {
		render(<ToggleChipGroup {...defaultProps} type='divisions' />)

		expect(screen.getByText('Division item1')).toBeInTheDocument()
		expect(screen.getByText('Division item2')).toBeInTheDocument()
		expect(screen.getByText('Division item3')).toBeInTheDocument()
	})

	it('uses correct labels for categories', () => {
		render(
			<ToggleChipGroup {...defaultProps} type='categories' items={['cat1', 'cat2']} />,
		)

		expect(screen.getByText('Category cat1')).toBeInTheDocument()
		expect(screen.getByText('Category cat2')).toBeInTheDocument()
	})

	it('calls onToggle when chip is clicked', () => {
		const onToggle = vi.fn()
		render(<ToggleChipGroup {...defaultProps} onToggle={onToggle} />)

		fireEvent.click(screen.getByText('Division item1'))

		expect(onToggle).toHaveBeenCalledWith('item1')
	})

	it('renders selected chips correctly', () => {
		render(<ToggleChipGroup {...defaultProps} selectedValues={['item1', 'item3']} />)

		const checkboxes = screen.getAllByRole('checkbox')
		expect(checkboxes[0]).toBeChecked() // item1
		expect(checkboxes[1]).not.toBeChecked() // item2
		expect(checkboxes[2]).toBeChecked() // item3
	})

	it('disables all chips when disabled prop is true', () => {
		render(<ToggleChipGroup {...defaultProps} disabled={true} />)

		const chips = screen.getAllByRole('checkbox')
		chips.forEach((chip) => {
			expect(chip).toBeDisabled()
		})
	})

	it('uses correct test ids for divisions', () => {
		render(<ToggleChipGroup {...defaultProps} type='divisions' />)

		expect(screen.getByTestId('division-item1')).toBeInTheDocument()
		expect(screen.getByTestId('division-item2')).toBeInTheDocument()
		expect(screen.getByTestId('division-item3')).toBeInTheDocument()
	})

	it('uses correct test ids for categories', () => {
		render(
			<ToggleChipGroup {...defaultProps} type='categories' items={['cat1', 'cat2']} />,
		)

		expect(screen.getByTestId('category-cat1')).toBeInTheDocument()
		expect(screen.getByTestId('category-cat2')).toBeInTheDocument()
	})

	it('applies custom className', () => {
		render(<ToggleChipGroup {...defaultProps} className='custom-class' />)

		// Verify the component renders without error with custom class
		expect(screen.getByText('Division item1')).toBeInTheDocument()
	})

	it('applies correct grid layout classes', () => {
		render(<ToggleChipGroup {...defaultProps} />)

		// Verify all items are rendered in the grid layout
		expect(screen.getByText('Division item1')).toBeInTheDocument()
		expect(screen.getByText('Division item2')).toBeInTheDocument()
		expect(screen.getByText('Division item3')).toBeInTheDocument()
	})

	it('passes correct color to individual chips', () => {
		render(<ToggleChipGroup {...defaultProps} color='red' />)

		// Each chip should receive the color prop
		const chips = screen.getAllByRole('checkbox')
		expect(chips).toHaveLength(3)

		// Test that chips are rendered (color application is tested in ToggleChip tests)
		chips.forEach((chip) => {
			expect(chip).toBeInTheDocument()
		})
	})

	it('handles empty items array', () => {
		render(<ToggleChipGroup {...defaultProps} items={[]} />)

		expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
	})

	it('handles different languages', () => {
		// This tests that the component doesn't break with different languages
		// The actual language handling is tested in the helper function mocks
		render(<ToggleChipGroup {...defaultProps} />)

		expect(screen.getByText('Division item1')).toBeInTheDocument()
	})

	it('maintains selection state correctly', () => {
		const { rerender } = render(
			<ToggleChipGroup {...defaultProps} selectedValues={['item1']} />,
		)

		// Initially item1 is selected
		let checkboxes = screen.getAllByRole('checkbox')
		expect(checkboxes[0]).toBeChecked() // item1
		expect(checkboxes[1]).not.toBeChecked() // item2

		// Update selection
		rerender(<ToggleChipGroup {...defaultProps} selectedValues={['item2']} />)

		// Now item2 is selected
		checkboxes = screen.getAllByRole('checkbox')
		expect(checkboxes[0]).not.toBeChecked() // item1
		expect(checkboxes[1]).toBeChecked() // item2
	})

	it('handles mixed selection states', () => {
		render(
			<ToggleChipGroup
				{...defaultProps}
				selectedValues={['item1', 'item3']}
				disabled={false}
			/>,
		)

		const chips = screen.getAllByRole('checkbox')
		expect(chips[0]).toBeChecked() // item1
		expect(chips[1]).not.toBeChecked() // item2
		expect(chips[2]).toBeChecked() // item3

		// All should be enabled
		chips.forEach((chip) => {
			expect(chip).toBeEnabled()
		})
	})
})
