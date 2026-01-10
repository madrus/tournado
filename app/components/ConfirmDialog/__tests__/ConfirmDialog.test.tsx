import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog', () => {
	const defaultProps = {
		open: true,
		onOpenChange: vi.fn(),
		title: 'Test Title',
		description: 'Test Description',
		confirmLabel: 'Confirm',
		cancelLabel: 'Cancel',
		onConfirm: vi.fn(),
	}

	it('renders with title and description', () => {
		render(<ConfirmDialog {...defaultProps} />)
		expect(screen.getByText('Test Title')).toBeInTheDocument()
		expect(screen.getByText('Test Description')).toBeInTheDocument()
	})

	it('renders with correct labels', () => {
		render(<ConfirmDialog {...defaultProps} />)
		expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
	})

	it('calls onConfirm when confirm button is clicked', () => {
		render(<ConfirmDialog {...defaultProps} />)
		screen.getByRole('button', { name: 'Confirm' }).click()
		expect(defaultProps.onConfirm).toHaveBeenCalled()
	})

	it('calls onOpenChange when cancel button is clicked', () => {
		render(<ConfirmDialog {...defaultProps} />)
		screen.getByRole('button', { name: 'Cancel' }).click()
		expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
	})

	it('applies correct intent classes for warning', () => {
		render(<ConfirmDialog {...defaultProps} intent='warning' />)
		const iconContainer = screen.getByTestId('confirm-dialog-icon-container')
		expect(iconContainer).toHaveClass('bg-warning-100')
	})

	it('applies correct intent classes for danger', () => {
		render(<ConfirmDialog {...defaultProps} intent='danger' />)
		const iconContainer = screen.getByTestId('confirm-dialog-icon-container')
		expect(iconContainer).toHaveClass('bg-brand-100')
	})

	it('applies correct intent classes for info', () => {
		render(<ConfirmDialog {...defaultProps} intent='info' />)
		const iconContainer = screen.getByTestId('confirm-dialog-icon-container')
		expect(iconContainer).toHaveClass('bg-info-100')
	})

	it('applies correct intent classes for success', () => {
		render(<ConfirmDialog {...defaultProps} intent='success' />)
		const iconContainer = screen.getByTestId('confirm-dialog-icon-container')
		expect(iconContainer).toHaveClass('bg-success-100')
	})

	it('uses disabled color for cancel button (slate styling)', () => {
		render(<ConfirmDialog {...defaultProps} />)
		const cancelButton = screen.getByRole('button', { name: 'Cancel' })
		// ButtonColor 'disabled' maps to 'border-disabled-600' in secondary variant
		expect(cancelButton).toHaveClass('border-disabled-600')
	})

	it('disables buttons when isLoading is true', () => {
		render(<ConfirmDialog {...defaultProps} isLoading={true} />)
		expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
	})

	it('does not render when open is false', () => {
		render(<ConfirmDialog {...defaultProps} open={false} />)
		expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
	})
})
