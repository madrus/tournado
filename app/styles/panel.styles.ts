import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

// Panel style mapping for different color schemes
const panelStyleMap: Record<
  string,
  {
    border: string
    gradient: string
    glow: string
    iconBorder: string
    iconBg: string
    iconText: string
    title: string
    description: string
    hoverBorder?: string
    hoverGradient?: string
  }
> = {
  emerald: {
    border: 'border-emerald-400/60',
    gradient: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800/80',
    glow: 'bg-emerald-400/30',
    iconBorder: 'border-emerald-400/70',
    iconBg: 'bg-emerald-400/10',
    iconText: 'text-emerald-300',
    title: 'text-white',
    description: 'text-emerald-100/80',
  },
  teal: {
    border: 'border-teal-400/60',
    gradient: 'bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800/80',
    glow: 'bg-teal-400/30',
    iconBorder: 'border-teal-400/70',
    iconBg: 'bg-teal-400/10',
    iconText: 'text-teal-300',
    title: 'text-white',
    description: 'text-teal-100/80',
    hoverBorder: 'hover:border-teal-400/80',
    hoverGradient: 'hover:from-teal-950 hover:via-teal-900 hover:to-teal-800/90',
  },
  brand: {
    border: 'border-red-400/60',
    gradient: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800/80',
    glow: 'bg-red-400/30',
    iconBorder: 'border-red-400/70',
    iconBg: 'bg-red-400/10',
    iconText: 'text-red-300',
    title: 'text-white',
    description: 'text-red-100/80',
  },
  blue: {
    border: 'border-blue-400/60',
    gradient: 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800/80',
    glow: 'bg-blue-400/30',
    iconBorder: 'border-blue-400/70',
    iconBg: 'bg-blue-400/10',
    iconText: 'text-blue-300',
    title: 'text-white',
    description: 'text-blue-100/80',
  },
  gray: {
    border: 'border-gray-400/60',
    gradient: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800/80',
    glow: 'bg-gray-400/30',
    iconBorder: 'border-gray-400/70',
    iconBg: 'bg-gray-400/10',
    iconText: 'text-gray-300',
    title: 'text-white',
    description: 'text-gray-100/80',
  },
}

export function getPanelClasses(colorScheme: ColorAccent): {
  base: string
  icon: string
  glow: string
} {
  const style = panelStyleMap[colorScheme] || panelStyleMap.emerald

  return {
    base: cn(
      'relative overflow-hidden rounded-2xl border shadow-xl p-6 group cursor-pointer',
      'transition-[border-color,background-image,background-color] duration-500 ease-in-out',
      style.border,
      style.gradient
    ),
    icon: cn(
      'flex h-8 w-8 items-center justify-center rounded-full border-2',
      'transition-[border-color,background-color,color] duration-500 ease-in-out',
      style.iconBorder,
      style.iconBg
    ),
    glow: cn(
      'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-90',
      'transition-[background-color] duration-500 ease-in-out',
      style.glow
    ),
  }
}

export function getTitleClasses(colorScheme: ColorAccent): string {
  const style = panelStyleMap[colorScheme] || panelStyleMap.emerald
  return cn(
    'text-lg font-semibold break-words transition-colors duration-500 ease-in-out',
    style.title
  )
}

export function getDescriptionClasses(colorScheme: ColorAccent): string {
  const style = panelStyleMap[colorScheme] || panelStyleMap.emerald
  return cn('transition-colors duration-500 ease-in-out', style.description)
}

export function getIconTextClasses(colorScheme: ColorAccent): string {
  const style = panelStyleMap[colorScheme] || panelStyleMap.emerald
  return cn('transition-colors duration-500 ease-in-out', style.iconText)
}

// Legacy support - keep the old function for backward compatibility
export type ColorScheme = ColorAccent
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
  teal: {
    border: 'border-teal-600',
    hoverBorder: 'hover:border-teal-300',
    hoverBg: 'hover:bg-teal-50/30',
    focus: 'focus:ring-teal-500',
    iconBorder: 'border-teal-600',
    iconHoverBorder: 'group-hover:border-teal-700',
    iconHoverBg: 'group-hover:bg-teal-50',
    titleHover: 'group-hover:text-teal-700',
    textHover: 'group-hover:text-teal-600',
  },
}

// Helper to resolve color for panel styles
function resolvePanelColor(color: ColorAccent): keyof typeof colorClasses {
  if (color === 'primary') return 'emerald'
  if (color === 'brand') return 'brand'
  if (color in colorClasses) return color as keyof typeof colorClasses
  return 'emerald'
}

export function getActionLinkPanelClasses(colorScheme: ColorAccent): {
  base: string
  icon: string
  title: string
  description: string
  focus: string
} {
  const colors = colorClasses[resolvePanelColor(colorScheme)]

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
