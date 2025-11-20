import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey, createColorVariantMapping } from '~/components/shared/colorVariants'

// Import base panel variants that are shared across all panel components
export {
	type BasePanelContentVariants as PanelContentVariants,
	type BasePanelGlowVariants as PanelGlowVariants,
	basePanelContentVariants as panelContentVariants,
	basePanelGlowVariants as panelGlowVariants,
} from '~/components/shared/panel-base.variants'

/**
 * ActionLinkPanel variants for interactive panel components.
 *
 * Provides styling for clickable panels with hover effects and semantic backgrounds.
 * Uses panel-{color}-bg classes for consistent theming across light/dark modes.
 *
 * Features:
 * - Smooth color transitions on hover
 * - Semantic background classes for theme adaptation
 * - Interactive cursor and overflow handling
 * - Group-based hover effects for child elements
 *
 * @example
 * ```tsx
 * <div className={actionLinkPanelVariants({ color: 'brand' })}>
 *   <ActionLinkContent />
 * </div>
 * ```
 */
export const actionLinkPanelVariants = cva(
	// Base classes - all the common panel styling
	[
		'group relative cursor-pointer overflow-hidden rounded-2xl border shadow-xl',
		'transition-colors duration-750 ease-in-out',
		'flex flex-col', // Add flex-col to make it a flex container
	],
	{
		variants: {
			/**
			 * Color theme variants using semantic panel background classes.
			 * Each color uses panel-{color}-bg for consistent theming.
			 */
			color: createColorVariantMapping((color) => `panel-${color}-bg`),
			size: {
				none: '',
				default: '',
				sm: '',
				lg: '',
			},
		},
		defaultVariants: {
			color: 'teal',
			size: 'none',
		},
	},
)

/**
 * Panel background variants for stable background layers.
 *
 * Provides absolute positioning for background layers in ActionLinkPanel architecture.
 * Uses semantic panel background classes for consistent theming across components.
 *
 * Design Pattern:
 * - Absolute positioning to cover entire panel area
 * - Uses panel-{color}-bg classes for semantic color mapping
 * - Special handling for primary -> emerald mapping
 *
 * @example
 * ```tsx
 * <div className={panelBackgroundVariants({ color: 'brand' })} />
 * ```
 */
export const panelBackgroundVariants = cva(
	// Base classes for panel background
	['absolute inset-0'],
	{
		variants: {
			/**
			 * Background color variants using semantic panel classes.
			 * Special mapping for primary to emerald for design consistency.
			 */
			color: createColorVariantMapping((color) => {
				// Primary maps to emerald background
				if (color === 'primary') return 'panel-emerald-bg'
				// Standard pattern for all other colors
				return `panel-${color}-bg`
			}),
		},
		defaultVariants: {
			color: 'teal',
		},
	},
)

// Layer variants for panel content layers
export const panelLayerPositioningVariants = cva(
	// Base classes for panel layers
	['flex h-full flex-col'],
	{
		variants: {
			isHover: {
				true: 'panel-hover-layer absolute inset-0 z-30',
				false: 'relative z-20',
			},
		},
		defaultVariants: {
			isHover: false,
		},
	},
)

export const panelLayerOpacityVariants = cva(['transition-opacity duration-750 ease-in-out'], {
	variants: {
		isHover: {
			true: 'opacity-0 group-hover:opacity-100',
			false: '',
		},
		isBaseLayerWithHoverColor: {
			true: 'panel-base-layer group-hover:opacity-0',
			false: '',
		},
	},
	compoundVariants: [
		{
			isHover: false,
			isBaseLayerWithHoverColor: true,
			class: 'panel-base-layer group-hover:opacity-0',
		},
	],
	defaultVariants: {
		isHover: false,
		isBaseLayerWithHoverColor: false,
	},
})

// Layer variants for panel content layers

// ============================================================================
// ACTIONLINKPANEL COMPONENT-SPECIFIC VARIANTS
// These variants are only used by ActionLinkPanel and not shared
// ============================================================================

/**
 * ActionLinkPanel-specific glow variants with different styling.
 *
 * @deprecated Consider using basePanelGlowVariants from panel-base.variants.ts
 * for consistency. This variant uses panel-{color}-glow classes and higher opacity.
 *
 * Uses semantic panel-{color}-glow classes instead of direct color classes.
 * Higher opacity (90%) compared to base glow variants (60%).
 */
