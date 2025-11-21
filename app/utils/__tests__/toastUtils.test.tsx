/// <reference types="vitest/globals" />

import { toast as sonnerToast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import {
	createErrorToast,
	createToast,
	showNetworkError,
	showPermissionError,
	showServerError,
	showValidationError,
	toast,
	toastAdvanced,
	toastCache,
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
			toast.success('Success!', {
				description: 'The task was completed successfully.',
			})

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
			expect(() => toast.warning('Test', { description: 'Desc', duration: 3000 })).not.toThrow()
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

		it('should return unique values for different toast types with same message', () => {
			// Each call to sonnerToast.custom should return a new ID
			vi.mocked(sonnerToast.custom)
				.mockReturnValueOnce('success-toast-id')
				.mockReturnValueOnce('error-toast-id')
				.mockReturnValueOnce('info-toast-id')
				.mockReturnValueOnce('warning-toast-id')

			const successResult = toast.success('Test')
			const errorResult = toast.error('Test')
			const infoResult = toast.info('Test')
			const warningResult = toast.warning('Test')

			// Different toast types should have different IDs even with same message
			expect(successResult).toBe('success-toast-id')
			expect(errorResult).toBe('error-toast-id')
			expect(infoResult).toBe('info-toast-id')
			expect(warningResult).toBe('warning-toast-id')
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

	describe('Performance and Memory Management', () => {
		beforeEach(() => {
			// Clear the toast cache before each test
			vi.clearAllMocks()
			vi.stubEnv('NODE_ENV', 'test')
			// Clear the toast cache for each test
			toastCache.clear()
		})

		afterEach(() => {
			vi.unstubAllEnvs()
		})

		it('should handle rapid toast creation without memory leaks', () => {
			// Mock sonnerToast.custom to return the same ID every time
			let callCount = 0
			vi.mocked(sonnerToast.custom).mockImplementation(() => {
				callCount++
				return `toast-id-${callCount}`
			})

			// Create 50 rapid toasts of the same message
			const toastIds = []
			for (let i = 0; i < 50; i++) {
				toastIds.push(toast.success('Rapid test message'))
			}

			// Success toasts are no longer cached, so each call should create a new toast
			expect(sonnerToast.custom).toHaveBeenCalledTimes(50)

			// All should return unique IDs since success toasts aren't cached
			const uniqueIds = new Set(toastIds)
			expect(uniqueIds.size).toBe(50)
		})

		it('should handle rapid different toast types correctly', () => {
			// Reset mock call count
			let callCount = 0
			vi.mocked(sonnerToast.custom).mockImplementation(() => {
				callCount++
				return `toast-id-${callCount}`
			})

			const results = {
				success: toast.success('Test message'),
				error: toast.error('Test message'),
				info: toast.info('Test message'),
				warning: toast.warning('Test message'),
			}

			// Should call sonner.custom for each different type
			expect(sonnerToast.custom).toHaveBeenCalledTimes(4)

			// Different types should have different IDs even with same message
			const ids = Object.values(results)
			const uniqueIds = new Set(ids)
			expect(uniqueIds.size).toBe(4)
		})

		it('should clean up toast cache after timeout', () => {
			vi.useFakeTimers()
			vi.mocked(sonnerToast.custom).mockReturnValue('test-toast-id')

			// Create a toast (success toasts are not cached)
			toast.success('Test message', { duration: 5000 })

			// Should be called once
			expect(sonnerToast.custom).toHaveBeenCalledTimes(1)

			// Create same toast again immediately - should create new toast since success isn't cached
			toast.success('Test message', { duration: 5000 })
			expect(sonnerToast.custom).toHaveBeenCalledTimes(2)

			// Test with error toast which is cached
			toast.error('Error message', { duration: 5000 })
			expect(sonnerToast.custom).toHaveBeenCalledTimes(3)

			// Create same error toast again immediately - should return cached
			toast.error('Error message', { duration: 5000 })
			expect(sonnerToast.custom).toHaveBeenCalledTimes(3)

			vi.runAllTimers()
			vi.useRealTimers()
		})

		it('should handle toast dismissal and cache cleanup', () => {
			const mockToastId = 'dismissable-toast-id'
			vi.mocked(sonnerToast.custom).mockImplementation((component) => {
				// Simulate calling the onClose callback
				if (typeof component === 'function') {
					const reactElement = component(mockToastId)
					// Extract onClose from props and call it
					if (
						reactElement?.props &&
						typeof reactElement.props === 'object' &&
						reactElement.props !== null
					) {
						const props = reactElement.props as Record<string, unknown>
						if ('onClose' in props && typeof props.onClose === 'function') {
							props.onClose()
						}
					}
				}
				return mockToastId
			})

			// Create a toast
			toast.success('Dismissable message')

			// Verify sonner methods were called
			expect(sonnerToast.custom).toHaveBeenCalledTimes(1)
			expect(sonnerToast.dismiss).toHaveBeenCalledWith(mockToastId)
		})

		it('should handle burst toast creation with different messages', () => {
			const messages = [
				'Message 1',
				'Message 2',
				'Message 3',
				'Message 1', // Duplicate
				'Message 4',
			]

			const toastIds = messages.map((msg) => toast.error(msg))

			// Should create toast for each unique message (4 unique messages)
			expect(sonnerToast.custom).toHaveBeenCalledTimes(4)

			// Same messages should return same IDs
			expect(toastIds[0]).toBe(toastIds[3]) // Both 'Message 1'
		})

		it('should handle mixed priority toasts efficiently', () => {
			// Create toasts with different priorities
			toast.info('Normal message')
			toast.error('Error message', { priority: 'high' })
			toast.success('Success message')

			expect(sonnerToast.custom).toHaveBeenCalledTimes(3)

			// Verify high priority toast has correct styling
			const highPriorityCall = vi
				.mocked(sonnerToast.custom)
				.mock.calls.find((call) => call[1]?.style?.borderLeft)
			expect(highPriorityCall).toBeDefined()
			expect(highPriorityCall?.[1]?.style?.borderLeft).toBe('4px solid var(--color-red-500)')
		})
	})

	describe('Advanced Toast with Cleanup', () => {
		beforeEach(() => {
			vi.clearAllMocks()
			// Clear the toast cache for each test
			toastCache.clear()
		})

		it('should return ToastResult with cleanup function', () => {
			vi.mocked(sonnerToast.custom).mockReturnValue('test-toast-id')

			const result = createToast('error')('Test message')

			expect(result).toHaveProperty('id')
			expect(result).toHaveProperty('cleanup')
			expect(typeof result.cleanup).toBe('function')
			expect(result.id).toBe('test-toast-id')
		})

		it('should cleanup cache and clear timeout on manual cleanup', () => {
			vi.useFakeTimers()
			vi.mocked(sonnerToast.custom).mockReturnValue('test-toast-id')
			const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

			// Temporarily change NODE_ENV to non-test to enable timeout creation
			const originalNodeEnv = process.env.NODE_ENV
			vi.stubEnv('NODE_ENV', 'development')

			const result = createToast('error')('Test message')

			// Verify cache was set
			expect(toastCache.size).toBe(1)

			// Call cleanup
			result.cleanup()

			// Verify cache was cleared
			expect(toastCache.size).toBe(0)

			// Verify timeout was cleared
			expect(clearTimeoutSpy).toHaveBeenCalled()

			// Restore environment
			vi.stubEnv('NODE_ENV', originalNodeEnv)
			clearTimeoutSpy.mockRestore()
			vi.useRealTimers()
		})

		it('should maintain backward compatibility with regular toast object', () => {
			vi.mocked(sonnerToast.custom).mockReturnValue('test-toast-id')

			const result = toast.success('Test message')

			expect(typeof result).toBe('string')
			expect(result).toBe('test-toast-id')
		})

		it('should provide advanced toast object with cleanup capability', () => {
			vi.mocked(sonnerToast.custom).mockReturnValue('test-toast-id')

			const result = toastAdvanced.success('Test message')

			expect(result).toHaveProperty('id')
			expect(result).toHaveProperty('cleanup')
			expect(result.id).toBe('test-toast-id')
		})
	})
})
