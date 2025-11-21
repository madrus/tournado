import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToggleChip } from '../ToggleChip'

// Mock i18n
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

describe('ToggleChip', () => {
	const defaultProps = {
		value: 'test-value',
		label: 'Test Label',
		selected: false,
		color: 'indigo' as const,
		onToggle: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Basic Functionality', () => {
		it('should render with correct label', () => {
			render(<ToggleChip {...defaultProps} />)
			expect(screen.getByText('Test Label')).toBeInTheDocument()
		})

		it('should call onToggle when clicked', () => {
			const onToggle = vi.fn()
			render(<ToggleChip {...defaultProps} onToggle={onToggle} />)

			fireEvent.click(screen.getByRole('checkbox'))
			expect(onToggle).toHaveBeenCalledWith('test-value')
		})

		it('should not call onToggle when disabled', () => {
			const onToggle = vi.fn()
			render(<ToggleChip {...defaultProps} onToggle={onToggle} disabled />)

			fireEvent.click(screen.getByRole('checkbox'))
			expect(onToggle).not.toHaveBeenCalled()
		})

		it('should apply custom className', () => {
			render(<ToggleChip {...defaultProps} className='custom-class' />)
			expect(screen.getByTestId('toggle-chip-container')).toHaveClass('custom-class')
		})

		it('should apply custom data-testid', () => {
			render(<ToggleChip {...defaultProps} data-testid='custom-testid' />)
			expect(screen.getByTestId('custom-testid')).toBeInTheDocument()
		})
	})

	describe('Selected State', () => {
		it('should show as checked when selected', () => {
			render(<ToggleChip {...defaultProps} selected />)
			expect(screen.getByRole('checkbox')).toBeChecked()
		})

		it('should show as unchecked when not selected', () => {
			render(<ToggleChip {...defaultProps} selected={false} />)
			expect(screen.getByRole('checkbox')).not.toBeChecked()
		})
	})

	describe('Disabled State', () => {
		it('should disable checkbox when disabled', () => {
			render(<ToggleChip {...defaultProps} disabled />)
			expect(screen.getByRole('checkbox')).toBeDisabled()
		})

		it('should enable checkbox when not disabled', () => {
			render(<ToggleChip {...defaultProps} disabled={false} />)
			expect(screen.getByRole('checkbox')).toBeEnabled()
		})
	})

	describe('Color Variants', () => {
		it('should apply indigo color styling', () => {
			render(<ToggleChip {...defaultProps} color='indigo' />)
			expect(screen.getByTestId('toggle-chip-container')).toHaveClass('hover:border-indigo-300')
		})

		it('should apply fuchsia color styling', () => {
			render(<ToggleChip {...defaultProps} color='fuchsia' />)
			expect(screen.getByTestId('toggle-chip-container')).toHaveClass('hover:border-fuchsia-300')
		})

		it('should apply selected indigo styling', () => {
			render(<ToggleChip {...defaultProps} color='indigo' selected />)
			expect(screen.getByTestId('toggle-chip-container')).toHaveClass('border-indigo-500')
		})

		it('should apply selected fuchsia styling', () => {
			render(<ToggleChip {...defaultProps} color='fuchsia' selected />)
			expect(screen.getByTestId('toggle-chip-container')).toHaveClass('border-fuchsia-500')
		})
	})

	describe('Accessibility', () => {
		it('should render checkbox element', () => {
			render(<ToggleChip {...defaultProps} />)
			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})

		it('should hide checkbox visually but keep it accessible', () => {
			render(<ToggleChip {...defaultProps} />)
			const checkbox = screen.getByRole('checkbox')
			expect(checkbox).toHaveClass('sr-only')
		})
	})
})
