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
      // Primary variant + colors (ordered by COLOR_VARIANT_KEYS)
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
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
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
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'emerald',
        class: [
          'bg-emerald-600',
          'border border-emerald-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-emerald-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-emerald-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-emerald-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-emerald-600',
          'shadow-emerald-700/40 hover:shadow-emerald-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'blue',
        class: [
          'bg-blue-600',
          'border border-blue-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-blue-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-blue-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-blue-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-blue-600',
          'shadow-blue-700/40 hover:shadow-blue-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'slate',
        class: [
          'bg-slate-600',
          'border border-slate-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-slate-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-slate-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-slate-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-slate-600',
          'shadow-slate-700/40 hover:shadow-slate-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'teal',
        class: [
          'bg-teal-600',
          'border border-teal-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-teal-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-teal-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-teal-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-teal-600',
          'shadow-teal-700/40 hover:shadow-teal-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'red',
        class: [
          'bg-red-600',
          'border border-red-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-red-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-red-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-red-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-red-600',
          'shadow-red-700/40 hover:shadow-red-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'cyan',
        class: [
          'bg-cyan-600',
          'border border-cyan-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-cyan-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-cyan-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-cyan-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-cyan-600',
          'shadow-cyan-700/40 hover:shadow-cyan-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'yellow',
        class: [
          'bg-yellow-600',
          'border border-yellow-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-yellow-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-yellow-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-yellow-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-yellow-600',
          'shadow-yellow-700/40 hover:shadow-yellow-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'green',
        class: [
          'bg-green-600',
          'border border-green-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-green-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-green-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-green-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-green-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-green-600',
          'shadow-green-700/40 hover:shadow-green-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'violet',
        class: [
          'bg-violet-600',
          'border border-violet-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-violet-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-violet-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-violet-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-violet-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-violet-600',
          'shadow-violet-700/40 hover:shadow-violet-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'zinc',
        class: [
          'bg-zinc-600',
          'border border-zinc-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-zinc-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-zinc-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-zinc-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-zinc-600',
          'shadow-zinc-700/40 hover:shadow-zinc-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'orange',
        class: [
          'bg-orange-600',
          'border border-orange-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-orange-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-orange-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-orange-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-orange-600',
          'shadow-orange-700/40 hover:shadow-orange-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'amber',
        class: [
          'bg-amber-600',
          'border border-amber-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-amber-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-amber-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-amber-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-amber-600',
          'shadow-amber-700/40 hover:shadow-amber-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'lime',
        class: [
          'bg-lime-600',
          'border border-lime-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lime-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-lime-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-lime-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-lime-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-lime-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-lime-600',
          'shadow-lime-700/40 hover:shadow-lime-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'sky',
        class: [
          'bg-sky-600',
          'border border-sky-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-sky-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-sky-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-sky-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-sky-600',
          'shadow-sky-700/40 hover:shadow-sky-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'indigo',
        class: [
          'bg-indigo-600',
          'border border-indigo-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-indigo-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-indigo-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-indigo-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-indigo-600',
          'shadow-indigo-700/40 hover:shadow-indigo-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'purple',
        class: [
          'bg-purple-600',
          'border border-purple-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-purple-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-purple-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-purple-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-purple-600',
          'shadow-purple-700/40 hover:shadow-purple-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'fuchsia',
        class: [
          'bg-fuchsia-600',
          'border border-fuchsia-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-fuchsia-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-fuchsia-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-fuchsia-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-fuchsia-600',
          'shadow-fuchsia-700/40 hover:shadow-fuchsia-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'pink',
        class: [
          'bg-pink-600',
          'border border-pink-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-pink-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-pink-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-pink-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-pink-600',
          'shadow-pink-700/40 hover:shadow-pink-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'primary',
        color: 'rose',
        class: [
          'bg-rose-600',
          'border border-rose-600',
          'hover:dark:border-slate-50 focus-visible:dark:border-slate-50',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-600 focus-visible:ring-offset-slate-50',
          'focus-visible:dark:ring-slate-50 focus-visible:dark:ring-offset-rose-600',
          'hover:ring-2 hover:ring-offset-2 hover:ring-rose-600 hover:ring-offset-slate-50',
          'hover:dark:ring-slate-50 hover:dark:ring-offset-rose-600',
          'focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 focus:ring-offset-slate-50',
          'focus:dark:ring-slate-50 focus:dark:ring-offset-rose-600',
          'shadow-rose-700/40 hover:shadow-rose-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      // Secondary variant + colors (ordered by COLOR_VARIANT_KEYS)
      {
        variant: 'secondary',
        color: 'brand',
        class: [
          'bg-brand-50',
          'text-brand-600',
          'border-brand-600',
          'hover:bg-brand-100 focus-visible:bg-brand-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-slate-50',
          'shadow-brand-700/40 hover:shadow-brand-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'primary',
        class: [
          'bg-primary-50',
          'text-primary-600',
          'border-primary-700',
          'hover:bg-primary-100 focus-visible:bg-primary-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-primary-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 focus:ring-offset-white/70',
          'shadow-primary-700/40 hover:shadow-primary-700/60',
          'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'emerald',
        class: [
          'bg-emerald-50',
          'text-emerald-600',
          'border-emerald-600',
          'hover:bg-emerald-100 focus-visible:bg-emerald-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-emerald-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 focus:ring-offset-slate-50',
          'shadow-emerald-700/40 hover:shadow-emerald-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'blue',
        class: [
          'bg-blue-50',
          'text-blue-600',
          'border-blue-600',
          'hover:bg-blue-100 focus-visible:bg-blue-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-blue-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-slate-50',
          'shadow-blue-700/40 hover:shadow-blue-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'slate',
        class: [
          'bg-slate-50',
          'text-slate-600',
          'border-slate-700',
          'hover:bg-slate-100 focus-visible:bg-slate-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-700 focus-visible:ring-offset-white/70',
          'hover:ring-2 hover:ring-offset-2 hover:ring-slate-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 focus:ring-offset-white/70',
          'shadow-slate-700/40 hover:shadow-slate-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'teal',
        class: [
          'bg-teal-50',
          'text-teal-600',
          'border-teal-700',
          'hover:bg-teal-100 focus-visible:bg-teal-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-teal-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 focus:ring-offset-white/70',
          'shadow-teal-700/40 hover:shadow-teal-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'red',
        class: [
          'bg-red-50',
          'text-red-600',
          'border-red-700',
          'hover:bg-red-100 focus-visible:bg-red-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-red-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-red-700 focus:ring-offset-white/70',
          'shadow-red-700/40 hover:shadow-red-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'cyan',
        class: [
          'bg-cyan-50',
          'text-cyan-600',
          'border-cyan-600',
          'hover:bg-cyan-100 focus-visible:bg-cyan-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-cyan-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 focus:ring-offset-slate-50',
          'shadow-cyan-700/40 hover:shadow-cyan-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'yellow',
        class: [
          'bg-yellow-50',
          'text-yellow-600',
          'border-yellow-700',
          'hover:bg-yellow-100 focus-visible:bg-yellow-100',
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
          'bg-green-50',
          'text-green-600',
          'border-green-700',
          'hover:bg-green-100 focus-visible:bg-green-100',
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
          'bg-violet-50',
          'text-violet-600',
          'border-violet-700',
          'hover:bg-violet-100 focus-visible:bg-violet-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-violet-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-violet-700 focus:ring-offset-white/70',
          'shadow-violet-700/40 hover:shadow-violet-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'zinc',
        class: [
          'bg-zinc-50',
          'text-zinc-600',
          'border-zinc-700',
          'hover:bg-zinc-100 focus-visible:bg-zinc-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-zinc-700 hover:ring-offset-white/70',
          'focus:ring-2 focus:ring-offset-2 focus:ring-zinc-700 focus:ring-offset-white/70',
          'shadow-zinc-700/40 hover:shadow-zinc-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'orange',
        class: [
          'bg-orange-50',
          'text-orange-600',
          'border-orange-600',
          'hover:bg-orange-100 focus-visible:bg-orange-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-orange-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 focus:ring-offset-slate-50',
          'shadow-orange-700/40 hover:shadow-orange-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'amber',
        class: [
          'bg-amber-50',
          'text-amber-600',
          'border-amber-600',
          'hover:bg-amber-100 focus-visible:bg-amber-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-amber-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 focus:ring-offset-slate-50',
          'shadow-amber-700/40 hover:shadow-amber-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'lime',
        class: [
          'bg-lime-50',
          'text-lime-600',
          'border-lime-600',
          'hover:bg-lime-100 focus-visible:bg-lime-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lime-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-lime-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-lime-600 focus:ring-offset-slate-50',
          'shadow-lime-700/40 hover:shadow-lime-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'sky',
        class: [
          'bg-sky-50',
          'text-sky-600',
          'border-sky-600',
          'hover:bg-sky-100 focus-visible:bg-sky-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-sky-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 focus:ring-offset-slate-50',
          'shadow-sky-700/40 hover:shadow-sky-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'indigo',
        class: [
          'bg-indigo-50',
          'text-indigo-600',
          'border-indigo-600',
          'hover:bg-indigo-100 focus-visible:bg-indigo-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-indigo-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-50',
          'shadow-indigo-700/40 hover:shadow-indigo-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'purple',
        class: [
          'bg-purple-50',
          'text-purple-600',
          'border-purple-600',
          'hover:bg-purple-100 focus-visible:bg-purple-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-purple-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 focus:ring-offset-slate-50',
          'shadow-purple-700/40 hover:shadow-purple-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'fuchsia',
        class: [
          'bg-fuchsia-50',
          'text-fuchsia-600',
          'border-fuchsia-600',
          'hover:bg-fuchsia-100 focus-visible:bg-fuchsia-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-fuchsia-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-600 focus:ring-offset-slate-50',
          'shadow-fuchsia-700/40 hover:shadow-fuchsia-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'pink',
        class: [
          'bg-pink-50',
          'text-pink-600',
          'border-pink-600',
          'hover:bg-pink-100 focus-visible:bg-pink-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-pink-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 focus:ring-offset-slate-50',
          'shadow-pink-700/40 hover:shadow-pink-700/60',
          'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
        ],
      },
      {
        variant: 'secondary',
        color: 'rose',
        class: [
          'bg-rose-50',
          'text-rose-600',
          'border-rose-600',
          'hover:bg-rose-100 focus-visible:bg-rose-100',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-600 focus-visible:ring-offset-slate-50',
          'hover:ring-2 hover:ring-offset-2 hover:ring-rose-600 hover:ring-offset-slate-50',
          'focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 focus:ring-offset-slate-50',
          'shadow-rose-700/40 hover:shadow-rose-700/60',
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
