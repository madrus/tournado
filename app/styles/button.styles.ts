import { cn } from '~/utils/misc'

// Common classes for all buttons
export const commonButtonClasses = cn(
  'inline-flex items-center justify-center rounded-lg font-semibold gap-2',
  'min-h-12 min-w-32 py-2.5 px-4 text-sm uppercase',
  'relative transition-all duration-300 ease-out',
  'whitespace-nowrap',
  'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
  'hover:scale-103 active:scale-95 disabled:hover:scale-100',
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  'hover:ring-2 hover:ring-offset-2 hover:ring-offset-white disabled:hover:ring-0 disabled:hover:ring-offset-0',
  'focus-visible:disabled:ring-0',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'disabled:bg-button-neutral-background disabled:text-button-neutral-text disabled:border-button-neutral-secondary-border'
)

// Color system
export type ButtonColor = 'emerald' | 'brand' | 'blue' | 'gray'

const ringColor = {
  emerald:
    'focus-visible:ring-emerald-600 hover:ring-emerald-600 disabled:hover:ring-0',
  brand: 'focus-visible:ring-brand hover:ring-brand disabled:hover:ring-0',
  blue: 'focus-visible:ring-blue-600 hover:ring-blue-600 disabled:hover:ring-0',
  gray: 'focus-visible:ring-gray-600 hover:ring-gray-600 disabled:hover:ring-0',
}

const shadowColor = {
  emerald:
    'shadow-emerald-700/40 hover:shadow-emerald-700/60 disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
  brand:
    'shadow-brand/40 hover:shadow-brand/60 disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
  blue: 'shadow-blue-700/40 hover:shadow-blue-700/60 disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
  gray: 'shadow-gray-700/40 hover:shadow-gray-700/60 disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
}

const border = {
  emerald: 'border border-emerald-600',
  brand: 'border border-brand',
  blue: 'border border-blue-600',
  gray: 'border border-gray-600',
}

const colors = {
  emerald: {
    primary: cn(
      'bg-emerald-600 text-white',
      border.emerald,
      ringColor.emerald,
      shadowColor.emerald
    ),
    secondary: cn(
      'bg-transparent text-emerald-600 border border-emerald-600',
      ringColor.emerald,
      shadowColor.emerald
    ),
  },
  brand: {
    primary: cn(
      'bg-brand text-white',
      border.brand,
      ringColor.brand,
      shadowColor.brand
    ),
    secondary: cn(
      'bg-transparent text-brand border border-brand',
      ringColor.brand,
      shadowColor.brand
    ),
  },
  blue: {
    primary: cn(
      'bg-blue-600 text-white',
      border.blue,
      ringColor.blue,
      shadowColor.blue
    ),
    secondary: cn(
      'bg-transparent text-blue-600 border border-blue-600',
      ringColor.blue,
      shadowColor.blue
    ),
  },
  gray: {
    primary: cn(
      'bg-gray-600 text-white',
      border.gray,
      ringColor.gray,
      shadowColor.gray
    ),
    secondary: cn(
      'bg-transparent text-gray-600 border border-gray-600',
      ringColor.gray,
      shadowColor.gray
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
