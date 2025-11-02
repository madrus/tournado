import { cva, type VariantProps } from 'class-variance-authority'

import {
  COLOR_VARIANT_KEYS,
  type ColorVariantKey,
  createColorVariantObject,
} from '~/components/shared/colorVariants'

/**
 * Button component variants with comprehensive styling and interaction states.
 *
 * Provides a complete button system with:
 * - Multiple visual variants (primary, secondary)
 * - Full color palette support
 * - Size variants for different contexts
 * - Advanced interaction states (hover, active, disabled)
 * - Accessibility features (focus rings, disabled states)
 *
 * Design System Integration:
 * - Uses semantic CSS custom properties for consistent theming
 * - Supports all standard design system colors
 * - Includes hover animations and state transitions
 *
 * @example
 * ```tsx
 * <button className={buttonVariants({ variant: 'primary', color: 'brand', size: 'md' })}>
 *   Click Me
 * </button>
 * ```
 */

/**
 * Dark mode darker background classes for buttons.
 * Maps color keys to their darker variants (700 weight) for dark mode.
 *
 * IMPORTANT: Must use explicit, complete class names (not template literals)
 * for Tailwind's static analysis to detect and include them in the CSS bundle.
 *
 * Used by components that need darker backgrounds in dark mode (e.g., ActionButton).
 */
export const DARK_MODE_DARKER_CLASSES: Record<ColorVariantKey, string> = {
  brand: 'dark:bg-red-700 dark:border-red-700',
  primary: 'dark:bg-emerald-700 dark:border-emerald-700',
  emerald: 'dark:bg-emerald-700 dark:border-emerald-700',
  blue: 'dark:bg-blue-700 dark:border-blue-700',
  slate: 'dark:bg-slate-700 dark:border-slate-700',
  teal: 'dark:bg-teal-700 dark:border-teal-700',
  red: 'dark:bg-red-700 dark:border-red-700',
  cyan: 'dark:bg-cyan-700 dark:border-cyan-700',
  yellow: 'dark:bg-yellow-700 dark:border-yellow-700',
  green: 'dark:bg-green-700 dark:border-green-700',
  violet: 'dark:bg-violet-700 dark:border-violet-700',
  zinc: 'dark:bg-zinc-700 dark:border-zinc-700',
  orange: 'dark:bg-orange-700 dark:border-orange-700',
  amber: 'dark:bg-amber-700 dark:border-amber-700',
  lime: 'dark:bg-lime-700 dark:border-lime-700',
  sky: 'dark:bg-sky-700 dark:border-sky-700',
  indigo: 'dark:bg-indigo-700 dark:border-indigo-700',
  purple: 'dark:bg-purple-700 dark:border-purple-700',
  fuchsia: 'dark:bg-fuchsia-700 dark:border-fuchsia-700',
  pink: 'dark:bg-pink-700 dark:border-pink-700',
  rose: 'dark:bg-rose-700 dark:border-rose-700',
  disabled: 'dark:bg-gray-700 dark:border-gray-700',
}

/**
 * Helper function to generate primary button variant classes for a given color.
 * Primary buttons are filled with colored backgrounds and white text.
 * All colors uniformly use -600 weight with white text for consistency.
 */
function createPrimaryVariant(color: ColorVariantKey) {
  const weight = '600'

  return {
    variant: 'primary' as const,
    color,
    class: [
      'text-white',
      `bg-${color}-${weight}`,
      `border border-${color}-${weight}`,
      `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${color}-${weight} focus-visible:ring-offset-slate-50`,
      `hover:ring-2 hover:ring-offset-2 hover:ring-${color}-${weight} hover:ring-offset-slate-50`,
      `focus:ring-2 focus:ring-offset-2 focus:ring-${color}-${weight} focus:ring-offset-slate-50`,
      `shadow-${color}-700/40 hover:shadow-${color}-700/60`,
      'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
      'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
    ],
  }
}

/**
 * Helper function to generate secondary button variant classes for a given color.
 * Secondary buttons have light colored backgrounds with colored text and borders.
 * All colors uniformly use -50 backgrounds, -600 text/borders, and slate-50 ring offset for consistency.
 */
