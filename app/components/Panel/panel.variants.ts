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
        'dashboard-panel': 'rounded-xl border shadow-lg', // Stats/metrics panels
        'form-panel': 'rounded-xl border shadow-lg', // Multi-step form panels
      },
    },
    defaultVariants: {
      color: 'brand',
      variant: 'content-panel',
    },
  }
)

export const panelGlowVariants = cva(
  // Base classes for glow effect
  [
    'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-60',
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
    language: 'en',
  },
})

// Panel description styling
export const panelDescriptionVariants = cva(['text-foreground'], {
  variants: {},
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
        brand: 'text-red-600 border-red-600',
        primary: 'text-emerald-600 border-emerald-600',
        emerald:
          'text-emerald-700 dark:text-emerald-300 border-emerald-700 dark:border-emerald-300',
        blue: 'text-blue-700 dark:text-blue-300 border-blue-700 dark:border-blue-300',
        slate:
          'text-slate-700 dark:text-slate-300 border-slate-700 dark:border-slate-300',
        teal: 'text-teal-700 dark:text-teal-300 border-teal-700 dark:border-teal-300',
        red: 'text-red-700 dark:text-red-300 border-red-700 dark:border-red-300',
        cyan: 'text-cyan-700 dark:text-cyan-300 border-cyan-700 dark:border-cyan-300',
        yellow:
          'text-yellow-700 dark:text-yellow-300 border-yellow-700 dark:border-yellow-300',
        green:
          'text-green-700 dark:text-green-300 border-green-700 dark:border-green-300',
        violet:
          'text-violet-700 dark:text-violet-300 border-violet-700 dark:border-violet-300',
        zinc: 'text-zinc-700 dark:text-zinc-300 border-zinc-700 dark:border-zinc-300',
        orange:
          'text-orange-700 dark:text-orange-300 border-orange-700 dark:border-orange-300',
        amber:
          'text-amber-700 dark:text-amber-300 border-amber-700 dark:border-amber-300',
        lime: 'text-lime-700 dark:text-lime-300 border-lime-700 dark:border-lime-300',
        sky: 'text-sky-700 dark:text-sky-300 border-sky-700 dark:border-sky-300',
        indigo:
          'text-indigo-700 dark:text-indigo-300 border-indigo-700 dark:border-indigo-300',
        purple:
          'text-purple-700 dark:text-purple-300 border-purple-700 dark:border-purple-300',
        fuchsia:
          'text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-700 dark:border-fuchsia-300',
        pink: 'text-pink-700 dark:text-pink-300 border-pink-700 dark:border-pink-300',
        rose: 'text-rose-700 dark:text-rose-300 border-rose-700 dark:border-rose-300',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

// Panel children text color variants
export const panelChildrenVariants = cva(
  // Base classes for children content
  [],
  {
    variants: {
      iconColor: {
        brand: '[&_p]:!text-red-600 [&_strong]:!text-red-600',
        primary: '[&_p]:!text-emerald-600 [&_strong]:!text-emerald-600',
        emerald:
          '[&_p]:!text-emerald-700 [&_p]:dark:!text-emerald-300 [&_strong]:!text-emerald-700 [&_strong]:dark:!text-emerald-300',
        blue: '[&_p]:!text-blue-700 [&_p]:dark:!text-blue-300 [&_strong]:!text-blue-700 [&_strong]:dark:!text-blue-300',
        slate:
          '[&_p]:!text-slate-700 [&_p]:dark:!text-slate-300 [&_strong]:!text-slate-700 [&_strong]:dark:!text-slate-300',
        teal: '[&_p]:!text-teal-700 [&_p]:dark:!text-teal-300 [&_strong]:!text-teal-700 [&_strong]:dark:!text-teal-300',
        red: '[&_p]:!text-red-700 [&_p]:dark:!text-red-300 [&_strong]:!text-red-700 [&_strong]:dark:!text-red-300',
        cyan: '[&_p]:!text-cyan-700 [&_p]:dark:!text-cyan-300 [&_strong]:!text-cyan-700 [&_strong]:dark:!text-cyan-300',
        yellow:
          '[&_p]:!text-yellow-700 [&_p]:dark:!text-yellow-300 [&_strong]:!text-yellow-700 [&_strong]:dark:!text-yellow-300',
        green:
          '[&_p]:!text-green-700 [&_p]:dark:!text-green-300 [&_strong]:!text-green-700 [&_strong]:dark:!text-green-300',
        violet:
          '[&_p]:!text-violet-700 [&_p]:dark:!text-violet-300 [&_strong]:!text-violet-700 [&_strong]:dark:!text-violet-300',
        zinc: '[&_p]:!text-zinc-700 [&_p]:dark:!text-zinc-300 [&_strong]:!text-zinc-700 [&_strong]:dark:!text-zinc-300',
        orange:
          '[&_p]:!text-orange-700 [&_p]:dark:!text-orange-300 [&_strong]:!text-orange-700 [&_strong]:dark:!text-orange-300',
        amber:
          '[&_p]:!text-amber-700 [&_p]:dark:!text-amber-300 [&_strong]:!text-amber-700 [&_strong]:dark:!text-amber-300',
        lime: '[&_p]:!text-lime-700 [&_p]:dark:!text-lime-300 [&_strong]:!text-lime-700 [&_strong]:dark:!text-lime-300',
        sky: '[&_p]:!text-sky-700 [&_p]:dark:!text-sky-300 [&_strong]:!text-sky-700 [&_strong]:dark:!text-sky-300',
        indigo:
          '[&_p]:!text-indigo-700 [&_p]:dark:!text-indigo-300 [&_strong]:!text-indigo-700 [&_strong]:dark:!text-indigo-300',
        purple:
          '[&_p]:!text-purple-700 [&_p]:dark:!text-purple-300 [&_strong]:!text-purple-700 [&_strong]:dark:!text-purple-300',
        fuchsia:
          '[&_p]:!text-fuchsia-700 [&_p]:dark:!text-fuchsia-300 [&_strong]:!text-fuchsia-700 [&_strong]:dark:!text-fuchsia-300',
        pink: '[&_p]:!text-pink-700 [&_p]:dark:!text-pink-300 [&_strong]:!text-pink-700 [&_strong]:dark:!text-pink-300',
        rose: '[&_p]:!text-rose-700 [&_p]:dark:!text-rose-300 [&_strong]:!text-rose-700 [&_strong]:dark:!text-rose-300',
      },
    },
    defaultVariants: {
      iconColor: 'brand',
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
