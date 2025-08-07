import { render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { ToastIcon } from '../ToastIcon'

// Mock the icon components with proper className handling
vi.mock('~/components/icons', () => ({
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
      className={className || 'h-[18px] w-[18px] text-emerald-700'}
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
      data-testid='error-icon'
      className={className || 'h-6 w-6 text-red-700'}
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
      className={className || 'h-6 w-6 text-sky-400'}
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
      className={className || 'h-6 w-6 text-orange-700'}
      data-size={size}
      data-weight={weight}
    >
      ⚠
    </span>
  ),
}))

// Mock the toastIconVariants function
vi.mock('../toastMessage.variants', () => ({
  toastIconVariants: ({ hasBackground }: { hasBackground: boolean }) =>
    hasBackground ? 'bg-white rounded-full p-1' : '',
}))

describe('ToastIcon Component', () => {
  describe('Success Icon', () => {
    it('should render success icon with correct styling and attributes', () => {
      render(<ToastIcon type='success' />)

      const successIcon = screen.getByTestId('success-icon')
      expect(successIcon).toBeInTheDocument()
      expect(successIcon).toHaveClass('h-[18px]', 'w-[18px]', 'text-emerald-700')
      expect(successIcon).toHaveAttribute('data-size', '18')
      expect(successIcon).toHaveAttribute('data-weight', '600')
    })

    it('should render success icon with background wrapper', () => {
      render(<ToastIcon type='success' />)

      const wrapper = screen.getByTestId('success-wrapper')
      expect(wrapper).toHaveClass('bg-white', 'rounded-full', 'p-1')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Error Icon', () => {
    it('should render error icon with correct styling and attributes', () => {
      render(<ToastIcon type='error' />)

      const errorIcon = screen.getByTestId('error-icon')
      expect(errorIcon).toBeInTheDocument()
      expect(errorIcon).toHaveClass('h-6', 'w-6', 'text-red-700')
      expect(errorIcon).toHaveAttribute('data-size', '24')
      expect(errorIcon).toHaveAttribute('data-weight', '600')
    })

    it('should render error icon without background wrapper', () => {
      render(<ToastIcon type='error' />)

      const wrapper = screen.getByTestId('error-wrapper')
      expect(wrapper).not.toHaveClass('bg-white', 'rounded-full', 'p-1')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Info Icon', () => {
    it('should render info icon with correct styling and attributes', () => {
      render(<ToastIcon type='info' />)

      const infoIcon = screen.getByTestId('info-icon')
      expect(infoIcon).toBeInTheDocument()
      expect(infoIcon).toHaveClass('h-6', 'w-6', 'text-sky-400')
      expect(infoIcon).toHaveAttribute('data-size', '24')
      expect(infoIcon).toHaveAttribute('data-weight', '600')
    })

    it('should render info icon without background wrapper', () => {
      render(<ToastIcon type='info' />)

      const wrapper = screen.getByTestId('info-wrapper')
      expect(wrapper).not.toHaveClass('bg-white', 'rounded-full', 'p-1')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Warning Icon', () => {
    it('should render warning icon with correct styling and attributes', () => {
      render(<ToastIcon type='warning' />)

      const warningIcon = screen.getByTestId('warning-icon')
      expect(warningIcon).toBeInTheDocument()
      expect(warningIcon).toHaveClass('h-6', 'w-6', 'text-orange-700')
      expect(warningIcon).toHaveAttribute('data-size', '24')
      expect(warningIcon).toHaveAttribute('data-weight', '600')
    })

    it('should render warning icon without background wrapper', () => {
      render(<ToastIcon type='warning' />)

      const wrapper = screen.getByTestId('warning-wrapper')
      expect(wrapper).not.toHaveClass('bg-white', 'rounded-full', 'p-1')
      expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-hidden attribute on all icon wrappers', () => {
      const types = ['success', 'error', 'info', 'warning'] as const

      types.forEach(type => {
        const { unmount } = render(<ToastIcon type={type} />)
        const wrapper = screen.getByTestId(`${type}-wrapper`)

        expect(wrapper).toHaveAttribute('aria-hidden', 'true')
        unmount()
      })
    })
  })

  describe('Icon Variations', () => {
    it('should render different icons for different types', () => {
      const { rerender } = render(<ToastIcon type='success' />)
      expect(screen.getByTestId('success-icon')).toBeInTheDocument()

      rerender(<ToastIcon type='error' />)
      expect(screen.getByTestId('error-icon')).toBeInTheDocument()

      rerender(<ToastIcon type='info' />)
      expect(screen.getByTestId('info-icon')).toBeInTheDocument()

      rerender(<ToastIcon type='warning' />)
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument()
    })

    it('should maintain consistent structure across all types', () => {
      const types = ['success', 'error', 'info', 'warning'] as const

      types.forEach(type => {
        const { unmount } = render(<ToastIcon type={type} />)

        const iconElement = screen.getByTestId(`${type}-icon`)
        const wrapperElement = screen.getByTestId(`${type}-wrapper`)
        expect(iconElement).toBeInTheDocument()
        expect(wrapperElement).toHaveAttribute('aria-hidden', 'true')

        unmount()
      })
    })
  })

  describe('Error Type Variations', () => {
    it('should render error icon for all error types', () => {
      const errorTypes = [
        'error',
        'network',
        'permission',
        'server',
        'client',
        'unknown',
      ] as const

      errorTypes.forEach(type => {
        const { unmount } = render(<ToastIcon type={type} />)
        expect(screen.getByTestId('error-icon')).toBeInTheDocument()
        unmount()
      })
    })

    it('should render warning icon for validation type', () => {
      render(<ToastIcon type='validation' />)
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument()
    })
  })
})
