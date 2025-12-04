import { cva, type VariantProps } from 'class-variance-authority'

import {
	type ColorVariantKey,
	createColorVariantObject,
} from '~/components/shared/colorVariants'

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
		'bg-input text-foreground placeholder:[color:var(--color-placeholder)]',
		'transition-all duration-300 ease-in-out focus:outline-none',
		'transform-gpu will-change-transform',
		'disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 disabled:transition-none',
	],
	{
		variants: {
			/**
			 * Color variants with complex interaction states.
			 * Each color includes border, hover, focus, and dark mode variations.
			 *
			 * Note: The 'disabled' color variant provides visual theming for disabled-styled
			 * inputs but does NOT handle functional disabled state. Use the separate boolean
			 * `disabled: true` variant below (line 92-94) for actual disabled behavior
			 * (cursor-not-allowed, opacity, etc.).
			 */
			color: {
				// Functional Semantics
				brand:
					'border-brand-700/30 hover:border-brand-600 hover:shadow-brand-500/20 hover:shadow-md focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-400/30 dark:hover:shadow-brand-400/30',
				primary:
					'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/30 dark:hover:shadow-primary-400/30',
				success:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				error:
					'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				warning:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				info: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				'accent-indigo':
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				'accent-fuchsia':
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
				'accent-teal':
					'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				'accent-sky':
					'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				'accent-purple':
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				// Legacy Real Colors
				emerald:
					'border-emerald-700/30 hover:border-emerald-600 hover:shadow-emerald-500/20 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/30 dark:hover:shadow-emerald-400/30',
				red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				green:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				yellow:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				purple:
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				indigo:
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-lime-500/20 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:focus:ring-lime-400/30 dark:hover:shadow-lime-400/30',
				slate:
					'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:focus:ring-slate-400/30 dark:hover:shadow-slate-400/30',
				amber:
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				fuchsia:
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
			},
		},
	},
)

