import { type VariantProps, cva } from 'class-variance-authority'
import {
  type ColorVariantKey,
  createColorVariantMapping,
  createColorVariantObject,
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
          `border-slate-200 bg-white dark:bg-${color}-50 hover:border-${color}-300 hover:bg-${color}-50 dark:hover:bg-${color}-100`,
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
          'border-brand-500 bg-brand-100 text-adaptive-brand-selected dark:bg-brand-200',
      },
      {
        color: 'primary',
        selected: true,
        className:
          'border-primary-500 bg-primary-100 text-adaptive-primary-selected dark:bg-primary-200',
      },
      {
        color: 'emerald',
        selected: true,
        className:
          'border-emerald-500 bg-emerald-100 text-adaptive-emerald-selected dark:bg-emerald-200',
      },
      {
        color: 'red',
        selected: true,
        className:
          'border-red-500 bg-red-100 text-adaptive-red-selected dark:bg-red-200',
      },
      {
        color: 'blue',
        selected: true,
        className:
          'border-blue-500 bg-blue-100 text-adaptive-blue-selected dark:bg-blue-200',
      },
      {
        color: 'green',
        selected: true,
        className:
          'border-green-500 bg-green-100 text-adaptive-green-selected dark:bg-green-200',
      },
      {
        color: 'yellow',
        selected: true,
        className:
          'border-yellow-500 bg-yellow-100 text-adaptive-yellow-selected dark:bg-yellow-200',
      },
      {
        color: 'purple',
        selected: true,
        className:
          'border-purple-500 bg-purple-100 text-adaptive-purple-selected dark:bg-purple-200',
      },
      {
        color: 'indigo',
        selected: true,
        className:
          'border-indigo-500 bg-indigo-100 text-adaptive-indigo-selected dark:bg-indigo-200',
      },
      {
        color: 'slate',
        selected: true,
        className:
          'border-slate-500 bg-slate-100 text-adaptive-slate-selected dark:bg-slate-200',
      },
      {
        color: 'amber',
        selected: true,
        className:
          'border-amber-500 bg-amber-100 text-adaptive-amber-selected dark:bg-amber-200',
      },
      {
        color: 'teal',
        selected: true,
        className:
          'border-teal-500 bg-teal-100 text-adaptive-teal-selected dark:bg-teal-200',
      },
      {
        color: 'sky',
        selected: true,
        className:
          'border-sky-500 bg-sky-100 text-adaptive-sky-selected dark:bg-sky-200',
      },
      {
        color: 'fuchsia',
        selected: true,
        className:
          'border-fuchsia-500 bg-fuchsia-100 text-adaptive-fuchsia-selected dark:bg-fuchsia-200',
      },
      {
        color: 'lime',
        selected: true,
        className:
          'border-lime-500 bg-lime-100 text-adaptive-lime-selected dark:bg-lime-200',
      },
      // Functional Semantics
      {
        color: 'success',
        selected: true,
        className:
          'border-green-500 bg-green-100 text-adaptive-green-selected dark:bg-green-200',
      },
      {
        color: 'error',
        selected: true,
        className:
          'border-red-500 bg-red-100 text-adaptive-red-selected dark:bg-red-200',
      },
      {
        color: 'warning',
        selected: true,
        className:
          'border-yellow-500 bg-yellow-100 text-adaptive-yellow-selected dark:bg-yellow-200',
      },
      {
        color: 'info',
        selected: true,
        className:
          'border-blue-500 bg-blue-100 text-adaptive-blue-selected dark:bg-blue-200',
      },
      {
        color: 'disabled',
        selected: true,
        className:
          'border-slate-500 bg-slate-100 text-adaptive-slate-selected dark:bg-slate-200',
      },
      // Visual Accents
      {
        color: 'accent-amber',
        selected: true,
        className:
          'border-amber-500 bg-amber-100 text-adaptive-amber-selected dark:bg-amber-200',
      },
      {
        color: 'accent-indigo',
        selected: true,
        className:
          'border-indigo-500 bg-indigo-100 text-adaptive-indigo-selected dark:bg-indigo-200',
      },
      {
        color: 'accent-fuchsia',
        selected: true,
        className:
          'border-fuchsia-500 bg-fuchsia-100 text-adaptive-fuchsia-selected dark:bg-fuchsia-200',
      },
      {
        color: 'accent-teal',
        selected: true,
        className:
          'border-teal-500 bg-teal-100 text-adaptive-teal-selected dark:bg-teal-200',
      },
      {
        color: 'accent-sky',
        selected: true,
        className:
          'border-sky-500 bg-sky-100 text-adaptive-sky-selected dark:bg-sky-200',
      },
      {
        color: 'accent-purple',
        selected: true,
        className:
          'border-purple-500 bg-purple-100 text-adaptive-purple-selected dark:bg-purple-200',
      },
    ],
    defaultVariants: {
      color: 'brand',
      selected: false,
      disabled: false,
    },
  },
)

export const toggleChipTextVariants = cva(
  ['font-medium text-sm transition-colors duration-200'],
  {
    variants: {
      color: createColorVariantObject('text-adaptive-unselected'),
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
      {
        color: 'blue',
        selected: true,
        className: 'text-adaptive-blue-selected',
      },
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
      {
        color: 'amber',
        selected: true,
        className: 'text-adaptive-amber-selected',
      },
      {
        color: 'teal',
        selected: true,
        className: 'text-adaptive-teal-selected',
      },
      { color: 'sky', selected: true, className: 'text-adaptive-sky-selected' },
      {
        color: 'fuchsia',
        selected: true,
        className: 'text-adaptive-fuchsia-selected',
      },
      { color: 'lime', selected: true, className: 'text-adaptive-lime-selected' },
      // Functional Semantics
      {
        color: 'success',
        selected: true,
        className: 'text-adaptive-green-selected',
      },
      {
        color: 'error',
        selected: true,
        className: 'text-adaptive-red-selected',
      },
      {
        color: 'warning',
        selected: true,
        className: 'text-adaptive-yellow-selected',
      },
      {
        color: 'info',
        selected: true,
        className: 'text-adaptive-blue-selected',
      },
      {
        color: 'disabled',
        selected: true,
        className: 'text-adaptive-slate-selected',
      },
      // Visual Accents
      {
        color: 'accent-amber',
        selected: true,
        className: 'text-adaptive-amber-selected',
      },
      {
        color: 'accent-indigo',
        selected: true,
        className: 'text-adaptive-indigo-selected',
      },
      {
        color: 'accent-fuchsia',
        selected: true,
        className: 'text-adaptive-fuchsia-selected',
      },
      {
        color: 'accent-teal',
        selected: true,
        className: 'text-adaptive-teal-selected',
      },
      {
        color: 'accent-sky',
        selected: true,
        className: 'text-adaptive-sky-selected',
      },
      {
        color: 'accent-purple',
        selected: true,
        className: 'text-adaptive-purple-selected',
      },
    ],
    defaultVariants: {
      color: 'brand',
      selected: false,
    },
  },
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
