import { cva, type VariantProps } from 'class-variance-authority'

// Text input field variants
export const textInputFieldVariants = cva(
  [
    'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
    'placeholder:[color:var(--color-placeholder)] bg-input dark:bg-input/40 text-foreground',
    'transition-all duration-300 ease-in-out focus:outline-none',
    'transform-gpu will-change-transform',
  ],
  {
    variants: {
      color: {
        brand:
          'border-brand-700/30 hover:border-brand-600 hover:shadow-md hover:shadow-brand-500/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:hover:shadow-brand-400/30 dark:focus:ring-brand-400/30',
        primary:
          'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:hover:shadow-primary-400/30 dark:focus:ring-primary-400/30',
        emerald:
          'border-emerald-700/30 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:hover:shadow-emerald-400/30 dark:focus:ring-emerald-400/30',
        red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:hover:shadow-red-400/30 dark:focus:ring-red-400/30',
        blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:hover:shadow-blue-400/30 dark:focus:ring-blue-400/30',
        green:
          'border-green-700/30 hover:border-green-600 hover:shadow-md hover:shadow-green-500/20 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:hover:shadow-green-400/30 dark:focus:ring-green-400/30',
        yellow:
          'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:hover:shadow-yellow-400/30 dark:focus:ring-yellow-400/30',
        purple:
          'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:hover:shadow-purple-400/30 dark:focus:ring-purple-400/30',
        pink: 'border-pink-700/30 hover:border-pink-600 hover:shadow-md hover:shadow-pink-500/20 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:hover:shadow-pink-400/30 dark:focus:ring-pink-400/30',
        indigo:
          'border-indigo-700/30 hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:hover:shadow-indigo-400/30 dark:focus:ring-indigo-400/30',
        slate:
          'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:hover:shadow-slate-400/30 dark:focus:ring-slate-400/30',
        zinc: 'border-zinc-700/30 hover:border-zinc-600 hover:shadow-md hover:shadow-zinc-500/20 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/20 dark:hover:shadow-zinc-400/30 dark:focus:ring-zinc-400/30',
        orange:
          'border-orange-700/30 hover:border-orange-600 hover:shadow-md hover:shadow-orange-500/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:hover:shadow-orange-400/30 dark:focus:ring-orange-400/30',
        amber:
          'border-amber-700/30 hover:border-amber-600 hover:shadow-md hover:shadow-amber-500/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:hover:shadow-amber-400/30 dark:focus:ring-amber-400/30',
        lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-md hover:shadow-lime-500/20 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:hover:shadow-lime-400/30 dark:focus:ring-lime-400/30',
        teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:hover:shadow-teal-400/30 dark:focus:ring-teal-400/30',
        cyan: 'border-cyan-700/30 hover:border-cyan-600 hover:shadow-md hover:shadow-cyan-500/20 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:hover:shadow-cyan-400/30 dark:focus:ring-cyan-400/30',
        sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:hover:shadow-sky-400/30 dark:focus:ring-sky-400/30',
        violet:
          'border-violet-700/30 hover:border-violet-600 hover:shadow-md hover:shadow-violet-500/20 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:hover:shadow-violet-400/30 dark:focus:ring-violet-400/30',
        fuchsia:
          'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-md hover:shadow-fuchsia-500/20 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:hover:shadow-fuchsia-400/30 dark:focus:ring-fuchsia-400/30',
        rose: 'border-rose-700/30 hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:hover:shadow-rose-400/30 dark:focus:ring-rose-400/30',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
      },
    },
  }
)