// ComboField trigger button variants
export const comboFieldTriggerVariants = cva(
	[
		'flex w-full items-center gap-1 rounded-md border-2 text-lg',
		'bg-input text-input-foreground placeholder:[color:var(--color-placeholder)]',
		'transition-all duration-300 ease-in-out focus:outline-none',
		'transform-gpu will-change-transform',
		'pr-1 pl-3 rtl:pr-3 rtl:pl-1',
		'disabled:transform-none disabled:transition-none',
	],
	{
		variants: {
			compact: {
				true: 'py-1 text-sm',
				false: 'h-12 py-2',
			},
			color: {
				// Functional Semantics
				brand:
					'border-brand-700/30 hover:border-brand-700/50 hover:shadow-brand-500/20 hover:shadow-md focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 data-[state=open]:border-brand-500 data-[state=open]:ring-4 data-[state=open]:ring-brand-500/20 dark:focus:ring-brand-400/30 dark:hover:shadow-brand-400/30',
				primary:
					'border-primary-700/30 hover:border-primary-700/50 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-500/20 dark:focus:ring-primary-400/30 dark:hover:shadow-primary-400/30',
				success:
					'border-green-700/30 hover:border-green-700/50 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 data-[state=open]:border-green-500 data-[state=open]:ring-4 data-[state=open]:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				error:
					'border-red-700/30 hover:border-red-700/50 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 data-[state=open]:border-red-500 data-[state=open]:ring-4 data-[state=open]:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				warning:
					'border-yellow-700/30 hover:border-yellow-700/50 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 data-[state=open]:border-yellow-500 data-[state=open]:ring-4 data-[state=open]:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				info: 'border-blue-700/30 hover:border-blue-700/50 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border-amber-700/30 hover:border-amber-700/50 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 data-[state=open]:border-amber-500 data-[state=open]:ring-4 data-[state=open]:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				'accent-indigo':
					'border-indigo-700/30 hover:border-indigo-700/50 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				'accent-fuchsia':
					'border-fuchsia-700/30 hover:border-fuchsia-700/50 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 data-[state=open]:border-fuchsia-500 data-[state=open]:ring-4 data-[state=open]:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
				'accent-teal':
					'border-teal-700/30 hover:border-teal-700/50 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 data-[state=open]:border-teal-500 data-[state=open]:ring-4 data-[state=open]:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				'accent-sky':
					'border-sky-700/30 hover:border-sky-700/50 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 data-[state=open]:border-sky-500 data-[state=open]:ring-4 data-[state=open]:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				'accent-purple':
					'border-purple-700/30 hover:border-purple-700/50 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 data-[state=open]:border-purple-500 data-[state=open]:ring-4 data-[state=open]:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				// Legacy Real Colors
				emerald:
					'border-emerald-700/30 hover:border-emerald-700/50 hover:shadow-emerald-500/20 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 data-[state=open]:border-emerald-500 data-[state=open]:ring-4 data-[state=open]:ring-emerald-500/20 dark:focus:ring-emerald-400/30 dark:hover:shadow-emerald-400/30',
				red: 'border-red-700/30 hover:border-red-700/50 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 data-[state=open]:border-red-500 data-[state=open]:ring-4 data-[state=open]:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				blue: 'border-blue-700/30 hover:border-blue-700/50 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				green:
					'border-green-700/30 hover:border-green-700/50 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 data-[state=open]:border-green-500 data-[state=open]:ring-4 data-[state=open]:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				yellow:
					'border-yellow-700/30 hover:border-yellow-700/50 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 data-[state=open]:border-yellow-500 data-[state=open]:ring-4 data-[state=open]:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				purple:
					'border-purple-700/30 hover:border-purple-700/50 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 data-[state=open]:border-purple-500 data-[state=open]:ring-4 data-[state=open]:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				indigo:
					'border-indigo-700/30 hover:border-indigo-700/50 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 data-[state=open]:border-indigo-500 data-[state=open]:ring-4 data-[state=open]:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				lime: 'border-lime-700/30 hover:border-lime-700/50 hover:shadow-lime-500/20 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 data-[state=open]:border-lime-500 data-[state=open]:ring-4 data-[state=open]:ring-lime-500/20 dark:focus:ring-lime-400/30 dark:hover:shadow-lime-400/30',
				slate:
					'border-slate-700/30 hover:border-slate-700/50 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 data-[state=open]:border-slate-500 data-[state=open]:ring-4 data-[state=open]:ring-slate-500/20 dark:focus:ring-slate-400/30 dark:hover:shadow-slate-400/30',
				amber:
					'border-amber-700/30 hover:border-amber-700/50 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 data-[state=open]:border-amber-500 data-[state=open]:ring-4 data-[state=open]:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				teal: 'border-teal-700/30 hover:border-teal-700/50 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 data-[state=open]:border-teal-500 data-[state=open]:ring-4 data-[state=open]:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				sky: 'border-sky-700/30 hover:border-sky-700/50 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 data-[state=open]:border-sky-500 data-[state=open]:ring-4 data-[state=open]:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				fuchsia:
					'border-fuchsia-700/30 hover:border-fuchsia-700/50 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 data-[state=open]:border-fuchsia-500 data-[state=open]:ring-4 data-[state=open]:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border-destructive hover:border-destructive hover:shadow-destructive/20 hover:shadow-md focus:border-destructive focus:ring-4 focus:ring-destructive/20 data-[state=open]:border-destructive data-[state=open]:ring-4 data-[state=open]:ring-destructive/20 dark:focus:ring-destructive/30 dark:hover:shadow-destructive/30',
			},
		},
		defaultVariants: {
			compact: false,
		},
	},
)