function createSecondaryVariant(color: ColorVariantKey) {
  const borderWeight = '600'
  const ringOffset = 'slate-50'

  return {
    variant: 'secondary' as const,
    color,
    class: [
      `bg-${color}-50`,
      `text-${color}-600`,
      `border-${color}-${borderWeight}`,
      `hover:bg-${color}-100 focus-visible:bg-${color}-100`,
      `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${color}-${borderWeight} focus-visible:ring-offset-${ringOffset}`,
      `hover:ring-2 hover:ring-offset-2 hover:ring-${color}-${borderWeight} hover:ring-offset-${ringOffset}`,
      `focus:ring-2 focus:ring-offset-2 focus:ring-${color}-${borderWeight} focus:ring-offset-${ringOffset}`,
      `shadow-${color}-700/40 hover:shadow-${color}-700/60`,
      'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
      'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
    ],
  }
}
export const buttonVariants = cva(
  // Base classes - all the common button styling
  [
    'inline-flex items-center justify-center rounded-lg font-bold gap-2',
    'min-h-12 min-w-32 py-2.5 px-4 text-base ltr:uppercase rtl:normal-case',
    'relative transition-all duration-300 ease-out whitespace-nowrap',
    'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
    'hover:scale-105 active:scale-95 disabled:hover:scale-100',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'disabled:bg-button-neutral-background disabled:text-button-neutral-text disabled:border-button-neutral-secondary-border',
    'focus:outline-none',
    // Ring system base classes for accessibility
    'disabled:hover:ring-0 disabled:hover:ring-offset-0 disabled:focus-visible:ring-0 disabled:focus-visible:ring-offset-0 disabled:focus:ring-0 disabled:focus:ring-offset-0',
  ],
  {
    variants: {
      /**
       * Visual style variants affecting button appearance.
       * - primary: Filled buttons with white text (default)
       * - secondary: Light colored backgrounds with colored text and borders
       */
      variant: {
        primary: [],
        secondary: ['border'],
      },
      /**
       * Color theme variants following the design system palette.
       * Empty arrays indicate that styling is handled via compound variants
       * which combine color + variant for complete button styles.
       */
      color: createColorVariantObject(),
      /**
       * Size variants for different contexts.
       * - sm: Smaller buttons for compact interfaces
       * - md: Default size for standard use cases
       */
      size: {
        sm: 'min-h-10 min-w-24 py-2 px-3 text-sm',
        md: '', // Default size, no additional classes needed
      },
    },
    compoundVariants: [
      // Generate all primary color variants dynamically (ordered by COLOR_VARIANT_KEYS)
      ...Object.keys(COLOR_VARIANT_KEYS).map(color =>
        createPrimaryVariant(color as ColorVariantKey)
      ),
      // Generate all secondary color variants dynamically (ordered by COLOR_VARIANT_KEYS)
      ...Object.keys(COLOR_VARIANT_KEYS).map(color =>
        createSecondaryVariant(color as ColorVariantKey)
      ),
      // Dark mode text colors for primary buttons
      { variant: 'primary', color: 'brand', class: 'dark:text-red-50' },
      { variant: 'primary', color: 'primary', class: 'dark:text-emerald-50' },
      { variant: 'primary', color: 'emerald', class: 'dark:text-emerald-50' },
      { variant: 'primary', color: 'blue', class: 'dark:text-blue-50' },
      { variant: 'primary', color: 'slate', class: 'dark:text-slate-50' },
      { variant: 'primary', color: 'teal', class: 'dark:text-teal-50' },
      { variant: 'primary', color: 'red', class: 'dark:text-red-50' },
      { variant: 'primary', color: 'cyan', class: 'dark:text-cyan-50' },
      { variant: 'primary', color: 'yellow', class: 'dark:text-yellow-50' },
      { variant: 'primary', color: 'green', class: 'dark:text-green-50' },
      { variant: 'primary', color: 'violet', class: 'dark:text-violet-50' },
      { variant: 'primary', color: 'zinc', class: 'dark:text-zinc-50' },
      { variant: 'primary', color: 'orange', class: 'dark:text-orange-50' },
      { variant: 'primary', color: 'amber', class: 'dark:text-amber-50' },
      { variant: 'primary', color: 'lime', class: 'dark:text-lime-50' },
      { variant: 'primary', color: 'sky', class: 'dark:text-sky-50' },
      { variant: 'primary', color: 'indigo', class: 'dark:text-indigo-50' },
      { variant: 'primary', color: 'purple', class: 'dark:text-purple-50' },
      { variant: 'primary', color: 'fuchsia', class: 'dark:text-fuchsia-50' },
      { variant: 'primary', color: 'pink', class: 'dark:text-pink-50' },
      { variant: 'primary', color: 'rose', class: 'dark:text-rose-50' },
    ],
    defaultVariants: {
      variant: 'primary',
      color: 'brand',
      size: 'md',
    },
  }
)

// TypeScript type exports for component prop typing

/**
 * Type definition for buttonVariants props.
 * Use this when defining component props that accept button styling options.
 */
export type ButtonVariants = VariantProps<typeof buttonVariants>

/**
 * Type definition for button visual variants.
 * Ensures type safety when specifying button styles.
 */
export type ButtonVariant = NonNullable<ButtonVariants['variant']>

/**
 * Type definition for button color options.
 * Aligned with the design system's color palette.
 */
export type ButtonColor = NonNullable<ButtonVariants['color']>

/**
 * Type definition for button size options.
 * Provides type safety for size-related props.
 */
export type ButtonSize = NonNullable<ButtonVariants['size']>

/**
 * Shared color variant key type for button components.
 * Ensures consistency with the design system's color palette.
 */
export type ButtonColorVariant = ColorVariantKey
