import { type ColorAccent } from '~/lib/lib.types'

// Helper to resolve color name: 'primary' stays 'primary', 'brand' stays 'brand', else itself
const resolveColorName = (color: ColorAccent): string => color // No more mapping needed - primary and brand are semantic colors now

const getInputColors = (color: ColorAccent) => {
  const resolvedColor = resolveColorName(color)
  // Special case for primary - uses custom CSS properties
  if (resolvedColor === 'primary') {
    return {
      border: 'border-input-border/30',
      hover: 'hover:border-input-hover',
      focus: 'focus:border-input-focus focus:ring-2 focus:ring-input-ring/20',
    }
  }
  // Special case for brand - uses error styles
  if (resolvedColor === 'brand') {
    return {
      border: 'border-error/30',
      hover: 'hover:border-error',
      focus: 'focus:border-error focus:ring-2 focus:ring-error/20',
    }
  }
  // Standard pattern for all other Tailwind colors
  return {
    border: `border-${resolvedColor}-700/30`,
    hover: `hover:border-${resolvedColor}-600`,
    focus: `focus:border-${resolvedColor}-600 focus:ring-2 focus:ring-${resolvedColor}-600/20`,
  }
}

export const getInputColorClasses = (
  color: ColorAccent,
  disabled: boolean,
  error?: string
): string => {
  if (disabled) {
    return 'border-button-neutral-tertiary-border'
  }
  const colors = error
    ? {
        border: 'border-error',
        hover: 'hover:border-error',
        focus: 'focus:border-error focus:ring-2 focus:ring-error/20',
      }
    : getInputColors(color)
  return `${colors.border} ${colors.hover} ${colors.focus}`
}

export const getDropdownItemColorClasses = (color: ColorAccent): string => {
  const resolvedColor = resolveColorName(color)
  if (resolvedColor === 'primary') {
    return 'focus:bg-primary-50 focus:text-primary-800'
  }
  if (resolvedColor === 'brand') {
    return 'focus:bg-brand-100 focus:text-brand-800'
  }
  return `focus:bg-${resolvedColor}-50 focus:text-${resolvedColor}-900`
}

export const getCalendarColorClasses = (
  color: ColorAccent
): { today: string; hover: string; navButton: string } => {
  const resolvedColor = resolveColorName(color)
  if (resolvedColor === 'primary') {
    return {
      today: 'bg-primary-100 text-primary-800',
      hover: 'hover:bg-primary-100',
      navButton: 'text-primary-600 hover:bg-primary-100',
    }
  }
  if (resolvedColor === 'brand') {
    return {
      today: 'bg-brand-400 text-brand-700',
      hover: 'hover:bg-brand-400',
      navButton: 'text-brand-600 hover:bg-brand-400',
    }
  }
  return {
    today: `bg-${resolvedColor}-100 text-${resolvedColor}-900`,
    hover: `hover:bg-${resolvedColor}-100`,
    navButton: `text-${resolvedColor}-600 hover:bg-${resolvedColor}-100`,
  }
}