// ComboField content variants
export const comboFieldContentVariants = cva(
	['z-50 overflow-hidden rounded-md border shadow-lg', 'border-input-border'],
	{
		variants: {
			color: {
				// Functional Semantics
				brand: 'combo-content-bg bg-red-50 text-red-800 dark:text-red-50',
				primary: 'combo-content-bg bg-emerald-50 text-emerald-800 dark:text-emerald-50',
				success: 'combo-content-bg bg-green-50 text-green-800 dark:text-green-50',
				error: 'combo-content-bg bg-red-50 text-red-800 dark:text-red-50',
				warning: 'combo-content-bg bg-yellow-50 text-yellow-800 dark:text-yellow-50',
				info: 'combo-content-bg bg-blue-50 text-blue-800 dark:text-blue-50',
				disabled:
					'combo-content-bg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
				// Visual Accents
				'accent-amber':
					'combo-content-bg bg-amber-50 text-amber-800 dark:text-amber-50',
				'accent-indigo':
					'combo-content-bg bg-indigo-50 text-indigo-800 dark:text-indigo-50',
				'accent-fuchsia':
					'combo-content-bg bg-fuchsia-50 text-fuchsia-800 dark:text-fuchsia-50',
				'accent-teal': 'combo-content-bg bg-teal-50 text-teal-800 dark:text-teal-50',
				'accent-sky': 'combo-content-bg bg-sky-50 text-sky-800 dark:text-sky-50',
				'accent-purple':
					'combo-content-bg bg-purple-50 text-purple-800 dark:text-purple-50',
				// Legacy Real Colors
				emerald: 'combo-content-bg bg-emerald-50 text-emerald-800 dark:text-emerald-50',
				red: 'combo-content-bg bg-red-50 text-red-800 dark:text-red-50',
				blue: 'combo-content-bg bg-blue-50 text-blue-800 dark:text-blue-50',
				green: 'combo-content-bg bg-green-50 text-green-800 dark:text-green-50',
				yellow: 'combo-content-bg bg-yellow-50 text-yellow-800 dark:text-yellow-50',
				purple: 'combo-content-bg bg-purple-50 text-purple-800 dark:text-purple-50',
				indigo: 'combo-content-bg bg-indigo-50 text-indigo-800 dark:text-indigo-50',
				lime: 'combo-content-bg bg-lime-50 text-lime-800 dark:text-lime-50',
				slate: 'combo-content-bg bg-slate-50 text-slate-800 dark:text-slate-50',
				amber: 'combo-content-bg bg-amber-50 text-amber-800 dark:text-amber-50',
				teal: 'combo-content-bg bg-teal-50 text-teal-800 dark:text-teal-50',
				sky: 'combo-content-bg bg-sky-50 text-sky-800 dark:text-sky-50',
				fuchsia: 'combo-content-bg bg-fuchsia-50 text-fuchsia-800 dark:text-fuchsia-50',
			},
		},
		defaultVariants: {
			color: 'slate',
		},
	},
)

