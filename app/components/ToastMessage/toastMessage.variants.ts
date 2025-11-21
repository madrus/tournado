import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Toast type variant type for consistent typing across the application.
 */
import type { ToastType } from '~/lib/lib.types'

/**
 * Toast message variants for notification display components.
 *
 * Provides styled toast notifications with different types (success, error, info, warning).
 * Features consistent styling with proper color coordination between backgrounds and icon colors.
 *
 * Design Features:
 * - Type-specific color theming (emerald, red, sky, orange)
 * - Clean borderless design with colored shadows
 * - Light mode: Dark colored shadows matching toast themes for visibility
 * - Dark mode: Medium white shadows for balanced definition
 * - Icon color coordination with toast backgrounds
 * - Proper contrast for accessibility
 *
 * @example
 * ```tsx
 * <div className={toastMessageVariants({ type: 'success' })}>
 *   Toast content
 * </div>
 * ```
 */
// Common styling patterns for toast types
const COMMON_STYLES = {
	errorStyles: [
		'bg-linear-to-br from-red-600/75 via-red-600/55 to-red-600/45',
		'dark:from-red-700/55 dark:via-red-700/45 dark:to-red-700/40',
		'text-white',
		'shadow-xl shadow-red-950/30 dark:shadow-md dark:shadow-white/20',
	],
	warningStyles: [
		'bg-linear-to-br from-orange-600/75 via-orange-600/55 to-orange-600/45',
		'dark:from-orange-700/55 dark:via-orange-700/45 dark:to-orange-700/40',
		'text-white',
		'shadow-xl shadow-orange-950/30 dark:shadow-md dark:shadow-white/20',
	],
} as const

export const toastMessageVariants = cva(
	// Base classes for all toast messages
	[
		'pointer-events-auto flex w-full min-w-[16rem] max-w-sm items-start gap-3 rounded-lg p-4',
		// Enable glossy overlays and separate stacking context
		'relative isolate overflow-hidden',
		// Lucid glass effect
		'backdrop-blur-lg backdrop-saturate-150',
		// Subtle edge definition
		'ring-1 ring-white/15 ring-inset dark:ring-white/10',
		// Top glossy highlight (pseudo-element overlay)
		'before:-z-10 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[56%] before:rounded-[inherit] before:content-[""]',
		'before:bg-linear-to-b before:from-white/55 before:via-white/20 before:to-transparent before:opacity-60 before:mix-blend-screen',
		'dark:before:from-white/35 dark:before:via-white/15 dark:before:opacity-50',
		// Re-introduce subtle underlay in light mode to boost internal contrast
		'"] after:-z-10 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-["',
		'after:bg-slate-900/15 after:mix-blend-multiply dark:after:bg-transparent',
	],
	{
		variants: {
			/**
			 * Toast type variants with coordinated background, text colors, and shadows.
			 *
			 * - success: Emerald theming with dark emerald shadows in light mode, medium white shadows in dark mode
			 * - error: Red theming with dark red shadows in light mode, medium white shadows in dark mode
			 * - info: Sky theming with dark sky shadows in light mode, medium white shadows in dark mode
			 * - warning: Orange theming with dark orange shadows in light mode, medium white shadows in dark mode
			 */
			type: {
				success: [
					// Return to 600 with light-mode underlay for contrast
					'bg-linear-to-br from-emerald-600/75 via-emerald-600/55 to-emerald-600/45',
					'dark:from-emerald-700/55 dark:via-emerald-700/45 dark:to-emerald-700/40',
					// Text and definition
					'text-white',
					'shadow-emerald-950/30 shadow-xl dark:shadow-md dark:shadow-white/20',
				],
				error: COMMON_STYLES.errorStyles,
				network: COMMON_STYLES.errorStyles,
				permission: COMMON_STYLES.errorStyles,
				server: COMMON_STYLES.errorStyles,
				client: COMMON_STYLES.errorStyles,
				unknown: COMMON_STYLES.errorStyles,
				info: [
					'bg-linear-to-br from-sky-600/75 via-sky-600/55 to-sky-600/45',
					'dark:from-sky-700/55 dark:via-sky-700/45 dark:to-sky-700/40',
					'text-white',
					'shadow-sky-950/30 shadow-xl dark:shadow-md dark:shadow-white/20',
				],
				warning: COMMON_STYLES.warningStyles,
				validation: COMMON_STYLES.warningStyles,
			},
		},
		defaultVariants: {
			type: 'info',
		},
	},
)

/**
 * Toast icon wrapper variants for icon container styling.
 *
 * Provides consistent sizing and positioning for toast icons.
 * Success icons get white circular backgrounds, while shaped icons (circles, triangles) render directly.
 *
 * @example
 * ```tsx
 * <div className={toastIconVariants({ type: 'success', hasBackground: true })}>
 *   <SuccessIcon />
 * </div>
 * ```
 */
export const toastIconVariants = cva(
	// Base classes for all toast icons
	['flex h-5 w-5 items-center justify-center'],
	{
		variants: {
			hasBackground: {
				true: 'rounded-full bg-white ring-2 ring-white/70',
				false: '',
			},
			type: {
				success: 'text-emerald-600',
				error: 'text-red-600',
				network: 'text-red-600',
				permission: 'text-red-600',
				server: 'text-red-600',
				client: 'text-red-600',
				unknown: 'text-red-600',
				info: 'text-sky-600',
				warning: 'text-orange-600',
				validation: 'text-orange-600',
			},
		},
		defaultVariants: {
			hasBackground: false,
			type: 'info',
		},
	},
)

/**
 * Toast close button variants for close button styling.
 *
 * Provides consistent styling for close buttons with proper theming based on toast type.
 * Uses opacity states for hover interactions.
 *
 * @example
 * ```tsx
 * <button className={toastCloseButtonVariants({ type: 'success' })}>
 *   <CloseIcon />
 * </button>
 * ```
 */
export const toastCloseButtonVariants = cva(
	// Base classes for all close buttons - all toast types use white text
	['flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white'],
	{
		variants: {
			// All types use the same white text styling, so no type variants needed
		},
		defaultVariants: {},
	},
)

// TypeScript type exports for component prop typing

/**
 * Type definition for toastMessageVariants props.
 * Use this when defining component props that accept toast message styling options.
 */
export type ToastMessageVariants = VariantProps<typeof toastMessageVariants>

/**
 * Type definition for toastIconVariants props.
 * Use this for icon wrapper styling within toast messages.
 */
export type ToastIconVariants = VariantProps<typeof toastIconVariants>

/**
 * Type definition for toastCloseButtonVariants props.
 * Use this for close button styling within toast messages.
 */
export type ToastCloseButtonVariants = VariantProps<typeof toastCloseButtonVariants>

export type { ToastType }
