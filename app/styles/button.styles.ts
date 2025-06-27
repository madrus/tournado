import { cn } from '~/utils/misc'

// Common classes for all buttons
export const commonButtonClasses = cn(
  'inline-flex items-center justify-center rounded-lg font-semibold gap-2',
  'min-h-12 min-w-32 py-2.5 px-4 text-sm',
  'relative transition-all duration-300 ease-out',
  'whitespace-nowrap',
  'hover:scale-103 active:scale-95',
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
  'hover:ring-2 hover:ring-white hover:ring-offset-2',
  'focus-visible:disabled:ring-0',
  'disabled:cursor-not-allowed disabled:opacity-50'
)

// Color system
export type ButtonColor = 'emerald' | 'brand' | 'blue' | 'gray'

const ringOffset = {
  emerald: 'focus-visible:ring-offset-emerald-600 hover:ring-offset-emerald-600',
  brand: 'focus-visible:ring-offset-brand hover:ring-offset-brand',
  blue: 'focus-visible:ring-offset-blue-600 hover:ring-offset-blue-600',
  gray: 'focus-visible:ring-offset-gray-600 hover:ring-offset-gray-600',
}

const border = {
  emerald: 'border border-emerald-600',
  brand: 'border border-brand',
  blue: 'border border-blue-600',
  gray: 'border border-gray-600',
}

const colors = {
  emerald: {
    primary: cn('bg-emerald-600 text-white', border.emerald, ringOffset.emerald),
    secondary: cn(
      'bg-transparent text-emerald-600 border border-emerald-600',
      ringOffset.emerald
    ),
  },
  brand: {
    primary: cn('bg-brand text-white', border.brand, ringOffset.brand),
    secondary: cn('bg-transparent text-brand border border-brand', ringOffset.brand),
  },
  blue: {
    primary: cn('bg-blue-600 text-white', border.blue, ringOffset.blue),
    secondary: cn(
      'bg-transparent text-blue-600 border border-blue-600',
      ringOffset.blue
    ),
  },
  gray: {
    primary: cn('bg-gray-600 text-white', border.gray, ringOffset.gray),
    secondary: cn(
      'bg-transparent text-gray-600 border border-gray-600',
      ringOffset.gray
    ),
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