// ComboField item variants
export const comboFieldItemVariants = cva(
	[
		'relative flex cursor-pointer select-none items-center rounded-sm px-3 outline-none',
		'bg-transparent transition-colors duration-200',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
	],
	{
		variants: {
			compact: {
				true: 'py-1.5 text-sm',
				false: 'py-2 text-lg',
			},
			color: {
				// Functional Semantics
				brand:
					'text-red-800 hover:bg-red-100 focus:bg-red-100 data-[highlighted]:bg-red-100 dark:text-red-50 dark:data-[highlighted]:bg-red-900 dark:focus:bg-red-900 dark:hover:bg-red-900',
				primary:
					'text-emerald-800 hover:bg-emerald-100 focus:bg-emerald-100 data-[highlighted]:bg-emerald-100 dark:text-emerald-50 dark:data-[highlighted]:bg-emerald-900 dark:focus:bg-emerald-900 dark:hover:bg-emerald-900',
				success:
					'text-green-800 hover:bg-green-100 focus:bg-green-100 data-[highlighted]:bg-green-100 dark:text-green-50 dark:data-[highlighted]:bg-green-900 dark:focus:bg-green-900 dark:hover:bg-green-900',
				error:
					'text-red-800 hover:bg-red-100 focus:bg-red-100 data-[highlighted]:bg-red-100 dark:text-red-50 dark:data-[highlighted]:bg-red-900 dark:focus:bg-red-900 dark:hover:bg-red-900',
				warning:
					'text-yellow-800 hover:bg-yellow-100 focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 dark:text-yellow-50 dark:data-[highlighted]:bg-yellow-900 dark:focus:bg-yellow-900 dark:hover:bg-yellow-900',
				info: 'text-blue-800 hover:bg-blue-100 focus:bg-blue-100 data-[highlighted]:bg-blue-100 dark:text-blue-50 dark:data-[highlighted]:bg-blue-900 dark:focus:bg-blue-900 dark:hover:bg-blue-900',
				disabled: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
				// Visual Accents
				'accent-amber':
					'text-amber-800 hover:bg-amber-100 focus:bg-amber-100 data-[highlighted]:bg-amber-100 dark:text-amber-50 dark:data-[highlighted]:bg-amber-900 dark:focus:bg-amber-900 dark:hover:bg-amber-900',
				'accent-indigo':
					'text-indigo-800 hover:bg-indigo-100 focus:bg-indigo-100 data-[highlighted]:bg-indigo-100 dark:text-indigo-50 dark:data-[highlighted]:bg-indigo-900 dark:focus:bg-indigo-900 dark:hover:bg-indigo-900',
				'accent-fuchsia':
					'text-fuchsia-800 hover:bg-fuchsia-100 focus:bg-fuchsia-100 data-[highlighted]:bg-fuchsia-100 dark:text-fuchsia-50 dark:data-[highlighted]:bg-fuchsia-900 dark:focus:bg-fuchsia-900 dark:hover:bg-fuchsia-900',
				'accent-teal':
					'text-teal-800 hover:bg-teal-100 focus:bg-teal-100 data-[highlighted]:bg-teal-100 dark:text-teal-50 dark:data-[highlighted]:bg-teal-900 dark:focus:bg-teal-900 dark:hover:bg-teal-900',
				'accent-sky':
					'text-sky-800 hover:bg-sky-100 focus:bg-sky-100 data-[highlighted]:bg-sky-100 dark:text-sky-50 dark:data-[highlighted]:bg-sky-900 dark:focus:bg-sky-900 dark:hover:bg-sky-900',
				'accent-purple':
					'text-purple-800 hover:bg-purple-100 focus:bg-purple-100 data-[highlighted]:bg-purple-100 dark:text-purple-50 dark:data-[highlighted]:bg-purple-900 dark:focus:bg-purple-900 dark:hover:bg-purple-900',
				// Legacy Real Colors
				emerald:
					'text-emerald-800 hover:bg-emerald-100 focus:bg-emerald-100 data-[highlighted]:bg-emerald-100 dark:text-emerald-50 dark:data-[highlighted]:bg-emerald-900 dark:focus:bg-emerald-900 dark:hover:bg-emerald-900',
				red: 'text-red-800 hover:bg-red-100 focus:bg-red-100 data-[highlighted]:bg-red-100 dark:text-red-50 dark:data-[highlighted]:bg-red-900 dark:focus:bg-red-900 dark:hover:bg-red-900',
				blue: 'text-blue-800 hover:bg-blue-100 focus:bg-blue-100 data-[highlighted]:bg-blue-100 dark:text-blue-50 dark:data-[highlighted]:bg-blue-900 dark:focus:bg-blue-900 dark:hover:bg-blue-900',
				green:
					'text-green-800 hover:bg-green-100 focus:bg-green-100 data-[highlighted]:bg-green-100 dark:text-green-50 dark:data-[highlighted]:bg-green-900 dark:focus:bg-green-900 dark:hover:bg-green-900',
				yellow:
					'text-yellow-800 hover:bg-yellow-100 focus:bg-yellow-100 data-[highlighted]:bg-yellow-100 dark:text-yellow-50 dark:data-[highlighted]:bg-yellow-900 dark:focus:bg-yellow-900 dark:hover:bg-yellow-900',
				purple:
					'text-purple-800 hover:bg-purple-100 focus:bg-purple-100 data-[highlighted]:bg-purple-100 dark:text-purple-50 dark:data-[highlighted]:bg-purple-900 dark:focus:bg-purple-900 dark:hover:bg-purple-900',
				indigo:
					'text-indigo-800 hover:bg-indigo-100 focus:bg-indigo-100 data-[highlighted]:bg-indigo-100 dark:text-indigo-50 dark:data-[highlighted]:bg-indigo-900 dark:focus:bg-indigo-900 dark:hover:bg-indigo-900',
				lime: 'text-lime-800 hover:bg-lime-100 focus:bg-lime-100 data-[highlighted]:bg-lime-100 dark:text-lime-50 dark:data-[highlighted]:bg-lime-900 dark:focus:bg-lime-900 dark:hover:bg-lime-900',
				slate:
					'text-slate-800 hover:bg-slate-100 focus:bg-slate-100 data-[highlighted]:bg-slate-100 dark:text-slate-50 dark:data-[highlighted]:bg-slate-900 dark:focus:bg-slate-900 dark:hover:bg-slate-900',
				amber:
					'text-amber-800 hover:bg-amber-100 focus:bg-amber-100 data-[highlighted]:bg-amber-100 dark:text-amber-50 dark:data-[highlighted]:bg-amber-900 dark:focus:bg-amber-900 dark:hover:bg-amber-900',
				teal: 'text-teal-800 hover:bg-teal-100 focus:bg-teal-100 data-[highlighted]:bg-teal-100 dark:text-teal-50 dark:data-[highlighted]:bg-teal-900 dark:focus:bg-teal-900 dark:hover:bg-teal-900',
				sky: 'text-sky-800 hover:bg-sky-100 focus:bg-sky-100 data-[highlighted]:bg-sky-100 dark:text-sky-50 dark:data-[highlighted]:bg-sky-900 dark:focus:bg-sky-900 dark:hover:bg-sky-900',
				fuchsia:
					'text-fuchsia-800 hover:bg-fuchsia-100 focus:bg-fuchsia-100 data-[highlighted]:bg-fuchsia-100 dark:text-fuchsia-50 dark:data-[highlighted]:bg-fuchsia-900 dark:focus:bg-fuchsia-900 dark:hover:bg-fuchsia-900',
			},
		},
		defaultVariants: {
			compact: false,
			color: 'slate',
		},
	},
)

