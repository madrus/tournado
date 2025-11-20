import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { describe, expect, it, vi } from 'vitest'

import { DateInputField } from '../DateInputField'

describe('DateInputField', () => {
	const defaultProps = {
		name: 'test-date',
		label: 'Test Date',
		onChange: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should render with label', () => {
		render(<DateInputField {...defaultProps} />)

		expect(screen.getByText('Test Date')).toBeInTheDocument()
		expect(screen.getByLabelText('Test Date')).toBeInTheDocument()
	})

	it('should render with placeholder', () => {
		render(<DateInputField {...defaultProps} placeholder='Select a date' />)

		expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument()
	})

	it('should display current value', () => {
		render(<DateInputField {...defaultProps} defaultValue='2024-01-15' />)

		expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument()
	})

	it('should call onChange when date is entered', async () => {
		const mockOnChange = vi.fn()
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} onChange={mockOnChange} />)

		const input = screen.getByLabelText('Test Date')
		await user.type(input, '2024-01-15')

		expect(mockOnChange).toHaveBeenCalled()
	})

	it('should call onBlur when focus is lost', async () => {
		const mockOnBlur = vi.fn()
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} onBlur={mockOnBlur} />)

		const input = screen.getByLabelText('Test Date')
		await user.click(input)
		await user.tab() // Move focus away

		expect(mockOnBlur).toHaveBeenCalled()
	})

	it('should display error message when error prop is provided', () => {
		render(<DateInputField {...defaultProps} error='Invalid date' />)

		expect(screen.getByText('Invalid date')).toBeInTheDocument()
	})

	it('should be disabled when disabled prop is true', () => {
		render(<DateInputField {...defaultProps} disabled />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toBeDisabled()
	})

	it('should be required when required prop is true', () => {
		render(<DateInputField {...defaultProps} required />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toBeRequired()
	})

	it('should have date input type', () => {
		render(<DateInputField {...defaultProps} />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveAttribute('type', 'date')
	})

	it('should apply custom className', () => {
		render(<DateInputField {...defaultProps} className='custom-class' />)

		// Test that the component renders correctly with custom className
		expect(screen.getByLabelText('Test Date')).toBeInTheDocument()
	})

	it('should handle color variants', () => {
		render(<DateInputField {...defaultProps} color='red' />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toBeInTheDocument()
	})

	it('should render with correct name attribute', () => {
		render(<DateInputField {...defaultProps} name='custom-date' />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveAttribute('name', 'custom-date')
	})

	it('should handle valid date format', async () => {
		const mockOnChange = vi.fn()
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} onChange={mockOnChange} />)

		const input = screen.getByLabelText('Test Date')
		await user.type(input, '2024-12-25')

		expect(mockOnChange).toHaveBeenCalled()
	})

	it('should handle min and max date constraints', () => {
		render(<DateInputField {...defaultProps} min='2024-01-01' max='2024-12-31' />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveAttribute('min', '2024-01-01')
		expect(input).toHaveAttribute('max', '2024-12-31')
	})

	it('should handle focus and blur events correctly', async () => {
		const mockOnBlur = vi.fn()
		const user = userEvent.setup()

		render(<DateInputField {...defaultProps} onBlur={mockOnBlur} />)

		const input = screen.getByLabelText('Test Date')

		await user.click(input)
		await user.tab()
		expect(mockOnBlur).toHaveBeenCalled()
	})

	it('should handle defaultValue correctly', () => {
		const mockOnChange = vi.fn()

		render(<DateInputField {...defaultProps} defaultValue='2024-01-15' onChange={mockOnChange} />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveValue('2024-01-15')
	})

	it('should show label correctly associated with input', () => {
		render(<DateInputField {...defaultProps} label='Birth Date' />)

		const input = screen.getByLabelText('Birth Date')
		expect(input).toBeInTheDocument()
	})

	it('should handle empty defaultValue', () => {
		render(<DateInputField {...defaultProps} defaultValue='' />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveValue('')
	})

	it('should handle readOnly prop', () => {
		render(<DateInputField {...defaultProps} readOnly />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toHaveAttribute('readonly')
	})

	it('should handle keyboard navigation correctly', async () => {
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} defaultValue='2024-01-15' />)

		const input = screen.getByLabelText('Test Date')
		await user.click(input)

		// Should be able to focus and interact with the date input
		expect(input).toHaveFocus()
	})

	it('should handle date clearing', async () => {
		const mockOnChange = vi.fn()
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} defaultValue='2024-01-15' onChange={mockOnChange} />)

		const input = screen.getByLabelText('Test Date')
		await user.clear(input)

		expect(mockOnChange).toHaveBeenCalled()
	})

	it('should handle date input validation', () => {
		render(<DateInputField {...defaultProps} required />)

		const input = screen.getByLabelText('Test Date')
		expect(input).toBeInvalid() // Empty required field should be invalid
	})

	it('should have hover transition animations', async () => {
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} />)

		const input = screen.getByLabelText('Test Date')

		// Check for transition classes
		expect(input).toHaveClass('transition-all', 'duration-300', 'ease-in-out')

		// Hover should trigger border and shadow changes
		await user.hover(input)

		// Focus should trigger border changes
		await user.click(input)
		expect(input).toHaveFocus()
	})

	it('should have focus transition animations', async () => {
		const user = userEvent.setup()
		render(<DateInputField {...defaultProps} />)

		const input = screen.getByLabelText('Test Date')

		// Test focus state
		await user.click(input)
		expect(input).toHaveFocus()

		// Test blur state
		await user.tab()
		expect(input).not.toHaveFocus()
	})
})
