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
          'border-brand-500 bg-brand-100 dark:bg-brand-200 text-brand-800 dark:text-brand-900',
      },
      {
        color: 'primary',
        selected: true,
        className:
          'border-primary-500 bg-primary-100 dark:bg-primary-200 text-primary-800 dark:text-primary-900',
      },
      {
        color: 'emerald',
        selected: true,
        className:
          'border-emerald-500 bg-emerald-100 dark:bg-emerald-200 text-emerald-800 dark:text-emerald-900',
      },
      {
        color: 'red',
        selected: true,
        className:
          'border-red-500 bg-red-100 dark:bg-red-200 text-red-800 dark:text-red-900',
      },
      {
        color: 'blue',
        selected: true,
        className:
          'border-blue-500 bg-blue-100 dark:bg-blue-200 text-blue-800 dark:text-blue-900',
      },
      {
        color: 'green',
        selected: true,
        className:
          'border-green-500 bg-green-100 dark:bg-green-200 text-green-800 dark:text-green-900',
      },
      {
        color: 'yellow',
        selected: true,
        className:
          'border-yellow-500 bg-yellow-100 dark:bg-yellow-200 text-yellow-800 dark:text-yellow-900',
      },
      {
        color: 'purple',
        selected: true,
        className:
          'border-purple-500 bg-purple-100 dark:bg-purple-200 text-purple-800 dark:text-purple-900',
      },
      {
        color: 'pink',
        selected: true,
        className:
          'border-pink-500 bg-pink-100 dark:bg-pink-200 text-pink-800 dark:text-pink-900',
      },
      {
        color: 'indigo',
        selected: true,
        className:
          'border-indigo-500 bg-indigo-100 dark:bg-indigo-200 text-indigo-800 dark:text-indigo-900',
      },
      {
        color: 'slate',
        selected: true,
        className:
          'border-slate-500 bg-slate-100 dark:bg-slate-200 text-slate-800 dark:text-slate-900',
      },
      {
        color: 'zinc',
        selected: true,
        className:
          'border-zinc-500 bg-zinc-100 dark:bg-zinc-200 text-zinc-800 dark:text-zinc-900',
      },
      {
        color: 'orange',
        selected: true,
        className:
          'border-orange-500 bg-orange-100 dark:bg-orange-200 text-orange-800 dark:text-orange-900',
      },
      {
        color: 'amber',
        selected: true,
        className:
          'border-amber-500 bg-amber-100 dark:bg-amber-200 text-amber-800 dark:text-amber-900',
      },
      {
        color: 'lime',
        selected: true,
        className:
          'border-lime-500 bg-lime-100 dark:bg-lime-200 text-lime-800 dark:text-lime-900',
      },
      {
        color: 'teal',
        selected: true,
        className:
          'border-teal-500 bg-teal-100 dark:bg-teal-200 text-teal-800 dark:text-teal-900',
      },
      {
        color: 'cyan',
        selected: true,
        className:
          'border-cyan-500 bg-cyan-100 dark:bg-cyan-200 text-cyan-800 dark:text-cyan-900',
      },
      {
        color: 'sky',
        selected: true,
        className:
          'border-sky-500 bg-sky-100 dark:bg-sky-200 text-sky-800 dark:text-sky-900',
      },
      {
        color: 'violet',
        selected: true,
        className:
          'border-violet-500 bg-violet-100 dark:bg-violet-200 text-violet-800 dark:text-violet-900',
      },
      {
        color: 'fuchsia',
        selected: true,
        className:
          'border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-200 text-fuchsia-800 dark:text-fuchsia-900',
      },
      {
        color: 'rose',
        selected: true,
        className:
          'border-rose-500 bg-rose-100 dark:bg-rose-200 text-rose-800 dark:text-rose-900',
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
        brand: 'text-slate-700 dark:text-slate-900',
        primary: 'text-slate-700 dark:text-slate-900',
        emerald: 'text-slate-700 dark:text-slate-900',
        red: 'text-slate-700 dark:text-slate-900',
        blue: 'text-slate-700 dark:text-slate-900',
        green: 'text-slate-700 dark:text-slate-900',
        yellow: 'text-slate-700 dark:text-slate-900',
        purple: 'text-slate-700 dark:text-slate-900',
        pink: 'text-slate-700 dark:text-slate-900',
        indigo: 'text-slate-700 dark:text-slate-900',
        slate: 'text-slate-700 dark:text-slate-900',
        zinc: 'text-slate-700 dark:text-slate-900',
        orange: 'text-slate-700 dark:text-slate-900',
        amber: 'text-slate-700 dark:text-slate-900',
        lime: 'text-slate-700 dark:text-slate-900',
        teal: 'text-slate-700 dark:text-slate-900',
        cyan: 'text-slate-700 dark:text-slate-900',
        sky: 'text-slate-700 dark:text-slate-900',
        violet: 'text-slate-700 dark:text-slate-900',
        fuchsia: 'text-slate-700 dark:text-slate-900',
        rose: 'text-slate-700 dark:text-slate-900',
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
        className: 'text-brand-800 dark:text-brand-900',
      },
      {
        color: 'primary',
        selected: true,
        className: 'text-primary-800 dark:text-primary-900',
      },
      {
        color: 'emerald',
        selected: true,
        className: 'text-emerald-800 dark:text-emerald-900',
      },
      { color: 'red', selected: true, className: 'text-red-800 dark:text-red-900' },
      { color: 'blue', selected: true, className: 'text-blue-800 dark:text-blue-900' },
      {
        color: 'green',
        selected: true,
        className: 'text-green-800 dark:text-green-900',
      },
      {
        color: 'yellow',
        selected: true,
        className: 'text-yellow-800 dark:text-yellow-900',
      },
      {
        color: 'purple',
        selected: true,
        className: 'text-purple-800 dark:text-purple-900',
      },
      { color: 'pink', selected: true, className: 'text-pink-800 dark:text-pink-900' },
      {
        color: 'indigo',
        selected: true,
        className: 'text-indigo-800 dark:text-indigo-900',
      },
      {
        color: 'slate',
        selected: true,
        className: 'text-slate-800 dark:text-slate-900',
      },
      { color: 'zinc', selected: true, className: 'text-zinc-800 dark:text-zinc-900' },
      {
        color: 'orange',
        selected: true,
        className: 'text-orange-800 dark:text-orange-900',
      },
      {
        color: 'amber',
        selected: true,
        className: 'text-amber-800 dark:text-amber-900',
      },
      { color: 'lime', selected: true, className: 'text-lime-800 dark:text-lime-900' },
      { color: 'teal', selected: true, className: 'text-teal-800 dark:text-teal-900' },
      { color: 'cyan', selected: true, className: 'text-cyan-800 dark:text-cyan-900' },
      { color: 'sky', selected: true, className: 'text-sky-800 dark:text-sky-900' },
      {
        color: 'violet',
        selected: true,
        className: 'text-violet-800 dark:text-violet-900',
      },
      {
        color: 'fuchsia',
        selected: true,
        className: 'text-fuchsia-800 dark:text-fuchsia-900',
      },
      { color: 'rose', selected: true, className: 'text-rose-800 dark:text-rose-900' },
    ],
    defaultVariants: {
      color: 'brand',
      selected: false,
    },
  }
)

export type ToggleChipVariants = VariantProps<typeof toggleChipVariants>
export type ToggleChipTextVariants = VariantProps<typeof toggleChipTextVariants>
