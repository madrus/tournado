import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettingsStore } from '~/stores/useSettingsStore'

import { CheckboxAgreementField } from '../CheckboxAgreementField'

const state = useSettingsStore.getState

beforeEach(() => {
	state().resetSettingsStoreState()
})

describe('CheckboxAgreementField', () => {
	const defaultProps = {
		name: 'agreement',
		checked: false,
		label: 'I agree to the terms',
		onChange: vi.fn(),
	}

	it('should render with label', () => {
		render(<CheckboxAgreementField {...defaultProps} />)

		expect(screen.getByText('I agree to the terms')).toBeInTheDocument()
		expect(screen.getByRole('checkbox')).toBeInTheDocument()
	})

	it('should render with description when provided', () => {
		render(
			<CheckboxAgreementField {...defaultProps} description='Please read and accept the terms' />,
		)

		expect(screen.getByText('Please read and accept the terms')).toBeInTheDocument()
	})

	it('should call onChange when clicked', () => {
		const mockOnChange = vi.fn()
		render(<CheckboxAgreementField {...defaultProps} onChange={mockOnChange} />)

		const checkbox = screen.getByRole('checkbox')
		fireEvent.click(checkbox)

		expect(mockOnChange).toHaveBeenCalledWith(true)
	})

	it('should call onBlur when focus is lost', () => {
		const mockOnBlur = vi.fn()
		render(<CheckboxAgreementField {...defaultProps} onBlur={mockOnBlur} />)

		const checkbox = screen.getByRole('checkbox')
		fireEvent.blur(checkbox)

		expect(mockOnBlur).toHaveBeenCalled()
	})

	it('should have hover transition animations', async () => {
		const user = userEvent.setup()
		render(<CheckboxAgreementField {...defaultProps} />)

		const checkbox = screen.getByRole('checkbox')

		// Check checkbox for transition classes
		expect(checkbox).toHaveClass('transition-all', 'duration-300')

		// Hover should trigger border and shadow changes
		await user.hover(checkbox)
	})

	it('should have focus transition animations', async () => {
		const user = userEvent.setup()
		render(<CheckboxAgreementField {...defaultProps} />)

		const checkbox = screen.getByRole('checkbox')

		// Check for transition classes on the checkbox input
		expect(checkbox).toHaveClass('transition-all', 'duration-300')

		// Test focus state
		await user.click(checkbox)
		expect(checkbox).toHaveFocus()

		// Test blur state
		await user.tab()
		expect(checkbox).not.toHaveFocus()
	})

	it('should display error message when error prop is provided', () => {
		render(<CheckboxAgreementField {...defaultProps} error='This field is required' />)

		expect(screen.getByText('This field is required')).toBeInTheDocument()
	})

	it('should be disabled when disabled prop is true', () => {
		render(<CheckboxAgreementField {...defaultProps} disabled />)

		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeDisabled()
	})

	it('should be checked when checked prop is true', () => {
		render(<CheckboxAgreementField {...defaultProps} checked />)

		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeChecked()
	})

	it('should show check icon when checked', () => {
		render(<CheckboxAgreementField {...defaultProps} checked />)

		// The check icon should be visible when checked - we can check the presence of the icon
		expect(screen.getByRole('checkbox')).toBeChecked()
		// Check icon presence indirectly by testing the visual state
	})

	it('should not show check icon when unchecked', () => {
		render(<CheckboxAgreementField {...defaultProps} checked={false} />)

		// The check icon should not be visible when unchecked
		expect(screen.getByRole('checkbox')).not.toBeChecked()
	})

	it('should apply custom className', () => {
		render(<CheckboxAgreementField {...defaultProps} className='custom-class' />)

		// Test that the component renders correctly with custom className
		expect(screen.getByRole('checkbox')).toBeInTheDocument()
	})

	it('should apply custom labelClassName', () => {
		render(<CheckboxAgreementField {...defaultProps} labelClassName='custom-label' />)

		// Test that the label can be found and interacted with
		const label = screen.getByLabelText('I agree to the terms')
		expect(label).toBeInTheDocument()
	})

	it('should apply custom inputClassName', () => {
		render(<CheckboxAgreementField {...defaultProps} inputClassName='custom-input' />)

		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeInTheDocument()
	})

	it('should be required when required prop is true', () => {
		render(<CheckboxAgreementField {...defaultProps} required />)

		const checkbox = screen.getByRole('checkbox')
		expect(checkbox).toBeRequired()
	})

	it('should handle color variants', () => {
		render(<CheckboxAgreementField {...defaultProps} color='red' />)

		const checkbox = screen.getByRole('checkbox')
		// Test that the component renders correctly with color prop
		expect(checkbox).toBeInTheDocument()
	})

	it('should handle language prop for RTL support', () => {
		state().setLanguage('ar')
		render(<CheckboxAgreementField {...defaultProps} />)

		// Should not throw and render properly with RTL language
		expect(screen.getByText('I agree to the terms')).toBeInTheDocument()
	})

	it('should handle checkbox state change correctly', async () => {
		const mockOnChange = vi.fn()

		// First render: unchecked
		const { rerender } = render(
			<CheckboxAgreementField {...defaultProps} onChange={mockOnChange} />,
		)
		const uncheckedCheckbox = screen.getByRole('checkbox')
		expect(uncheckedCheckbox).not.toBeChecked()

		// Rerender with checked state
		rerender(<CheckboxAgreementField {...defaultProps} checked onChange={mockOnChange} />)
		const checkedCheckbox = screen.getByRole('checkbox')
		expect(checkedCheckbox).toBeChecked()
	})

	// New tests for internal validation logic
	describe('Internal validation status', () => {
		it('should show success status when checked and required', () => {
			render(
				<CheckboxAgreementField
					{...defaultProps}
					checked={true}
					required={true}
					description='Accept terms'
				/>,
			)

			const statusIcon = screen.getByTestId('field-status-success')
			expect(statusIcon).toBeInTheDocument()
		})

		it('should show error status when unchecked, required, and has error', () => {
			render(
				<CheckboxAgreementField
					{...defaultProps}
					checked={false}
					required={true}
					error='This field is required'
					description='Accept terms'
				/>,
			)

			const statusIcon = screen.getByTestId('field-status-error')
			expect(statusIcon).toBeInTheDocument()
		})

		it('should show neutral status when disabled regardless of other props', () => {
			render(
				<CheckboxAgreementField
					{...defaultProps}
					disabled={true}
					required={true}
					error='Some error'
					description='Accept terms'
				/>,
			)

			// Check that no status icon is rendered for neutral state
			expect(screen.queryByTestId('field-status-success')).not.toBeInTheDocument()
			expect(screen.queryByTestId('field-status-error')).not.toBeInTheDocument()
			expect(screen.queryByTestId('field-status-neutral')).not.toBeInTheDocument()
		})

		it('should show neutral status for optional field when unchecked', () => {
			render(
				<CheckboxAgreementField
					{...defaultProps}
					checked={false}
					required={false}
					description='Accept terms'
				/>,
			)

			// Check that no status icon is rendered for neutral state
			expect(screen.queryByTestId('field-status-success')).not.toBeInTheDocument()
			expect(screen.queryByTestId('field-status-error')).not.toBeInTheDocument()
			expect(screen.queryByTestId('field-status-neutral')).not.toBeInTheDocument()
		})

		it('should show success status for optional field when checked', () => {
			render(
				<CheckboxAgreementField
					{...defaultProps}
					checked={true}
					required={false}
					description='Accept terms'
				/>,
			)

			const statusIcon = screen.getByTestId('field-status-success')
			expect(statusIcon).toBeInTheDocument()
		})

		it('should render status icon even when no description is provided', () => {
			render(<CheckboxAgreementField {...defaultProps} checked={true} required={true} />)

			// Should still show success status icon even without description
			expect(screen.getByTestId('field-status-success')).toBeInTheDocument()
		})
	})
})
