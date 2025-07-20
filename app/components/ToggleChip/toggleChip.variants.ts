import { cva, type VariantProps } from 'class-variance-authority'

export const toggleChipVariants = cva(
  [
    'flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all duration-200',
  ],
  {
    variants: {
      color: {
        brand: [
          // Unselected state: white in light mode, brand-50 in dark mode
          'border-slate-200 bg-white dark:bg-brand-50 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-100',
        ],
        primary: [
          'border-slate-200 bg-white dark:bg-primary-50 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-100',
        ],
        emerald: [
          'border-slate-200 bg-white dark:bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-100',
        ],
        red: [
          'border-slate-200 bg-white dark:bg-red-50 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-100',
        ],
        blue: [
          'border-slate-200 bg-white dark:bg-blue-50 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-100',
        ],
        green: [
          'border-slate-200 bg-white dark:bg-green-50 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-100',
        ],
        yellow: [
          'border-slate-200 bg-white dark:bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-100',
        ],
        purple: [
          'border-slate-200 bg-white dark:bg-purple-50 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-100',
        ],
        pink: [
          'border-slate-200 bg-white dark:bg-pink-50 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-100',
        ],
        indigo: [
          'border-slate-200 bg-white dark:bg-indigo-50 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-100',
        ],
        slate: [
          'border-slate-200 bg-white dark:bg-slate-50 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-100',
        ],
        zinc: [
          'border-slate-200 bg-white dark:bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-100',
        ],
        orange: [
          'border-slate-200 bg-white dark:bg-orange-50 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-100',
        ],
        amber: [
          'border-slate-200 bg-white dark:bg-amber-50 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-100',
        ],
        lime: [
          'border-slate-200 bg-white dark:bg-lime-50 hover:border-lime-300 hover:bg-lime-50 dark:hover:bg-lime-100',
        ],
        teal: [
          'border-slate-200 bg-white dark:bg-teal-50 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-100',
        ],
        cyan: [
          'border-slate-200 bg-white dark:bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-100',
        ],
        sky: [
          'border-slate-200 bg-white dark:bg-sky-50 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-100',
        ],
        violet: [
          'border-slate-200 bg-white dark:bg-violet-50 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-100',
        ],
        fuchsia: [
          'border-slate-200 bg-white dark:bg-fuchsia-50 hover:border-fuchsia-300 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-100',
        ],
        rose: [
          'border-slate-200 bg-white dark:bg-rose-50 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-100',
        ],
      },
      selected: {
        true: '',
        false: '',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    compoundVariants: [
      // Selected state: color-100 in light mode, color-200 in dark mode
      {
        color: 'brand',
        selected: true,
        className:
          'border-brand-500 bg-brand-100 dark:bg-brand-200 text-adaptive-brand-selected',
      },
      {
        color: 'primary',
        selected: true,
        className:
          'border-primary-500 bg-primary-100 dark:bg-primary-200 text-adaptive-primary-selected',
      },
      {
        color: 'emerald',
        selected: true,
        className:
          'border-emerald-500 bg-emerald-100 dark:bg-emerald-200 text-adaptive-emerald-selected',
      },
      {
        color: 'red',
        selected: true,
        className:
          'border-red-500 bg-red-100 dark:bg-red-200 text-adaptive-red-selected',
      },
      {
        color: 'blue',
        selected: true,
        className:
          'border-blue-500 bg-blue-100 dark:bg-blue-200 text-adaptive-blue-selected',
      },
      {
        color: 'green',
        selected: true,
        className:
          'border-green-500 bg-green-100 dark:bg-green-200 text-adaptive-green-selected',
      },
      {
        color: 'yellow',
        selected: true,
        className:
          'border-yellow-500 bg-yellow-100 dark:bg-yellow-200 text-adaptive-yellow-selected',
      },
      {
        color: 'purple',
        selected: true,
        className:
          'border-purple-500 bg-purple-100 dark:bg-purple-200 text-adaptive-purple-selected',
      },
      {
        color: 'pink',
        selected: true,
        className:
          'border-pink-500 bg-pink-100 dark:bg-pink-200 text-adaptive-pink-selected',
      },
      {
        color: 'indigo',
        selected: true,
        className:
          'border-indigo-500 bg-indigo-100 dark:bg-indigo-200 text-adaptive-indigo-selected',
      },
      {
        color: 'slate',
        selected: true,
        className:
          'border-slate-500 bg-slate-100 dark:bg-slate-200 text-adaptive-slate-selected',
      },
      {
        color: 'zinc',
        selected: true,
        className:
          'border-zinc-500 bg-zinc-100 dark:bg-zinc-200 text-adaptive-zinc-selected',
      },
      {
        color: 'orange',
        selected: true,
        className:
          'border-orange-500 bg-orange-100 dark:bg-orange-200 text-adaptive-orange-selected',
      },
      {
        color: 'amber',
        selected: true,
        className:
          'border-amber-500 bg-amber-100 dark:bg-amber-200 text-adaptive-amber-selected',
      },
      {
        color: 'lime',
        selected: true,
        className:
          'border-lime-500 bg-lime-100 dark:bg-lime-200 text-adaptive-lime-selected',
      },
      {
        color: 'teal',
        selected: true,
        className:
          'border-teal-500 bg-teal-100 dark:bg-teal-200 text-adaptive-teal-selected',
      },
      {
        color: 'cyan',
        selected: true,
        className:
          'border-cyan-500 bg-cyan-100 dark:bg-cyan-200 text-adaptive-cyan-selected',
      },
      {
        color: 'sky',
        selected: true,
        className:
          'border-sky-500 bg-sky-100 dark:bg-sky-200 text-adaptive-sky-selected',
      },
      {
        color: 'violet',
        selected: true,
        className:
          'border-violet-500 bg-violet-100 dark:bg-violet-200 text-adaptive-violet-selected',
      },
      {
        color: 'fuchsia',
        selected: true,
        className:
          'border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-200 text-adaptive-fuchsia-selected',
      },
      {
        color: 'rose',
        selected: true,
        className:
          'border-rose-500 bg-rose-100 dark:bg-rose-200 text-adaptive-rose-selected',
      },
    ],
    defaultVariants: {
      color: 'brand',
      selected: false,
      disabled: false,
    },
  }
)

export const toggleChipTextVariants = cva(
  ['font-medium text-sm transition-colors duration-200'],
  {
    variants: {
      color: {
        brand: 'text-adaptive-unselected',
        primary: 'text-adaptive-unselected',
        emerald: 'text-adaptive-unselected',
        red: 'text-adaptive-unselected',
        blue: 'text-adaptive-unselected',
        green: 'text-adaptive-unselected',
        yellow: 'text-adaptive-unselected',
        purple: 'text-adaptive-unselected',
        pink: 'text-adaptive-unselected',
        indigo: 'text-adaptive-unselected',
        slate: 'text-adaptive-unselected',
        zinc: 'text-adaptive-unselected',
        orange: 'text-adaptive-unselected',
        amber: 'text-adaptive-unselected',
        lime: 'text-adaptive-unselected',
        teal: 'text-adaptive-unselected',
        cyan: 'text-adaptive-unselected',
        sky: 'text-adaptive-unselected',
        violet: 'text-adaptive-unselected',
        fuchsia: 'text-adaptive-unselected',
        rose: 'text-adaptive-unselected',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        color: 'brand',
        selected: true,
        className: 'text-adaptive-brand-selected',
      },
      {
        color: 'primary',
        selected: true,
        className: 'text-adaptive-primary-selected',
      },
      {
        color: 'emerald',
        selected: true,
        className: 'text-adaptive-emerald-selected',
      },
      { color: 'red', selected: true, className: 'text-adaptive-red-selected' },
      { color: 'blue', selected: true, className: 'text-adaptive-blue-selected' },
      {
        color: 'green',
        selected: true,
        className: 'text-adaptive-green-selected',
      },
      {
        color: 'yellow',
        selected: true,
        className: 'text-adaptive-yellow-selected',
      },
      {
        color: 'purple',
        selected: true,
        className: 'text-adaptive-purple-selected',
      },
      { color: 'pink', selected: true, className: 'text-adaptive-pink-selected' },
      {
        color: 'indigo',
        selected: true,
        className: 'text-adaptive-indigo-selected',
      },
      {
        color: 'slate',
        selected: true,
        className: 'text-adaptive-slate-selected',
      },
      { color: 'zinc', selected: true, className: 'text-adaptive-zinc-selected' },
      {
        color: 'orange',
        selected: true,
        className: 'text-adaptive-orange-selected',
      },
      {
        color: 'amber',
        selected: true,
        className: 'text-adaptive-amber-selected',
      },
      { color: 'lime', selected: true, className: 'text-adaptive-lime-selected' },
      { color: 'teal', selected: true, className: 'text-adaptive-teal-selected' },
      { color: 'cyan', selected: true, className: 'text-adaptive-cyan-selected' },
      { color: 'sky', selected: true, className: 'text-adaptive-sky-selected' },
      {
        color: 'violet',
        selected: true,
        className: 'text-adaptive-violet-selected',
      },
      {
        color: 'fuchsia',
        selected: true,
        className: 'text-adaptive-fuchsia-selected',
      },
      { color: 'rose', selected: true, className: 'text-adaptive-rose-selected' },
    ],
    defaultVariants: {
      color: 'brand',
      selected: false,
    },
  }
)

export type ToggleChipVariants = VariantProps<typeof toggleChipVariants>
export type ToggleChipTextVariants = VariantProps<typeof toggleChipTextVariants>
