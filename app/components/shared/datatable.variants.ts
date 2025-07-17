import { cva, type VariantProps } from 'class-variance-authority'

// Datatable container styling
export const datatableContainerVariants = cva(
  // Base classes - container styling
  ['w-full overflow-hidden rounded-lg border'],
  {
    variants: {
      color: {
        brand: 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950',
        primary:
          'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950',
        emerald:
          'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
        blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
        slate: 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950',
        teal: 'border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950',
        red: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
        cyan: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950',
        yellow:
          'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
        green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
        violet:
          'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950',
        zinc: 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950',
        orange:
          'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
        amber: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
        lime: 'border-lime-200 bg-lime-50 dark:border-lime-800 dark:bg-lime-950',
        sky: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950',
        indigo:
          'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950',
        purple:
          'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
        fuchsia:
          'border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-800 dark:bg-fuchsia-950',
        pink: 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950',
        rose: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// Datatable header row styling
export const datatableHeaderVariants = cva(
  // Base classes for header row
  ['border-b px-3 py-3'],
  {
    variants: {
      color: {
        brand: 'border-brand-200 bg-brand-100 dark:border-brand-700 dark:bg-brand-900',
        primary:
          'border-primary-200 bg-primary-100 dark:border-primary-700 dark:bg-primary-900',
        emerald:
          'border-emerald-200 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900',
        blue: 'border-blue-200 bg-blue-100 dark:border-blue-700 dark:bg-blue-900',
        slate: 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900',
        teal: 'border-teal-200 bg-teal-100 dark:border-teal-700 dark:bg-teal-900',
        red: 'border-red-200 bg-red-100 dark:border-red-700 dark:bg-red-900',
        cyan: 'border-cyan-200 bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900',
        yellow:
          'border-yellow-200 bg-yellow-100 dark:border-yellow-700 dark:bg-yellow-900',
        green: 'border-green-200 bg-green-100 dark:border-green-700 dark:bg-green-900',
        violet:
          'border-violet-200 bg-violet-100 dark:border-violet-700 dark:bg-violet-900',
        zinc: 'border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900',
        orange:
          'border-orange-200 bg-orange-100 dark:border-orange-700 dark:bg-orange-900',
        amber: 'border-amber-200 bg-amber-100 dark:border-amber-700 dark:bg-amber-900',
        lime: 'border-lime-200 bg-lime-100 dark:border-lime-700 dark:bg-lime-900',
        sky: 'border-sky-200 bg-sky-100 dark:border-sky-700 dark:bg-sky-900',
        indigo:
          'border-indigo-200 bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-900',
        purple:
          'border-purple-200 bg-purple-100 dark:border-purple-700 dark:bg-purple-900',
        fuchsia:
          'border-fuchsia-200 bg-fuchsia-100 dark:border-fuchsia-700 dark:bg-fuchsia-900',
        pink: 'border-pink-200 bg-pink-100 dark:border-pink-700 dark:bg-pink-900',
        rose: 'border-rose-200 bg-rose-100 dark:border-rose-700 dark:bg-rose-900',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// Datatable header text styling
export const datatableHeaderTextVariants = cva(
  // Base classes for header text
  ['text-xs font-medium uppercase tracking-wider'],
  {
    variants: {
      color: {
        brand: 'text-brand-600 dark:text-brand-300',
        primary: 'text-primary-600 dark:text-primary-300',
        emerald: 'text-emerald-600 dark:text-emerald-300',
        blue: 'text-blue-600 dark:text-blue-300',
        slate: 'text-slate-600 dark:text-slate-300',
        teal: 'text-teal-600 dark:text-teal-300',
        red: 'text-red-600 dark:text-red-300',
        cyan: 'text-cyan-600 dark:text-cyan-300',
        yellow: 'text-yellow-600 dark:text-yellow-300',
        green: 'text-green-600 dark:text-green-300',
        violet: 'text-violet-600 dark:text-violet-300',
        zinc: 'text-zinc-600 dark:text-zinc-300',
        orange: 'text-orange-600 dark:text-orange-300',
        amber: 'text-amber-600 dark:text-amber-300',
        lime: 'text-lime-600 dark:text-lime-300',
        sky: 'text-sky-600 dark:text-sky-300',
        indigo: 'text-indigo-600 dark:text-indigo-300',
        purple: 'text-purple-600 dark:text-purple-300',
        fuchsia: 'text-fuchsia-600 dark:text-fuchsia-300',
        pink: 'text-pink-600 dark:text-pink-300',
        rose: 'text-rose-600 dark:text-rose-300',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// Datatable row styling
export const datatableRowVariants = cva(
  // Base classes for data rows
  ['cursor-pointer border-b bg-white transition-colors dark:bg-slate-950'],
  {
    variants: {
      color: {
        brand:
          'border-brand-100 hover:bg-brand-50 dark:border-brand-800 dark:hover:bg-brand-900/50',
        primary:
          'border-primary-100 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-900/50',
        emerald:
          'border-emerald-100 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/50',
        blue: 'border-blue-100 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/50',
        slate:
          'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50',
        teal: 'border-teal-100 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/50',
        red: 'border-red-100 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/50',
        cyan: 'border-cyan-100 hover:bg-cyan-50 dark:border-cyan-800 dark:hover:bg-cyan-900/50',
        yellow:
          'border-yellow-100 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/50',
        green:
          'border-green-100 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/50',
        violet:
          'border-violet-100 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/50',
        zinc: 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50',
        orange:
          'border-orange-100 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/50',
        amber:
          'border-amber-100 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/50',
        lime: 'border-lime-100 hover:bg-lime-50 dark:border-lime-800 dark:hover:bg-lime-900/50',
        sky: 'border-sky-100 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/50',
        indigo:
          'border-indigo-100 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/50',
        purple:
          'border-purple-100 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/50',
        fuchsia:
          'border-fuchsia-100 hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:hover:bg-fuchsia-900/50',
        pink: 'border-pink-100 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-900/50',
        rose: 'border-rose-100 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/50',
      },
      variant: {
        default: '',
        last: 'border-b-0 rounded-b-lg',
      },
    },
    defaultVariants: {
      color: 'slate',
      variant: 'default',
    },
  }
)

// Datatable cell text styling
export const datatableCellTextVariants = cva(
  // Base classes for cell text
  [''],
  {
    variants: {
      variant: {
        primary: 'text-sm font-medium text-slate-900 dark:text-slate-100',
        secondary: 'text-sm text-slate-600 dark:text-slate-400',
        muted: 'text-sm text-slate-500 dark:text-slate-500',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

// Datatable action button styling
export const datatableActionButtonVariants = cva(
  // Base classes for action buttons
  ['flex items-center justify-center rounded-full p-1 transition-colors duration-200'],
  {
    variants: {
      action: {
        delete:
          'text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300',
        edit: 'text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300',
        view: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
      },
    },
    defaultVariants: {
      action: 'view',
    },
  }
)

// Datatable delete area styling (for mobile swipe)
export const datatableDeleteAreaVariants = cva(
  // Base classes for delete area
  ['flex w-screen flex-shrink-0 items-center justify-center'],
  {
    variants: {
      color: {
        red: 'bg-red-500 dark:bg-red-600',
        brand: 'bg-brand-500 dark:bg-brand-600',
      },
    },
    defaultVariants: {
      color: 'red',
    },
  }
)

// Export types
export type DatatableContainerVariants = VariantProps<typeof datatableContainerVariants>
export type DatatableHeaderVariants = VariantProps<typeof datatableHeaderVariants>
export type DatatableHeaderTextVariants = VariantProps<
  typeof datatableHeaderTextVariants
>
export type DatatableRowVariants = VariantProps<typeof datatableRowVariants>
export type DatatableCellTextVariants = VariantProps<typeof datatableCellTextVariants>
export type DatatableActionButtonVariants = VariantProps<
  typeof datatableActionButtonVariants
>
export type DatatableDeleteAreaVariants = VariantProps<
  typeof datatableDeleteAreaVariants
>
