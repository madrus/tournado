/// <reference types="vitest/globals" />
import { fireEvent, render, screen } from '@testing-library/react'

import { describe, expect, it, vi } from 'vitest'

import { toast as sonnerToast } from 'sonner'

import { toast } from '../toastUtils'

// Mock Sonner toast library
vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Mock ToastMessage component
vi.mock('~/components/ToastMessage', () => ({
  ToastMessage: ({
    type,
    title,
    description,
    onClose,
  }: {
    type: string
    title: string
    description?: string
    onClose?: () => void
  }) => (
    <div
      data-testid={`toast-${type}`}
      data-title={title}
      {...(description !== undefined && { 'data-description': description })}
    >
      <span>{title}</span>
      {description ? <span>{description}</span> : null}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

describe('toastUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toast.success', () => {
    it('should create a success toast with title only', () => {
      toast.success('Operation completed successfully')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

      // Get the component function passed to sonner
      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 7500 })

      // Render the component to test it
      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-success')).toBeInTheDocument()
      expect(screen.getByTestId('toast-success')).toHaveAttribute(
        'data-title',
        'Operation completed successfully'
      )
      expect(screen.getByTestId('toast-success')).not.toHaveAttribute(
        'data-description'
      )
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    })

    it('should create a success toast with title and description', () => {
      toast.success('Success!', { description: 'The task was completed successfully.' })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-success')).toHaveAttribute(
        'data-title',
        'Success!'
      )
      expect(screen.getByTestId('toast-success')).toHaveAttribute(
        'data-description',
        'The task was completed successfully.'
      )
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(
        screen.getByText('The task was completed successfully.')
      ).toBeInTheDocument()
    })

    it('should create a success toast with custom duration', () => {
      toast.success('Quick message', { duration: 3000 })

      const [, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 3000 })
    })

    it('should handle onClose callback', () => {
      toast.success('Test message')

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)

      expect(sonnerToast.dismiss).toHaveBeenCalledWith(mockToastId)
    })
  })

  describe('toast.error', () => {
    it('should create an error toast with title only', () => {
      toast.error('Something went wrong')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 7500 })

      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-error')).toBeInTheDocument()
      expect(screen.getByTestId('toast-error')).toHaveAttribute(
        'data-title',
        'Something went wrong'
      )
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should create an error toast with title and description', () => {
      toast.error('Error occurred', {
        description: 'Please check your network connection and try again.',
        duration: 10000,
      })

      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 10000 })

      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-error')).toHaveAttribute(
        'data-title',
        'Error occurred'
      )
      expect(screen.getByTestId('toast-error')).toHaveAttribute(
        'data-description',
        'Please check your network connection and try again.'
      )
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(
        screen.getByText('Please check your network connection and try again.')
      ).toBeInTheDocument()
    })
  })

  describe('toast.info', () => {
    it('should create an info toast with title only', () => {
      toast.info('Information message')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 7500 })

      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-info')).toBeInTheDocument()
      expect(screen.getByTestId('toast-info')).toHaveAttribute(
        'data-title',
        'Information message'
      )
      expect(screen.getByText('Information message')).toBeInTheDocument()
    })

    it('should create an info toast with title and description', () => {
      toast.info('New feature available', {
        description: 'You can now export your data to CSV format.',
      })

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-info')).toHaveAttribute(
        'data-title',
        'New feature available'
      )
      expect(screen.getByTestId('toast-info')).toHaveAttribute(
        'data-description',
        'You can now export your data to CSV format.'
      )
      expect(screen.getByText('New feature available')).toBeInTheDocument()
      expect(
        screen.getByText('You can now export your data to CSV format.')
      ).toBeInTheDocument()
    })
  })

  describe('toast.warning', () => {
    it('should create a warning toast with title only', () => {
      toast.warning('Please review your changes')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 7500 })

      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-warning')).toBeInTheDocument()
      expect(screen.getByTestId('toast-warning')).toHaveAttribute(
        'data-title',
        'Please review your changes'
      )
      expect(screen.getByText('Please review your changes')).toBeInTheDocument()
    })

    it('should create a warning toast with title and description', () => {
      toast.warning('Storage almost full', {
        description: 'You have less than 100MB of storage remaining.',
        duration: 15000,
      })

      const [componentFn, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 15000 })

      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-warning')).toHaveAttribute(
        'data-title',
        'Storage almost full'
      )
      expect(screen.getByTestId('toast-warning')).toHaveAttribute(
        'data-description',
        'You have less than 100MB of storage remaining.'
      )
      expect(screen.getByText('Storage almost full')).toBeInTheDocument()
      expect(
        screen.getByText('You have less than 100MB of storage remaining.')
      ).toBeInTheDocument()
    })
  })

  describe('Default options', () => {
    it('should use default duration when no duration is provided', () => {
      toast.success('Default duration test')

      const [, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 7500 })
    })

    it('should use custom duration when provided', () => {
      toast.error('Custom duration test', { duration: 5000 })

      const [, options] = vi.mocked(sonnerToast.custom).mock.calls[0]
      expect(options).toEqual({ duration: 5000 })
    })

    it('should handle undefined description', () => {
      toast.info('Title only', {})

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'test-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      expect(screen.getByTestId('toast-info')).not.toHaveAttribute('data-description')
    })
  })

  describe('Toast dismissal', () => {
    it('should dismiss toast when onClose is called', () => {
      toast.success('Dismissible toast')

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'unique-toast-id'
      const component = componentFn(mockToastId)
      render(component)

      // Simulate clicking the close button
      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)

      expect(sonnerToast.dismiss).toHaveBeenCalledWith(mockToastId)
    })

    it('should pass correct toast ID to dismiss function', () => {
      toast.warning('Another dismissible toast')

      const [componentFn] = vi.mocked(sonnerToast.custom).mock.calls[0]
      const mockToastId = 'another-unique-id'
      const component = componentFn(mockToastId)
      render(component)

      const closeButton = screen.getByText('Close')
      fireEvent.click(closeButton)

      expect(sonnerToast.dismiss).toHaveBeenCalledWith(mockToastId)
      expect(sonnerToast.dismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('Function signatures', () => {
    it('should have correct function signatures for all toast types', () => {
      // Test that all toast functions exist
      expect(typeof toast.success).toBe('function')
      expect(typeof toast.error).toBe('function')
      expect(typeof toast.info).toBe('function')
      expect(typeof toast.warning).toBe('function')

      // Test that they can be called with just title
      expect(() => toast.success('Test')).not.toThrow()
      expect(() => toast.error('Test')).not.toThrow()
      expect(() => toast.info('Test')).not.toThrow()
      expect(() => toast.warning('Test')).not.toThrow()

      // Test that they can be called with title and options
      expect(() => toast.success('Test', {})).not.toThrow()
      expect(() => toast.error('Test', { description: 'desc' })).not.toThrow()
      expect(() => toast.info('Test', { duration: 1000 })).not.toThrow()
      expect(() =>
        toast.warning('Test', { description: 'desc', duration: 2000 })
      ).not.toThrow()
    })
  })

  describe('Return values', () => {
    it('should return the result of sonner toast.custom', () => {
      const mockReturnValue = 'toast-123'
      vi.mocked(sonnerToast.custom).mockReturnValue(mockReturnValue)

      const result = toast.success('Test toast')

      expect(result).toBe(mockReturnValue)
    })

    it('should return consistent values for all toast types', () => {
      const mockReturnValue = 'consistent-id'
      vi.mocked(sonnerToast.custom).mockReturnValue(mockReturnValue)

      const successResult = toast.success('Success')
      const errorResult = toast.error('Error')
      const infoResult = toast.info('Info')
      const warningResult = toast.warning('Warning')

      expect(successResult).toBe(mockReturnValue)
      expect(errorResult).toBe(mockReturnValue)
      expect(infoResult).toBe(mockReturnValue)
      expect(warningResult).toBe(mockReturnValue)
    })
  })
})
