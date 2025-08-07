import { toast as sonnerToast } from 'sonner'

import type { ToastConfig, ToastErrorType, ToastType } from '~/lib/lib.types'

// Default toast duration constant
const DEFAULT_TOAST_DURATION = 7500

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

/**
 * Enhanced toast function with better error handling
 */
export const createToast = (
  type: ToastType
): ((
  message: string,
  options?: {
    description?: string
    duration?: number
    priority?: 'low' | 'normal' | 'high'
  }
) => string | number) => {
  const config = TOAST_CONFIGS[type]

  return (
    message: string,
    options?: {
      description?: string
      duration?: number
      priority?: 'low' | 'normal' | 'high'
    }
  ) => {
    const toastOptions = {
      duration: options?.duration ?? config.duration,
      ...(options?.priority === 'high' && {
        style: { borderLeft: '4px solid var(--color-red-500)' }, // Red accent for high priority
      }),
    }

    switch (type) {
      case 'success':
        return sonnerToast.success(message, {
          description: options?.description,
          ...toastOptions,
        })
      case 'error':
      case 'network':
      case 'permission':
      case 'server':
      case 'client':
      case 'unknown':
        return sonnerToast.error(message, {
          description: options?.description,
          ...toastOptions,
        })
      case 'warning':
      case 'validation':
        return sonnerToast.warning(message, {
          description: options?.description,
          ...toastOptions,
        })
      case 'info':
        return sonnerToast.info(message, {
          description: options?.description,
          ...toastOptions,
        })
      default:
        return sonnerToast(message, {
          description: options?.description,
          ...toastOptions,
        })
    }
  }
}

/**
 * Enhanced toast object with specific error types
 */
export const toast = {
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
  errorType?: ToastErrorType
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
