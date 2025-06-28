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
    red: {
      border: 'border-error/30',
      hover: 'hover:border-error',
      focus: 'focus:border-error focus:ring-2 focus:ring-error/20',
    },
    blue: {
      border: 'border-blue-700/30',
      hover: 'hover:border-blue-600',
      focus: 'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20',
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
    red: 'focus:bg-red-50 focus:text-red-900',
    blue: 'focus:bg-blue-50 focus:text-blue-900',
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
    red: {
      today: 'bg-brand-light text-brand-dark',
      hover: 'hover:bg-brand-light',
      navButton: 'text-brand hover:bg-brand-light',
    },
    blue: {
      today: 'bg-blue-100 text-blue-900',
      hover: 'hover:bg-blue-100',
      navButton: 'text-blue-600 hover:bg-blue-100',
    },
  }

  return colorMap[color]
}
