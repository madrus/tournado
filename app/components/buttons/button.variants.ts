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
 * Helper function to generate primary button variant classes for a given color.
 * Reduces code duplication by templating the color-specific classes.
 * All colors uniformly use -600 weight and -50 text for consistency.
 */
function createPrimaryVariant(color: ColorVariantKey) {
  const weight = '600'

  return {
    variant: 'primary' as const,
    color,
    class: [
      `text-${color}-50`,
      `bg-${color}-${weight}`,
      `border border-${color}-${weight}`,
      'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
      `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${color}-${weight} focus-visible:ring-offset-slate-50`,
      `focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-${color}-${weight}`,
      `hover:ring-2 hover:ring-offset-2 hover:ring-${color}-${weight} hover:ring-offset-slate-50`,
      `hover:dark:ring-slate-50 hover:dark:ring-offset-${color}-${weight}`,
      `focus:ring-2 focus:ring-offset-2 focus:ring-${color}-${weight} focus:ring-offset-slate-50`,
      `focus:dark:ring-slate-50 focus:dark:ring-offset-${color}-${weight}`,
      `shadow-${color}-700/40 hover:shadow-${color}-700/60`,
      'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
      'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
    ],
  }
}

/**
 * Helper function to generate secondary button variant classes for a given color.
 * All colors uniformly use -600 weight and slate-50 ring offset for consistency.
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
    'min-h-12 min-w-32 py-2.5 px-4 text-base uppercase',
    'relative transition-all duration-300 ease-out whitespace-nowrap',
    'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
    'hover:scale-103 active:scale-95 disabled:hover:scale-100',
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
       * - primary: Filled buttons with colored text (default)
       * - secondary: Outlined buttons with transparent background
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
