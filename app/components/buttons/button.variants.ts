import { cva, type VariantProps } from 'class-variance-authority'

import {
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
       * - primary: Filled buttons with white text (default)
       * - secondary: Outlined buttons with transparent background
       */
      variant: {
        primary: ['text-white'],
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
      // Primary variant + colors
      {
        variant: 'primary',
        color: 'brand',
        class: [
          'bg-brand-600',
          'border border-brand-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-brand-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-brand-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-brand-600',
          'shadow-brand-700/40 hover:shadow-brand-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'primary',
        class: [
          'bg-primary-700',
          'border border-primary-700',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-primary-700',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-primary-700 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-primary-700',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-primary-700',
          'shadow-primary-700/40 hover:shadow-primary-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      // Secondary variant + colors
      {
        variant: 'secondary',
        color: 'brand',
        class: [
          'bg-white/60',
          'text-brand-600',
          'border-brand-600',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-white/70',
          'shadow-brand-700/40 hover:shadow-brand-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'primary',
        class: [
          'bg-white/60',
          'text-primary-600',
          'border-primary-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-primary-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 focus:ring-offset-white/70',
          'shadow-primary-700/40 hover:shadow-primary-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      // Additional secondary colors
      {
        variant: 'secondary',
        color: 'emerald',
        class: [
          'bg-white/60',
          'text-emerald-600',
          'border-emerald-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-emerald-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 focus:ring-offset-white/70',
          'shadow-emerald-700/40 hover:shadow-emerald-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'red',
        class: [
          'bg-white/60',
          'text-red-600',
          'border-red-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-red-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-red-700 focus:ring-offset-white/70',
          'shadow-red-700/40 hover:shadow-red-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'teal',
        class: [
          'bg-white/60',
          'text-teal-600',
          'border-teal-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-teal-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 focus:ring-offset-white/70',
          'shadow-teal-700/40 hover:shadow-teal-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'cyan',
        class: [
          'bg-white/60',
          'text-cyan-600',
          'border-cyan-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-cyan-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-cyan-700 focus:ring-offset-white/70',
          'shadow-cyan-700/40 hover:shadow-cyan-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'yellow',
        class: [
          'bg-white/60',
          'text-yellow-600',
          'border-yellow-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-yellow-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-yellow-700 focus:ring-offset-white/70',
          'shadow-yellow-700/40 hover:shadow-yellow-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'green',
        class: [
          'bg-white/60',
          'text-green-600',
          'border-green-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-green-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-green-700 focus:ring-offset-white/70',
          'shadow-green-700/40 hover:shadow-green-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'violet',
        class: [
          'bg-white/60',
          'text-violet-600',
          'border-violet-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-violet-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-violet-700 focus:ring-offset-white/70',
          'shadow-violet-700/40 hover:shadow-violet-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'slate',
        class: [
          'bg-white/60',
          'text-slate-600',
          'border-slate-700',
          'hover:bg-white/70 focus-visible:bg-white/70',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-700 focus-visible:ring-offset-white/70',
          'hover:ring-2 hover:ring-offset-2 hover:ring-slate-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 focus:ring-offset-white/70',
          'shadow-slate-700/40 hover:shadow-slate-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
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
