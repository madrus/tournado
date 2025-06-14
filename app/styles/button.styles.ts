import { cn } from '~/utils/misc'

// Common classes for all button variants
export const commonButtonClasses = 'shadow-lg hover:shadow-xl'

// Color-specific classes for shadows and focus states
export const colorClasses = {
  emerald: {
    shadow: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
    focus: 'focus:ring-emerald-600/90',
  },
  red: {
    shadow: 'shadow-red-500/25 hover:shadow-red-500/40',
    focus: 'focus:ring-red-600/90',
  },
  brand: {
    shadow: 'shadow-brand/25 hover:shadow-brand/40',
    focus: 'focus:ring-brand/90',
  },
  gray: {
    shadow: 'shadow-gray-500/25 hover:shadow-gray-500/40',
    focus: 'focus:ring-gray-600/90',
  },
} as const

// Button variant classes for ActionButton
export const buttonVariantClasses = {
  solid: {
    emerald: cn(
      'bg-emerald-600 text-white hover:bg-emerald-500 border-0',
      colorClasses.emerald.shadow,
      colorClasses.emerald.focus
    ),
    red: cn(
      'bg-red-600 text-white hover:bg-red-500 border-0',
      colorClasses.red.shadow,
      colorClasses.red.focus
    ),
    brand: cn(
      'bg-brand text-white hover:bg-brand/90 border-0',
      colorClasses.brand.shadow,
      colorClasses.brand.focus
    ),
    gray: cn(
      'bg-gray-600 text-white hover:bg-gray-500 border-0',
      colorClasses.gray.shadow,
      colorClasses.gray.focus
    ),
  },
  light: {
    emerald: cn(
      'bg-emerald-50 text-emerald-700 border border-emerald-700 hover:bg-white',
      colorClasses.emerald.shadow,
      colorClasses.emerald.focus
    ),
    red: cn(
      'bg-red-50 text-red-700 border border-red-700 hover:bg-white',
      colorClasses.red.shadow,
      colorClasses.red.focus
    ),
    brand: cn(
      'bg-brand/10 text-brand border border-brand hover:bg-white',
      colorClasses.brand.shadow,
      colorClasses.brand.focus
    ),
    gray: cn(
      'bg-gray-50 text-gray-700 border border-gray-700 hover:bg-white',
      colorClasses.gray.shadow,
      colorClasses.gray.focus
    ),
  },
  outline: {
    emerald: cn(
      'bg-white text-emerald-700 border border-emerald-400 hover:border-emerald-500 hover:bg-emerald-50/30',
      colorClasses.emerald.shadow,
      colorClasses.emerald.focus
    ),
    red: cn(
      'bg-white text-red-700 border border-red-400 hover:border-red-500 hover:bg-red-50/30',
      colorClasses.red.shadow,
      colorClasses.red.focus
    ),
    brand: cn(
      'bg-white text-brand border border-brand/40 hover:border-brand/60 hover:bg-brand/5',
      colorClasses.brand.shadow,
      colorClasses.brand.focus
    ),
    gray: cn(
      'bg-white text-gray-700 border border-gray-400 hover:border-gray-500 hover:bg-gray-50/30',
      colorClasses.gray.shadow,
      colorClasses.gray.focus
    ),
  },
} as const

// ActionLinkButton variant classes (for backward compatibility)
export const linkButtonVariantClasses = {
  primary: cn(
    'bg-brand text-white hover:bg-brand/90 border-0',
    colorClasses.brand.shadow,
    colorClasses.brand.focus
  ),
  secondary: cn(
    'bg-gray-100 text-gray-800 hover:bg-gray-200 border-0',
    'shadow-gray-500/15 hover:shadow-gray-500/25',
    'focus:ring-gray-700/90'
  ),
  emerald: cn(
    'bg-emerald-600 text-white hover:bg-emerald-500 border-0',
    colorClasses.emerald.shadow,
    colorClasses.emerald.focus
  ),
} as const

// Type definitions for better TypeScript support
export type ButtonVariant = keyof typeof buttonVariantClasses
export type ButtonColor = keyof typeof buttonVariantClasses.solid
export type LinkButtonVariant = keyof typeof linkButtonVariantClasses
