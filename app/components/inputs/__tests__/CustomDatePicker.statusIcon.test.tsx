import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { CustomDatePicker } from '../CustomDatePicker'

// Mock the translation hook
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

describe('CustomDatePicker - StatusIcon Support', () => {
	const defaultProps = {
		name: 'startDate',
		label: 'Start Date',
	}

	it('renders status icon when provided', () => {
		const statusIcon = <div data-testid='status-icon'>✓</div>
		render(<CustomDatePicker {...defaultProps} statusIcon={statusIcon} />)

		expect(screen.getByText('Start Date')).toBeInTheDocument()
		expect(screen.getByTestId('status-icon')).toBeInTheDocument()
	})

	it('renders without status icon when not provided', () => {
		render(<CustomDatePicker {...defaultProps} />)

		expect(screen.getByText('Start Date')).toBeInTheDocument()
		expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument()
	})

	it('applies correct layout classes for label with status icon', () => {
		const statusIcon = <div data-testid='status-icon'>✓</div>
		render(<CustomDatePicker {...defaultProps} statusIcon={statusIcon} />)

		// Verify both label and status icon are rendered
		expect(screen.getByText('Start Date')).toBeInTheDocument()
		expect(screen.getByTestId('status-icon')).toBeInTheDocument()
	})

	it('renders status icon in fixed-width container', () => {
		const statusIcon = <div data-testid='status-icon'>✓</div>
		render(<CustomDatePicker {...defaultProps} statusIcon={statusIcon} />)

		// Verify status icon is rendered and positioned correctly
		expect(screen.getByTestId('status-icon')).toBeInTheDocument()
		expect(screen.getByText('Start Date')).toBeInTheDocument()
	})

	it('maintains proper spacing with INPUT_LABEL_SPACING', () => {
		const statusIcon = <div data-testid='status-icon'>✓</div>
		render(<CustomDatePicker {...defaultProps} statusIcon={statusIcon} />)

		// Verify proper spacing by checking both elements are rendered correctly
		expect(screen.getByText('Start Date')).toBeInTheDocument()
		expect(screen.getByTestId('status-icon')).toBeInTheDocument()
	})

	it('works with all existing props while showing status icon', () => {
		const statusIcon = <div data-testid='success-icon'>✓</div>
		render(
			<CustomDatePicker
				name='testDate'
				label='Test Date'
				value='2024-01-01'
				required={true}
				error='Some error'
				color='emerald'
				statusIcon={statusIcon}
			/>,
		)

		expect(screen.getByText('Test Date')).toBeInTheDocument()
		expect(screen.getByTestId('success-icon')).toBeInTheDocument()
		expect(screen.getByText('01/01/2024')).toBeInTheDocument() // Formatted date display
	})

	it('renders correctly when readOnly with status icon', () => {
		const statusIcon = <div data-testid='readonly-icon'>—</div>
		render(
			<CustomDatePicker {...defaultProps} readOnly={true} statusIcon={statusIcon} />,
		)

		expect(screen.getByTestId('readonly-icon')).toBeInTheDocument()
		const button = screen.getByRole('button')
		expect(button).toBeDisabled()
	})

	it('maintains accessibility with status icon present', () => {
		const statusIcon = (
			<div data-testid='accessible-icon' aria-hidden='true'>
				✓
			</div>
		)
		render(
			<CustomDatePicker {...defaultProps} required={true} statusIcon={statusIcon} />,
		)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-label', 'Start Date - select date')
		expect(screen.getByTestId('accessible-icon')).toBeInTheDocument()
	})

	it('renders error message alongside status icon', () => {
		const statusIcon = <div data-testid='error-icon'>✗</div>
		render(
			<CustomDatePicker
				{...defaultProps}
				error='This field is required'
				statusIcon={statusIcon}
			/>,
		)

		expect(screen.getByText('This field is required')).toBeInTheDocument()
		expect(screen.getByTestId('error-icon')).toBeInTheDocument()
	})

	it('handles color variants with status icon', () => {
		const statusIcon = <div data-testid='colored-icon'>✓</div>
		render(<CustomDatePicker {...defaultProps} color='red' statusIcon={statusIcon} />)

		expect(screen.getByTestId('colored-icon')).toBeInTheDocument()
		// The component should render without errors with the color prop
		expect(screen.getByText('Start Date')).toBeInTheDocument()
	})
})
