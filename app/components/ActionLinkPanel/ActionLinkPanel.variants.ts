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
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      color: 'teal',
      size: 'default',
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
        teal: 'panel-teal-bg',
        brand: 'panel-brand-bg',
        emerald: 'panel-emerald-bg',
        blue: 'panel-blue-bg',
        slate: 'panel-slate-bg',
        red: 'panel-red-bg',
        cyan: 'panel-cyan-bg',
        yellow: 'panel-yellow-bg',
        green: 'panel-green-bg',
        violet: 'panel-violet-bg',
        zinc: 'panel-zinc-bg',
        orange: 'panel-orange-bg',
        amber: 'panel-amber-bg',
        lime: 'panel-lime-bg',
        sky: 'panel-sky-bg',
        indigo: 'panel-indigo-bg',
        purple: 'panel-purple-bg',
        fuchsia: 'panel-fuchsia-bg',
        pink: 'panel-pink-bg',
        rose: 'panel-rose-bg',
        primary: 'panel-primary-bg',
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
        false: '',
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

// Export types
export type ActionLinkPanelVariants = VariantProps<typeof actionLinkPanelVariants>
export type PanelBackgroundVariants = VariantProps<typeof panelBackgroundVariants>
export type PanelLayerVariants = VariantProps<typeof panelLayerVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
export type PanelIconVariants = VariantProps<typeof panelIconVariants>