// ComboField value (selected or placeholder) variants
export const comboFieldValueVariants = cva(
	['flex-1 truncate text-start [&>span]:text-start'],
	{
		variants: {
			state: {
				value: 'text-foreground',
				placeholder: 'text-[color:var(--color-placeholder)]',
			},
		},
		defaultVariants: {
			state: 'value',
		},
	},
)

// Date picker button variants
export const datePickerButtonVariants = cva(
	[
		'flex h-12 w-full items-center justify-between rounded-md border-2 px-3 text-left text-lg leading-6',
		'bg-input text-input-foreground placeholder:[color:var(--color-placeholder)]',
		'transition-all duration-300 ease-in-out focus:outline-none',
		'transform-gpu will-change-transform',
		'disabled:transform-none disabled:transition-none',
	],
	{
		variants: {
			color: {
				// Functional Semantics
				brand:
					'border-brand-700/30 hover:border-brand-600 hover:shadow-brand-500/20 hover:shadow-md focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-400/30 dark:hover:shadow-brand-400/30',
				primary:
					'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/30 dark:hover:shadow-primary-400/30',
				success:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				error:
					'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				warning:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				info: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				'accent-indigo':
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				'accent-fuchsia':
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
				'accent-teal':
					'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				'accent-sky':
					'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				'accent-purple':
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				// Legacy Real Colors
				emerald:
					'border-emerald-700/30 hover:border-emerald-600 hover:shadow-emerald-500/20 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/30 dark:hover:shadow-emerald-400/30',
				red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				green:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				yellow:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				purple:
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				indigo:
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-lime-500/20 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:focus:ring-lime-400/30 dark:hover:shadow-lime-400/30',
				slate:
					'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:focus:ring-slate-400/30 dark:hover:shadow-slate-400/30',
				amber:
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				fuchsia:
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border-destructive hover:border-destructive hover:shadow-destructive/20 hover:shadow-md focus:border-destructive focus:ring-4 focus:ring-destructive/20 dark:focus:ring-destructive/30 dark:hover:shadow-destructive/30',
			},
		},
	},
)

