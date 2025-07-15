import { type ColorAccent } from '~/lib/lib.types'

// Helper to resolve color name: 'primary' stays 'primary', 'brand' stays 'brand', else itself
const resolveColorName = (color: ColorAccent): string => color // No more mapping needed - primary and brand are semantic colors now

const getInputColors = (color: ColorAccent) => {
  const resolvedColor = resolveColorName(color)
  // Use wider borders instead of rings: 1px normal → 2px on hover/focus
  // Hover uses 700/50 for better visibility, focus uses 200 for subtle highlight
  return {
    border: `border border-${resolvedColor}-700/30`,
    hover: `hover:border-2 hover:border-${resolvedColor}-700/50`,
    focus: `focus:border-2 focus:border-${resolvedColor}-200`,
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
        border: 'border border-error/30',
        hover: 'hover:border-2 hover:border-brand-700/50',
        focus: 'focus:border-2 focus:border-brand-200',
      }
    : getInputColors(color)
  return `${colors.border} ${colors.hover} ${colors.focus}`
}

export const getInputOpenStateClasses = (
  color: ColorAccent,
  error?: string
): string => {
  if (error) {
    return 'data-[state=open]:border-2 data-[state=open]:border-brand-200'
  }

  const resolvedColor = resolveColorName(color)
  return `data-[state=open]:border-2 data-[state=open]:border-${resolvedColor}-200`
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