// ComboField trigger button variants
export const comboFieldTriggerVariants = cva(
  [
    'flex h-12 w-full items-center justify-between rounded-md px-3 py-2 text-lg border-2',
    'bg-input dark:bg-input/40 text-input-foreground placeholder:[color:var(--color-placeholder)]',
    'transition-all duration-300 ease-in-out focus:outline-none',
    'transform-gpu will-change-transform',
  ],
  {
    variants: {
      color: {
        brand:
          'border-brand-700/30 hover:border-brand-600 hover:shadow-md hover:shadow-brand-500/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:hover:shadow-brand-400/30 dark:focus:ring-brand-400/30 data-[state=open]:border-brand-500 data-[state=open]:ring-4 data-[state=open]:ring-brand-500/20',
        primary:
          'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:hover:shadow-primary-400/30 dark:focus:ring-primary-400/30 data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-500/20',
        emerald:
          'border-emerald-700/30 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:hover:shadow-emerald-400/30 dark:focus:ring-emerald-400/30 data-[state=open]:border-emerald-500 data-[state=open]:ring-4 data-[state=open]:ring-emerald-500/20',
        red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:hover:shadow-red-400/30 dark:focus:ring-red-400/30 data-[state=open]:border-red-500 data-[state=open]:ring-4 data-[state=open]:ring-red-500/20',
        blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:hover:shadow-blue-400/30 dark:focus:ring-blue-400/30 data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-500/20',
        green:
          'border-green-700/30 hover:border-green-600 hover:shadow-md hover:shadow-green-500/20 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:hover:shadow-green-400/30 dark:focus:ring-green-400/30 data-[state=open]:border-green-500 data-[state=open]:ring-4 data-[state=open]:ring-green-500/20',
        yellow:
          'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:hover:shadow-yellow-400/30 dark:focus:ring-yellow-400/30 data-[state=open]:border-yellow-500 data-[state=open]:ring-4 data-[state=open]:ring-yellow-500/20',
        purple:
          'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:hover:shadow-purple-400/30 dark:focus:ring-purple-400/30 data-[state=open]:border-purple-500 data-[state=open]:ring-4 data-[state=open]:ring-purple-500/20',
        pink: 'border-pink-700/30 hover:border-pink-600 hover:shadow-md hover:shadow-pink-500/20 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:hover:shadow-pink-400/30 dark:focus:ring-pink-400/30 data-[state=open]:border-pink-500 data-[state=open]:ring-4 data-[state=open]:ring-pink-500/20',
        indigo:
          'border-indigo-700/30 hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:hover:shadow-indigo-400/30 dark:focus:ring-indigo-400/30 data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/20',
        slate:
          'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:hover:shadow-slate-400/30 dark:focus:ring-slate-400/30 data-[state=open]:border-slate-500 data-[state=open]:ring-4 data-[state=open]:ring-slate-500/20',
        zinc: 'border-zinc-700/30 hover:border-zinc-600 hover:shadow-md hover:shadow-zinc-500/20 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/20 dark:hover:shadow-zinc-400/30 dark:focus:ring-zinc-400/30 data-[state=open]:border-zinc-500 data-[state=open]:ring-4 data-[state=open]:ring-zinc-500/20',
        orange:
          'border-orange-700/30 hover:border-orange-600 hover:shadow-md hover:shadow-orange-500/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:hover:shadow-orange-400/30 dark:focus:ring-orange-400/30 data-[state=open]:border-orange-500 data-[state=open]:ring-4 data-[state=open]:ring-orange-500/20',
        amber:
          'border-amber-700/30 hover:border-amber-600 hover:shadow-md hover:shadow-amber-500/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:hover:shadow-amber-400/30 dark:focus:ring-amber-400/30 data-[state=open]:border-amber-500 data-[state=open]:ring-4 data-[state=open]:ring-amber-500/20',
        lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-md hover:shadow-lime-500/20 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:hover:shadow-lime-400/30 dark:focus:ring-lime-400/30 data-[state=open]:border-lime-500 data-[state=open]:ring-4 data-[state=open]:ring-lime-500/20',
        teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:hover:shadow-teal-400/30 dark:focus:ring-teal-400/30 data-[state=open]:border-teal-500 data-[state=open]:ring-4 data-[state=open]:ring-teal-500/20',
        cyan: 'border-cyan-700/30 hover:border-cyan-600 hover:shadow-md hover:shadow-cyan-500/20 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:hover:shadow-cyan-400/30 dark:focus:ring-cyan-400/30 data-[state=open]:border-cyan-500 data-[state=open]:ring-4 data-[state=open]:ring-cyan-500/20',
        sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:hover:shadow-sky-400/30 dark:focus:ring-sky-400/30 data-[state=open]:border-sky-500 data-[state=open]:ring-4 data-[state=open]:ring-sky-500/20',
        violet:
          'border-violet-700/30 hover:border-violet-600 hover:shadow-md hover:shadow-violet-500/20 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:hover:shadow-violet-400/30 dark:focus:ring-violet-400/30 data-[state=open]:border-violet-500 data-[state=open]:ring-4 data-[state=open]:ring-violet-500/20',
        fuchsia:
          'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-md hover:shadow-fuchsia-500/20 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:hover:shadow-fuchsia-400/30 dark:focus:ring-fuchsia-400/30 data-[state=open]:border-fuchsia-500 data-[state=open]:ring-4 data-[state=open]:ring-fuchsia-500/20',
        rose: 'border-rose-700/30 hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:hover:shadow-rose-400/30 dark:focus:ring-rose-400/30 data-[state=open]:border-rose-500 data-[state=open]:ring-4 data-[state=open]:ring-rose-500/20',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border-destructive hover:border-destructive hover:shadow-md hover:shadow-destructive/20 focus:border-destructive focus:ring-4 focus:ring-destructive/20 dark:hover:shadow-destructive/30 dark:focus:ring-destructive/30 data-[state=open]:border-destructive data-[state=open]:ring-4 data-[state=open]:ring-destructive/20',
      },
    },
  }
)