// Date picker text variants
export const datePickerTextVariants = cva(
	['flex-1 truncate text-start transition-colors duration-200'],
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
	},
)

// Date picker icon variants
export const datePickerIconVariants = cva(['h-5 w-5 transition-colors duration-200'], {
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
export const textInputLabelVariants = cva(['flex w-full flex-col'])

// Text input label text variants
export const textInputLabelTextVariants = cva(['font-medium text-foreground text-sm'])
// Calendar container variants
export const calendarContainerVariants = cva([
	'rounded-lg border p-4 shadow-lg',
	'border-input-border bg-background',
])

// Calendar header variants
export const calendarHeaderVariants = cva([
	'mb-4 flex items-center justify-between text-foreground',
])

// Calendar weekday variants
export const calendarWeekdayVariants = cva([
	'font-medium text-foreground-lighter text-sm',
])

// Calendar day variants
export const calendarDayVariants = cva(
	[
		'flex h-9 w-9 items-center justify-center rounded-full font-medium text-sm',
		'cursor-pointer transition-colors duration-200',
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
				disabled: 'cursor-not-allowed text-foreground-lighter',
				past: 'text-foreground-lighter',
			},
		},
		defaultVariants: {
			state: 'default',
		},
	},
)

// Date input field variants
export const dateInputFieldVariants = cva(
	[
		'h-12 w-full rounded-md border-2 px-3 text-lg leading-6',
		'bg-input text-input-foreground dark:bg-input/40 placeholder:[color:var(--color-placeholder)]',
		'transition-all duration-300 ease-in-out focus:outline-none',
		'[&::-webkit-calendar-picker-indicator]:opacity-70',
		'disabled:transition-none',
	],
	{
		variants: {
			color: {
				// Functional Semantics
				brand:
					'border border-brand-700/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
				primary:
					'border border-primary-700/30 hover:border-2 hover:border-primary-700/50 focus:border-2 focus:border-primary-200',
				success:
					'border border-green-700/30 hover:border-2 hover:border-green-700/50 focus:border-2 focus:border-green-200',
				error:
					'border border-red-700/30 hover:border-2 hover:border-red-700/50 focus:border-2 focus:border-red-200',
				warning:
					'border border-yellow-700/30 hover:border-2 hover:border-yellow-700/50 focus:border-2 focus:border-yellow-200',
				info: 'border border-blue-700/30 hover:border-2 hover:border-blue-700/50 focus:border-2 focus:border-blue-200',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200',
				'accent-indigo':
					'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200',
				'accent-fuchsia':
					'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200',
				'accent-teal':
					'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200',
				'accent-sky':
					'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200',
				'accent-purple':
					'border border-purple-700/30 hover:border-2 hover:border-purple-700/50 focus:border-2 focus:border-purple-200',
				// Legacy Real Colors
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
				indigo:
					'border border-indigo-700/30 hover:border-2 hover:border-indigo-700/50 focus:border-2 focus:border-indigo-200',
				lime: 'border border-lime-700/30 hover:border-2 hover:border-lime-700/50 focus:border-2 focus:border-lime-200',
				slate:
					'border border-slate-700/30 hover:border-2 hover:border-slate-700/50 focus:border-2 focus:border-slate-200',
				amber:
					'border border-amber-700/30 hover:border-2 hover:border-amber-700/50 focus:border-2 focus:border-amber-200',
				teal: 'border border-teal-700/30 hover:border-2 hover:border-teal-700/50 focus:border-2 focus:border-teal-200',
				sky: 'border border-sky-700/30 hover:border-2 hover:border-sky-700/50 focus:border-2 focus:border-sky-200',
				fuchsia:
					'border border-fuchsia-700/30 hover:border-2 hover:border-fuchsia-700/50 focus:border-2 focus:border-fuchsia-200',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
			},
		},
		defaultVariants: {
			color: 'emerald',
		},
	},
)

