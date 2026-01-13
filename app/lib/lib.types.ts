/**
 * @fileoverview Shared Type System for Tournado Application
 *
 * This file contains ONLY shared/generic type definitions used across the application.
 * Feature-specific types live in their respective feature modules (e.g., ~/features/teams/types).
 *
 * Key principles:
 * - Prefer branded types for domain-specific values
 * - Use union types for controlled sets of values
 * - Maintain database compatibility through helper functions
 * - NO re-exports - import directly from feature modules
 *
 * For detailed documentation, see: docs/development/type-system.md
 */
import type { CATEGORIES, DIVISIONS } from './lib.constants'

// ============================================================================
// Foundation Types (Shared)
// ============================================================================

/**
 * Branded type for email addresses with validation potential
 */
export type Email = string & { readonly brand: unique symbol }

// Icon Types

export type IconVariant = 'outlined' | 'filled'
export type IconWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700

/**
 * Standard icon sizes for consistency across the application
 */
export type IconSize = 12 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64

/**
 * Enhanced icon props with strict typing
 */
export type IconProps = {
  className?: string
  size?: IconSize
  weight?: IconWeight
  'aria-label'?: string
  'aria-hidden'?: boolean
}

/**
 * Toast error types for better error handling
 */
export type ToastErrorType =
  | 'validation' // Form validation errors
  | 'network' // Network-related errors
  | 'permission' // Permission/authorization errors
  | 'server' // Server-side errors
  | 'client' // Client-side errors
  | 'unknown' // Unknown/unclassified errors

/**
 * Enhanced toast types with error categorization
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | ToastErrorType

/**
 * Toast position options
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/**
 * Toast configuration per type
 */
export type ToastConfig = {
  position?: ToastPosition
  duration?: number
  priority?: 'low' | 'normal' | 'high'
}

/**
 * Functional semantic colors with specific meaning (success, error, warning, etc.)
 * These colors communicate state or intent to the user
 */
export type FunctionalSemantic =
  | 'brand'
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'disabled'

/**
 * Visual accent colors for design variety without functional meaning
 * Used for progressive disclosure (multi-step forms), role badges, feature areas
 */
export type VisualAccent =
  | 'accent-amber'
  | 'accent-indigo'
  | 'accent-fuchsia'
  | 'accent-teal'
  | 'accent-sky'
  | 'accent-purple'

/**
 * Semantic color accents for UI components
 * Combines functional semantics with visual accents
 * Prefer these in component props to ensure consistency with design system
 * @see app/styles/colors.css for semantic class definitions
 * @see ADR-0029 for two-tier semantic color system architecture
 */
export type SemanticAccent = FunctionalSemantic | VisualAccent

/**
 * Full color accent palette including raw Tailwind colors
 * Includes all official Tailwind CSS color names, plus semantic accents:
 * - 'brand' (maps to 'red')
 * - 'primary' (maps to 'emerald')
 *
 * Note: Prefer SemanticAccent for component props. Raw colors should be
 * mapped to semantic tokens in CVA/theme layer for consistency.
 */
export type ColorAccent =
  | SemanticAccent
  | 'slate'
  | 'red'
  | 'amber'
  | 'yellow'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'fuchsia'
  | 'lime'
  | 'disabled'

// ============================================================================
// Division & Category System (Shared)
// ============================================================================

/**
 * Supported locales across the application
 */
export type Locale = 'nl' | 'en' | 'de' | 'fr' | 'ar' | 'tr'

/**
 * Immutable localized labels for divisions, categories, and other i18n content
 */
export type LocalizedLabels = Readonly<Record<Locale, string>>

/**
 * Division configuration object for localization and metadata
 */
export type DivisionObject = {
  readonly value: string
  readonly labels: LocalizedLabels
  readonly order: number
}

// ============================================================================
// Category System
// ============================================================================

/**
 * Division enum values derived from constants (client-safe)
 */
export type Division = (typeof DIVISIONS)[keyof typeof DIVISIONS]['value']

/**
 * Category enum values derived from constants (client-safe)
 */
export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES]['value']

/**
 * Category configuration object for localization and metadata
 */
export type CategoryObject = {
  readonly value: string
  readonly labels: LocalizedLabels
  readonly order: number
  readonly ageGroup?: {
    readonly min: number
    readonly max: number
  }
  readonly gender?: 'MIXED' | 'BOYS' | 'GIRLS' | 'MEN' | 'WOMEN'
}
