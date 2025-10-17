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
 * Color accent options for UI components
 * Includes all official Tailwind CSS color names, plus:
 * - 'brand' (maps to 'red')
 * - 'primary' (maps to 'emerald')
 */
export type ColorAccent =
  | 'brand' // special: maps to 'red'
  | 'primary' // special: maps to 'emerald'
  | 'slate'
  | 'zinc'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'

// ============================================================================
// Division & Category System (Shared)
// ============================================================================

/**
 * Division configuration object for localization and metadata
 */
export type DivisionObject = {
  value: string
  labels: {
    nl: string
    en: string
    de: string
    fr: string
    ar: string
    tr: string
  }
  order: number
}

// ============================================================================
// Category System
// ============================================================================

/**
 * Category configuration object for localization and metadata
 */
export type CategoryObject = {
  value: string
  labels: {
    nl: string
    en: string
    de: string
    fr: string
    ar: string
    tr: string
  }
  order: number
  ageGroup?: {
    min: number
    max: number
  }
  gender?: 'MIXED' | 'BOYS' | 'GIRLS' | 'MEN' | 'WOMEN'
}
