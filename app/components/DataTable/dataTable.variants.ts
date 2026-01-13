import { type VariantProps, cva } from 'class-variance-authority'
import {
	type ColorVariantKey,
	createColorVariantMapping,
} from '../shared/colorVariants'

export type DatatableColorVariant = ColorVariantKey

/**
 * Datatable container variants for data table wrapper styling.
 *
 * Provides consistent container styling for data tables with themed borders and backgrounds.
 * Uses subtle -50 backgrounds in light mode and -950 in dark mode for optimal content contrast.
 *
 * Pattern:
 * - Light mode: -200 borders with -50 backgrounds
 * - Dark mode: -800 borders with -950 backgrounds
 *
 * @example
 * ```tsx
 * <div className={datatableContainerVariants({ color: 'brand' })}>
 *   <table>...</table>
 * </div>
 * ```
 */
export const datatableContainerVariants = cva(
	// Base classes - container styling
	['w-full overflow-hidden rounded-lg border'],
	{
		variants: {
			/**
			 * Color theme variants for container borders and backgrounds.
			 * Uses subtle colors appropriate for data table contexts.
			 */
			color: createColorVariantMapping(
				(color) =>
					`border-${color}-200 bg-${color}-50 dark:border-${color}-800 dark:bg-${color}-950`,
			),
		},
		defaultVariants: {
			color: 'slate',
		},
	},
)

/**
 * Datatable header row variants for table headers.
 *
 * Provides themed styling for table header rows with stronger contrast than container.
 * Uses -100 backgrounds in light mode and -900 in dark mode for header emphasis.
 *
 * @example
 * ```tsx
 * <thead className={datatableHeaderVariants({ color: 'brand' })}>
 *   <tr>...</tr>
 * </thead>
 * ```
 */
export const datatableHeaderVariants = cva(
	// Base classes for header row
	['border-b px-3 py-3'],
	{
		variants: {
			/**
			 * Color theme variants for header styling with stronger contrast.
			 */
			color: createColorVariantMapping(
				(color) =>
					`border-${color}-200 bg-${color}-100 dark:border-${color}-700 dark:bg-${color}-900`,
			),
		},
		defaultVariants: {
			color: 'slate',
		},
	},
)

/**
 * Datatable header text variants for table column headers.
 *
 * Provides styling for table header text with adaptive colors and consistent typography.
 * Uses small caps formatting typical for data table headers.
 *
 * @example
 * ```tsx
 * <th className={datatableHeaderTextVariants({ color: 'brand' })}>
 *   Column Header
 * </th>
 * ```
 */
export const datatableHeaderTextVariants = cva(
	// Base classes for header text
	['font-medium text-xs uppercase tracking-wider'],
	{
		variants: {
			/**
			 * Header text color variants using adaptive header classes.
			 * Provides consistent text colors optimized for header readability.
			 */
			color: createColorVariantMapping((color) => `text-adaptive-${color}-header`),
		},
		defaultVariants: {
			color: 'slate',
		},
	},
)

/**
 * Datatable row variants for table data rows.
 *
 * Provides styling for interactive table rows with hover effects and theming.
 * Includes support for special row variants like the last row styling.
 *
 * Pattern:
 * - Light mode: -100 borders with -50 hover backgrounds
 * - Dark mode: -800 borders with -900/50 hover backgrounds
 *
 * @example
 * ```tsx
 * <tr className={datatableRowVariants({ color: 'brand', variant: 'default' })}>
 *   <td>Row content</td>
 * </tr>
 * ```
 */
export const datatableRowVariants = cva(
	// Base classes for data rows
	['border-b transition-colors'],
	{
		variants: {
			/**
			 * Color theme variants for row borders and hover states.
			 * Uses subtle colors for non-intrusive row highlighting.
			 */
			color: createColorVariantMapping(
				(color) => `border-${color}-100 dark:border-${color}-800`,
			),
			/**
			 * Row layout variants for special positioning and alternating colors.
			 */
			variant: {
				default: '',
				last: 'rounded-b-lg border-b-0',
			},
			/**
			 * Interaction variants for row clickability.
			 * Controls cursor style based on whether the row is interactive.
			 */
			interaction: {
				clickable: 'cursor-pointer',
				static: '',
			},
		},
		defaultVariants: {
			color: 'slate',
			variant: 'default',
			interaction: 'clickable',
		},
	},
)

