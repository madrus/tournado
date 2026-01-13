import { type VariantProps, cva } from 'class-variance-authority'

// Tree-shaking optimization: Only include colors actually used in navigation
const NAVIGATION_COLORS = {
	brand: '',
	primary: '',
	emerald: '',
	blue: '',
	teal: '',
	red: '',
} as const

type NavigationColorKey = keyof typeof NAVIGATION_COLORS

/**
 * Navigation item container variant styles for mobile bottom navigation.
 *
 * Provides consistent styling for navigation links in the mobile bottom navigation bar.
 * Uses the design system's color mapping where 'brand' represents the primary accent color
 * and 'primary' represents the secondary brand color (emerald).
 *
 * @example
 * ```tsx
 * <Link className={navigationItemVariants({ color: 'brand', active: true })}>
 *   Navigation Item
 * </Link>
 * ```
 */
export const navigationItemVariants = cva(
	// Base classes - common navigation item styling
	['flex flex-col items-center transition-colors duration-200'],
	{
		variants: {
			/**
			 * Color theme variants following the design system color mapping.
			 * Limited to commonly used navigation colors for bundle size optimization.
			 * - brand: Primary brand color (red) for key navigation items
			 * - primary: Secondary brand color (emerald) for default items
			 * - Other colors: Essential colors for different navigation contexts
			 */
			color: NAVIGATION_COLORS,
			/**
			 * Active state indicating current page/route.
			 * Combined with color variants to show proper visual hierarchy.
			 */
			active: {
				true: '',
				false: '',
			},
		},
		defaultVariants: {
			color: 'brand',
			active: false,
		},
	},
)

/**
 * Navigation icon variant styles with semantic color classes.
 *
 * Uses semantic CSS classes (text-adaptive-*) that automatically adapt to light/dark themes.
 * The active state uses brand colors while inactive state uses neutral foreground colors.
 *
 * Design rationale:
 * - Active icons use semantic brand colors (text-adaptive-brand) for visual prominence
 * - Inactive icons use neutral colors (text-primary-foreground) to reduce visual noise
 * - Compound variants ensure proper color/state combinations
 *
 * @example
 * ```tsx
 * const iconClasses = navigationIconVariants({ color: 'brand', active: isCurrentPage })
 * ```
 */
export const navigationIconVariants = cva(
	// Base classes for navigation icons
	['transition-colors duration-200'],
	{
		variants: {
			/**
			 * Color theme for the navigation icon.
			 * Limited to essential navigation colors for bundle optimization.
			 */
			color: NAVIGATION_COLORS,
			/**
			 * Active/inactive state for current page indication.
			 */
			active: {
				true: '',
				false: '',
			},
		},
		compoundVariants: [
			// Generate compound variants for navigation colors only
			...Object.keys(NAVIGATION_COLORS).flatMap((color) => [
				// Active state: use adaptive color for visual prominence
				{
					color: color as NavigationColorKey,
					active: true,
					class:
						color === 'brand'
							? 'text-adaptive-brand' // Brand uses special adaptive class
							: color === 'primary'
								? 'text-adaptive-emerald' // Primary maps to emerald
								: `text-adaptive-${color}`, // Standard adaptive pattern
				},
				// Inactive state: use neutral foreground for all colors
				{
					color: color as NavigationColorKey,
					active: false,
					class: 'text-primary-foreground',
				},
			]),
		],
		defaultVariants: {
			color: 'brand',
			active: false,
		},
	},
)

/**
 * Navigation label text variant styles with typography emphasis.
 *
 * Active labels receive both semantic color and font-weight emphasis to clearly indicate
 * the current page. Inactive labels use neutral colors to create visual hierarchy.
 *
 * Typography patterns:
 * - Active: Semantic color + bold font weight for emphasis
 * - Inactive: Neutral color + normal font weight for subtlety
 * - Small text size (text-xs) appropriate for mobile navigation
 *
 * @example
 * ```tsx
 * <span className={navigationLabelVariants({ color: 'brand', active: true })}>
 *   Home
 * </span>
 * ```
 */
export const navigationLabelVariants = cva(
	// Base classes for navigation labels
	['mt-1 text-xs transition-colors duration-200'],
	{
		variants: {
			/**
			 * Color theme for the navigation label text.
			 * Limited to essential navigation colors for bundle optimization.
			 */
			color: NAVIGATION_COLORS,
			/**
			 * Active/inactive state affecting both color and typography weight.
			 */
			active: {
				true: '',
				false: '',
			},
		},
		compoundVariants: [
			// Generate compound variants for navigation colors with typography emphasis
			...Object.keys(NAVIGATION_COLORS).flatMap((color) => [
				// Active state: use adaptive color + bold font for emphasis
				{
					color: color as NavigationColorKey,
					active: true,
					class:
						color === 'brand'
							? 'font-bold text-adaptive-brand' // Brand uses special adaptive class
							: color === 'primary'
								? 'font-bold text-adaptive-emerald' // Primary maps to emerald
								: `text-adaptive-${color} font-bold`, // Standard adaptive pattern
				},
				// Inactive state: use neutral foreground for all colors
				{
					color: color as NavigationColorKey,
					active: false,
					class: 'text-primary-foreground',
				},
			]),
		],
		defaultVariants: {
			color: 'brand',
			active: false,
		},
	},
)

// TypeScript type exports for component prop typing

/**
 * Type definition for navigationItemVariants props.
 * Use this when defining component props that accept navigation item styling options.
 */
export type NavigationItemVariants = VariantProps<typeof navigationItemVariants>

/**
 * Type definition for navigationIconVariants props.
 * Use this when defining component props that accept navigation icon styling options.
 */
export type NavigationIconVariants = VariantProps<typeof navigationIconVariants>

/**
 * Type definition for navigationLabelVariants props.
 * Use this when defining component props that accept navigation label styling options.
 */
export type NavigationLabelVariants = VariantProps<typeof navigationLabelVariants>

/**
 * Navigation-specific color variant type.
 * Limited to colors actually used in navigation for bundle optimization.
 */
export type NavigationColorVariant = NavigationColorKey
