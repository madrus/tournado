import { type ColorAccent } from '~/lib/lib.types'
import { cn } from '~/utils/misc'

// Resolve color aliases to actual colors
export function resolveColorAccent(color: ColorAccent): string {
  return color // No more mapping needed - primary and brand are semantic colors now
}

// Generate panel styles dynamically based on color
function getPanelStyles(colorAccent: ColorAccent) {
  const resolvedColor = resolveColorAccent(colorAccent)

  // Special case for brand: use gray gradient
  const getGradient = () => {
    if (colorAccent === 'brand') {
      return 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-800'
    }
    return `bg-gradient-to-br from-${resolvedColor}-950 via-${resolvedColor}-900 to-${resolvedColor}-900`
  }

  return {
    border: `border-${resolvedColor}-400/60`,
    gradient: getGradient(),
    glow: `bg-${resolvedColor}-400/30`,
    iconBorder: `border-${resolvedColor}-400/70`,
    iconBg: `bg-${resolvedColor}-400/10`,
    iconText: `text-${resolvedColor}-300`,
    title: 'text-white',
    description: `text-${resolvedColor}-100/80`,
  }
}

export function getPanelClasses(colorAccent: ColorAccent): {
  base: string
  background: string
  icon: string
  glow: string
} {
  const style = getPanelStyles(colorAccent)

  return {
    base: cn(
      'relative overflow-hidden rounded-2xl border shadow-xl p-6 group cursor-pointer',
      style.border,
      style.gradient
    ),
    background: style.gradient,
    icon: cn(
      'flex h-8 w-8 items-center justify-center rounded-full border-2',
      'transition-[border-color,background-color,color] duration-500 ease-in-out',
      style.iconBorder,
      style.iconBg
    ),
    glow: cn(
      'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-90',
      style.glow
    ),
  }
}

export function getTitleClasses(colorAccent: ColorAccent): string {
  const style = getPanelStyles(colorAccent)
  return cn('text-lg font-semibold break-words', style.title)
}

export function getDescriptionClasses(colorAccent: ColorAccent): string {
  const style = getPanelStyles(colorAccent)
  return cn(style.description)
}

export function getIconTextClasses(colorAccent: ColorAccent): string {
  const style = getPanelStyles(colorAccent)
  return cn('transition-colors duration-500 ease-in-out', style.iconText)
}

// Legacy support - keep the old function for backward compatibility
export type ColorScheme = ColorAccent
export const colorClasses = {
  emerald: {
    border: 'border-emerald-600',
    hoverBorder: 'hover:border-emerald-400',
    hoverBg: 'hover:bg-emerald-50/30',
    focus: 'focus:ring-emerald-500',
    iconBorder: 'border-emerald-600',
    iconHoverBorder: 'group-hover:border-emerald-700',
    iconHoverBg: 'group-hover:bg-emerald-50',
    titleHover: 'group-hover:text-emerald-700',
    textHover: 'group-hover:text-emerald-600',
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
    border: 'border-brand-600',
    hoverBorder: 'hover:border-brand-400',
    hoverBg: 'hover:bg-brand-100/30',
    focus: 'focus:ring-brand-500',
    iconBorder: 'border-brand-600',
    iconHoverBorder: 'group-hover:border-brand-700',
    iconHoverBg: 'group-hover:bg-brand-100',
    titleHover: 'group-hover:text-brand-700',
    textHover: 'group-hover:text-brand-600',
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

export function getActionLinkPanelClasses(colorAccent: ColorAccent): {
  base: string
  icon: string
  title: string
  description: string
  focus: string
} {
  const colors = colorClasses[resolvePanelColor(colorAccent)]

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
