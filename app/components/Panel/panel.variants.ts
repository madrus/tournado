import { cva, type VariantProps } from 'class-variance-authority'

export const panelVariants = cva(
  // Base classes - common panel styling
  ['relative overflow-visible p-6'],
  {
    variants: {
      color: {
        brand: 'border-brand-400 panel-brand-bg',
        primary: 'border-emerald-300 panel-emerald-bg',
        emerald: 'border-emerald-300 panel-emerald-bg',
        blue: 'border-blue-300 panel-blue-bg',
        slate: 'border-slate-300 panel-slate-bg',
        teal: 'border-teal-300 panel-teal-bg',
        red: 'border-red-300 panel-red-bg',
        cyan: 'border-cyan-300 panel-cyan-bg',
        yellow: 'border-yellow-300 panel-yellow-bg',
        green: 'border-green-300 panel-green-bg',
        violet: 'border-violet-300 panel-violet-bg',
        zinc: 'border-zinc-300 panel-zinc-bg',
        orange: 'border-orange-300 panel-orange-bg',
        amber: 'border-amber-300 panel-amber-bg',
        lime: 'border-lime-300 panel-lime-bg',
        sky: 'border-sky-300 panel-sky-bg',
        indigo: 'border-indigo-300 panel-indigo-bg',
        purple: 'border-purple-300 panel-purple-bg',
        fuchsia: 'border-fuchsia-300 panel-fuchsia-bg',
        pink: 'border-pink-300 panel-pink-bg',
        rose: 'border-rose-300 panel-rose-bg',
      },
      variant: {
        // Layer-specific variants (for ActionLinkPanel architecture)
        container: 'cursor-pointer transition-colors duration-750 ease-in-out',
        background: 'absolute inset-0 p-0',
        content: 'relative z-20 p-6',
        hover:
          'absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-750 ease-in-out',

        // Semantic panel type variants
        'content-panel': 'rounded-xl border shadow-lg', // General content panels
        'dashboard-panel':
          'rounded-xl border shadow-lg p-6 [&_.dashboard-content]:flex [&_.dashboard-content]:items-center [&_.dashboard-icon]:flex-shrink-0 [&_.dashboard-icon]:me-5 [&_.dashboard-stats]:w-0 [&_.dashboard-stats]:flex-1', // Stats/metrics panels with horizontal layout
        'form-panel': 'rounded-xl border shadow-lg p-6 lg:p-8', // Multi-step form panels with responsive padding
      },
    },
    defaultVariants: {
      color: 'brand',
      variant: 'content-panel',
    },
  }
)

