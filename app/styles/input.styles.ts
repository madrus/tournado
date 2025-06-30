import { type ColorAccent } from '~/lib/lib.types'

// Helper to resolve color name: 'primary' -> 'emerald', 'brand' -> 'red', else itself
const resolveColorName = (color: ColorAccent): string => {
  if (color === 'primary') return 'emerald'
  if (color === 'brand') return 'red'
  return color
}

const getInputColors = (color: ColorAccent) => {
  const resolvedColor = resolveColorName(color)
  // Special case for emerald - uses custom CSS properties
  if (resolvedColor === 'emerald') {
    return {
      border: 'border-input-border/30',
      hover: 'hover:border-input-hover',
      focus: 'focus:border-input-focus focus:ring-2 focus:ring-input-ring/20',
    }
  }
  // Special case for red (brand) - uses error styles
  if (resolvedColor === 'red') {
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
  if (resolvedColor === 'emerald') {
    return 'focus:bg-emerald-lightest focus:text-emerald-darkest'
  }
  if (resolvedColor === 'red') {
    return 'focus:bg-brand-lightest focus:text-brand-darkest'
  }
  return `focus:bg-${resolvedColor}-50 focus:text-${resolvedColor}-900`
}

export const getCalendarColorClasses = (
  color: ColorAccent
): { today: string; hover: string; navButton: string } => {
  const resolvedColor = resolveColorName(color)
  if (resolvedColor === 'emerald') {
    return {
      today: 'bg-emerald-lighter text-emerald-darkest',
      hover: 'hover:bg-emerald-lighter',
      navButton: 'text-emerald-dark hover:bg-emerald-lighter',
    }
  }
  if (resolvedColor === 'red') {
    return {
      today: 'bg-brand-light text-brand-dark',
      hover: 'hover:bg-brand-light',
      navButton: 'text-brand hover:bg-brand-light',
    }
  }
  return {
    today: `bg-${resolvedColor}-100 text-${resolvedColor}-900`,
    hover: `hover:bg-${resolvedColor}-100`,
    navButton: `text-${resolvedColor}-600 hover:bg-${resolvedColor}-100`,
  }
}
