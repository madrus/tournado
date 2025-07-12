import { type ColorAccent } from '~/lib/lib.types'
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

// Helper to resolve color name: 'primary' stays 'primary', 'brand' stays 'brand', else itself
const resolveColorName = (color: ColorAccent): string => color // No more mapping needed - primary and brand are semantic colors now

const getRingClasses = (color: ColorAccent): string => {
  const resolvedColor = resolveColorName(color)
  return `focus-visible:ring-${resolvedColor}-600 hover:ring-${resolvedColor}-600 disabled:hover:ring-0`
}

const getShadowClasses = (color: ColorAccent): string => {
  const resolvedColor = resolveColorName(color)
  const disabledShadow =
    'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70'
  return `shadow-${resolvedColor}-700/40 hover:shadow-${resolvedColor}-700/60 ${disabledShadow}`
}

const getBorderClasses = (color: ColorAccent): string => {
  const resolvedColor = resolveColorName(color)
  return `border border-${resolvedColor}-600`
}

const getColorClasses = (color: ColorAccent, variant: ButtonVariant): string => {
  const resolvedColor = resolveColorName(color)
  const ringClasses = getRingClasses(color)
  const shadowClasses = getShadowClasses(color)
  const borderClasses = getBorderClasses(color)

  if (variant === 'primary') {
    return cn(
      `bg-${resolvedColor}-600 text-white`,
      borderClasses,
      ringClasses,
      shadowClasses
    )
  } else {
    return cn(
      `bg-transparent text-${resolvedColor}-600`,
      borderClasses,
      ringClasses,
      shadowClasses
    )
  }
}

// Variant definitions
export type ButtonVariant = 'primary' | 'secondary'

// Set default button color
export const DEFAULT_BUTTON_COLOR: ColorAccent = 'brand'

// Get button classes based on variant and color, defaulting to 'brand'
export const getButtonClasses = (
  variant: ButtonVariant,
  color: ColorAccent = DEFAULT_BUTTON_COLOR
): string => cn(commonButtonClasses, getColorClasses(color, variant))

// Legacy type exports for backward compatibility
export type LinkButtonVariant = ButtonVariant
export type ButtonColor = ColorAccent // Legacy alias