export const panelGlowVariants = cva(
  // Base classes for glow effect - RTL aware positioning
  [
    'pointer-events-none absolute -top-8 -right-8 rtl:-left-8 rtl:right-auto h-32 w-32 rounded-full blur-2xl opacity-60',
  ],
  {
    variants: {
      color: {
        brand: 'bg-brand-400/30',
        primary: 'bg-primary-400/30',
        emerald: 'bg-emerald-400/30',
        blue: 'bg-blue-400/30',
        slate: 'bg-slate-400/30',
        teal: 'bg-teal-400/30',
        red: 'bg-red-400/30',
        cyan: 'bg-cyan-400/30',
        yellow: 'bg-yellow-400/30',
        green: 'bg-green-400/30',
        violet: 'bg-violet-400/30',
        zinc: 'bg-zinc-400/30',
        orange: 'bg-orange-400/30',
        amber: 'bg-amber-400/30',
        lime: 'bg-lime-400/30',
        sky: 'bg-sky-400/30',
        indigo: 'bg-indigo-400/30',
        purple: 'bg-purple-400/30',
        fuchsia: 'bg-fuchsia-400/30',
        pink: 'bg-pink-400/30',
        rose: 'bg-rose-400/30',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

export const panelContentVariants = cva(
  // Base classes for content
  ['relative z-20']
)

// Panel title styling - consistent across app
export const panelTitleVariants = cva(['mb-4 font-bold text-title'], {
  variants: {
    size: {
      lg: 'text-2xl',
      md: 'text-xl',
      sm: 'text-lg',
    },
    language: {
      ar: 'latin-title', // Arabic RTL - apply latin-title class
      en: '', // English LTR - no additional classes
      nl: '', // Dutch LTR - no additional classes
      tr: '', // Turkish LTR - no additional classes
    },
  },
  defaultVariants: {
    size: 'md',
    language: 'nl',
  },
})

// Panel description styling
export const panelDescriptionVariants = cva(['text-foreground'], {
  variants: {
    color: {
      brand: 'text-brand-darkest dark:text-red-200', // Keep custom brand logic
      primary: 'text-emerald-800 dark:text-emerald-200',
      emerald: 'text-emerald-800 dark:text-emerald-200',
      blue: 'text-blue-800 dark:text-blue-200',
      slate: 'text-foreground', // Keep semantic foreground
      teal: 'text-teal-800 dark:text-teal-200',
      red: 'text-red-800 dark:text-red-200',
      cyan: 'text-cyan-800 dark:text-cyan-200',
      yellow: 'text-yellow-800 dark:text-yellow-200',
      green: 'text-green-800 dark:text-green-200',
      violet: 'text-violet-800 dark:text-violet-200',
      zinc: 'text-zinc-800 dark:text-zinc-200',
      orange: 'text-orange-800 dark:text-orange-200',
      amber: 'text-amber-800 dark:text-amber-200',
      lime: 'text-lime-800 dark:text-lime-200',
      sky: 'text-sky-800 dark:text-sky-200',
      indigo: 'text-indigo-800 dark:text-indigo-200',
      purple: 'text-purple-800 dark:text-purple-200',
      fuchsia: 'text-fuchsia-800 dark:text-fuchsia-200',
      pink: 'text-pink-800 dark:text-pink-200',
      rose: 'text-rose-800 dark:text-rose-200',
    },
  },
  defaultVariants: {
    color: 'slate',
  },
})

// Panel number badge styling
export const panelNumberVariants = cva(
  [
    'text-primary-foreground absolute top-8 -left-4 z-30 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg rtl:-right-4 rtl:left-auto',
  ],
  {
    variants: {
      color: {
        brand: 'bg-brand-600',
        primary: 'bg-primary-600',
        emerald: 'bg-emerald-600',
        blue: 'bg-blue-600',
        slate: 'bg-slate-600',
        teal: 'bg-teal-600',
        red: 'bg-red-600',
        cyan: 'bg-cyan-600',
        yellow: 'bg-yellow-600',
        green: 'bg-green-600',
        violet: 'bg-violet-600',
        zinc: 'bg-zinc-600',
        orange: 'bg-orange-600',
        amber: 'bg-amber-600',
        lime: 'bg-lime-600',
        sky: 'bg-sky-600',
        indigo: 'bg-indigo-600',
        purple: 'bg-purple-600',
        fuchsia: 'bg-fuchsia-600',
        pink: 'bg-pink-600',
        rose: 'bg-rose-600',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

// Panel icon styling
export const panelIconVariants = cva(
  [
    'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-[color,border-color] duration-500 ease-in-out',
  ],
  {
    variants: {
      color: {
        brand: 'text-adaptive-brand border-adaptive-brand',
        primary: 'text-adaptive-emerald border-adaptive-emerald',
        emerald: 'text-adaptive-emerald border-adaptive-emerald',
        blue: 'text-adaptive-blue border-adaptive-blue',
        slate: 'text-adaptive-slate border-adaptive-slate',
        teal: 'text-adaptive-teal border-adaptive-teal',
        red: 'text-adaptive-red border-adaptive-red',
        cyan: 'text-adaptive-cyan border-adaptive-cyan',
        yellow: 'text-adaptive-yellow border-adaptive-yellow',
        green: 'text-adaptive-green border-adaptive-green',
        violet: 'text-adaptive-violet border-adaptive-violet',
        zinc: 'text-adaptive-zinc border-adaptive-zinc',
        orange: 'text-adaptive-orange border-adaptive-orange',
        amber: 'text-adaptive-amber border-adaptive-amber',
        lime: 'text-adaptive-lime border-adaptive-lime',
        sky: 'text-adaptive-sky border-adaptive-sky',
        indigo: 'text-adaptive-indigo border-adaptive-indigo',
        purple: 'text-adaptive-purple border-adaptive-purple',
        fuchsia: 'text-adaptive-fuchsia border-adaptive-fuchsia',
        pink: 'text-adaptive-pink border-adaptive-pink',
        rose: 'text-adaptive-rose border-adaptive-rose',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

// Panel children text color variants - using semantic classes
export const panelChildrenVariants = cva(
  // Base classes for children content
  [],
  {
    variants: {
      iconColor: {
        brand: '[&_p]:text-adaptive-brand [&_strong]:text-adaptive-brand',
        primary: '[&_p]:text-adaptive-emerald [&_strong]:text-adaptive-emerald',
        emerald: '[&_p]:text-adaptive-emerald [&_strong]:text-adaptive-emerald',
        blue: '[&_p]:text-adaptive-blue [&_strong]:text-adaptive-blue',
        slate: '[&_p]:text-adaptive-slate [&_strong]:text-adaptive-slate',
        teal: '[&_p]:text-adaptive-teal [&_strong]:text-adaptive-teal',
        red: '[&_p]:text-adaptive-red [&_strong]:text-adaptive-red',
        cyan: '[&_p]:text-adaptive-cyan [&_strong]:text-adaptive-cyan',
        yellow: '[&_p]:text-adaptive-yellow [&_strong]:text-adaptive-yellow',
        green: '[&_p]:text-adaptive-green [&_strong]:text-adaptive-green',
        violet: '[&_p]:text-adaptive-violet [&_strong]:text-adaptive-violet',
        zinc: '[&_p]:text-adaptive-zinc [&_strong]:text-adaptive-zinc',
        orange: '[&_p]:text-adaptive-orange [&_strong]:text-adaptive-orange',
        amber: '[&_p]:text-adaptive-amber [&_strong]:text-adaptive-amber',
        lime: '[&_p]:text-adaptive-lime [&_strong]:text-adaptive-lime',
        sky: '[&_p]:text-adaptive-sky [&_strong]:text-adaptive-sky',
        indigo: '[&_p]:text-adaptive-indigo [&_strong]:text-adaptive-indigo',
        purple: '[&_p]:text-adaptive-purple [&_strong]:text-adaptive-purple',
        fuchsia: '[&_p]:text-adaptive-fuchsia [&_strong]:text-adaptive-fuchsia',
        pink: '[&_p]:text-adaptive-pink [&_strong]:text-adaptive-pink',
        rose: '[&_p]:text-adaptive-rose [&_strong]:text-adaptive-rose',
      },
    },
    defaultVariants: {
      iconColor: 'brand',
    },
  }
)

// Dashboard icon background styling
export const dashboardIconVariants = cva(
  ['flex h-8 w-8 items-center justify-center rounded-md text-white'],
  {
    variants: {
      color: {
        brand: 'bg-red-600',
        primary: 'bg-emerald-600',
        emerald: 'bg-emerald-600',
        blue: 'bg-blue-600',
        slate: 'bg-slate-600',
        teal: 'bg-teal-600',
        red: 'bg-red-600',
        cyan: 'bg-cyan-600',
        yellow: 'bg-yellow-600',
        green: 'bg-green-600',
        violet: 'bg-violet-600',
        zinc: 'bg-zinc-600',
        orange: 'bg-orange-600',
        amber: 'bg-amber-600',
        lime: 'bg-lime-600',
        sky: 'bg-sky-600',
        indigo: 'bg-indigo-600',
        purple: 'bg-purple-600',
        fuchsia: 'bg-fuchsia-600',
        pink: 'bg-pink-600',
        rose: 'bg-rose-600',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

export type PanelVariants = VariantProps<typeof panelVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
export type PanelNumberVariants = VariantProps<typeof panelNumberVariants>
export type PanelTitleVariants = VariantProps<typeof panelTitleVariants>
export type PanelDescriptionVariants = VariantProps<typeof panelDescriptionVariants>
export type PanelIconVariants = VariantProps<typeof panelIconVariants>
export type PanelChildrenVariants = VariantProps<typeof panelChildrenVariants>
export type DashboardIconVariants = VariantProps<typeof dashboardIconVariants>
