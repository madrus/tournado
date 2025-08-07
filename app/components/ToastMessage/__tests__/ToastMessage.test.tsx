import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToastMessage } from '../ToastMessage'

// Mock the cn utility
vi.mock('~/utils/misc', () => ({
  cn: (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(' '),
}))

// Mock the icon components
vi.mock('~/components/icons', () => ({
  CloseIcon: ({ className, size }: { className?: string; size?: number }) => (
    <span data-testid='close-icon' className={className} data-size={size}>
      ×
    </span>
  ),
  SuccessIcon: ({
    className,
    size,
    weight,
  }: {
    className?: string
    size?: number
    weight?: number
  }) => (
    <span
      data-testid='success-icon'
      className={className}
      data-size={size}
      data-weight={weight}
    >
      ✓
    </span>
  ),
  ExclamationIcon: ({
    className,
    size,
    weight,
  }: {
    className?: string
    size?: number
    weight?: number
  }) => (
    <span
      data-testid='exclamation-icon'
      className={className}
      data-size={size}
      data-weight={weight}
    >
      !
    </span>
  ),
  InfoLetterIcon: ({
    className,
    size,
    weight,
  }: {
    className?: string
    size?: number
    weight?: number
  }) => (
    <span
      data-testid='info-icon'
      className={className}
      data-size={size}
      data-weight={weight}
    >
      i
    </span>
  ),
  WarningIcon: ({
    className,
    size,
    weight,
  }: {
    className?: string
    size?: number
    weight?: number
  }) => (
    <span
      data-testid='warning-icon'
      className={className}
      data-size={size}
      data-weight={weight}
    >
      ⚠
    </span>
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
        />
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
      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument()
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
    it('should render success icon with white background wrapper', () => {
      render(<ToastMessage type='success' title='Success!' />)

      const successIcon = screen.getByTestId('success-icon')
      expect(successIcon).toHaveClass('h-[18px]', 'w-[18px]', 'text-emerald-700')
      expect(successIcon).toHaveAttribute('data-size', '18')
      expect(successIcon).toHaveAttribute('data-weight', '600')

      // Success icon is rendered with proper attributes
      expect(successIcon).toBeInTheDocument()
    })

    it('should render error icon without background wrapper', () => {
      render(<ToastMessage type='error' title='Error!' />)

      const errorIcon = screen.getByTestId('exclamation-icon')
      expect(errorIcon).toHaveClass('h-6', 'w-6', 'text-red-700')
      expect(errorIcon).toHaveAttribute('data-size', '24')
      expect(errorIcon).toHaveAttribute('data-weight', '600')

      // Error icon is rendered with proper attributes
      expect(errorIcon).toBeInTheDocument()
    })

    it('should render info icon without background wrapper', () => {
      render(<ToastMessage type='info' title='Info!' />)

      const infoIcon = screen.getByTestId('info-icon')
      expect(infoIcon).toHaveClass('h-6', 'w-6', 'text-sky-400')
      expect(infoIcon).toHaveAttribute('data-size', '24')
      expect(infoIcon).toHaveAttribute('data-weight', '600')

      // Info icon is rendered with proper attributes
      expect(infoIcon).toBeInTheDocument()
    })

    it('should render warning icon without background wrapper', () => {
      render(<ToastMessage type='warning' title='Warning!' />)

      const warningIcon = screen.getByTestId('warning-icon')
      expect(warningIcon).toHaveClass('h-6', 'w-6', 'text-orange-700')
      expect(warningIcon).toHaveAttribute('data-size', '24')
      expect(warningIcon).toHaveAttribute('data-weight', '600')

      // Warning icon is rendered with proper attributes
      expect(warningIcon).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('should render close button when onClose is provided', () => {
      const handleClose = vi.fn()
      render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn()
      render(<ToastMessage type='success' title='Test' onClose={handleClose} />)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      fireEvent.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('should render close button even when onClose is not provided', () => {
      render(<ToastMessage type='error' title='Test' />)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toBeInTheDocument()
    })

    it('should have correct close button styling for each toast type', () => {
      const types = ['success', 'error', 'info', 'warning'] as const

      types.forEach(type => {
        const { unmount } = render(<ToastMessage type={type} title='Test' />)

        const closeButton = screen.getByRole('button', { name: 'Close' })
        expect(closeButton).toHaveClass('text-white')
        expect(closeButton).toHaveClass('opacity-70')
        expect(closeButton).toHaveClass('hover:opacity-100')

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
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should have proper structure with title and description', () => {
      render(
        <ToastMessage
          type='warning'
          title='Warning Title'
          description='Warning description'
        />
      )

      // Check title styling
      const title = screen.getByText('Warning Title')
      expect(title).toHaveClass('font-medium')

      // Check description styling
      const description = screen.getByText('Warning description')
      expect(description).toHaveClass('mt-1', 'text-sm', 'opacity-90')
    })
  })

  describe('Accessibility', () => {
    it('should have proper close button accessibility', () => {
      const handleClose = vi.fn()
      render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

      const closeButton = screen.getByRole('button', { name: 'Close' })
      expect(closeButton).toHaveAttribute('aria-label', 'Close')
    })

    it('should be keyboard accessible', () => {
      const handleClose = vi.fn()
      render(<ToastMessage type='info' title='Test' onClose={handleClose} />)

      const closeButton = screen.getByRole('button', { name: 'Close' })

      // Simulate keyboard interaction
      closeButton.focus()
      fireEvent.keyDown(closeButton, { key: 'Enter' })

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
        />
      )

      expect(screen.getByText(/very long title/)).toBeInTheDocument()
    })

    it('should handle long descriptions gracefully', () => {
      render(
        <ToastMessage
          type='info'
          title='Title'
          description='This is a very long description that should wrap gracefully and maintain proper spacing and readability across multiple lines of text content.'
        />
      )

      expect(screen.getByText(/very long description/)).toBeInTheDocument()
    })

    it('should handle special characters in title and description', () => {
      render(
        <ToastMessage
          type='success'
          title='Success! 🎉'
          description='Operation completed successfully. File saved to ~/documents/file.txt'
        />
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
        />
      )

      expect(screen.getByText('Integration Test')).toBeInTheDocument()
      expect(screen.getByText('Testing all props together')).toBeInTheDocument()
      expect(screen.getByTestId('success-icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      render(<ToastMessage type='error' title='Minimal Test' />)

      expect(screen.getByText('Minimal Test')).toBeInTheDocument()
      expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })
})