/**
 * Helper to generate header background classes.
 * Keeps header lighter than first data row in light mode and darker in dark mode.
 */
export function getDatatableHeaderClasses(color: DatatableColorVariant): string {
	const headerClasses: Record<DatatableColorVariant, string> = {
		// Functional Semantics
		brand: 'bg-white dark:bg-brand-950',
		primary: 'bg-white dark:bg-primary-950',
		success: 'bg-white dark:bg-green-950',
		error: 'bg-white dark:bg-red-950',
		warning: 'bg-white dark:bg-yellow-950',
		info: 'bg-white dark:bg-blue-950',
		disabled: 'bg-white dark:bg-slate-950',
		// Visual Accents
		'accent-amber': 'bg-white dark:bg-amber-950',
		'accent-indigo': 'bg-white dark:bg-indigo-950',
		'accent-fuchsia': 'bg-white dark:bg-fuchsia-950',
		'accent-teal': 'bg-white dark:bg-teal-950',
		'accent-sky': 'bg-white dark:bg-sky-950',
		'accent-purple': 'bg-white dark:bg-purple-950',
		// Legacy Real Colors
		amber: 'bg-white dark:bg-amber-950',
		blue: 'bg-white dark:bg-blue-950',
		emerald: 'bg-white dark:bg-emerald-950',
		fuchsia: 'bg-white dark:bg-fuchsia-950',
		green: 'bg-white dark:bg-green-950',
		indigo: 'bg-white dark:bg-indigo-950',
		lime: 'bg-white dark:bg-lime-950',
		purple: 'bg-white dark:bg-purple-950',
		red: 'bg-white dark:bg-red-950',
		sky: 'bg-white dark:bg-sky-950',
		slate: 'bg-white dark:bg-slate-950',
		teal: 'bg-white dark:bg-teal-950',
		yellow: 'bg-white dark:bg-yellow-950',
	}
	return headerClasses[color]
}

/**
 * Helper to generate stripe classes for alternating row colors.
 * index % 2 === 1 is treated as "even" (lighter stripe in light mode).
 *
 * Note: These classes must be explicit (not template literals) for Tailwind's JIT compiler
 * to detect them at build time. Dynamic class generation breaks static analysis.
 */
export function getDatatableStripeClasses(
	color: DatatableColorVariant,
	isEven: boolean,
): string {
	const evenClasses: Record<DatatableColorVariant, string> = {
		// Functional Semantics
		brand: 'bg-white hover:bg-brand-200 dark:bg-brand-950 dark:hover:bg-brand-800',
		primary:
			'bg-white hover:bg-primary-200 dark:bg-primary-950 dark:hover:bg-primary-800',
		success: 'bg-white hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-800',
		error: 'bg-white hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-800',
		warning: 'bg-white hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-800',
		info: 'bg-white hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-800',
		disabled: 'bg-white hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800',
		// Visual Accents
		'accent-amber':
			'bg-white hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-800',
		'accent-indigo':
			'bg-white hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-800',
		'accent-fuchsia':
			'bg-white hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800',
		'accent-teal': 'bg-white hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-800',
		'accent-sky': 'bg-white hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-800',
		'accent-purple':
			'bg-white hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-800',
		// Legacy Real Colors
		amber: 'bg-white hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-800',
		blue: 'bg-white hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-800',
		emerald:
			'bg-white hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-800',
		fuchsia:
			'bg-white hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800',
		green: 'bg-white hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-800',
		indigo: 'bg-white hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-800',
		lime: 'bg-white hover:bg-lime-200 dark:bg-lime-950 dark:hover:bg-lime-800',
		purple: 'bg-white hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-800',
		red: 'bg-white hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-800',
		sky: 'bg-white hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-800',
		slate: 'bg-white hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800',
		teal: 'bg-white hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-800',
		yellow: 'bg-white hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-800',
	}

	const oddClasses: Record<DatatableColorVariant, string> = {
		// Functional Semantics
		brand: 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-900 dark:hover:bg-brand-800',
		primary:
			'bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800',
		success:
			'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800',
		error: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800',
		warning:
			'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800',
		info: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800',
		disabled:
			'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800',
		// Visual Accents
		'accent-amber':
			'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800',
		'accent-indigo':
			'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800',
		'accent-fuchsia':
			'bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-900 dark:hover:bg-fuchsia-800',
		'accent-teal':
			'bg-teal-100 hover:bg-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800',
		'accent-sky': 'bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800',
		'accent-purple':
			'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800',
		// Legacy Real Colors
		amber: 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800',
		blue: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800',
		emerald:
			'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800',
		fuchsia:
			'bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-900 dark:hover:bg-fuchsia-800',
		green: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800',
		indigo:
			'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800',
		lime: 'bg-lime-100 hover:bg-lime-200 dark:bg-lime-900 dark:hover:bg-lime-800',
		purple:
			'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800',
		red: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800',
		sky: 'bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800',
		slate: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800',
		teal: 'bg-teal-100 hover:bg-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800',
		yellow:
			'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800',
	}

	return isEven ? evenClasses[color] : oddClasses[color]
}

