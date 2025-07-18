import { cva, type VariantProps } from 'class-variance-authority'

// CVA variants for ActionLinkPanel - modern approach with @variant dark support
export const actionLinkPanelVariants = cva(
  // Base classes - all the common panel styling
  [
    'group relative cursor-pointer overflow-hidden rounded-2xl border shadow-xl',
    'transition-colors duration-750 ease-in-out',
  ],
  {
    variants: {
      color: {
        // Panel specific classes - will be styled with @variant dark
        teal: 'panel-teal',
        brand: 'panel-brand',
        emerald: 'panel-emerald',
        blue: 'panel-blue',
        slate: 'panel-slate',
        red: 'panel-red',
        cyan: 'panel-cyan',
        yellow: 'panel-yellow',
        green: 'panel-green',
        violet: 'panel-violet',
        zinc: 'panel-zinc',
        orange: 'panel-orange',
        amber: 'panel-amber',
        lime: 'panel-lime',
        sky: 'panel-sky',
        indigo: 'panel-indigo',
        purple: 'panel-purple',
        fuchsia: 'panel-fuchsia',
        pink: 'panel-pink',
        rose: 'panel-rose',
        primary: 'panel-primary',
      },
      size: {
        none: '',
        default: '',
        sm: '',
        lg: '',
      },
    },
    defaultVariants: {
      color: 'teal',
      size: 'none',
    },
  }
)

// Background variants for the stable background layer
export const panelBackgroundVariants = cva(
  // Base classes for panel background
  ['absolute inset-0'],
  {
    variants: {
      color: {
        brand: 'panel-brand-bg',
        primary: 'panel-emerald-bg',
        emerald: 'panel-emerald-bg',
        blue: 'panel-blue-bg',
        slate: 'panel-slate-bg',
        teal: 'panel-teal-bg',
        red: 'panel-red-bg',
        cyan: 'bg-gradient-to-br from-white via-cyan-100 to-white dark:from-cyan-950 dark:via-cyan-900 dark:to-cyan-900',
        yellow:
          'bg-gradient-to-br from-white via-yellow-100 to-white dark:from-yellow-950 dark:via-yellow-900 dark:to-yellow-900',
        green:
          'bg-gradient-to-br from-white via-green-100 to-white dark:from-green-950 dark:via-green-900 dark:to-green-900',
        violet:
          'bg-gradient-to-br from-white via-violet-100 to-white dark:from-violet-950 dark:via-violet-900 dark:to-violet-900',
        zinc: 'bg-gradient-to-br from-white via-zinc-100 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900',
        orange:
          'bg-gradient-to-br from-white via-orange-100 to-white dark:from-orange-950 dark:via-orange-900 dark:to-orange-900',
        amber:
          'bg-gradient-to-br from-white via-amber-100 to-white dark:from-amber-950 dark:via-amber-900 dark:to-amber-900',
        lime: 'bg-gradient-to-br from-white via-lime-100 to-white dark:from-lime-950 dark:via-lime-900 dark:to-lime-900',
        sky: 'bg-gradient-to-br from-white via-sky-100 to-white dark:from-sky-950 dark:via-sky-900 dark:to-sky-900',
        indigo:
          'bg-gradient-to-br from-white via-indigo-100 to-white dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-900',
        purple:
          'bg-gradient-to-br from-white via-purple-100 to-white dark:from-purple-950 dark:via-purple-900 dark:to-purple-900',
        fuchsia:
          'bg-gradient-to-br from-white via-fuchsia-100 to-white dark:from-fuchsia-950 dark:via-fuchsia-900 dark:to-fuchsia-900',
        pink: 'bg-gradient-to-br from-white via-pink-100 to-white dark:from-pink-950 dark:via-pink-900 dark:to-pink-900',
        rose: 'bg-gradient-to-br from-white via-rose-100 to-white dark:from-rose-950 dark:via-rose-900 dark:to-rose-900',
      },
    },
    defaultVariants: {
      color: 'teal',
    },
  }
)

// Layer variants for panel content layers
export const panelLayerVariants = cva(
  // Base classes for panel layers
  ['relative z-20 transition-opacity duration-750 ease-in-out'],
  {
    variants: {
      isHover: {
        true: 'absolute inset-0 z-30 opacity-0 group-hover:opacity-100',
        false: 'relative z-20',
      },
      hasHoverColor: {
        true: 'group-hover:opacity-0',
        false: '',
      },
    },
    compoundVariants: [
      {
        isHover: false,
        hasHoverColor: true,
        class: 'group-hover:opacity-0',
      },
    ],
    defaultVariants: {
      isHover: false,
      hasHoverColor: false,
    },
  }
)

