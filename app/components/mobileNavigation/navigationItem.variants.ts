import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey, createColorVariantObject } from '../shared/colorVariants'

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
       * - brand: Primary brand color (red) for key navigation items
       * - primary: Secondary brand color (emerald) for default items
       * - Other colors: Extended palette for specialized navigation contexts
       */
      color: createColorVariantObject(),
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
  }
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
       * Maps to semantic CSS classes that handle light/dark theme adaptation.
       */
      color: createColorVariantObject(),
      /**
       * Active/inactive state for current page indication.
       */
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Brand color active/inactive states - primary accent color
      {
        color: 'brand',
        active: true,
        class: 'text-adaptive-brand', // Semantic brand color class
      },
      {
        color: 'brand',
        active: false,
        class: 'text-primary-foreground', // Neutral inactive color
      },
      // Primary color active/inactive states - secondary brand color (emerald)
      {
        color: 'primary',
        active: true,
        class: 'text-adaptive-emerald', // Semantic emerald color class
      },
      {
        color: 'primary',
        active: false,
        class: 'text-primary-foreground', // Neutral inactive color
      },
      // Additional color variants can be added as needed following the same pattern
    ],
    defaultVariants: {
      color: 'brand',
      active: false,
    },
  }
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
       * Uses semantic classes that adapt to light/dark themes.
       */
      color: createColorVariantObject(),
      /**
       * Active/inactive state affecting both color and typography weight.
       */
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Brand color active/inactive states with typography emphasis
      {
        color: 'brand',
        active: true,
        class: 'text-adaptive-brand font-bold', // Brand color + bold for active state
      },
      {
        color: 'brand',
        active: false,
        class: 'text-primary-foreground', // Neutral color for inactive state
      },
      // Primary color active/inactive states
      {
        color: 'primary',
        active: true,
        class: 'text-adaptive-emerald font-bold', // Emerald color + bold for active state
      },
      {
        color: 'primary',
        active: false,
        class: 'text-primary-foreground', // Neutral color for inactive state
      },
      // Additional color variants follow the same active/inactive pattern
    ],
    defaultVariants: {
      color: 'brand',
      active: false,
    },
  }
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
 * Shared color variant key type for navigation components.
 * Ensures consistency with the design system's color palette.
 */
export type NavigationColorVariant = ColorVariantKey
