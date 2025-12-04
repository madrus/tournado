import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey, createColorVariantMapping } from './colorVariants'

/**
 * Base panel container variants - foundation for all panel components.
 *
 * Provides core styling for panel containers across the application.
 * Supports multiple color themes, semantic variants, and layout patterns.
 *
 * Design System Integration:
 * - Color variants use semantic panel background classes (panel-{color}-bg)
 * - Border colors follow the design system's color mapping
 * - Special handling for brand (red) vs primary (emerald) colors
 *
 * @example
 * ```tsx
 * <div className={basePanelVariants({ color: 'brand', variant: 'content-panel' })}>
 *   Panel Content
 * </div>
 * ```
 */
export const basePanelVariants = cva(
	// Base classes - common panel styling
	['relative overflow-visible p-6'],
	{
		variants: {
			/**
			 * Color theme variants with semantic background and border classes.
			 * Each color maps to specific border and background combinations.
			 *
			 * Special mappings:
			 * - brand: Uses border-brand-400 (red accent)
			 * - primary: Maps to emerald for consistency
			 * - Other colors: Use standard -300 border weights
			 */
			color: createColorVariantMapping((color) => {
				// Special case for brand color using -400 weight
				if (color === 'brand') return 'panel-brand-bg border-brand-400'
				// Primary maps to emerald for design system consistency
				if (color === 'primary') return 'panel-emerald-bg border-emerald-300'
				// Standard pattern for all other colors
				return `border-${color}-300 panel-${color}-bg`
			}),
			/**
			 * Disabled state variant for consistent panel disabling.
			 * Uses !important to override other opacity and pointer-event settings.
			 */
			disabled: {
				true: '!opacity-20 !pointer-events-none',
				false: '',
			},
			/**
			 * Panel layout and interaction variants.
			 *
			 * Layer-specific variants support ActionLinkPanel's layered architecture,
			 * while semantic variants provide consistent styling for different panel types.
			 *
			 * Variant categories:
			 * - Layer variants: For complex interactive panels with hover effects
			 * - Semantic variants: Standard panel types with consistent spacing and borders
			 */
			variant: {
				// Layer-specific variants (for ActionLinkPanel architecture)
				/** Container layer for interactive panels with hover transitions */
				container: 'cursor-pointer transition-colors duration-750 ease-in-out',
				/** Background layer positioned absolutely for layered effects */
				background: 'absolute inset-0 p-0',
				/** Content layer with z-index for proper stacking */
				content: 'relative z-20 p-6',
				/** Hover overlay with opacity transitions */
				hover:
					'absolute inset-0 z-30 opacity-0 transition-opacity duration-750 ease-in-out group-hover:opacity-100',

				// Semantic panel type variants
				/** General content panels with rounded borders and shadows */
				'content-panel': 'rounded-xl border shadow-lg',
				/** Dashboard/stats panels with horizontal layout and specific child selectors */
				'dashboard-panel':
					'rounded-xl border p-6 shadow-lg [&_.dashboard-content]:flex [&_.dashboard-content]:items-center [&_.dashboard-icon]:me-5 [&_.dashboard-icon]:shrink-0 [&_.dashboard-stats]:w-0 [&_.dashboard-stats]:flex-1',
				/** Form panels with responsive padding for multi-step forms */
				'form-panel': 'rounded-xl border p-6 shadow-lg lg:p-8',
			},
		},
		defaultVariants: {
			color: 'brand',
			variant: 'content-panel',
			disabled: false,
		},
	},
)

/**
 * Base panel glow effect variants for visual enhancement.
 *
 * Creates subtle background glow effects positioned in the top-right corner of panels.
 * Uses RTL-aware positioning for international layouts.
 *
 * Visual Design:
 * - Semi-transparent background colors (30% opacity)
 * - Consistent -400 color weight for visual coherence
 * - Blur effect for soft, ambient lighting
 * - Positioned to not interfere with content
 *
 * @example
 * ```tsx
 * <div className={basePanelGlowVariants({ color: 'brand' })} />
 * ```
 */
export const basePanelGlowVariants = cva(
	// Base classes for glow effect - RTL aware positioning
	[
		'-top-8 -right-8 rtl:-left-8 pointer-events-none absolute h-32 w-32 rounded-full opacity-60 blur-2xl rtl:right-auto',
	],
	{
		variants: {
			/**
			 * Glow color variants using semi-transparent backgrounds.
			 * All colors use -400 weight with 30% opacity for consistency.
			 */
			color: createColorVariantMapping((color) => `bg-${color}-400/30`),
		},
		defaultVariants: {
			color: 'brand',
		},
	},
)

/**
 * Base panel content layer variants for proper z-index stacking.
 *
 * Ensures content appears above background layers in complex panel compositions.
 * Used primarily in ActionLinkPanel architecture.
 *
 * @example
 * ```tsx
 * <div className={basePanelContentVariants()}>
 *   Panel content here
 * </div>
 * ```
 */
export const basePanelContentVariants = cva(
	// Base classes for content layer positioning
	['relative z-20'],
)

/**
 * Base panel title typography variants with internationalization support.
 *
 * Provides consistent title styling across all panel components with support
 * for different languages and typography scales.
 *
 * Language Support:
 * - RTL languages (Arabic) receive special latin-title class for proper rendering
 * - LTR languages use default text rendering
 *
 * @example
 * ```tsx
 * <h2 className={basePanelTitleVariants({ size: 'lg', language: 'nl' })}>
 *   Panel Title
 * </h2>
 * ```
 */