export const actionLinkPanelGlowVariants = cva(
	// Base classes for glow effect
	['-top-8 -right-8 pointer-events-none absolute h-32 w-32 rounded-full opacity-90 blur-2xl'],
	{
		variants: {
			/**
			 * Glow color variants using semantic panel glow classes.
			 * Coordinates with panel background colors for visual consistency.
			 */
			color: createColorVariantMapping((color) => `panel-${color}-glow`),
		},
		defaultVariants: {
			color: 'teal',
		},
	},
)

/**
 * Panel icon variants for ActionLinkPanel icon styling.
 *
 * Provides consistent styling for icons within ActionLinkPanel components.
 * Uses adaptive action colors for proper contrast and theme coordination.
 *
 * Design Features:
 * - Circular 32px containers with transparent backgrounds
 * - 2px borders matching text colors
 * - Smooth color transitions for theme changes
 * - Uses text-adaptive-{color}-action classes for enhanced contrast
 *
 * @example
 * ```tsx
 * <div className={panelIconVariants({ color: 'brand' })}>
 *   <ActionIcon />
 * </div>
 * ```
 */
export const panelIconVariants = cva(
	// Base classes for icons
	[
		'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-transparent',
		'transition-[border-color,background-color,color] duration-500 ease-in-out',
	],
	{
		variants: {
			/**
			 * Icon color variants using adaptive action classes.
			 * Special handling for brand and primary color mappings.
			 */
			color: createColorVariantMapping((color) => {
				// Special cases for color mapping
				if (color === 'brand') {
					return 'border-adaptive-red-action text-adaptive-red-action'
				}
				if (color === 'primary') {
					return 'border-adaptive-emerald-action text-adaptive-emerald-action'
				}
				// Standard pattern for other colors
				return `text-adaptive-${color}-action border-adaptive-${color}-action`
			}),
		},
		defaultVariants: {
			color: 'teal',
		},
	},
)

/**
 * Panel children content variants for ActionLinkPanel text styling.
 *
 * Applies adaptive action colors to child paragraph and strong elements.
 * Uses CSS child selectors with !important to override default text colors.
 *
 * Design Pattern:
 * - Uses [&_element] syntax for scoped child styling
 * - Applies same color to both p and strong elements
 * - Uses !important for color override specificity
 * - Special handling for brand/primary color mappings
 *
 * @example
 * ```tsx
 * <div className={panelChildrenVariants({ iconColor: 'brand' })}>
 *   <p>This paragraph will be brand colored</p>
 *   <strong>This text will also be brand colored</strong>
 * </div>
 * ```
 */
export const panelChildrenVariants = cva(
	// Base classes for children content
	[],
	{
		variants: {
			/**
			 * Child element color variants using adaptive action classes.
			 * Applies colors to nested p and strong elements with override specificity.
			 */
			iconColor: createColorVariantMapping((color) => {
				// Special cases for color mapping
				if (color === 'brand') {
					return '[&_p]:!text-adaptive-red-action [&_strong]:!text-adaptive-red-action'
				}
				if (color === 'primary') {
					return '[&_p]:!text-adaptive-emerald-action [&_strong]:!text-adaptive-emerald-action'
				}
				// Standard pattern for other colors
				return `[&_p]:!text-adaptive-${color}-action [&_strong]:!text-adaptive-${color}-action`
			}),
		},
		defaultVariants: {
			iconColor: 'teal',
		},
	},
)

// TypeScript type exports for component prop typing

/**
 * Type definition for actionLinkPanelVariants props.
 * Use this when defining component props that accept ActionLinkPanel styling options.
 */
export type ActionLinkPanelVariants = VariantProps<typeof actionLinkPanelVariants>

/**
 * Type definition for panelBackgroundVariants props.
 * Use this for panel background layer styling options.
 */
export type PanelBackgroundVariants = VariantProps<typeof panelBackgroundVariants>

/**
 * Type definition for actionLinkPanelGlowVariants props.
 * Use this for ActionLinkPanel-specific glow effect styling options.
 */
export type ActionLinkPanelGlowVariants = VariantProps<typeof actionLinkPanelGlowVariants>

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
 * Shared color variant key type for ActionLinkPanel components.
 * Ensures consistency with the design system's color palette.
 */
export type ActionLinkPanelColorVariant = ColorVariantKey
