/**
 * Shared color variant constants for CVA (Class Variance Authority) components
 *
 * This file defines the standard color palette used across all components in the design system.
 * Each color corresponds to specific Tailwind CSS classes and semantic CSS custom properties.
 *
 * Design System Color Mapping:
 * - brand: Primary brand color (red) - most important actions and highlights
 * - primary: Secondary brand color (emerald) - default actions and content
 * - emerald: Success states, positive actions, nature-themed content
 * - blue: Information, links, trust-related content
 * - red: Errors, warnings, destructive actions
 * - Other colors: Extended palette for categorization and visual variety
 *
 * @see {@link ~/styles/tailwind_semantic.css} for semantic color definitions
 */

/**
 * Standard color variant keys used across all CVA components.
 * This ensures consistency in color naming and available options.
 *
 * Includes both legacy real colors and new semantic colors (ADR-0029):
 * - Functional Semantics: success, error, warning, info, disabled, brand, primary
 * - Visual Accents: accent-amber, accent-indigo, accent-fuchsia, accent-teal, accent-sky, accent-purple
 * - Legacy Real Colors: All 21 Tailwind colors (will be reduced to 12 in Phase 2)
 */
export const COLOR_VARIANT_KEYS = {
	// Functional Semantics (ADR-0029)
	brand: 'brand',
	primary: 'primary',
	success: 'success',
	error: 'error',
	warning: 'warning',
	info: 'info',
	disabled: 'disabled',
	// Visual Accents (ADR-0029)
	'accent-amber': 'accent-amber',
	'accent-indigo': 'accent-indigo',
	'accent-fuchsia': 'accent-fuchsia',
	'accent-teal': 'accent-teal',
	'accent-sky': 'accent-sky',
	'accent-purple': 'accent-purple',
	// Legacy Real Colors (reduced to 13 - kept lime for admin panel)
	emerald: 'emerald',
	blue: 'blue',
	slate: 'slate',
	teal: 'teal',
	red: 'red',
	yellow: 'yellow',
	green: 'green',
	amber: 'amber',
	sky: 'sky',
	indigo: 'indigo',
	purple: 'purple',
	fuchsia: 'fuchsia',
	lime: 'lime',
} as const

/**
 * Type definition for color variant keys.
 * Use this type when defining color props in component types.
 */
export type ColorVariantKey = keyof typeof COLOR_VARIANT_KEYS

/**
 * Creates an empty color variant object with all standard colors.
 * Use this helper to create consistent color variant structures in CVA definitions.
 *
 * @param defaultValue - The default value to assign to each color key (default: empty string)
 * @returns Object with all color keys mapped to the default value
 *
 * @example
 * ```typescript
 * const myColorVariants = createColorVariantObject()
 * // Result: { brand: '', primary: '', emerald: '', ... }
 *
 * const myColorVariantsWithDefault = createColorVariantObject('bg-transparent')
 * // Result: { brand: 'bg-transparent', primary: 'bg-transparent', ... }
 * ```
 */
export const createColorVariantObject = (
	defaultValue = '',
): Record<ColorVariantKey, string> =>
	Object.keys(COLOR_VARIANT_KEYS).reduce(
		(acc, key) => {
			acc[key as ColorVariantKey] = defaultValue
			return acc
		},
		{} as Record<ColorVariantKey, string>,
	)

/**
 * Standard color list as an array for iteration or validation.
 * Useful when you need to programmatically work with all available colors.
 */
export const COLOR_VARIANT_LIST = Object.keys(COLOR_VARIANT_KEYS) as ColorVariantKey[]

/**
 * Creates color variant mappings with custom class patterns.
 * Use this helper when you need to map each color to a specific class pattern.
 *
 * @param getClassForColor - Function that takes a color key and returns the CSS classes
 * @returns Object with all color keys mapped to their respective classes
 *
 * @example
 * ```typescript
 * const borderVariants = createColorVariantMapping(
 *   (color) => `border-${color}-300 panel-${color}-bg`
 * )
 * // Result: { brand: 'border-brand-300 panel-brand-bg', primary: 'border-primary-300 panel-primary-bg', ... }
 * ```
 */
export const createColorVariantMapping = (
	getClassForColor: (color: ColorVariantKey) => string,
): Record<ColorVariantKey, string> =>
	Object.keys(COLOR_VARIANT_KEYS).reduce(
		(acc, key) => {
			acc[key as ColorVariantKey] = getClassForColor(key as ColorVariantKey)
			return acc
		},
		{} as Record<ColorVariantKey, string>,
	)