// Datatable cell text styling
export const datatableCellTextVariants = cva(
	// Base classes for cell text
	[''],
	{
		variants: {
			variant: {
				primary: 'font-medium text-adaptive-cell-primary text-sm',
				secondary: 'text-adaptive-cell-secondary text-sm',
				muted: 'text-adaptive-cell-muted text-sm',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	},
)

// Datatable action button styling
export const datatableActionButtonVariants = cva(
	// Base classes for action buttons
	['flex items-center justify-center rounded-full p-1 transition-colors duration-200'],
	{
		variants: {
			action: {
				delete:
					'text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300',
				edit: 'text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300',
				view: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
			},
		},
		defaultVariants: {
			action: 'view',
		},
	},
)

/**
 * Datatable delete area variants for mobile swipe actions.
 *
 * Provides styling for the delete area revealed during mobile swipe gestures.
 * Uses strong background colors to clearly indicate destructive actions.
 *
 * Design Pattern:
 * - Full screen width for easy touch targets
 * - Centered content layout
 * - Strong -500/-600 colors for clear action indication
 *
 * @example
 * ```tsx
 * <div className={datatableDeleteAreaVariants({ color: 'red' })}>
 *   <DeleteIcon />
 * </div>
 * ```
 */
export const datatableDeleteAreaVariants = cva(
	// Base classes for delete area
	['flex w-screen shrink-0 items-center'],
	{
		variants: {
			/**
			 * Color variants for delete area backgrounds.
			 * Limited to destructive action colors (red/brand).
			 */
			color: {
				red: 'bg-red-500 dark:bg-red-600',
				brand: 'bg-brand-500 dark:bg-brand-600',
			},
			/**
			 * Justify variants for delete area content alignment.
			 */
			justify: {
				center: 'justify-center',
				start: 'justify-start',
			},
		},
		defaultVariants: {
			color: 'red',
			justify: 'center',
		},
	},
)

// TypeScript type exports for component prop typing

/**
 * Type definition for datatableContainerVariants props.
 * Use this when defining component props that accept datatable container styling options.
 */
export type DatatableContainerVariants = VariantProps<typeof datatableContainerVariants>

/**
 * Type definition for datatableHeaderVariants props.
 * Use this for datatable header row styling options.
 */
export type DatatableHeaderVariants = VariantProps<typeof datatableHeaderVariants>

/**
 * Type definition for datatableHeaderTextVariants props.
 * Use this for datatable header text styling options.
 */
export type DatatableHeaderTextVariants = VariantProps<
	typeof datatableHeaderTextVariants
>

/**
 * Type definition for datatableRowVariants props.
 * Use this for datatable row styling options.
 */
export type DatatableRowVariants = VariantProps<typeof datatableRowVariants>

/**
 * Type definition for datatableCellTextVariants props.
 * Use this for datatable cell text styling options.
 */
export type DatatableCellTextVariants = VariantProps<typeof datatableCellTextVariants>

/**
 * Type definition for datatableActionButtonVariants props.
 * Use this for datatable action button styling options.
 */
export type DatatableActionButtonVariants = VariantProps<
	typeof datatableActionButtonVariants
>

/**
 * Type definition for datatableDeleteAreaVariants props.
 * Use this for datatable delete area styling options.
 */
export type DatatableDeleteAreaVariants = VariantProps<
	typeof datatableDeleteAreaVariants
>
