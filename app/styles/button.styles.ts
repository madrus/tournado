import { cn } from '~/utils/misc'

// Common classes for all buttons
export const commonButtonClasses = cn(
  'inline-flex items-center justify-center rounded-lg font-semibold gap-2',
  'min-h-12 min-w-32 py-2.5 px-4 text-sm',
  'relative overflow-hidden transition-all duration-300 ease-out',
  'whitespace-nowrap',
  'hover:scale-103 active:scale-95',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

// Simplified color system
export type ButtonColor = 'emerald' | 'brand' | 'blue' | 'gray'

// Color definitions
const colors = {
  emerald: {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600',
    secondary:
      'bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-50 focus:ring-emerald-600',
  },
  brand: {
    primary: 'bg-brand text-white hover:bg-brand/90 focus:ring-brand',
    secondary:
      'bg-transparent text-brand border border-brand hover:bg-brand/10 focus:ring-brand',
  },
  blue: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
    secondary:
      'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-600',
  },
  gray: {
    primary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-600',
    secondary:
      'bg-transparent text-gray-600 border border-gray-600 hover:bg-gray-50 focus:ring-gray-600',
  },
} as const

// Variant definitions
export type ButtonVariant = 'primary' | 'secondary'

// Set default button color
export const DEFAULT_BUTTON_COLOR: ButtonColor = 'brand'

// Get button classes based on variant and color, defaulting to 'brand'
export const getButtonClasses = (
  variant: ButtonVariant,
  color: ButtonColor = DEFAULT_BUTTON_COLOR
): string => cn(commonButtonClasses, colors[color][variant])

// Legacy type exports for backward compatibility
export type LinkButtonVariant = ButtonVariant
