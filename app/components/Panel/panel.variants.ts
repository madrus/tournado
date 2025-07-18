import { cva, type VariantProps } from 'class-variance-authority'

export const panelVariants = cva(
  // Base classes - common panel styling
  ['relative overflow-visible rounded-2xl border shadow-xl p-6'],
  {
    variants: {
      color: {
        brand:
          'border-red-300 bg-gradient-to-br from-white via-red-100 to-white @dark:from-red-950 @dark:via-red-900 @dark:to-red-900',
        primary:
          'border-emerald-300 bg-gradient-to-br from-white via-emerald-100 to-white @dark:from-emerald-950 @dark:via-emerald-900 @dark:to-emerald-900',
        emerald:
          'border-emerald-300 bg-gradient-to-br from-white via-emerald-100 to-white @dark:from-emerald-950 @dark:via-emerald-900 @dark:to-emerald-900',
        blue: 'border-blue-300 bg-gradient-to-br from-white via-blue-100 to-white @dark:from-blue-950 @dark:via-blue-900 @dark:to-blue-900',
        slate:
          'border-slate-300 bg-gradient-to-br from-white via-slate-100 to-white @dark:from-slate-950 @dark:via-slate-900 @dark:to-slate-900',
        teal: 'border-teal-300 bg-gradient-to-br from-white via-teal-100 to-white @dark:from-teal-950 @dark:via-teal-900 @dark:to-teal-900',
        red: 'border-red-300 bg-gradient-to-br from-white via-red-100 to-white @dark:from-red-950 @dark:via-red-900 @dark:to-red-900',
        cyan: 'border-cyan-300 bg-gradient-to-br from-white via-cyan-100 to-white @dark:from-cyan-950 @dark:via-cyan-900 @dark:to-cyan-900',
        yellow:
          'border-yellow-300 bg-gradient-to-br from-white via-yellow-100 to-white @dark:from-yellow-950 @dark:via-yellow-900 @dark:to-yellow-900',
        green:
          'border-green-300 bg-gradient-to-br from-white via-green-100 to-white @dark:from-green-950 @dark:via-green-900 @dark:to-green-900',
        violet:
          'border-violet-300 bg-gradient-to-br from-white via-violet-100 to-white @dark:from-violet-950 @dark:via-violet-900 @dark:to-violet-900',
        zinc: 'border-zinc-300 bg-gradient-to-br from-white via-zinc-100 to-white @dark:from-zinc-950 @dark:via-zinc-900 @dark:to-zinc-900',
        orange:
          'border-orange-300 bg-gradient-to-br from-white via-orange-100 to-white @dark:from-orange-950 @dark:via-orange-900 @dark:to-orange-900',
        amber:
          'border-amber-300 bg-gradient-to-br from-white via-amber-100 to-white @dark:from-amber-950 @dark:via-amber-900 @dark:to-amber-900',
        lime: 'border-lime-300 bg-gradient-to-br from-white via-lime-100 to-white @dark:from-lime-950 @dark:via-lime-900 @dark:to-lime-900',
        sky: 'border-sky-300 bg-gradient-to-br from-white via-sky-100 to-white @dark:from-sky-950 @dark:via-sky-900 @dark:to-sky-900',
        indigo:
          'border-indigo-300 bg-gradient-to-br from-white via-indigo-100 to-white @dark:from-indigo-950 @dark:via-indigo-900 @dark:to-indigo-900',
        purple:
          'border-purple-300 bg-gradient-to-br from-white via-purple-100 to-white @dark:from-purple-950 @dark:via-purple-900 @dark:to-purple-900',
        fuchsia:
          'border-fuchsia-300 bg-gradient-to-br from-white via-fuchsia-100 to-white @dark:from-fuchsia-950 @dark:via-fuchsia-900 @dark:to-fuchsia-900',
        pink: 'border-pink-300 bg-gradient-to-br from-white via-pink-100 to-white @dark:from-pink-950 @dark:via-pink-900 @dark:to-pink-900',
        rose: 'border-rose-300 bg-gradient-to-br from-white via-rose-100 to-white @dark:from-rose-950 @dark:via-rose-900 @dark:to-rose-900',
      },
      variant: {
        // Layer-specific variants
        container: 'cursor-pointer h-full transition-colors duration-750 ease-in-out',
        background: 'absolute inset-0 p-0',
        content: 'relative z-20 p-6',
        hover:
          'absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-750 ease-in-out',
      },
    },
    defaultVariants: {
      color: 'brand',
      variant: 'content',
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
export const panelTitleVariants = cva(['mb-2 font-bold'], {
  variants: {
    size: {
      lg: 'text-2xl',
      md: 'text-xl',
      sm: 'text-lg',
    },
    color: {
      slate: 'text-foreground-darker',
      red: 'text-red-600 @dark:text-red-400',
      blue: 'text-blue-600 @dark:text-blue-400',
      emerald: 'text-emerald-600 @dark:text-emerald-400',
      teal: 'text-teal-600 @dark:text-teal-400',
      cyan: 'text-cyan-600 @dark:text-cyan-400',
      green: 'text-green-600 @dark:text-green-400',
      violet: 'text-violet-600 @dark:text-violet-400',
      purple: 'text-purple-600 @dark:text-purple-400',
      yellow: 'text-yellow-600 @dark:text-yellow-400',
      orange: 'text-orange-600 @dark:text-orange-400',
      pink: 'text-pink-600 @dark:text-pink-400',
      indigo: 'text-indigo-600 @dark:text-indigo-400',
      fuchsia: 'text-fuchsia-600 @dark:text-fuchsia-400',
      sky: 'text-sky-600 @dark:text-sky-400',
      lime: 'text-lime-600 @dark:text-lime-400',
      amber: 'text-amber-600 @dark:text-amber-400',
      rose: 'text-rose-600 @dark:text-rose-400',
      brand: 'text-red-600 @dark:text-red-400',
      primary: 'text-emerald-600 @dark:text-emerald-400',
      zinc: 'text-zinc-600 @dark:text-zinc-400',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'slate',
  },
})

// Panel description styling
export const panelDescriptionVariants = cva(['text-foreground text-sm'], {
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

export type PanelVariants = VariantProps<typeof panelVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
export type PanelNumberVariants = VariantProps<typeof panelNumberVariants>
export type PanelTitleVariants = VariantProps<typeof panelTitleVariants>
export type PanelDescriptionVariants = VariantProps<typeof panelDescriptionVariants>
