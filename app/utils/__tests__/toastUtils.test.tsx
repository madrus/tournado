/// <reference types="vitest/globals" />
import { describe, expect, it, vi } from 'vitest'

import { toast as sonnerToast } from 'sonner'

import {
  createErrorToast,
  showNetworkError,
  showPermissionError,
  showServerError,
  showValidationError,
  toast,
} from '../toastUtils'

// Mock Sonner toast library
vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  },
}))

describe('toastUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('toast.success', () => {
    it('should create a success toast with title only', () => {
      toast.success('Operation completed successfully')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should create a success toast with title and description', () => {
      toast.success('Success!', { description: 'The task was completed successfully.' })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should create a success toast with custom duration', () => {
      toast.success('Quick message', { duration: 3000 })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 3000,
      })
    })

    it('should handle priority option', () => {
      toast.success('Test message', { priority: 'high' })

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
        style: { borderLeft: '4px solid var(--color-red-500)' },
      })
    })
  })

  describe('toast.error', () => {
    it('should create an error toast with title only', () => {
      toast.error('An error occurred')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should create an error toast with title and description', () => {
      toast.error('Error!', { description: 'Something went wrong.' })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })

  describe('toast.info', () => {
    it('should create an info toast with title only', () => {
      toast.info('Information message')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should create an info toast with title and description', () => {
      toast.info('Info!', { description: 'Here is some information.' })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })

  describe('toast.warning', () => {
    it('should create a warning toast with title only', () => {
      toast.warning('Warning message')

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should create a warning toast with title and description', () => {
      toast.warning('Warning!', { description: 'Please be careful.' })

      expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })

  describe('Default options', () => {
    it('should use default duration when no duration is provided', () => {
      toast.success('Test message')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should use custom duration when provided', () => {
      toast.error('Test message', { duration: 5000 })

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 5000,
      })
    })

    it('should handle undefined description', () => {
      toast.info('Test message', { description: undefined })

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })

  describe('Function signatures', () => {
    it('should have correct function signatures for all toast types', () => {
      // Test that they can be called with just title
      expect(() => toast.success('Test')).not.toThrow()
      expect(() => toast.error('Test')).not.toThrow()
      expect(() => toast.info('Test')).not.toThrow()
      expect(() => toast.warning('Test')).not.toThrow()

      // Test that they can be called with title and options
      expect(() => toast.success('Test', { description: 'Desc' })).not.toThrow()
      expect(() => toast.error('Test', { duration: 5000 })).not.toThrow()
      expect(() => toast.info('Test', { priority: 'high' })).not.toThrow()
      expect(() =>
        toast.warning('Test', { description: 'Desc', duration: 3000 })
      ).not.toThrow()
    })
  })

  describe('Return values', () => {
    it('should return the result of sonner toast methods', () => {
      vi.mocked(sonnerToast.custom)
        .mockImplementationOnce((): string | number => 'success-toast-id')
        .mockImplementationOnce((): string | number => 'error-toast-id')
        .mockImplementationOnce((): string | number => 'info-toast-id')
        .mockImplementationOnce((): string | number => 'warning-toast-id')

      expect(toast.success('Test')).toBe('success-toast-id')
      expect(toast.error('Test')).toBe('error-toast-id')
      expect(toast.info('Test')).toBe('info-toast-id')
      expect(toast.warning('Test')).toBe('warning-toast-id')
    })

    it('should return consistent values for all toast types', () => {
      vi.mocked(sonnerToast.custom).mockReturnValue('toast-id')

      const successResult = toast.success('Test')
      const errorResult = toast.error('Test')
      const infoResult = toast.info('Test')
      const warningResult = toast.warning('Test')

      expect(successResult).toBe('toast-id')
      expect(errorResult).toBe('toast-id')
      expect(infoResult).toBe('toast-id')
      expect(warningResult).toBe('toast-id')
    })
  })

  describe('Error-specific toast types', () => {
    it('should handle validation errors', () => {
      toast.validation('Validation error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should handle network errors', () => {
      toast.network('Network error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should handle permission errors', () => {
      toast.permission('Permission denied')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should handle server errors', () => {
      toast.server('Server error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should handle client errors', () => {
      toast.client('Client error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should handle unknown errors', () => {
      toast.unknown('Unknown error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })

  describe('Helper functions', () => {
    it('should create error toast with createErrorToast', () => {
      const error = new Error('Test error')
      createErrorToast(error, 'network')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
        style: { borderLeft: '4px solid var(--color-red-500)' },
      })
    })

    it('should show validation error with showValidationError', () => {
      showValidationError('email', 'Invalid email format')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should show network error with showNetworkError', () => {
      showNetworkError('Connection failed')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should show permission error with showPermissionError', () => {
      showPermissionError('Access denied')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })

    it('should show server error with showServerError', () => {
      showServerError('Internal server error')

      expect(sonnerToast.custom).toHaveBeenCalledWith(expect.any(Function), {
        duration: 7500,
      })
    })
  })
})
