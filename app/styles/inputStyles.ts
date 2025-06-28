import { type ColorAccent } from '~/lib/lib.types'

export const getInputColorClasses = (
  color: ColorAccent,
  disabled: boolean,
  error?: string
): string => {
  // If disabled, always use neutral border - no animations
  if (disabled) {
    return 'border-button-neutral-tertiary-border'
  }

  const colorMap = {
    emerald: {
      border: 'border-input-border/30',
      hover: 'hover:border-input-hover',
      focus: 'focus:border-input-focus focus:ring-2 focus:ring-input-ring/20',
    },
    brand: {
      border: 'border-error/30',
      hover: 'hover:border-error',
      focus: 'focus:border-error focus:ring-2 focus:ring-error/20',
    },
    blue: {
      border: 'border-blue-700/30',
      hover: 'hover:border-blue-600',
      focus: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20',
    },
    gray: {
      border: 'border-gray-700/30',
      hover: 'hover:border-gray-600',
      focus: 'focus:border-gray-600 focus:ring-2 focus:ring-gray-600/20',
    },
  }

  const colors = error
    ? {
        border: 'border-error',
        hover: 'hover:border-error',
        focus: 'focus:border-error focus:ring-2 focus:ring-error/20',
      }
    : colorMap[color]

  // If enabled, return all interactive states
  return `${colors.border} ${colors.hover} ${colors.focus}`
}

export const getDropdownItemColorClasses = (color: ColorAccent): string => {
  const colorMap = {
    emerald: 'focus:bg-emerald-lightest focus:text-emerald-darkest',
    brand: 'focus:bg-brand-lightest focus:text-brand-darkest',
    blue: 'focus:bg-blue-50 focus:text-blue-900',
    gray: 'focus:bg-gray-50 focus:text-gray-900',
  }

  return colorMap[color]
}

export const getCalendarColorClasses = (
  color: ColorAccent
): { today: string; hover: string; navButton: string } => {
  const colorMap = {
    emerald: {
      today: 'bg-emerald-lighter text-emerald-darkest',
      hover: 'hover:bg-emerald-lighter',
      navButton: 'text-emerald-dark hover:bg-emerald-lighter',
    },
    brand: {
      today: 'bg-brand-light text-brand-dark',
      hover: 'hover:bg-brand-light',
      navButton: 'text-brand hover:bg-brand-light',
    },
    blue: {
      today: 'bg-blue-100 text-blue-900',
      hover: 'hover:bg-blue-100',
      navButton: 'text-blue-600 hover:bg-blue-100',
    },
    gray: {
      today: 'bg-gray-100 text-gray-900',
      hover: 'hover:bg-gray-100',
      navButton: 'text-gray-600 hover:bg-gray-100',
    },
  }

  return colorMap[color]
}