// Checkbox agreement field variants
export const checkboxAgreementFieldVariants = cva(
	[
		'flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all duration-300',
		'bg-input dark:bg-input/40',
		'disabled:transition-none',
	],
	{
		variants: {
			color: {
				// Functional Semantics
				brand:
					'border-brand-700/30 hover:border-brand-600 hover:shadow-brand-500/20 hover:shadow-md focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-400/30 dark:hover:shadow-brand-400/30',
				primary:
					'border-primary-700/30 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/30 dark:hover:shadow-primary-400/30',
				success:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				error:
					'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				warning:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				info: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				'accent-indigo':
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				'accent-fuchsia':
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
				'accent-teal':
					'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				'accent-sky':
					'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				'accent-purple':
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				// Legacy Real Colors
				emerald:
					'border-emerald-700/30 hover:border-emerald-600 hover:shadow-emerald-500/20 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/30 dark:hover:shadow-emerald-400/30',
				red: 'border-red-700/30 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				blue: 'border-blue-700/30 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				green:
					'border-green-700/30 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				yellow:
					'border-yellow-700/30 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				purple:
					'border-purple-700/30 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				indigo:
					'border-indigo-700/30 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				lime: 'border-lime-700/30 hover:border-lime-600 hover:shadow-lime-500/20 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:focus:ring-lime-400/30 dark:hover:shadow-lime-400/30',
				slate:
					'border-slate-700/30 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:focus:ring-slate-400/30 dark:hover:shadow-slate-400/30',
				amber:
					'border-amber-700/30 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				teal: 'border-teal-700/30 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				sky: 'border-sky-700/30 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				fuchsia:
					'border-fuchsia-700/30 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
			},
		},
	},
)

