import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey } from '../shared/colorVariants'

/**
 * Text input field variants with comprehensive interaction states.
 *
 * Provides styling for form input fields with:
 * - Complex border and shadow transitions
 * - Focus ring system for accessibility
 * - Hover effects with colored shadows
 * - Light/dark theme support
 *
 * Color Pattern:
 * - Border: Uses -700/30 opacity for subtle initial state
 * - Hover: -600 border with -500/20 shadow
 * - Focus: -500 border with -500/20 ring
 * - Dark mode: Enhanced shadows with -400 variants
 *
 * @example
 * ```tsx
 * <input className={textInputFieldVariants({ color: 'brand' })} />
 * ```
 */
export const textInputFieldVariants = cva(
  [
    'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
    'placeholder:[color:var(--color-placeholder)] bg-input text-foreground',
    'transition-all duration-300 ease-in-out focus:outline-none',
    'transform-gpu will-change-transform',
  ],
  {
    variants: {
      /**
       * Color variants with complex interaction states.
       * Each color includes border, hover, focus, and dark mode variations.
       */
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
    'bg-input text-input-foreground placeholder:[color:var(--color-placeholder)]',
    'transition-all duration-300 ease-in-out focus:outline-none',
    'transform-gpu will-change-transform',
  ],
  {
    variants: {
      color: {
        brand:
          'border-brand-700/30 hover:border-brand-700/50 hover:shadow-md hover:shadow-brand-500/20 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:hover:shadow-brand-400/30 dark:focus:ring-brand-400/30 data-[state=open]:border-brand-500 data-[state=open]:ring-4 data-[state=open]:ring-brand-500/20',
        primary:
          'border-primary-700/30 hover:border-primary-700/50 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:hover:shadow-primary-400/30 dark:focus:ring-primary-400/30 data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-500/20',
        emerald:
          'border-emerald-700/30 hover:border-emerald-700/50 hover:shadow-md hover:shadow-emerald-500/20 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:hover:shadow-emerald-400/30 dark:focus:ring-emerald-400/30 data-[state=open]:border-emerald-500 data-[state=open]:ring-4 data-[state=open]:ring-emerald-500/20',
        red: 'border-red-700/30 hover:border-red-700/50 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:hover:shadow-red-400/30 dark:focus:ring-red-400/30 data-[state=open]:border-red-500 data-[state=open]:ring-4 data-[state=open]:ring-red-500/20',
        blue: 'border-blue-700/30 hover:border-blue-700/50 hover:shadow-md hover:shadow-blue-500/20 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:hover:shadow-blue-400/30 dark:focus:ring-blue-400/30 data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-500/20',
        green:
          'border-green-700/30 hover:border-green-700/50 hover:shadow-md hover:shadow-green-500/20 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:hover:shadow-green-400/30 dark:focus:ring-green-400/30 data-[state=open]:border-green-500 data-[state=open]:ring-4 data-[state=open]:ring-green-500/20',
        yellow:
          'border-yellow-700/30 hover:border-yellow-700/50 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:hover:shadow-yellow-400/30 dark:focus:ring-yellow-400/30 data-[state=open]:border-yellow-500 data-[state=open]:ring-4 data-[state=open]:ring-yellow-500/20',
        purple:
          'border-purple-700/30 hover:border-purple-700/50 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:hover:shadow-purple-400/30 dark:focus:ring-purple-400/30 data-[state=open]:border-purple-500 data-[state=open]:ring-4 data-[state=open]:ring-purple-500/20',
        pink: 'border-pink-700/30 hover:border-pink-700/50 hover:shadow-md hover:shadow-pink-500/20 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 dark:hover:shadow-pink-400/30 dark:focus:ring-pink-400/30 data-[state=open]:border-pink-500 data-[state=open]:ring-4 data-[state=open]:ring-pink-500/20',
        indigo:
          'border-indigo-700/30 hover:border-indigo-700/50 hover:shadow-md hover:shadow-indigo-500/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:hover:shadow-indigo-400/30 dark:focus:ring-indigo-400/30 data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/20',
        slate:
          'border-slate-700/30 hover:border-slate-700/50 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:hover:shadow-slate-400/30 dark:focus:ring-slate-400/30 data-[state=open]:border-slate-500 data-[state=open]:ring-4 data-[state=open]:ring-slate-500/20',
        zinc: 'border-zinc-700/30 hover:border-zinc-700/50 hover:shadow-md hover:shadow-zinc-500/20 focus:border-zinc-500 focus:ring-4 focus:ring-zinc-500/20 dark:hover:shadow-zinc-400/30 dark:focus:ring-zinc-400/30 data-[state=open]:border-zinc-500 data-[state=open]:ring-4 data-[state=open]:ring-zinc-500/20',
        orange:
          'border-orange-700/30 hover:border-orange-700/50 hover:shadow-md hover:shadow-orange-500/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:hover:shadow-orange-400/30 dark:focus:ring-orange-400/30 data-[state=open]:border-orange-500 data-[state=open]:ring-4 data-[state=open]:ring-orange-500/20',
        amber:
          'border-amber-700/30 hover:border-amber-700/50 hover:shadow-md hover:shadow-amber-500/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:hover:shadow-amber-400/30 dark:focus:ring-amber-400/30 data-[state=open]:border-amber-500 data-[state=open]:ring-4 data-[state=open]:ring-amber-500/20',
        lime: 'border-lime-700/30 hover:border-lime-700/50 hover:shadow-md hover:shadow-lime-500/20 focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:hover:shadow-lime-400/30 dark:focus:ring-lime-400/30 data-[state=open]:border-lime-500 data-[state=open]:ring-4 data-[state=open]:ring-lime-500/20',
        teal: 'border-teal-700/30 hover:border-teal-700/50 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:hover:shadow-teal-400/30 dark:focus:ring-teal-400/30 data-[state=open]:border-teal-500 data-[state=open]:ring-4 data-[state=open]:ring-teal-500/20',
        cyan: 'border-cyan-700/30 hover:border-cyan-700/50 hover:shadow-md hover:shadow-cyan-500/20 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 dark:hover:shadow-cyan-400/30 dark:focus:ring-cyan-400/30 data-[state=open]:border-cyan-500 data-[state=open]:ring-4 data-[state=open]:ring-cyan-500/20',
        sky: 'border-sky-700/30 hover:border-sky-700/50 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:hover:shadow-sky-400/30 dark:focus:ring-sky-400/30 data-[state=open]:border-sky-500 data-[state=open]:ring-4 data-[state=open]:ring-sky-500/20',
        violet:
          'border-violet-700/30 hover:border-violet-700/50 hover:shadow-md hover:shadow-violet-500/20 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:hover:shadow-violet-400/30 dark:focus:ring-violet-400/30 data-[state=open]:border-violet-500 data-[state=open]:ring-4 data-[state=open]:ring-violet-500/20',
        fuchsia:
          'border-fuchsia-700/30 hover:border-fuchsia-700/50 hover:shadow-md hover:shadow-fuchsia-500/20 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:hover:shadow-fuchsia-400/30 dark:focus:ring-fuchsia-400/30 data-[state=open]:border-fuchsia-500 data-[state=open]:ring-4 data-[state=open]:ring-fuchsia-500/20',
        rose: 'border-rose-700/30 hover:border-rose-700/50 hover:shadow-md hover:shadow-rose-500/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 dark:hover:shadow-rose-400/30 dark:focus:ring-rose-400/30 data-[state=open]:border-rose-500 data-[state=open]:ring-4 data-[state=open]:ring-rose-500/20',
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
        brand: 'bg-red-50 text-red-800 combo-content-bg dark:text-red-50',
        primary: 'bg-emerald-50 text-emerald-800 combo-content-bg dark:text-emerald-50',
        emerald: 'bg-emerald-50 text-emerald-800 combo-content-bg dark:text-emerald-50',
        red: 'bg-red-50 text-red-800 combo-content-bg dark:text-red-50',
        blue: 'bg-blue-50 text-blue-800 combo-content-bg dark:text-blue-50',
        green: 'bg-green-50 text-green-800 combo-content-bg dark:text-green-50',
        yellow: 'bg-yellow-50 text-yellow-800 combo-content-bg dark:text-yellow-50',
        purple: 'bg-purple-50 text-purple-800 combo-content-bg dark:text-purple-50',
        pink: 'bg-pink-50 text-pink-800 combo-content-bg dark:text-pink-50',
        indigo: 'bg-indigo-50 text-indigo-800 combo-content-bg dark:text-indigo-50',
        slate: 'bg-slate-50 text-slate-800 combo-content-bg dark:text-slate-50',
        zinc: 'bg-zinc-50 text-zinc-800 combo-content-bg dark:text-zinc-50',
        orange: 'bg-orange-50 text-orange-800 combo-content-bg dark:text-orange-50',
        amber: 'bg-amber-50 text-amber-800 combo-content-bg dark:text-amber-50',
        lime: 'bg-lime-50 text-lime-800 combo-content-bg dark:text-lime-50',
        teal: 'bg-teal-50 text-teal-800 combo-content-bg dark:text-teal-50',
        cyan: 'bg-cyan-50 text-cyan-800 combo-content-bg dark:text-cyan-50',
        sky: 'bg-sky-50 text-sky-800 combo-content-bg dark:text-sky-50',
        violet: 'bg-violet-50 text-violet-800 combo-content-bg dark:text-violet-50',
        fuchsia: 'bg-fuchsia-50 text-fuchsia-800 combo-content-bg dark:text-fuchsia-50',
        rose: 'bg-rose-50 text-rose-800 combo-content-bg dark:text-rose-50',
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
          'text-red-800 hover:bg-red-100 focus:bg-red-100 data-[highlighted]:bg-red-100 dark:text-red-50 dark:hover:bg-red-900 dark:focus:bg-red-900 dark:data-[highlighted]:bg-red-900',
        primary:
          'text-emerald-800 hover:bg-emerald-100 focus:bg-emerald-100 data-[highlighted]:bg-emerald-100 dark:text-emerald-50 dark:hover:bg-emerald-900 dark:focus:bg-emerald-900 dark:data-[highlighted]:bg-emerald-900',
        emerald:
          'text-emerald-800 hover:bg-emerald-100 focus:bg-emerald-100 data-[highlighted]:bg-emerald-100 dark:text-emerald-50 dark:hover:bg-emerald-900 dark:focus:bg-emerald-900 dark:data-[highlighted]:bg-emerald-900',
        red: 'text-red-800 hover:bg-red-100 focus:bg-red-100 data-[highlighted]:bg-red-100 dark:text-red-50 dark:hover:bg-red-900 dark:focus:bg-red-900 dark:data-[highlighted]:bg-red-900',
        blue: 'text-blue-800 hover:bg-blue-100 focus:bg-blue-100 data-[highlighted]:bg-blue-100 dark:text-blue-50 dark:hover:bg-blue-900 dark:focus:bg-blue-900 dark:data-[highlighted]:bg-blue-900',
        green:
          'text-green-800 hover:bg-green-100 focus:bg-green-100 data-[highlighted]:bg-green-100 dark:text-green-50 dark:hover:bg-green-900 dark:focus:bg-green-900 dark:data-[highlighted]:bg-green-900',
        yellow:
          'text-yellow-800 hover:bg-yellow-100 focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 dark:text-yellow-50 dark:hover:bg-yellow-900 dark:focus:bg-yellow-900 dark:data-[highlighted]:bg-yellow-900',
        purple:
          'text-purple-800 hover:bg-purple-100 focus:bg-purple-100 data-[highlighted]:bg-purple-100 dark:text-purple-50 dark:hover:bg-purple-900 dark:focus:bg-purple-900 dark:data-[highlighted]:bg-purple-900',
        pink: 'text-pink-800 hover:bg-pink-100 focus:bg-pink-100 data-[highlighted]:bg-pink-100 dark:text-pink-50 dark:hover:bg-pink-900 dark:focus:bg-pink-900 dark:data-[highlighted]:bg-pink-900',
        indigo:
          'text-indigo-800 hover:bg-indigo-100 focus:bg-indigo-100 data-[highlighted]:bg-indigo-100 dark:text-indigo-50 dark:hover:bg-indigo-900 dark:focus:bg-indigo-900 dark:data-[highlighted]:bg-indigo-900',
        slate:
          'text-slate-800 hover:bg-slate-100 focus:bg-slate-100 data-[highlighted]:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus:bg-slate-900 dark:data-[highlighted]:bg-slate-900',
        zinc: 'text-zinc-800 hover:bg-zinc-100 focus:bg-zinc-100 data-[highlighted]:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 dark:data-[highlighted]:bg-zinc-900',
        orange:
          'text-orange-800 hover:bg-orange-100 focus:bg-orange-100 data-[highlighted]:bg-orange-100 dark:text-orange-50 dark:hover:bg-orange-900 dark:focus:bg-orange-900 dark:data-[highlighted]:bg-orange-900',
        amber:
          'text-amber-800 hover:bg-amber-100 focus:bg-amber-100 data-[highlighted]:bg-amber-100 dark:text-amber-50 dark:hover:bg-amber-900 dark:focus:bg-amber-900 dark:data-[highlighted]:bg-amber-900',
        lime: 'text-lime-800 hover:bg-lime-100 focus:bg-lime-100 data-[highlighted]:bg-lime-100 dark:text-lime-50 dark:hover:bg-lime-900 dark:focus:bg-lime-900 dark:data-[highlighted]:bg-lime-900',
        teal: 'text-teal-800 hover:bg-teal-100 focus:bg-teal-100 data-[highlighted]:bg-teal-100 dark:text-teal-50 dark:hover:bg-teal-900 dark:focus:bg-teal-900 dark:data-[highlighted]:bg-teal-900',
        cyan: 'text-cyan-800 hover:bg-cyan-100 focus:bg-cyan-100 data-[highlighted]:bg-cyan-100 dark:text-cyan-50 dark:hover:bg-cyan-900 dark:focus:bg-cyan-900 dark:data-[highlighted]:bg-cyan-900',
        sky: 'text-sky-800 hover:bg-sky-100 focus:bg-sky-100 data-[highlighted]:bg-sky-100 dark:text-sky-50 dark:hover:bg-sky-900 dark:focus:bg-sky-900 dark:data-[highlighted]:bg-sky-900',
        violet:
          'text-violet-800 hover:bg-violet-100 focus:bg-violet-100 data-[highlighted]:bg-violet-100 dark:text-violet-50 dark:hover:bg-violet-900 dark:focus:bg-violet-900 dark:data-[highlighted]:bg-violet-900',
        fuchsia:
          'text-fuchsia-800 hover:bg-fuchsia-100 focus:bg-fuchsia-100 data-[highlighted]:bg-fuchsia-100 dark:text-fuchsia-50 dark:hover:bg-fuchsia-900 dark:focus:bg-fuchsia-900 dark:data-[highlighted]:bg-fuchsia-900',
        rose: 'text-rose-800 hover:bg-rose-100 focus:bg-rose-100 data-[highlighted]:bg-rose-100 dark:text-rose-50 dark:hover:bg-rose-900 dark:focus:bg-rose-900 dark:data-[highlighted]:bg-rose-900',
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
    'bg-input text-input-foreground placeholder:[color:var(--color-placeholder)]',
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

// Text input error variants - DEPRECATED: Use ErrorMessage component instead
// export const textInputErrorVariants = cva(['mt-2 text-sm text-brand'])

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
        slate:
          'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
        zinc: 'border border-zinc-700/30 hover:border-2 hover:border-zinc-700/50 focus:border-2 focus:border-zinc-200',
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

// Checkbox agreement field variants
export const checkboxAgreementFieldVariants = cva(
  [
    'flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all duration-300',
    'bg-input dark:bg-input/40',
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

export const checkboxAgreementInputVariants = cva(
  [
    'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 transition-all duration-300',
    'bg-input dark:bg-input/40',
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

// TypeScript type exports for component prop typing

/**
 * Type definition for textInputFieldVariants props.
 * Use this when defining component props that accept text input styling options.
 */
export type TextInputFieldVariants = VariantProps<typeof textInputFieldVariants>

/**
 * Type definition for comboFieldTriggerVariants props.
 */
export type ComboFieldTriggerVariants = VariantProps<typeof comboFieldTriggerVariants>

/**
 * Type definition for comboFieldContentVariants props.
 */
export type ComboFieldContentVariants = VariantProps<typeof comboFieldContentVariants>

/**
 * Type definition for comboFieldItemVariants props.
 */
export type ComboFieldItemVariants = VariantProps<typeof comboFieldItemVariants>

/**
 * Type definition for comboFieldValueVariants props.
 */
export type ComboFieldValueVariants = VariantProps<typeof comboFieldValueVariants>

/**
 * Type definition for dateInputFieldVariants props.
 */
export type DateInputFieldVariants = VariantProps<typeof dateInputFieldVariants>

/**
 * Type definition for datePickerButtonVariants props.
 */
export type DatePickerButtonVariants = VariantProps<typeof datePickerButtonVariants>

/**
 * Type definition for datePickerTextVariants props.
 */
export type DatePickerTextVariants = VariantProps<typeof datePickerTextVariants>

/**
 * Type definition for datePickerIconVariants props.
 */
export type DatePickerIconVariants = VariantProps<typeof datePickerIconVariants>

/**
 * Type definition for textInputLabelVariants props.
 */
export type TextInputLabelVariants = VariantProps<typeof textInputLabelVariants>

/**
 * Type definition for textInputLabelTextVariants props.
 */
export type TextInputLabelTextVariants = VariantProps<typeof textInputLabelTextVariants>

// export type TextInputErrorVariants = VariantProps<typeof textInputErrorVariants> // DEPRECATED: Now using ErrorMessage component

/**
 * Type definition for calendarContainerVariants props.
 */
export type CalendarContainerVariants = VariantProps<typeof calendarContainerVariants>

/**
 * Type definition for calendarHeaderVariants props.
 */
export type CalendarHeaderVariants = VariantProps<typeof calendarHeaderVariants>

/**
 * Type definition for calendarWeekdayVariants props.
 */
export type CalendarWeekdayVariants = VariantProps<typeof calendarWeekdayVariants>

/**
 * Type definition for calendarDayVariants props.
 */
export type CalendarDayVariants = VariantProps<typeof calendarDayVariants>

/**
 * Type definition for checkboxAgreementInputVariants props.
 */
export type CheckboxAgreementInputVariants = VariantProps<
  typeof checkboxAgreementInputVariants
>

/**
 * Shared color variant key type for input components.
 * Ensures consistency with the design system's color palette.
 */
export type InputColorVariant = ColorVariantKey