// Glow effect variants
export const panelGlowVariants = cva(
  // Base classes for glow effect
  [
    'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-90',
  ],
  {
    variants: {
      color: {
        teal: 'panel-teal-glow',
        brand: 'panel-brand-glow',
        emerald: 'panel-emerald-glow',
        blue: 'panel-blue-glow',
        slate: 'panel-slate-glow',
        red: 'panel-red-glow',
        cyan: 'panel-cyan-glow',
        yellow: 'panel-yellow-glow',
        green: 'panel-green-glow',
        violet: 'panel-violet-glow',
        zinc: 'panel-zinc-glow',
        orange: 'panel-orange-glow',
        amber: 'panel-amber-glow',
        lime: 'panel-lime-glow',
        sky: 'panel-sky-glow',
        indigo: 'panel-indigo-glow',
        purple: 'panel-purple-glow',
        fuchsia: 'panel-fuchsia-glow',
        pink: 'panel-pink-glow',
        rose: 'panel-rose-glow',
        primary: 'panel-primary-glow',
      },
    },
    defaultVariants: {
      color: 'teal',
    },
  }
)

// Icon variants for consistent icon styling
export const panelIconVariants = cva(
  // Base classes for icons
  [
    'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
    'transition-[border-color,background-color,color] duration-500 ease-in-out',
  ],
  {
    variants: {
      color: {
        brand: 'text-red-600 border-red-600',
        teal: 'text-teal-600 border-teal-600',
        emerald: 'text-emerald-600 border-emerald-600',
        blue: 'text-blue-600 border-blue-600',
        slate: 'text-slate-600 border-slate-600',
        red: 'text-red-600 border-red-600',
        cyan: 'text-cyan-600 border-cyan-600',
        yellow: 'text-yellow-600 border-yellow-600',
        green: 'text-green-600 border-green-600',
        violet: 'text-violet-600 border-violet-600',
        zinc: 'text-zinc-600 border-zinc-600',
        orange: 'text-orange-600 border-orange-600',
        amber: 'text-amber-600 border-amber-600',
        lime: 'text-lime-600 border-lime-600',
        sky: 'text-sky-600 border-sky-600',
        indigo: 'text-indigo-600 border-indigo-600',
        purple: 'text-purple-600 border-purple-600',
        fuchsia: 'text-fuchsia-600 border-fuchsia-600',
        pink: 'text-pink-600 border-pink-600',
        rose: 'text-rose-600 border-rose-600',
        primary: 'text-emerald-600 border-emerald-600',
      },
    },
    defaultVariants: {
      color: 'teal',
    },
  }
)

// Children text color variants
export const panelChildrenVariants = cva(
  // Base classes for children content
  [],
  {
    variants: {
      iconColor: {
        brand: '[&_p]:!text-red-600 [&_strong]:!text-red-600',
        green: '[&_p]:!text-green-600 [&_strong]:!text-green-600',
        cyan: '[&_p]:!text-cyan-600 [&_strong]:!text-cyan-600',
        yellow:
          '[&_p]:!text-yellow-700 [&_p]:dark:!text-yellow-300 [&_strong]:!text-yellow-700 [&_strong]:dark:!text-yellow-300',
        violet: '[&_p]:!text-violet-600 [&_strong]:!text-violet-600',
        teal: '[&_p]:!text-teal-600 [&_strong]:!text-teal-600',
        blue: '[&_p]:!text-blue-600 [&_strong]:!text-blue-600',
        emerald: '[&_p]:!text-emerald-600 [&_strong]:!text-emerald-600',
        red: '[&_p]:!text-red-600 [&_strong]:!text-red-600',
        slate: '[&_p]:!text-slate-600 [&_strong]:!text-slate-600',
        zinc: '[&_p]:!text-zinc-600 [&_strong]:!text-zinc-600',
        orange: '[&_p]:!text-orange-600 [&_strong]:!text-orange-600',
        amber: '[&_p]:!text-amber-600 [&_strong]:!text-amber-600',
        lime: '[&_p]:!text-lime-600 [&_strong]:!text-lime-600',
        sky: '[&_p]:!text-sky-600 [&_strong]:!text-sky-600',
        indigo: '[&_p]:!text-indigo-600 [&_strong]:!text-indigo-600',
        purple: '[&_p]:!text-purple-600 [&_strong]:!text-purple-600',
        fuchsia: '[&_p]:!text-fuchsia-600 [&_strong]:!text-fuchsia-600',
        pink: '[&_p]:!text-pink-600 [&_strong]:!text-pink-600',
        rose: '[&_p]:!text-rose-600 [&_strong]:!text-rose-600',
        primary: '[&_p]:!text-emerald-600 [&_strong]:!text-emerald-600',
      },
    },
    defaultVariants: {
      iconColor: 'teal',
    },
  }
)

// Export types
export type ActionLinkPanelVariants = VariantProps<typeof actionLinkPanelVariants>
export type PanelBackgroundVariants = VariantProps<typeof panelBackgroundVariants>
export type PanelLayerVariants = VariantProps<typeof panelLayerVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
export type PanelIconVariants = VariantProps<typeof panelIconVariants>
export type PanelChildrenVariants = VariantProps<typeof panelChildrenVariants>
