import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

export type ColorScheme = ColorAccent // Legacy alias, use ColorAccent directly

export const colorClasses = {
  emerald: {
    border: 'border-emerald-dark',
    hoverBorder: 'hover:border-emerald-light',
    hoverBg: 'hover:bg-emerald-lightest/30',
    focus: 'focus:ring-emerald-medium',
    iconBorder: 'border-emerald-dark',
    iconHoverBorder: 'group-hover:border-emerald-darker',
    iconHoverBg: 'group-hover:bg-emerald-lightest',
    titleHover: 'group-hover:text-emerald-darker',
    textHover: 'group-hover:text-emerald-dark',
  },
  blue: {
    border: 'border-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-50/30',
    focus: 'focus:ring-blue-500',
    iconBorder: 'border-blue-600',
    iconHoverBorder: 'group-hover:border-blue-700',
    iconHoverBg: 'group-hover:bg-blue-50',
    titleHover: 'group-hover:text-blue-700',
    textHover: 'group-hover:text-blue-600',
  },
  gray: {
    border: 'border-gray-600',
    hoverBorder: 'hover:border-gray-300',
    hoverBg: 'hover:bg-gray-50/30',
    focus: 'focus:ring-gray-500',
    iconBorder: 'border-gray-600',
    iconHoverBorder: 'group-hover:border-gray-700',
    iconHoverBg: 'group-hover:bg-gray-50',
    titleHover: 'group-hover:text-gray-700',
    textHover: 'group-hover:text-gray-600',
  },
  brand: {
    border: 'border-brand',
    hoverBorder: 'hover:border-brand-light',
    hoverBg: 'hover:bg-brand-lightest/30',
    focus: 'focus:ring-brand-medium',
    iconBorder: 'border-brand',
    iconHoverBorder: 'group-hover:border-brand-dark',
    iconHoverBg: 'group-hover:bg-brand-lightest',
    titleHover: 'group-hover:text-brand-dark',
    textHover: 'group-hover:text-brand',
  },
}

export function getActionLinkPanelClasses(colorScheme: ColorAccent): {
  base: string
  icon: string
  title: string
  description: string
  focus: string
} {
  const colors = colorClasses[colorScheme]

  return {
    base: cn(
      'group rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md',
      colors.hoverBorder,
      colors.hoverBg
    ),
    icon: cn(
      'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-all',
      colors.iconBorder,
      colors.iconHoverBorder,
      colors.iconHoverBg
    ),
    title: cn('text-lg font-semibold break-words transition-colors', colors.titleHover),
    description: cn(
      'text-foreground-light break-words transition-colors',
      colors.textHover
    ),
    focus: cn(colors.focus, 'focus:ring-2 focus:ring-offset-2 focus:outline-none'),
  }
}
