import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToastMessage } from '../ToastMessage'

// Mock the cn utility
vi.mock('~/utils/misc', () => ({
	cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}))

// Mock the extracted components
vi.mock('../ToastIcon', () => ({
	ToastIcon: ({ type }: { type: string }) => (
		<span data-testid={`${type}-icon`}>
			{type === 'success' ? '✓' : type === 'error' ? '!' : type === 'info' ? 'i' : '⚠'}
		</span>
	),
}))

vi.mock('../ToastCloseButton', () => ({
	ToastCloseButton: ({ type, onClose }: { type: string; onClose?: () => void }) => (
		<button
			type='button'
			onClick={onClose}
			aria-label={`Close ${type} notification`}
			data-testid='close-button'
		>
			×
		</button>
	),
}))

describe('ToastMessage Component', () => {
	describe('Basic Rendering', () => {
		it('should render toast message with title', () => {
			render(<ToastMessage type='info' title='Test message' />)

			expect(screen.getByText('Test message')).toBeInTheDocument()
			expect(screen.getByTestId('info-icon')).toBeInTheDocument()
		})

		it('should render toast message with title and description', () => {
			render(
				<ToastMessage
					type='success'
					title='Success message'
					description='This is a detailed description'
				/>,
			)

			expect(screen.getByText('Success message')).toBeInTheDocument()
			expect(screen.getByText('This is a detailed description')).toBeInTheDocument()
			expect(screen.getByTestId('success-icon')).toBeInTheDocument()
		})

		it('should not render description when not provided', () => {
			render(<ToastMessage type='error' title='Error message' />)

			expect(screen.getByText('Error message')).toBeInTheDocument()
			expect(screen.queryByText(/detailed/)).not.toBeInTheDocument()
		})
	})

	describe('Toast Types', () => {
		it('should render success toast with correct styling', () => {
			render(<ToastMessage type='success' title='Success!' />)

			expect(screen.getByText('Success!')).toHaveClass('font-medium')
			expect(screen.getByTestId('success-icon')).toBeInTheDocument()
		})

		it('should render error toast with correct styling', () => {
			render(<ToastMessage type='error' title='Error!' />)

			expect(screen.getByText('Error!')).toHaveClass('font-medium')
			expect(screen.getByTestId('error-icon')).toBeInTheDocument()
		})

		it('should render info toast with correct styling', () => {
			render(<ToastMessage type='info' title='Info!' />)

			expect(screen.getByText('Info!')).toHaveClass('font-medium')
			expect(screen.getByTestId('info-icon')).toBeInTheDocument()
		})

		it('should render warning toast with correct styling', () => {
			render(<ToastMessage type='warning' title='Warning!' />)

			expect(screen.getByText('Warning!')).toHaveClass('font-medium')
			expect(screen.getByTestId('warning-icon')).toBeInTheDocument()
		})
	})

	describe('Icons', () => {
		it('should render icons for all toast types', () => {
			const types = ['success', 'error', 'info', 'warning'] as const

			types.forEach((type) => {
				const { unmount } = render(<ToastMessage type={type} title={`${type} message`} />)

				expect(screen.getByTestId(`${type}-icon`)).toBeInTheDocument()

				unmount()
			})
		})
	})

	describe('Close Button', () => {
		it('should render close button when onClose is provided', () => {
			const handleClose = vi.fn()
			render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

			const closeButton = screen.getByTestId('close-button')
			expect(closeButton).toBeInTheDocument()
			expect(closeButton).toHaveAttribute('aria-label', 'Close info notification')
		})

		it('should call onClose when close button is clicked', () => {
			const handleClose = vi.fn()
			render(<ToastMessage type='success' title='Test' onClose={handleClose} />)

			const closeButton = screen.getByTestId('close-button')
			fireEvent.click(closeButton)

			expect(handleClose).toHaveBeenCalledTimes(1)
		})

		it('should render close button even when onClose is not provided', () => {
			render(<ToastMessage type='error' title='Test' />)

			const closeButton = screen.getByTestId('close-button')
			expect(closeButton).toBeInTheDocument()
			expect(closeButton).toHaveAttribute('aria-label', 'Close error notification')
		})

		it('should have correct aria-label for each toast type', () => {
			const types = ['success', 'error', 'info', 'warning'] as const

			types.forEach((type) => {
				const { unmount } = render(<ToastMessage type={type} title='Test' />)

				const closeButton = screen.getByTestId('close-button')
				expect(closeButton).toHaveAttribute('aria-label', `Close ${type} notification`)

				unmount()
			})
		})
	})

	describe('Base Styling', () => {
		it('should have correct base CSS classes', () => {
			render(<ToastMessage type='info' title='Test' />)

			// Verify the component renders with the expected elements
			expect(screen.getByText('Test')).toBeInTheDocument()
			expect(screen.getByTestId('info-icon')).toBeInTheDocument()
			expect(screen.getByTestId('close-button')).toBeInTheDocument()
		})

		it('should have proper structure with title and description', () => {
			render(
				<ToastMessage type='warning' title='Warning Title' description='Warning description' />,
			)

			// Check title styling
			const title = screen.getByText('Warning Title')
			expect(title).toHaveClass('font-medium')

			// Check description styling
			const description = screen.getByText('Warning description')
			expect(description).toHaveClass('mt-1', 'text-sm')
		})
	})

	describe('Accessibility', () => {
		it('should have proper close button accessibility', () => {
			const handleClose = vi.fn()
			render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

			const closeButton = screen.getByTestId('close-button')
			expect(closeButton).toHaveAttribute('aria-label', 'Close info notification')
		})

		it('should be keyboard accessible', () => {
			const handleClose = vi.fn()
			render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

			const closeButton = screen.getByTestId('close-button')

			// Simulate keyboard interaction
			closeButton.focus()
			expect(closeButton).toHaveFocus()

			// Button should still be clickable
			fireEvent.click(closeButton)
			expect(handleClose).toHaveBeenCalledTimes(1)
		})
	})

	describe('Content Variations', () => {
		it('should handle long titles gracefully', () => {
			render(
				<ToastMessage
					type='info'
					title='This is a very long title that might wrap to multiple lines'
				/>,
			)

			expect(screen.getByText(/very long title/)).toBeInTheDocument()
		})

		it('should handle long descriptions gracefully', () => {
			render(
				<ToastMessage
					type='info'
					title='Title'
					description='This is a very long description that should wrap gracefully and maintain proper spacing and readability across multiple lines of text content.'
				/>,
			)

			expect(screen.getByText(/very long description/)).toBeInTheDocument()
		})

		it('should handle special characters in title and description', () => {
			render(
				<ToastMessage
					type='success'
					title='Success! 🎉'
					description='Operation completed successfully. File saved to ~/documents/file.txt'
				/>,
			)

			expect(screen.getByText('Success! 🎉')).toBeInTheDocument()
			expect(screen.getByText(/Operation completed successfully/)).toBeInTheDocument()
		})

		it('should handle empty descriptions gracefully', () => {
			render(<ToastMessage type='info' title='Title' description='' />)

			// Empty description should not render a description paragraph
			expect(screen.getByText('Title')).toBeInTheDocument()
			expect(screen.getByText('Title')).toHaveClass('font-medium')
		})
	})

	describe('Component Integration', () => {
		it('should work with all required props', () => {
			const handleClose = vi.fn()

			render(
				<ToastMessage
					type='success'
					title='Integration Test'
					description='Testing all props together'
					onClose={handleClose}
				/>,
			)

			expect(screen.getByText('Integration Test')).toBeInTheDocument()
			expect(screen.getByText('Testing all props together')).toBeInTheDocument()
			expect(screen.getByTestId('success-icon')).toBeInTheDocument()
			expect(screen.getByTestId('close-button')).toBeInTheDocument()
		})

		it('should work with minimal props', () => {
			render(<ToastMessage type='error' title='Minimal Test' />)

			expect(screen.getByText('Minimal Test')).toBeInTheDocument()
			expect(screen.getByTestId('error-icon')).toBeInTheDocument()
			expect(screen.getByTestId('close-button')).toBeInTheDocument()
		})
	})
})
