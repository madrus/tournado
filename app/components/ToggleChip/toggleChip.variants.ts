import { cva, type VariantProps } from 'class-variance-authority'

import {
  type ColorVariantKey,
  createColorVariantMapping,
} from '~/components/shared/colorVariants'

/**
 * Toggle chip variants for selectable chip components.
 *
 * Provides styling for interactive chips with selected/unselected states.
 * Uses light/dark mode appropriate colors and hover effects.
 *
 * Design Pattern:
 * - Unselected: White/light backgrounds with subtle hover effects
 * - Selected: Colored backgrounds with contrast text
 * - Smooth transitions between states
 *
 * @example
 * ```tsx
 * <div className={toggleChipVariants({ color: 'brand', selected: true })}>
 *   Chip Content
 * </div>
 * ```
 */
export const toggleChipVariants = cva(
  [
    'flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all duration-200',
  ],
  {
    variants: {
      /**
       * Color theme variants with unselected state styling.
       * Selected state is handled via compound variants.
       *
       * Pattern: Light backgrounds with subtle hover effects
       * - Base: White background with slate borders
       * - Dark mode: Colored -50 backgrounds
       * - Hover: Colored -300 borders and -50/-100 backgrounds
       */
      color: createColorVariantMapping(
        color =>
          `border-slate-200 bg-white dark:bg-${color}-50 hover:border-${color}-300 hover:bg-${color}-50 dark:hover:bg-${color}-100`
      ),
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

// TypeScript type exports for component prop typing

/**
 * Type definition for toggleChipVariants props.
 * Use this when defining component props that accept toggle chip styling options.
 */
export type ToggleChipVariants = VariantProps<typeof toggleChipVariants>

/**
 * Type definition for toggleChipTextVariants props.
 * Use this for toggle chip text styling options.
 */
export type ToggleChipTextVariants = VariantProps<typeof toggleChipTextVariants>

/**
 * Shared color variant key type for toggle chip components.
 * Ensures consistency with the design system's color palette.
 */
export type ToggleChipColorVariant = ColorVariantKey