export const basePanelTitleVariants = cva(['mb-4 font-bold text-title'], {
	variants: {
		/**
		 * Typography size variants following consistent scale.
		 */
		size: {
			lg: 'text-2xl',
			md: 'text-xl',
			sm: 'text-lg',
		},
		/**
		 * Language-specific typography adjustments.
		 * Handles RTL vs LTR text rendering requirements.
		 */
		language: {
			nl: '', // Dutch LTR - no additional classes needed
			en: '', // English LTR - no additional classes needed
			de: '', // German LTR - no additional classes needed
			fr: '', // French LTR - no additional classes needed
			ar: 'arabic-text', // Arabic RTL - uses Arabic (Amiri) font, alignment comes from dir="rtl"
			tr: '', // Turkish LTR - no additional classes needed
		},
	},
	defaultVariants: {
		size: 'md',
		language: 'nl', // Default to Dutch for this application
	},
})

/**
 * Base panel description text variants with semantic color classes.
 *
 * Provides colored text styling for panel descriptions using the design system's
 * adaptive color classes that automatically handle light/dark theme transitions.
 *
 * Special Color Handling:
 * - brand: Uses 'text-adaptive-brand-text' for enhanced readability
 * - primary: Maps to emerald for design consistency
 * - Other colors: Use standard 'text-adaptive-{color}' pattern
 *
 * @example
 * ```tsx
 * <p className={basePanelDescriptionVariants({ color: 'brand' })}>
 *   Panel description text
 * </p>
 * ```
 */
export const basePanelDescriptionVariants = cva(['text-foreground'], {
	variants: {
		/**
		 * Semantic color variants for panel description text.
		 * Uses adaptive classes that respond to theme changes.
		 */
		color: createColorVariantMapping((color) => {
			// Special case for brand using enhanced text variant
			if (color === 'brand') return 'text-adaptive-brand-text'
			// Primary maps to emerald
			if (color === 'primary') return 'text-adaptive-emerald'
			// Standard pattern for other colors
			return `text-adaptive-${color}`
		}),
	},
	defaultVariants: {
		color: 'slate', // Neutral default for general descriptions
	},
})

/**
 * Base panel number badge variants for step indicators and numbering.
 *
 * Creates circular badges positioned on panel corners for step numbers or counts.
 * Uses RTL-aware positioning for international layouts.
 *
 * Design Features:
 * - Circular badges with consistent 32px dimensions
 * - RTL/LTR positioning support
 * - High contrast with white text on colored backgrounds
 * - -600 color weight for accessibility compliance
 *
 * @example
 * ```tsx
 * <div className={basePanelNumberVariants({ color: 'brand' })}>
 *   1
 * </div>
 * ```
 */
export const basePanelNumberVariants = cva(
	[
		'-left-4 rtl:-right-4 absolute top-8 z-30 flex h-8 w-8 items-center justify-center rounded-full font-bold text-primary-foreground text-sm shadow-lg rtl:left-auto latin-text',
	],
	{
		variants: {
			/**
			 * Background color variants using adaptive background colors for theme-aware styling.
			 * Adapts automatically between light and dark modes.
			 * All colors provide sufficient contrast with white text.
			 */
			color: createColorVariantMapping((color) => {
				// Primary maps to emerald
				if (color === 'primary') return 'bg-adaptive-bg-emerald'
				// Standard pattern for all colors including brand
				return `bg-adaptive-bg-${color}`
			}),
			/**
			 * Disabled state variant that overrides color with subtle light gray.
			 * Shows panel number is disabled while maintaining visibility.
			 */
			disabled: {
				true: '!bg-gray-200 !text-gray-700',
				false: '',
			},
		},
		defaultVariants: {
			color: 'brand',
			disabled: false,
		},
	},
)

// TypeScript type exports for component prop typing

/**
 * Type definition for basePanelVariants props.
 * Use this when defining component props that accept base panel styling options.
 */
export type BasePanelVariants = VariantProps<typeof basePanelVariants>

/**
 * Type definition for basePanelGlowVariants props.
 * Use this for base panel glow effect styling options.
 */
export type BasePanelGlowVariants = VariantProps<typeof basePanelGlowVariants>

/**
 * Type definition for basePanelContentVariants props.
 * Use this for base panel content layer styling options.
 */
export type BasePanelContentVariants = VariantProps<typeof basePanelContentVariants>

/**
 * Type definition for basePanelTitleVariants props.
 * Use this for base panel title typography options.
 */
export type BasePanelTitleVariants = VariantProps<typeof basePanelTitleVariants>

/**
 * Type definition for basePanelDescriptionVariants props.
 * Use this for base panel description text styling options.
 */
export type BasePanelDescriptionVariants = VariantProps<
	typeof basePanelDescriptionVariants
>

/**
 * Type definition for basePanelNumberVariants props.
 * Use this for base panel number badge styling options.
 */
export type BasePanelNumberVariants = VariantProps<typeof basePanelNumberVariants>

/**
 * Base color variant key type for all panel components.
 * Ensures consistency with the design system's color palette.
 */
export type BasePanelColorVariant = ColorVariantKey
