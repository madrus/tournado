import { cva, type VariantProps } from 'class-variance-authority'

// TypeScript type exports for component prop typing

/**
 * Semantic color type for buttons.
 * Only Functional Semantics and Visual Accents are supported.
 */
export type ButtonSemanticColor =
	| 'brand'
	| 'primary'
	| 'success'
	| 'error'
	| 'warning'
	| 'info'
	| 'disabled'
	| 'accent-amber'
	| 'accent-indigo'
	| 'accent-fuchsia'
	| 'accent-teal'
	| 'accent-sky'
	| 'accent-purple'

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
 * Aligned with the semantic color system.
 */
export type ButtonColor = NonNullable<ButtonVariants['color']>

/**
 * Type definition for button size options.
 * Provides type safety for size-related props.
 */
export type ButtonSize = NonNullable<ButtonVariants['size']>

/**
 * Button component variants with comprehensive styling and interaction states.
 *
 * Provides a complete button system with:
 * - Multiple visual variants (primary, secondary)
 * - Semantic color palette (Functional Semantics + Visual Accents)
 * - Size variants for different contexts
 * - Advanced interaction states (hover, active, disabled)
 * - Accessibility features (focus rings, disabled states)
 *
 * Design System Integration:
 * - Uses semantic CSS custom properties for consistent theming
 * - Supports only Functional Semantics and Visual Accents
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
 * Maps semantic color keys to their darker variants (700 weight) for dark mode.
 *
 * IMPORTANT: Must use explicit, complete class names (not template literals)
 * for Tailwind's static analysis to detect and include them in the CSS bundle.
 *
 * Used by components that need darker backgrounds in dark mode (e.g., ActionButton).
 */
export const DARK_MODE_DARKER_CLASSES: Record<ButtonSemanticColor, string> = {
	// Functional Semantics
	brand: 'dark:bg-red-700 dark:border-red-700',
	primary: 'dark:bg-emerald-700 dark:border-emerald-700',
	success: 'dark:bg-green-700 dark:border-green-700',
	error: 'dark:bg-red-700 dark:border-red-700',
	warning: 'dark:bg-amber-700 dark:border-amber-700',
	info: 'dark:bg-blue-700 dark:border-blue-700',
	disabled: 'dark:bg-slate-700 dark:border-slate-700',
	// Visual Accents
	'accent-amber': 'dark:bg-amber-700 dark:border-amber-700',
	'accent-indigo': 'dark:bg-indigo-700 dark:border-indigo-700',
	'accent-fuchsia': 'dark:bg-fuchsia-700 dark:border-fuchsia-700',
	'accent-teal': 'dark:bg-teal-700 dark:border-teal-700',
	'accent-sky': 'dark:bg-sky-700 dark:border-sky-700',
	'accent-purple': 'dark:bg-purple-700 dark:border-purple-700',
}

