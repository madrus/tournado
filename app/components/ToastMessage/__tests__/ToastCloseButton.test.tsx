import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToastCloseButton } from '../ToastCloseButton'

// Mock the icon components
vi.mock('~/components/icons', () => ({
	CloseIcon: ({ className, size }: { className?: string; size?: number }) => (
		<span data-testid='close-icon' className={className} data-size={size}>
			×
		</span>
	),
}))

describe('ToastCloseButton Component', () => {
	describe('Basic Rendering', () => {
		it('should render close button with icon', () => {
			render(<ToastCloseButton type='info' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toBeInTheDocument()
			expect(screen.getByTestId('close-icon')).toBeInTheDocument()
		})

		it('should render close button even when onClose is not provided', () => {
			render(<ToastCloseButton type='success' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toBeInTheDocument()
		})
	})

	describe('ARIA Labels by Toast Type', () => {
		it('should have correct aria-label for success toast', () => {
			render(<ToastCloseButton type='success' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toHaveAttribute('aria-label', 'Close success notification')
		})

		it('should have correct aria-label for error toast', () => {
			render(<ToastCloseButton type='error' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toHaveAttribute('aria-label', 'Close error notification')
		})

		it('should have correct aria-label for info toast', () => {
			render(<ToastCloseButton type='info' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toHaveAttribute('aria-label', 'Close information notification')
		})

		it('should have correct aria-label for warning toast', () => {
			render(<ToastCloseButton type='warning' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toHaveAttribute('aria-label', 'Close warning notification')
		})
	})

	describe('Click Handling', () => {
		it('should call onClose when button is clicked', () => {
			const handleClose = vi.fn()
			render(<ToastCloseButton type='info' onClose={handleClose} />)

			const closeButton = screen.getByRole('button')
			fireEvent.click(closeButton)

			expect(handleClose).toHaveBeenCalledTimes(1)
		})

		it('should not throw error when clicked without onClose handler', () => {
			render(<ToastCloseButton type='error' />)

			const closeButton = screen.getByRole('button')
			expect(() => fireEvent.click(closeButton)).not.toThrow()
		})

		it('should be keyboard accessible', () => {
			const handleClose = vi.fn()
			render(<ToastCloseButton type='info' onClose={handleClose} />)

			const closeButton = screen.getByRole('button')

			// Simulate keyboard interaction
			closeButton.focus()
			expect(closeButton).toHaveFocus()

			// Test that button is clickable
			fireEvent.click(closeButton)
			expect(handleClose).toHaveBeenCalledTimes(1)
		})
	})

	describe('Icon Styling', () => {
		it('should render close icon with correct attributes', () => {
			render(<ToastCloseButton type='warning' />)

			const closeIcon = screen.getByTestId('close-icon')
			expect(closeIcon).toHaveClass('h-4', 'w-4')
			expect(closeIcon).toHaveAttribute('data-size', '16')
		})

		it('should maintain consistent icon styling across all types', () => {
			const types = ['success', 'error', 'info', 'warning'] as const

			types.forEach((type) => {
				const { unmount } = render(<ToastCloseButton type={type} />)

				const closeIcon = screen.getByTestId('close-icon')
				expect(closeIcon).toHaveClass('h-4', 'w-4')
				expect(closeIcon).toHaveAttribute('data-size', '16')

				unmount()
			})
		})
	})

	describe('Button Styling', () => {
		it('should have correct button styling for each toast type', () => {
			const types = ['success', 'error', 'info', 'warning'] as const

			types.forEach((type) => {
				const { unmount } = render(<ToastCloseButton type={type} />)

				const closeButton = screen.getByRole('button')
				expect(closeButton).toHaveClass('text-white')

				unmount()
			})
		})
	})

	describe('Type Variations', () => {
		it('should render correctly for all toast types', () => {
			const types = ['success', 'error', 'info', 'warning'] as const

			types.forEach((type) => {
				const { unmount } = render(<ToastCloseButton type={type} />)

				const closeButton = screen.getByRole('button')
				expect(closeButton).toBeInTheDocument()
				expect(screen.getByTestId('close-icon')).toBeInTheDocument()

				unmount()
			})
		})

		it('should update aria-label when type changes', () => {
			const { rerender } = render(<ToastCloseButton type='success' />)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close success notification')

			rerender(<ToastCloseButton type='error' />)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close error notification')

			rerender(<ToastCloseButton type='info' />)
			expect(screen.getByRole('button')).toHaveAttribute(
				'aria-label',
				'Close information notification',
			)

			rerender(<ToastCloseButton type='warning' />)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close warning notification')
		})
	})

	describe('Accessibility', () => {
		it('should be focusable', () => {
			render(<ToastCloseButton type='info' />)

			const closeButton = screen.getByRole('button')
			closeButton.focus()
			expect(closeButton).toHaveFocus()
		})

		it('should have proper button role', () => {
			render(<ToastCloseButton type='error' />)

			const closeButton = screen.getByRole('button')
			expect(closeButton).toBeInTheDocument()
		})

		it('should be clickable with mouse', () => {
			const handleClose = vi.fn()
			render(<ToastCloseButton type='info' onClose={handleClose} />)

			const closeButton = screen.getByRole('button')

			// Mouse click
			fireEvent.click(closeButton)
			expect(handleClose).toHaveBeenCalledTimes(1)

			// Multiple clicks
			fireEvent.click(closeButton)
			expect(handleClose).toHaveBeenCalledTimes(2)

			// Another click
			fireEvent.click(closeButton)
			expect(handleClose).toHaveBeenCalledTimes(3)
		})
	})

	describe('Performance', () => {
		it('should memoize aria-label based on type', () => {
			const { rerender } = render(<ToastCloseButton type='success' />)

			// Initial render
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close success notification')

			// Re-render with same type should not change aria-label
			rerender(<ToastCloseButton type='success' />)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close success notification')

			// Change type should update aria-label
			rerender(<ToastCloseButton type='error' />)
			expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close error notification')
		})
	})
})
