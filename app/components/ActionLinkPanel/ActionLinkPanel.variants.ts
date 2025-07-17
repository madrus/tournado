import { cva, type VariantProps } from 'class-variance-authority'

export const actionLinkPanelVariants = cva(
  // Base classes - all the common panel styling
  [
    'group relative cursor-pointer overflow-hidden rounded-2xl border shadow-xl',
    'transition-colors duration-750 ease-in-out',
  ],
  {
    variants: {
      color: {
        brand: 'border-brand-400',
        primary: 'border-primary-400',
        emerald: 'border-emerald-400',
        blue: 'border-blue-400',
        slate: 'border-slate-400',
        teal: 'border-teal-400',
        red: 'border-red-400',
        cyan: 'border-cyan-400',
        yellow: 'border-yellow-400',
        green: 'border-green-400',
        violet: 'border-violet-400',
        zinc: 'border-zinc-400',
        orange: 'border-orange-400',
        amber: 'border-amber-400',
        lime: 'border-lime-400',
        sky: 'border-sky-400',
        indigo: 'border-indigo-400',
        purple: 'border-purple-400',
        fuchsia: 'border-fuchsia-400',
        pink: 'border-pink-400',
        rose: 'border-rose-400',
      },
      hoverColor: {
        brand: 'hover:border-brand-400',
        primary: 'hover:border-primary-400',
        emerald: 'hover:border-emerald-400',
        blue: 'hover:border-blue-400',
        slate: 'hover:border-slate-400',
        teal: 'hover:border-teal-400',
        red: 'hover:border-red-400',
        cyan: 'hover:border-cyan-400',
        yellow: 'hover:border-yellow-400',
        green: 'hover:border-green-400',
        violet: 'hover:border-violet-400',
        zinc: 'hover:border-zinc-400',
        orange: 'hover:border-orange-400',
        amber: 'hover:border-amber-400',
        lime: 'hover:border-lime-400',
        sky: 'hover:border-sky-400',
        indigo: 'hover:border-indigo-400',
        purple: 'hover:border-purple-400',
        fuchsia: 'hover:border-fuchsia-400',
        pink: 'hover:border-pink-400',
        rose: 'hover:border-rose-400',
        none: '',
      },
    },
    defaultVariants: {
      color: 'brand',
      hoverColor: 'none',
    },
  }
)

export const panelBackgroundVariants = cva(
  // Base classes for panel background
  [],
  {
    variants: {
      color: {
        brand: 'bg-panel-bg-brand',
        primary: 'bg-panel-bg-primary',
        emerald: 'bg-panel-bg-emerald',
        blue: 'bg-panel-bg-blue',
        slate: 'bg-panel-bg-slate',
        teal: 'bg-panel-bg-teal',
        red: 'bg-panel-bg-red',
        cyan: 'bg-panel-bg-cyan',
        yellow: 'bg-panel-bg-yellow',
        green: 'bg-panel-bg-green',
        violet: 'bg-panel-bg-violet',
        zinc: 'bg-panel-bg-zinc',
        orange: 'bg-panel-bg-orange',
        amber: 'bg-panel-bg-amber',
        lime: 'bg-panel-bg-lime',
        sky: 'bg-panel-bg-sky',
        indigo: 'bg-panel-bg-indigo',
        purple: 'bg-panel-bg-purple',
        fuchsia: 'bg-panel-bg-fuchsia',
        pink: 'bg-panel-bg-pink',
        rose: 'bg-panel-bg-rose',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

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

export type ActionLinkPanelVariants = VariantProps<typeof actionLinkPanelVariants>
export type PanelBackgroundVariants = VariantProps<typeof panelBackgroundVariants>
export type PanelLayerVariants = VariantProps<typeof panelLayerVariants>
