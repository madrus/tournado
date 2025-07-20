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
        brand: 'text-adaptive-red-action border-adaptive-red-action',
        teal: 'text-adaptive-teal-action border-adaptive-teal-action',
        emerald: 'text-adaptive-emerald-action border-adaptive-emerald-action',
        blue: 'text-adaptive-blue-action border-adaptive-blue-action',
        slate: 'text-adaptive-slate-action border-adaptive-slate-action',
        red: 'text-adaptive-red-action border-adaptive-red-action',
        cyan: 'text-adaptive-cyan-action border-adaptive-cyan-action',
        yellow: 'text-adaptive-yellow-action border-adaptive-yellow-action',
        green: 'text-adaptive-green-action border-adaptive-green-action',
        violet: 'text-adaptive-violet-action border-adaptive-violet-action',
        zinc: 'text-adaptive-zinc-action border-adaptive-zinc-action',
        orange: 'text-adaptive-orange-action border-adaptive-orange-action',
        amber: 'text-adaptive-amber-action border-adaptive-amber-action',
        lime: 'text-adaptive-lime-action border-adaptive-lime-action',
        sky: 'text-adaptive-sky-action border-adaptive-sky-action',
        indigo: 'text-adaptive-indigo-action border-adaptive-indigo-action',
        purple: 'text-adaptive-purple-action border-adaptive-purple-action',
        fuchsia: 'text-adaptive-fuchsia-action border-adaptive-fuchsia-action',
        pink: 'text-adaptive-pink-action border-adaptive-pink-action',
        rose: 'text-adaptive-rose-action border-adaptive-rose-action',
        primary: 'text-adaptive-emerald-action border-adaptive-emerald-action',
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
        brand: '[&_p]:!text-adaptive-red-action [&_strong]:!text-adaptive-red-action',
        green:
          '[&_p]:!text-adaptive-green-action [&_strong]:!text-adaptive-green-action',
        cyan: '[&_p]:!text-adaptive-cyan-action [&_strong]:!text-adaptive-cyan-action',
        yellow:
          '[&_p]:!text-adaptive-yellow-action [&_strong]:!text-adaptive-yellow-action',
        violet:
          '[&_p]:!text-adaptive-violet-action [&_strong]:!text-adaptive-violet-action',
        teal: '[&_p]:!text-adaptive-teal-action [&_strong]:!text-adaptive-teal-action',
        blue: '[&_p]:!text-adaptive-blue-action [&_strong]:!text-adaptive-blue-action',
        emerald:
          '[&_p]:!text-adaptive-emerald-action [&_strong]:!text-adaptive-emerald-action',
        red: '[&_p]:!text-adaptive-red-action [&_strong]:!text-adaptive-red-action',
        slate:
          '[&_p]:!text-adaptive-slate-action [&_strong]:!text-adaptive-slate-action',
        zinc: '[&_p]:!text-adaptive-zinc-action [&_strong]:!text-adaptive-zinc-action',
        orange:
          '[&_p]:!text-adaptive-orange-action [&_strong]:!text-adaptive-orange-action',
        amber:
          '[&_p]:!text-adaptive-amber-action [&_strong]:!text-adaptive-amber-action',
        lime: '[&_p]:!text-adaptive-lime-action [&_strong]:!text-adaptive-lime-action',
        sky: '[&_p]:!text-adaptive-sky-action [&_strong]:!text-adaptive-sky-action',
        indigo:
          '[&_p]:!text-adaptive-indigo-action [&_strong]:!text-adaptive-indigo-action',
        purple:
          '[&_p]:!text-adaptive-purple-action [&_strong]:!text-adaptive-purple-action',
        fuchsia:
          '[&_p]:!text-adaptive-fuchsia-action [&_strong]:!text-adaptive-fuchsia-action',
        pink: '[&_p]:!text-adaptive-pink-action [&_strong]:!text-adaptive-pink-action',
        rose: '[&_p]:!text-adaptive-rose-action [&_strong]:!text-adaptive-rose-action',
        primary:
          '[&_p]:!text-adaptive-emerald-action [&_strong]:!text-adaptive-emerald-action',
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