export const buttonVariants = cva(
	// Base classes - all the common button styling
	[
		'inline-flex items-center justify-center gap-1 rtl:flex-row-reverse rounded-lg font-bold',
		'min-h-12 min-w-32 px-2 md:px-4 py-2.5 text-base ltr:uppercase rtl:normal-case',
		'relative whitespace-nowrap transition-all duration-300 ease-out',
		'shadow-lg hover:shadow-xl disabled:hover:shadow-lg',
		'hover:scale-105 active:scale-95 disabled:hover:scale-100',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'disabled:border-button-neutral-secondary-border disabled:bg-button-neutral-background disabled:text-button-neutral-text',
		'focus:outline-none',
		// Ring system base classes for accessibility
		'disabled:focus-visible:ring-0 disabled:focus-visible:ring-offset-0 disabled:focus:ring-0 disabled:focus:ring-offset-0 disabled:hover:ring-0 disabled:hover:ring-offset-0',
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
			 * Semantic color variants following the design system.
			 * Only Functional Semantics and Visual Accents are supported.
			 * Empty objects indicate styling is handled via compound variants.
			 */
			color: {
				// Functional Semantics
				brand: {},
				primary: {},
				success: {},
				error: {},
				warning: {},
				info: {},
				disabled: {},
				// Visual Accents
				'accent-amber': {},
				'accent-indigo': {},
				'accent-fuchsia': {},
				'accent-teal': {},
				'accent-sky': {},
				'accent-purple': {},
			},
			/**
			 * Size variants for different contexts.
			 * - sm: Smaller buttons for compact interfaces
			 * - md: Default size for standard use cases
			 */
			size: {
				sm: 'min-h-10 min-w-24 px-3 py-2 text-sm',
				md: '', // Default size, no additional classes needed
			},
		},
		compoundVariants: [
			// Primary button variants - Functional Semantics (7)
			{
				variant: 'primary',
				color: 'brand',
				class: [
					'text-white',
					'bg-brand-600',
					'border border-white/60',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-brand-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 focus:ring-offset-slate-50',
					'shadow-brand-700/40 hover:shadow-brand-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'primary',
				class: [
					'text-white',
					'bg-primary-600',
					'border border-primary-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-primary-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-offset-slate-50',
					'shadow-primary-700/40 hover:shadow-primary-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'success',
				class: [
					'text-white',
					'bg-success-600',
					'border border-success-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-success-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-success-600 focus:ring-offset-slate-50',
					'shadow-success-700/40 hover:shadow-success-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'error',
				class: [
					'text-white',
					'bg-error-600',
					'border border-error-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-error-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-error-600 focus:ring-offset-slate-50',
					'shadow-error-700/40 hover:shadow-error-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'warning',
				class: [
					'text-white',
					'bg-warning-600',
					'border border-warning-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-warning-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-warning-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-warning-600 focus:ring-offset-slate-50',
					'shadow-warning-700/40 hover:shadow-warning-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'info',
				class: [
					'text-white',
					'bg-info-600',
					'border border-info-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-info-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-info-600 focus:ring-offset-slate-50',
					'shadow-info-700/40 hover:shadow-info-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'disabled',
				class: [
					'text-white',
					'bg-disabled-600',
					'border border-disabled-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-disabled-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-disabled-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-disabled-600 focus:ring-offset-slate-50',
					'shadow-disabled-700/40 hover:shadow-disabled-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},

			// Primary button variants - Visual Accents (6)
			{
				variant: 'primary',
				color: 'accent-amber',
				class: [
					'text-white',
					'bg-accent-amber-600',
					'border border-accent-amber-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-amber-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-amber-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-amber-600 focus:ring-offset-slate-50',
					'shadow-accent-amber-700/40 hover:shadow-accent-amber-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'accent-indigo',
				class: [
					'text-white',
					'bg-accent-indigo-600',
					'border border-accent-indigo-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-indigo-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-indigo-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo-600 focus:ring-offset-slate-50',
					'shadow-accent-indigo-700/40 hover:shadow-accent-indigo-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'accent-fuchsia',
				class: [
					'text-white',
					'bg-accent-fuchsia-600',
					'border border-accent-fuchsia-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-fuchsia-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-fuchsia-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-fuchsia-600 focus:ring-offset-slate-50',
					'shadow-accent-fuchsia-700/40 hover:shadow-accent-fuchsia-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'accent-teal',
				class: [
					'text-white',
					'bg-accent-teal-600',
					'border border-accent-teal-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-teal-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-teal-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal-600 focus:ring-offset-slate-50',
					'shadow-accent-teal-700/40 hover:shadow-accent-teal-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'accent-sky',
				class: [
					'text-white',
					'bg-accent-sky-600',
					'border border-accent-sky-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-sky-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-sky-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-sky-600 focus:ring-offset-slate-50',
					'shadow-accent-sky-700/40 hover:shadow-accent-sky-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'primary',
				color: 'accent-purple',
				class: [
					'text-white',
					'bg-accent-purple-600',
					'border border-accent-purple-600',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-purple-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-purple-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-purple-600 focus:ring-offset-slate-50',
					'shadow-accent-purple-700/40 hover:shadow-accent-purple-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},

			// Secondary button variants - Functional Semantics (7)
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
					'border-primary-600',
					'hover:bg-primary-100 focus-visible:bg-primary-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-primary-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 focus:ring-offset-slate-50',
					'shadow-primary-700/40 hover:shadow-primary-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'success',
				class: [
					'bg-success-50',
					'text-success-600',
					'border-success-600',
					'hover:bg-success-100 focus-visible:bg-success-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-success-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-success-600 focus:ring-offset-slate-50',
					'shadow-success-700/40 hover:shadow-success-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'error',
				class: [
					'bg-error-50',
					'text-error-600',
					'border-error-600',
					'hover:bg-error-100 focus-visible:bg-error-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-error-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-error-600 focus:ring-offset-slate-50',
					'shadow-error-700/40 hover:shadow-error-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'warning',
				class: [
					'bg-warning-50',
					'text-warning-600',
					'border-warning-600',
					'hover:bg-warning-100 focus-visible:bg-warning-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-warning-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-warning-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-warning-600 focus:ring-offset-slate-50',
					'shadow-warning-700/40 hover:shadow-warning-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'info',
				class: [
					'bg-info-50',
					'text-info-600',
					'border-info-600',
					'hover:bg-info-100 focus-visible:bg-info-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-info-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-info-600 focus:ring-offset-slate-50',
					'shadow-info-700/40 hover:shadow-info-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'disabled',
				class: [
					'bg-disabled-50',
					'text-disabled-600',
					'border-disabled-600',
					'hover:bg-disabled-100 focus-visible:bg-disabled-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-disabled-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-disabled-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-disabled-600 focus:ring-offset-slate-50',
					'shadow-disabled-700/40 hover:shadow-disabled-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},

			// Secondary button variants - Visual Accents (6)
			{
				variant: 'secondary',
				color: 'accent-amber',
				class: [
					'bg-accent-amber-50',
					'text-accent-amber-600',
					'border-accent-amber-600',
					'hover:bg-accent-amber-100 focus-visible:bg-accent-amber-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-amber-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-amber-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-amber-600 focus:ring-offset-slate-50',
					'shadow-accent-amber-700/40 hover:shadow-accent-amber-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'accent-indigo',
				class: [
					'bg-accent-indigo-50',
					'text-accent-indigo-600',
					'border-accent-indigo-600',
					'hover:bg-accent-indigo-100 focus-visible:bg-accent-indigo-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-indigo-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-indigo-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo-600 focus:ring-offset-slate-50',
					'shadow-accent-indigo-700/40 hover:shadow-accent-indigo-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'accent-fuchsia',
				class: [
					'bg-accent-fuchsia-50',
					'text-accent-fuchsia-600',
					'border-accent-fuchsia-600',
					'hover:bg-accent-fuchsia-100 focus-visible:bg-accent-fuchsia-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-fuchsia-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-fuchsia-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-fuchsia-600 focus:ring-offset-slate-50',
					'shadow-accent-fuchsia-700/40 hover:shadow-accent-fuchsia-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'accent-teal',
				class: [
					'bg-accent-teal-50',
					'text-accent-teal-600',
					'border-accent-teal-600',
					'hover:bg-accent-teal-100 focus-visible:bg-accent-teal-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-teal-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-teal-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal-600 focus:ring-offset-slate-50',
					'shadow-accent-teal-700/40 hover:shadow-accent-teal-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'accent-sky',
				class: [
					'bg-accent-sky-50',
					'text-accent-sky-600',
					'border-accent-sky-600',
					'hover:bg-accent-sky-100 focus-visible:bg-accent-sky-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-sky-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-sky-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-sky-600 focus:ring-offset-slate-50',
					'shadow-accent-sky-700/40 hover:shadow-accent-sky-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},
			{
				variant: 'secondary',
				color: 'accent-purple',
				class: [
					'bg-accent-purple-50',
					'text-accent-purple-600',
					'border-accent-purple-600',
					'hover:bg-accent-purple-100 focus-visible:bg-accent-purple-100',
					'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-purple-600 focus-visible:ring-offset-slate-50',
					'hover:ring-2 hover:ring-offset-2 hover:ring-accent-purple-600 hover:ring-offset-slate-50',
					'focus:ring-2 focus:ring-offset-2 focus:ring-accent-purple-600 focus:ring-offset-slate-50',
					'shadow-accent-purple-700/40 hover:shadow-accent-purple-700/60',
					'dark:shadow-slate-100/20 dark:hover:shadow-slate-100/30',
					'disabled:shadow-button-neutral-background/70 disabled:hover:shadow-button-neutral-background/70',
				],
			},

			// Dark mode text colors for primary buttons - Functional Semantics
			{ variant: 'primary', color: 'brand', class: 'dark:text-red-50' },
			{ variant: 'primary', color: 'primary', class: 'dark:text-emerald-50' },
			{ variant: 'primary', color: 'success', class: 'dark:text-green-50' },
			{ variant: 'primary', color: 'error', class: 'dark:text-red-50' },
			{ variant: 'primary', color: 'warning', class: 'dark:text-amber-50' },
			{ variant: 'primary', color: 'info', class: 'dark:text-blue-50' },
			{ variant: 'primary', color: 'disabled', class: 'dark:text-slate-50' },

			// Dark mode text colors for primary buttons - Visual Accents
			{ variant: 'primary', color: 'accent-amber', class: 'dark:text-amber-50' },
			{ variant: 'primary', color: 'accent-indigo', class: 'dark:text-indigo-50' },
			{ variant: 'primary', color: 'accent-fuchsia', class: 'dark:text-fuchsia-50' },
			{ variant: 'primary', color: 'accent-teal', class: 'dark:text-teal-50' },
			{ variant: 'primary', color: 'accent-sky', class: 'dark:text-sky-50' },
			{ variant: 'primary', color: 'accent-purple', class: 'dark:text-purple-50' },
		],
		defaultVariants: {
			variant: 'primary',
			color: 'brand',
			size: 'md',
		},
	},
)

export const ICON_CIRCLE_COLOR_VARIANTS: Record<ButtonColor, string> = {
	// Functional Semantics
	brand: 'border-brand-600/70',
	primary: 'border-primary-600/70',
	success: 'border-green-600/70',
	error: 'border-red-600/70',
	warning: 'border-amber-600/70',
	info: 'border-blue-600/70',
	disabled: 'border-button-neutral-secondary-border',
	// Visual Accents
	'accent-amber': 'border-amber-600/70',
	'accent-indigo': 'border-indigo-600/70',
	'accent-fuchsia': 'border-fuchsia-600/70',
	'accent-teal': 'border-teal-600/70',
	'accent-sky': 'border-sky-600/70',
	'accent-purple': 'border-purple-600/70',
} as const
