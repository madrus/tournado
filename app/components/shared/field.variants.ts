import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey, createColorVariantMapping } from './colorVariants'

/**
 * Shared positioning constants for field status icons.
 * Both success checkmarks and error icons use identical positioning.
 * Now positioned inline with labels rather than absolutely positioned.
 */
const FIELD_ICON_POSITIONING = {
  input: '',
  checkbox:
    'absolute top-8 right-1 rtl:right-auto rtl:left-1 md:top-8 md:right-2 md:rtl:right-auto md:rtl:left-2',
} as const

/**
 * Field validation checkmark variants for form field success states.
 *
 * Provides styling for checkmark icons that appear when form fields pass validation.
 * Uses semantic checkmark classes that adapt to light/dark themes automatically.
 *
 * Design Features:
 * - Positioned absolutely in top-right corner of field containers
 * - RTL-aware positioning for international layouts
 * - Circular background with consistent 24px dimensions
 * - Uses semantic checkmark-{color} classes for theme adaptation
 *
 * @example
 * ```tsx
 * <div className={fieldCheckmarkVariants({ color: 'primary' })}>
 *   <CheckIcon />
 * </div>
 * ```
 */
export const fieldCheckmarkVariants = cva(
  ['flex h-6 w-6 items-center justify-center rounded-full'],
  {
    variants: {
      /**
       * Color theme variants using semantic checkmark classes.
       * Each color uses checkmark-{color} for consistent validation styling.
       */
      color: createColorVariantMapping(color => `checkmark-${color}`),
    },
    defaultVariants: { color: 'primary' },
  }
)

/**
 * Field validation error icon variants for form field error states.
 *
 * Provides styling for error icons that appear when form fields fail validation.
 * Uses a single semantic error class that maintains consistent error styling
 * across all color themes.
 *
 * Design Features:
 * - Positioned absolutely in top-right corner of field containers
 * - RTL-aware positioning for international layouts
 * - Circular background with consistent 24px dimensions
 * - Single semantic field-error-icon class for unified error styling
 * - Color variants maintained for API consistency with checkmark pattern
 *
 * @example
 * ```tsx
 * <div className={fieldErrorIconVariants({ color: 'primary' })}>
 *   <ErrorIcon />
 * </div>
 * ```
 */
export const fieldErrorIconVariants = cva(
  [
    'flex h-6 w-6 items-center justify-center rounded-full',
    'field-error-icon', // Semantic class for error styling
  ],
  {
    variants: {
      /**
       * Color variants for consistency with checkmark pattern.
       * All colors use the same error styling via semantic class,
       * but variants are maintained for API consistency.
       */
      color: createColorVariantMapping(() => ''),
      /**
       * Field type variants for different input layouts.
       * - input: Standard input fields (text, select, etc.)
       * - checkbox: Checkbox agreement fields with complex layout
       */
      fieldType: FIELD_ICON_POSITIONING,
    },
    defaultVariants: {
      color: 'primary',
      fieldType: 'input',
    },
  }
)

// TypeScript type exports for component prop typing

/**
 * Type definition for fieldCheckmarkVariants props.
 * Use this when defining component props that accept field checkmark styling options.
 */
export type FieldCheckmarkVariants = VariantProps<typeof fieldCheckmarkVariants>

/**
 * Type definition for fieldErrorIconVariants props.
 * Use this when defining component props that accept field error icon styling options.
 */
export type FieldErrorIconVariants = VariantProps<typeof fieldErrorIconVariants>

/**
 * Shared color variant key type for field validation components.
 * Ensures consistency with the design system's color palette.
 */
export type FieldColorVariant = ColorVariantKey