// ComboField content variants
export const comboFieldContentVariants = cva(
  ['z-50 overflow-hidden rounded-md border shadow-lg', 'border-input-border'],
  {
    variants: {
      color: {
        brand: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-50',
        primary:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-50',
        emerald:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-50',
        red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-50',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-50',
        green: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-50',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-50',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-50',
        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-50',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-50',
        slate: 'bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-50',
        zinc: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-50',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-50',
        lime: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-50',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-50',
        cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-50',
        sky: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-50',
        violet: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-50',
        fuchsia:
          'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-50',
        rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-50',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// ComboField item variants
export const comboFieldItemVariants = cva(
  [
    'relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-lg outline-none select-none',
    'bg-transparent transition-colors duration-200',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  ],
  {
    variants: {
      color: {
        brand:
          'text-red-800 hover:bg-red-200 focus:bg-red-200 data-[highlighted]:bg-red-200 dark:text-red-50 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:data-[highlighted]:bg-red-800',
        primary:
          'text-emerald-800 hover:bg-emerald-200 focus:bg-emerald-200 data-[highlighted]:bg-emerald-200 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:focus:bg-emerald-800 dark:data-[highlighted]:bg-emerald-800',
        emerald:
          'text-emerald-800 hover:bg-emerald-200 focus:bg-emerald-200 data-[highlighted]:bg-emerald-200 dark:text-emerald-50 dark:hover:bg-emerald-800 dark:focus:bg-emerald-800 dark:data-[highlighted]:bg-emerald-800',
        red: 'text-red-800 hover:bg-red-200 focus:bg-red-200 data-[highlighted]:bg-red-200 dark:text-red-50 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:data-[highlighted]:bg-red-800',
        blue: 'text-blue-800 hover:bg-blue-200 focus:bg-blue-200 data-[highlighted]:bg-blue-200 dark:text-blue-50 dark:hover:bg-blue-800 dark:focus:bg-blue-800 dark:data-[highlighted]:bg-blue-800',
        green:
          'text-green-800 hover:bg-green-200 focus:bg-green-200 data-[highlighted]:bg-green-200 dark:text-green-50 dark:hover:bg-green-800 dark:focus:bg-green-800 dark:data-[highlighted]:bg-green-800',
        yellow:
          'text-yellow-800 hover:bg-yellow-200 focus:bg-yellow-200 data-[highlighted]:bg-yellow-200 dark:text-yellow-50 dark:hover:bg-yellow-800 dark:focus:bg-yellow-800 dark:data-[highlighted]:bg-yellow-800',
        purple:
          'text-purple-800 hover:bg-purple-200 focus:bg-purple-200 data-[highlighted]:bg-purple-200 dark:text-purple-50 dark:hover:bg-purple-800 dark:focus:bg-purple-800 dark:data-[highlighted]:bg-purple-800',
        pink: 'text-pink-800 hover:bg-pink-200 focus:bg-pink-200 data-[highlighted]:bg-pink-200 dark:text-pink-50 dark:hover:bg-pink-800 dark:focus:bg-pink-800 dark:data-[highlighted]:bg-pink-800',
        indigo:
          'text-indigo-800 hover:bg-indigo-200 focus:bg-indigo-200 data-[highlighted]:bg-indigo-200 dark:text-indigo-50 dark:hover:bg-indigo-800 dark:focus:bg-indigo-800 dark:data-[highlighted]:bg-indigo-800',
        slate:
          'text-slate-800 hover:bg-slate-200 focus:bg-slate-200 data-[highlighted]:bg-slate-200 dark:text-slate-50 dark:hover:bg-slate-800 dark:focus:bg-slate-800 dark:data-[highlighted]:bg-slate-800',
        zinc: 'text-zinc-800 hover:bg-zinc-200 focus:bg-zinc-200 data-[highlighted]:bg-zinc-200 dark:text-zinc-50 dark:hover:bg-zinc-800 dark:focus:bg-zinc-800 dark:data-[highlighted]:bg-zinc-800',
        orange:
          'text-orange-800 hover:bg-orange-200 focus:bg-orange-200 data-[highlighted]:bg-orange-200 dark:text-orange-50 dark:hover:bg-orange-800 dark:focus:bg-orange-800 dark:data-[highlighted]:bg-orange-800',
        amber:
          'text-amber-800 hover:bg-amber-200 focus:bg-amber-200 data-[highlighted]:bg-amber-200 dark:text-amber-50 dark:hover:bg-amber-800 dark:focus:bg-amber-800 dark:data-[highlighted]:bg-amber-800',
        lime: 'text-lime-800 hover:bg-lime-200 focus:bg-lime-200 data-[highlighted]:bg-lime-200 dark:text-lime-50 dark:hover:bg-lime-800 dark:focus:bg-lime-800 dark:data-[highlighted]:bg-lime-800',
        teal: 'text-teal-800 hover:bg-teal-200 focus:bg-teal-200 data-[highlighted]:bg-teal-200 dark:text-teal-50 dark:hover:bg-teal-800 dark:focus:bg-teal-800 dark:data-[highlighted]:bg-teal-800',
        cyan: 'text-cyan-800 hover:bg-cyan-200 focus:bg-cyan-200 data-[highlighted]:bg-cyan-200 dark:text-cyan-50 dark:hover:bg-cyan-800 dark:focus:bg-cyan-800 dark:data-[highlighted]:bg-cyan-800',
        sky: 'text-sky-800 hover:bg-sky-200 focus:bg-sky-200 data-[highlighted]:bg-sky-200 dark:text-sky-50 dark:hover:bg-sky-800 dark:focus:bg-sky-800 dark:data-[highlighted]:bg-sky-800',
        violet:
          'text-violet-800 hover:bg-violet-200 focus:bg-violet-200 data-[highlighted]:bg-violet-200 dark:text-violet-50 dark:hover:bg-violet-800 dark:focus:bg-violet-800 dark:data-[highlighted]:bg-violet-800',
        fuchsia:
          'text-fuchsia-800 hover:bg-fuchsia-200 focus:bg-fuchsia-200 data-[highlighted]:bg-fuchsia-200 dark:text-fuchsia-50 dark:hover:bg-fuchsia-800 dark:focus:bg-fuchsia-800 dark:data-[highlighted]:bg-fuchsia-800',
        rose: 'text-rose-800 hover:bg-rose-200 focus:bg-rose-200 data-[highlighted]:bg-rose-200 dark:text-rose-50 dark:hover:bg-rose-800 dark:focus:bg-rose-800 dark:data-[highlighted]:bg-rose-800',
      },
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// ComboField value (selected or placeholder) variants
export const comboFieldValueVariants = cva(['flex-1 truncate text-left'], {
  variants: {
    state: {
      value: 'text-foreground',
      placeholder: 'text-[color:var(--color-placeholder)]',
    },
  },
  defaultVariants: {
    state: 'value',
  },
})

// Date picker button variants
export const datePickerButtonVariants = cva(
  [
    'flex h-12 w-full items-center justify-between rounded-md border-2 px-3 text-left text-lg leading-6',
    'bg-input dark:bg-input/40 text-input-foreground placeholder:[color:var(--color-placeholder)]',
    'transition-all duration-300 ease-in-out focus:outline-none',
    'transform-gpu will-change-transform',
  ],
  {
    variants: {
      color: {
        brand:
          'border-brand-700/30 hover:border-brand-600 hover:shadow-md hover:shadow-brand-500/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:hover:shadow-brand-400/30 dark:focus:ring-brand-400/30',
        primary:
          'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:hover:shadow-primary-400/30 dark:focus:ring-primary-400/30',
        emerald:
          'border-emerald-700/30 hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:hover:shadow-emerald-400/30 dark:focus:ring-emerald-400/30',
        red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:hover:shadow-red-400/30 dark:focus:ring-red-400/30',
        blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:hover:shadow-blue-400/30 dark:focus:ring-blue-400/30',
        green:
          'border-green-700/30 hover:border-green-600 hover:shadow-md hover:shadow-green-500/20 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:hover:shadow-green-400/30 dark:focus:ring-green-400/30',
        yellow:
          'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:hover:shadow-yellow-400/30 dark:focus:ring-yellow-400/30',
        purple:
          'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:hover:shadow-purple-400/30 dark:focus:ring-purple-400/30',
        pink: 'border-pink-700/30 hover:border-pink-600 hover:shadow-md hover:shadow-pink-500/20 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:hover:shadow-pink-400/30 dark:focus:ring-pink-400/30',
        indigo:
          'border-indigo-700/30 hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-500/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:hover:shadow-indigo-400/30 dark:focus:ring-indigo-400/30',
        slate:
          'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:hover:shadow-slate-400/30 dark:focus:ring-slate-400/30',
        zinc: 'border-zinc-700/30 hover:border-zinc-600 hover:shadow-md hover:shadow-zinc-500/20 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/20 dark:hover:shadow-zinc-400/30 dark:focus:ring-zinc-400/30',
        orange:
          'border-orange-700/30 hover:border-orange-600 hover:shadow-md hover:shadow-orange-500/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:hover:shadow-orange-400/30 dark:focus:ring-orange-400/30',
        amber:
          'border-amber-700/30 hover:border-amber-600 hover:shadow-md hover:shadow-amber-500/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:hover:shadow-amber-400/30 dark:focus:ring-amber-400/30',
        lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-md hover:shadow-lime-500/20 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:hover:shadow-lime-400/30 dark:focus:ring-lime-400/30',
        teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:hover:shadow-teal-400/30 dark:focus:ring-teal-400/30',
        cyan: 'border-cyan-700/30 hover:border-cyan-600 hover:shadow-md hover:shadow-cyan-500/20 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:hover:shadow-cyan-400/30 dark:focus:ring-cyan-400/30',
        sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:hover:shadow-sky-400/30 dark:focus:ring-sky-400/30',
        violet:
          'border-violet-700/30 hover:border-violet-600 hover:shadow-md hover:shadow-violet-500/20 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:hover:shadow-violet-400/30 dark:focus:ring-violet-400/30',
        fuchsia:
          'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-md hover:shadow-fuchsia-500/20 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:hover:shadow-fuchsia-400/30 dark:focus:ring-fuchsia-400/30',
        rose: 'border-rose-700/30 hover:border-rose-600 hover:shadow-md hover:shadow-rose-500/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:hover:shadow-rose-400/30 dark:focus:ring-rose-400/30',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border-destructive hover:border-destructive hover:shadow-md hover:shadow-destructive/20 focus:border-destructive focus:ring-4 focus:ring-destructive/20 dark:hover:shadow-destructive/30 dark:focus:ring-destructive/30',
      },
    },
  }
)

// Date picker text variants
export const datePickerTextVariants = cva(
  ['flex-1 truncate text-left transition-colors duration-200'],
  {
    variants: {
      state: {
        selected: 'text-foreground',
        placeholder: 'text-foreground-lighter',
      },
    },
    defaultVariants: {
      state: 'selected',
    },
  }
)

// Date picker icon variants
export const datePickerIconVariants = cva(['w-5 h-5 transition-colors duration-200'], {
  variants: {
    state: {
      default: 'text-foreground-lighter',
      focused: 'text-foreground',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

// Text input label variants
export const textInputLabelVariants = cva(['flex w-full flex-col gap-1'])

// Text input label text variants
export const textInputLabelTextVariants = cva(['font-medium text-foreground'])

// Text input error variants
export const textInputErrorVariants = cva(['mt-2 text-sm text-brand'])

// Calendar container variants
export const calendarContainerVariants = cva([
  'p-4 rounded-lg shadow-lg border',
  'bg-input border-input-border',
])

// Calendar header variants
export const calendarHeaderVariants = cva([
  'mb-4 flex items-center justify-between text-foreground',
])

// Calendar weekday variants
export const calendarWeekdayVariants = cva([
  'text-sm font-medium text-foreground-lighter',
])

// Calendar day variants
export const calendarDayVariants = cva(
  [
    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium',
    'transition-colors duration-200 cursor-pointer',
    'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      state: {
        default: 'text-foreground hover:bg-accent',
        today:
          'bg-brand-100 text-brand-700 dark:border-2 dark:border-brand-600 dark:bg-transparent dark:text-brand-300',
        selected: 'bg-brand-500 text-white dark:bg-brand-600',
        disabled: 'text-foreground-lighter cursor-not-allowed',
        past: 'text-foreground-lighter',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
)

// Date input field variants
export const dateInputFieldVariants = cva(
  [
    'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
    'placeholder:[color:var(--color-placeholder)] bg-input dark:bg-input/40 text-input-foreground',
    'transition-all duration-300 ease-in-out focus:outline-none',
    '[&::-webkit-calendar-picker-indicator]:opacity-70',
  ],
  {
    variants: {
      color: {
        brand:
          'border border-brand-700/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
        primary:
          'border border-primary-700/30 hover:border-2 hover:border-primary-700/50 focus:border-2 focus:border-primary-200',
        emerald:
          'border border-emerald-700/30 hover:border-2 hover:border-emerald-700/50 focus:border-2 focus:border-emerald-200',
        red: 'border border-red-700/30 hover:border-2 hover:border-red-700/50 focus:border-2 focus:border-red-200',
        blue: 'border border-blue-700/30 hover:border-2 hover:border-blue-700/50 focus:border-2 focus:border-blue-200',
        green:
          'border border-green-700/30 hover:border-2 hover:border-green-700/50 focus:border-2 focus:border-green-200',
        yellow:
          'border border-yellow-700/30 hover:border-2 hover:border-yellow-700/50 focus:border-2 focus:border-yellow-200',
        purple:
          'border border-purple-700/30 hover:border-2 hover:border-purple-700/50 focus:border-2 focus:border-purple-200',
        pink: 'border border-pink-700/30 hover:border-2 hover:border-pink-700/50 focus:border-2 focus:border-pink-200',
        indigo:
          'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200',
        gray: 'border border-gray-700/30 hover:border-2 hover:border-gray-700/50 focus:border-2 focus:border-gray-200',
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
        neutral:
          'border border-neutral-700/30 hover:border-2 hover:border-neutral-700/50 focus:border-2 focus:border-neutral-200',
        stone:
          'border border-stone-700/30 hover:border-2 hover:border-stone-700/50 focus:border-2 focus:border-stone-200',
        orange:
          'border border-orange-700/30 hover:border-2 hover:border-orange-700/50 focus:border-2 focus:border-orange-200',
        amber:
          'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200',
        lime: 'border border-lime-700/30 hover:border-2 hover:border-lime-700/50 focus:border-2 focus:border-lime-200',
        teal: 'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200',
        cyan: 'border border-cyan-700/30 hover:border-2 hover:border-cyan-700/50 focus:border-2 focus:border-cyan-200',
        sky: 'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200',
        violet:
          'border border-violet-700/30 hover:border-2 hover:border-violet-700/50 focus:border-2 focus:border-violet-200',
        fuchsia:
          'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200',
        rose: 'border border-rose-700/30 hover:border-2 hover:border-rose-700/50 focus:border-2 focus:border-rose-200',
      },
      disabled: {
        true: 'border-button-neutral-tertiary-border cursor-not-allowed opacity-50',
      },
      error: {
        true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
      },
    },
    defaultVariants: {
      color: 'emerald',
    },
  }
)

// Export variant types
export type TextInputFieldVariants = VariantProps<typeof textInputFieldVariants>
export type ComboFieldTriggerVariants = VariantProps<typeof comboFieldTriggerVariants>
export type ComboFieldContentVariants = VariantProps<typeof comboFieldContentVariants>
export type ComboFieldItemVariants = VariantProps<typeof comboFieldItemVariants>
export type ComboFieldValueVariants = VariantProps<typeof comboFieldValueVariants>
export type DateInputFieldVariants = VariantProps<typeof dateInputFieldVariants>
export type DatePickerButtonVariants = VariantProps<typeof datePickerButtonVariants>
export type DatePickerTextVariants = VariantProps<typeof datePickerTextVariants>
export type DatePickerIconVariants = VariantProps<typeof datePickerIconVariants>
export type TextInputLabelVariants = VariantProps<typeof textInputLabelVariants>
export type TextInputLabelTextVariants = VariantProps<typeof textInputLabelTextVariants>
export type TextInputErrorVariants = VariantProps<typeof textInputErrorVariants>
export type CalendarContainerVariants = VariantProps<typeof calendarContainerVariants>
export type CalendarHeaderVariants = VariantProps<typeof calendarHeaderVariants>
export type CalendarWeekdayVariants = VariantProps<typeof calendarWeekdayVariants>
export type CalendarDayVariants = VariantProps<typeof calendarDayVariants>
