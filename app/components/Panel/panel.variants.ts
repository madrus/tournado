import { cva, type VariantProps } from 'class-variance-authority'

import { createColorVariantMapping } from '~/components/shared/colorVariants'

// Import base panel variants that are shared across all panel components
export {
	type BasePanelColorVariant as PanelColorVariant,
	type BasePanelContentVariants as PanelContentVariants,
	type BasePanelDescriptionVariants as PanelDescriptionVariants,
	type BasePanelGlowVariants as PanelGlowVariants,
	type BasePanelNumberVariants as PanelNumberVariants,
	type BasePanelTitleVariants as PanelTitleVariants,
	type BasePanelVariants as PanelVariants,
	basePanelContentVariants as panelContentVariants,
	basePanelDescriptionVariants as panelDescriptionVariants,
	basePanelGlowVariants as panelGlowVariants,
	basePanelNumberVariants as panelNumberVariants,
	basePanelTitleVariants as panelTitleVariants,
	basePanelVariants as panelVariants,
} from '~/components/shared/panel-base.variants'

// ============================================================================
// PANEL COMPONENT-SPECIFIC VARIANTS
// These variants are only used by the Panel component and not shared
// ============================================================================

/**
 * Panel icon variants with adaptive colors and borders.
 *
 * Creates circular icon containers with matching text and border colors.
 * Uses semantic adaptive classes for automatic light/dark theme support.
 *
 * Design Features:
 * - Circular 32px containers with transparent backgrounds
 * - Matching text and border colors using adaptive classes
 * - Smooth color transitions on theme changes
 * - Special handling for brand/primary color mapping
 *
 * @example
 * ```tsx
 * <div className={panelIconVariants({ color: 'brand' })}>
 *   <Icon />
 * </div>
 * ```
 */
export const panelIconVariants = cva(
	[
		'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent transition-[color,border-color] duration-500 ease-in-out',
	],
	{
		variants: {
			/**
			 * Color variants using adaptive classes for text and border.
			 * Special handling for brand/primary mapping.
			 */
			color: createColorVariantMapping((color) => {
				// Primary maps to emerald
				if (color === 'primary') return 'border-adaptive-emerald text-adaptive-emerald'
				// Standard pattern for all colors including brand
				return `text-adaptive-${color} border-adaptive-${color}`
			}),
		},
		defaultVariants: {
			color: 'brand',
		},
	},
)

/**
 * Panel children content variants with semantic color inheritance.
 *
 * Applies adaptive colors to child elements (p, strong, span) within panels.
 * Uses CSS child selectors to style nested content automatically.
 *
 * Design Pattern:
 * - Uses [&_element] syntax for scoped child styling
 * - Applies same color to paragraph, strong, and span elements
 * - Leverages adaptive classes for theme consistency
 * - Special handling for brand/primary color mapping
 *
 * @example
 * ```tsx
 * <div className={panelChildrenVariants({ iconColor: 'brand' })}>
 *   <p>This text will be brand colored</p>
 *   <strong>This text will also be brand colored</strong>
 *   <span>And this too</span>
 * </div>
 * ```
 */
export const panelChildrenVariants = cva(
	// Base classes for children content
	[],
	{
		variants: {
			/**
			 * Color variants for child elements using CSS child selectors.
			 * Applies adaptive colors to nested p, strong, and span elements.
			 */
			iconColor: createColorVariantMapping((color) => {
				// Primary maps to emerald
				if (color === 'primary') {
					return '[&_p]:text-adaptive-emerald [&_strong]:text-adaptive-emerald [&_span]:text-adaptive-emerald'
				}
				// Standard pattern for all colors including brand
				return `[&_p]:text-adaptive-${color} [&_strong]:text-adaptive-${color} [&_span]:text-adaptive-${color}`
			}),
		},
		defaultVariants: {
			iconColor: 'brand',
		},
	},
)

/**
 * Dashboard icon background variants with solid colors.
 *
 * Provides consistent background colors for dashboard icons using -600 weight colors
 * with white text for optimal contrast.
 *
 * Design Notes:
 * - brand: Uses bg-red-600 (primary brand color)
 * - primary: Maps to bg-emerald-600 (secondary brand color)
 * - All colors use -600 weight for sufficient contrast with white text
 *
 * @example
 * ```tsx
 * <div className={dashboardIconVariants({ color: 'brand' })}>
 *   <Icon />
 * </div>
 * ```
 */
export const dashboardIconVariants = cva(
	['flex h-8 w-8 items-center justify-center rounded-md text-white'],
	{
		variants: {
			/**
			 * Background color variants using -600 weight for contrast.
			 */
			color: createColorVariantMapping((color) => {
				// Special mapping for brand to red
				if (color === 'brand') return 'bg-red-600'
				// Primary maps to emerald
				if (color === 'primary') return 'bg-emerald-600'
				// Standard pattern for other colors
				return `bg-${color}-600`
			}),
		},
		defaultVariants: {
			color: 'brand',
		},
	},
)

// TypeScript type exports for Panel component-specific variants

/**
 * Type definition for panelIconVariants props.
 * Use this for panel icon styling options.
 */
export type PanelIconVariants = VariantProps<typeof panelIconVariants>

/**
 * Type definition for panelChildrenVariants props.
 * Use this for panel children content styling options.
 */
export type PanelChildrenVariants = VariantProps<typeof panelChildrenVariants>

/**
 * Type definition for dashboardIconVariants props.
 * Use this for dashboard icon background styling options.
 */
export type DashboardIconVariants = VariantProps<typeof dashboardIconVariants>
