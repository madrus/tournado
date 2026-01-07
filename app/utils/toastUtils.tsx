import { memo } from 'react'

import { toast as sonnerToast } from 'sonner'

import { ToastMessage as ToastMessageBase } from '~/components/ToastMessage'
import type { ToastConfig, ToastErrorType, ToastType } from '~/lib/lib.types'

// Default toast duration constant
export const DEFAULT_TOAST_DURATION = 10000

// Enhanced toast configuration per type
const TOAST_CONFIGS: Record<ToastType, ToastConfig> = {
	success: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'normal',
	},
	error: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'high',
	},
	info: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'low',
	},
	warning: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'normal',
	},
	validation: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'normal',
	},
	network: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'high',
	},
	permission: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'high',
	},
	server: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'high',
	},
	client: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'normal',
	},
	unknown: {
		position: 'top-center',
		duration: DEFAULT_TOAST_DURATION,
		priority: 'normal',
	},
}

// Global memoized ToastMessage to avoid re-creating components
const MemoizedToastMessage = memo(ToastMessageBase)

// Toast cache for performance optimization with rapid toasts
// The cacheKeys are in the format: `${type}:${message}:${options?.description || ''}`
export const toastCache = new Map<string, ReturnType<typeof sonnerToast.custom>>()

// Toast result with cleanup capability
export type ToastResult = {
	id: string | number
	cleanup: () => void
}

/**
 * Enhanced toast function with better error handling and performance optimizations
 * Returns a result object with toast ID and cleanup function
 */
export const createToast = (
	type: ToastType,
): ((
	message: string,
	options?: {
		description?: string
		duration?: number
		priority?: 'low' | 'normal' | 'high'
		force?: boolean
	},
) => ToastResult) => {
	const config = TOAST_CONFIGS[type]

	return (
		message: string,
		options?: {
			description?: string
			duration?: number
			priority?: 'low' | 'normal' | 'high'
			force?: boolean
		},
	) => {
		// Create cache key to prevent duplicate rapid toasts (account for priority)
		const priorityPart = options?.priority ?? config.priority
		const cacheKey = `${type}:${priorityPart}:${message}:${options?.description || ''}`

		// Check if identical toast is already showing (prevent spam)
		// Skip caching for success toasts to always show them
		if (type !== 'success' && !options?.force && toastCache.has(cacheKey)) {
			const cachedToast = toastCache.get(cacheKey)
			if (cachedToast) {
				return {
					id: cachedToast,
					cleanup: () => {
						toastCache.delete(cacheKey)
					},
				}
			}
		}
		const toastOptions = {
			duration: options?.duration ?? config.duration,
			...(options?.priority === 'high' && {
				style: { borderLeft: '4px solid var(--color-red-500)' }, // Red accent for high priority
			}),
		}

		const toastId = sonnerToast.custom(
			(id) => (
				<MemoizedToastMessage
					type={type}
					title={message}
					description={options?.description}
					onClose={() => {
						if (typeof id === 'string' || typeof id === 'number') {
							toastCache.delete(cacheKey) // Clean up cache
							sonnerToast.dismiss(id)
						}
					}}
				/>
			),
			toastOptions,
		)

		// Cache the toast briefly to prevent duplicates (skip caching success toasts or forced toasts)
		if (type !== 'success' && !options?.force) {
			toastCache.set(cacheKey, toastId)
		}

		// Auto-cleanup cache after toast duration (only for cached toasts)
		// In test environments we won't actually run this timer
		// but in production it ensures the cache gets cleaned up
		let timeoutId: NodeJS.Timeout | undefined
		if (
			type !== 'success' &&
			!options?.force &&
			typeof process !== 'undefined' &&
			process.env.NODE_ENV !== 'test'
		) {
			timeoutId = setTimeout(
				() => {
					toastCache.delete(cacheKey)
				},
				(options?.duration ?? config.duration ?? DEFAULT_TOAST_DURATION) + 1000,
			)
		}

		// Return toast result with cleanup function
		return {
			id: toastId,
			cleanup: () => {
				if (timeoutId) {
					clearTimeout(timeoutId)
					timeoutId = undefined
				}
				toastCache.delete(cacheKey)
			},
		}
	}
}

