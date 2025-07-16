import { cva, type VariantProps } from 'class-variance-authority'

export const panelVariants = cva(
  // Base classes - common panel styling
  ['relative overflow-hidden rounded-2xl border shadow-xl p-6'],
  {
    variants: {
      color: {
        brand:
          'border-brand-400 bg-gradient-to-br from-brand-from via-brand-via to-brand-to',
        primary:
          'border-primary-400 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 dark:from-primary-950 dark:via-primary-900 dark:to-primary-900',
        emerald:
          'border-emerald-400 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-900',
        blue: 'border-blue-400 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950 dark:via-blue-900 dark:to-blue-900',
        slate:
          'border-slate-400 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900',
        teal: 'border-teal-400 bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50 dark:from-teal-950 dark:via-teal-900 dark:to-teal-900',
        red: 'border-red-400 bg-gradient-to-br from-red-50 via-red-100 to-red-50 dark:from-red-950 dark:via-red-900 dark:to-red-900',
        cyan: 'border-cyan-400 bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-50 dark:from-cyan-950 dark:via-cyan-900 dark:to-cyan-900',
        yellow:
          'border-yellow-400 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 dark:from-yellow-950 dark:via-yellow-900 dark:to-yellow-900',
        green:
          'border-green-400 bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-green-950 dark:via-green-900 dark:to-green-900',
        violet:
          'border-violet-400 bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50 dark:from-violet-950 dark:via-violet-900 dark:to-violet-900',
        zinc: 'border-zinc-400 bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900',
        orange:
          'border-orange-400 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 dark:from-orange-950 dark:via-orange-900 dark:to-orange-900',
        amber:
          'border-amber-400 bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 dark:from-amber-950 dark:via-amber-900 dark:to-amber-900',
        lime: 'border-lime-400 bg-gradient-to-br from-lime-50 via-lime-100 to-lime-50 dark:from-lime-950 dark:via-lime-900 dark:to-lime-900',
        sky: 'border-sky-400 bg-gradient-to-br from-sky-50 via-sky-100 to-sky-50 dark:from-sky-950 dark:via-sky-900 dark:to-sky-900',
        indigo:
          'border-indigo-400 bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-900',
        purple:
          'border-purple-400 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 dark:from-purple-950 dark:via-purple-900 dark:to-purple-900',
        fuchsia:
          'border-fuchsia-400 bg-gradient-to-br from-fuchsia-50 via-fuchsia-100 to-fuchsia-50 dark:from-fuchsia-950 dark:via-fuchsia-900 dark:to-fuchsia-900',
        pink: 'border-pink-400 bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50 dark:from-pink-950 dark:via-pink-900 dark:to-pink-900',
        rose: 'border-rose-400 bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 dark:from-rose-950 dark:via-rose-900 dark:to-rose-900',
      },
    },
    defaultVariants: {
      color: 'brand',
    },
  }
)

export const panelGlowVariants = cva(
  // Base classes for glow effect
  [
    'pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-90',
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

export type PanelVariants = VariantProps<typeof panelVariants>
export type PanelGlowVariants = VariantProps<typeof panelGlowVariants>