export const checkboxAgreementInputVariants = cva(
	[
		'peer h-6 w-6 cursor-pointer appearance-none rounded border-2 transition-all duration-300',
		'bg-input dark:bg-input/40',
		// Android-specific improvements
		'-webkit-appearance-none -moz-appearance-none',
		'disabled:transition-none',
	],
	{
		variants: {
			color: {
				// Functional Semantics
				brand:
					'border-brand-700/30 checked:border-brand-600 checked:bg-brand-600 hover:border-brand-600 hover:shadow-brand-500/20 hover:shadow-md focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:focus:ring-brand-400/30 dark:hover:shadow-brand-400/30',
				primary:
					'border-primary-700/30 checked:border-primary-600 checked:bg-primary-600 hover:border-primary-600 hover:shadow-md hover:shadow-primary-500/20 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 dark:focus:ring-primary-400/30 dark:hover:shadow-primary-400/30',
				success:
					'border-green-700/30 checked:border-green-600 checked:bg-green-600 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				error:
					'border-red-700/30 checked:border-red-600 checked:bg-red-600 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				warning:
					'border-yellow-700/30 checked:border-yellow-600 checked:bg-yellow-600 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				info: 'border-blue-700/30 checked:border-blue-600 checked:bg-blue-600 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				disabled: 'border-slate-200 dark:border-slate-800',
				// Visual Accents
				'accent-amber':
					'border-amber-700/30 checked:border-amber-600 checked:bg-amber-600 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				'accent-indigo':
					'border-indigo-700/30 checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				'accent-fuchsia':
					'border-fuchsia-700/30 checked:border-fuchsia-600 checked:bg-fuchsia-600 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
				'accent-teal':
					'border-teal-700/30 checked:border-teal-600 checked:bg-teal-600 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				'accent-sky':
					'border-sky-700/30 checked:border-sky-600 checked:bg-sky-600 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				'accent-purple':
					'border-purple-700/30 checked:border-purple-600 checked:bg-purple-600 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				// Legacy Real Colors
				emerald:
					'border-emerald-700/30 checked:border-emerald-600 checked:bg-emerald-600 hover:border-emerald-600 hover:shadow-emerald-500/20 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/30 dark:hover:shadow-emerald-400/30',
				red: 'border-red-700/30 checked:border-red-600 checked:bg-red-600 hover:border-red-600 hover:shadow-md hover:shadow-red-500/20 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:focus:ring-red-400/30 dark:hover:shadow-red-400/30',
				blue: 'border-blue-700/30 checked:border-blue-600 checked:bg-blue-600 hover:border-blue-600 hover:shadow-blue-500/20 hover:shadow-md focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/30 dark:hover:shadow-blue-400/30',
				green:
					'border-green-700/30 checked:border-green-600 checked:bg-green-600 hover:border-green-600 hover:shadow-green-500/20 hover:shadow-md focus:border-green-500 focus:ring-4 focus:ring-green-500/20 dark:focus:ring-green-400/30 dark:hover:shadow-green-400/30',
				yellow:
					'border-yellow-700/30 checked:border-yellow-600 checked:bg-yellow-600 hover:border-yellow-600 hover:shadow-md hover:shadow-yellow-500/20 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-yellow-400/30 dark:hover:shadow-yellow-400/30',
				purple:
					'border-purple-700/30 checked:border-purple-600 checked:bg-purple-600 hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/20 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-400/30 dark:hover:shadow-purple-400/30',
				indigo:
					'border-indigo-700/30 checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-600 hover:shadow-indigo-500/20 hover:shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/30 dark:hover:shadow-indigo-400/30',
				lime: 'border-lime-700/30 checked:border-lime-600 checked:bg-lime-600 hover:border-lime-600 hover:shadow-lime-500/20 hover:shadow-md focus:border-lime-500 focus:ring-4 focus:ring-lime-500/20 dark:focus:ring-lime-400/30 dark:hover:shadow-lime-400/30',
				slate:
					'border-slate-700/30 checked:border-slate-600 checked:bg-slate-600 hover:border-slate-600 hover:shadow-md hover:shadow-slate-500/20 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 dark:focus:ring-slate-400/30 dark:hover:shadow-slate-400/30',
				amber:
					'border-amber-700/30 checked:border-amber-600 checked:bg-amber-600 hover:border-amber-600 hover:shadow-amber-500/20 hover:shadow-md focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-amber-400/30 dark:hover:shadow-amber-400/30',
				teal: 'border-teal-700/30 checked:border-teal-600 checked:bg-teal-600 hover:border-teal-600 hover:shadow-md hover:shadow-teal-500/20 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/30 dark:hover:shadow-teal-400/30',
				sky: 'border-sky-700/30 checked:border-sky-600 checked:bg-sky-600 hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/20 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/30 dark:hover:shadow-sky-400/30',
				fuchsia:
					'border-fuchsia-700/30 checked:border-fuchsia-600 checked:bg-fuchsia-600 hover:border-fuchsia-600 hover:shadow-fuchsia-500/20 hover:shadow-md focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 dark:focus:ring-fuchsia-400/30 dark:hover:shadow-fuchsia-400/30',
			},
			/**
			 * Functional disabled state (boolean variant).
			 * Applies cursor and opacity changes for actual disabled inputs.
			 * Separate from the 'disabled' color variant above, which only provides visual theming.
			 */
			disabled: {
				true: 'cursor-not-allowed opacity-50',
			},
			error: {
				true: 'border border-error/30 hover:border-2 hover:border-brand-700/50 focus:border-2 focus:border-brand-200',
			},
		},
	},
)

// Checkbox agreement checkmark variants
export const checkboxAgreementCheckmarkVariants = cva(
	[
		'pointer-events-none absolute h-4 w-4',
		'text-primary-foreground',
		// Positioning for visual balance
		'-translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2',
	],
	{
		variants: {
			color: createColorVariantObject(),
			disabled: {
				true: 'opacity-50',
				false: '',
			},
			error: {
				true: '',
				false: '',
			},
		},
		defaultVariants: {
			color: 'emerald',
			disabled: false,
			error: false,
		},
	},
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
 * Type definition for checkboxAgreementCheckmarkVariants props.
 */
export type CheckboxAgreementCheckmarkVariants = VariantProps<
	typeof checkboxAgreementCheckmarkVariants
>

/**
 * Shared color variant key type for input components.
 * Ensures consistency with the design system's color palette.
 */
export type InputColorVariant = ColorVariantKey