// Create wrapper functions that return just the ID for backward compatibility
const createSimpleToast = (type: ToastType) => {
	const toastFn = createToast(type)
	return (
		message: string,
		options?: {
			description?: string
			duration?: number
			priority?: 'low' | 'normal' | 'high'
			force?: boolean
		},
	): string | number => {
		const result = toastFn(message, options)
		return result.id
	}
}

/**
 * Enhanced toast object with specific error types
 * Returns toast IDs for backward compatibility
 */
export const toast = {
	success: createSimpleToast('success'),
	error: createSimpleToast('error'),
	info: createSimpleToast('info'),
	warning: createSimpleToast('warning'),
	validation: createSimpleToast('validation'),
	network: createSimpleToast('network'),
	permission: createSimpleToast('permission'),
	server: createSimpleToast('server'),
	client: createSimpleToast('client'),
	unknown: createSimpleToast('unknown'),
}

/**
 * Advanced toast object that returns ToastResult with cleanup capability
 * Use this when you need manual cleanup control
 */
export const toastAdvanced = {
	success: createToast('success'),
	error: createToast('error'),
	info: createToast('info'),
	warning: createToast('warning'),
	validation: createToast('validation'),
	network: createToast('network'),
	permission: createToast('permission'),
	server: createToast('server'),
	client: createToast('client'),
	unknown: createToast('unknown'),
}

/**
 * Helper function to create error toasts based on error type
 */
export const createErrorToast = (
	error: Error | string,
	errorType?: ToastErrorType,
): string | number => {
	const message = typeof error === 'string' ? error : error.message
	const type = errorType ?? 'unknown'

	return toast[type](message, {
		description:
			typeof error === 'string' ? undefined : error.stack?.split('\n')[1]?.trim(),
		priority: 'high',
	})
}

/**
 * Advanced helper function to create error toasts with cleanup capability
 */
export const createErrorToastAdvanced = (
	error: Error | string,
	errorType?: ToastErrorType,
): ToastResult => {
	const message = typeof error === 'string' ? error : error.message
	const type = errorType ?? 'unknown'

	return toastAdvanced[type](message, {
		description:
			typeof error === 'string' ? undefined : error.stack?.split('\n')[1]?.trim(),
		priority: 'high',
	})
}

/**
 * Helper function for form validation errors
 */
export const showValidationError = (field: string, message: string): string | number =>
	toast.validation(`${field}: ${message}`, {
		description: 'Please check your input and try again.',
	})

/**
 * Helper function for network errors
 */
export const showNetworkError = (message?: string): string | number =>
	toast.network(message ?? 'Network error occurred', {
		description: 'Please check your connection and try again.',
	})

/**
 * Helper function for permission errors
 */
export const showPermissionError = (message?: string): string | number =>
	toast.permission(message ?? 'Access denied', {
		description: 'You do not have permission to perform this action.',
	})

/**
 * Helper function for server errors
 */
export const showServerError = (message?: string): string | number =>
	toast.server(message ?? 'Server error occurred', {
		description: 'Please try again later or contact support if the problem persists.',
	})

// Advanced helper functions with cleanup capability
export const showValidationErrorAdvanced = (
	field: string,
	message: string,
): ToastResult =>
	toastAdvanced.validation(`${field}: ${message}`, {
		description: 'Please check your input and try again.',
	})

export const showNetworkErrorAdvanced = (message?: string): ToastResult =>
	toastAdvanced.network(message ?? 'Network error occurred', {
		description: 'Please check your connection and try again.',
	})

export const showPermissionErrorAdvanced = (message?: string): ToastResult =>
	toastAdvanced.permission(message ?? 'Access denied', {
		description: 'You do not have permission to perform this action.',
	})

export const showServerErrorAdvanced = (message?: string): ToastResult =>
	toastAdvanced.server(message ?? 'Server error occurred', {
		description: 'Please try again later or contact support if the problem persists.',
	})
