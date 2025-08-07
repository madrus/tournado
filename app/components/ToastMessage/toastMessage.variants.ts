import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Toast type variant type for consistent typing across the application.
 */
import type { ToastType } from '~/lib/lib.types'

/**
 * Toast message variants for notification display components.
 *
 * Provides styled toast notifications with different types (success, error, info, warning).
 * Features consistent styling with proper color coordination between backgrounds and icon colors.
 *
 * Design Features:
 * - Type-specific color theming (emerald, red, sky, orange)
 * - Clean borderless design with colored shadows
 * - Light mode: Dark colored shadows matching toast themes for visibility
 * - Dark mode: Medium white shadows for balanced definition
 * - Icon color coordination with toast backgrounds
 * - Proper contrast for accessibility
 *
 * @example
 * ```tsx
 * <div className={toastMessageVariants({ type: 'success' })}>
 *   Toast content
 * </div>
 * ```
 */
export const toastMessageVariants = cva(
  // Base classes for all toast messages
  [
    'pointer-events-auto flex w-full max-w-sm min-w-sm items-start gap-3 rounded-lg p-4',
  ],
  {
    variants: {
      /**
       * Toast type variants with coordinated background, text colors, and shadows.
       *
       * - success: Emerald theming with dark emerald shadows in light mode, medium white shadows in dark mode
       * - error: Red theming with dark red shadows in light mode, medium white shadows in dark mode
       * - info: Sky theming with dark sky shadows in light mode, medium white shadows in dark mode
       * - warning: Orange theming with dark orange shadows in light mode, medium white shadows in dark mode
       */
      type: {
        success: [
          'bg-emerald-600',
          'text-white',
          'shadow-lg shadow-emerald-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        error: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        network: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        permission: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        server: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        client: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        unknown: [
          'bg-red-600',
          'text-white',
          'shadow-lg shadow-red-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        info: [
          'bg-sky-600',
          'text-white',
          'shadow-lg shadow-sky-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        warning: [
          'bg-orange-600',
          'text-white',
          'shadow-lg shadow-orange-900/40 dark:shadow-md dark:shadow-white/20',
        ],
        validation: [
          'bg-orange-600',
          'text-white',
          'shadow-lg shadow-orange-900/40 dark:shadow-md dark:shadow-white/20',
        ],
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
)

/**
 * Toast icon wrapper variants for icon container styling.
 *
 * Provides consistent sizing and positioning for toast icons.
 * Success icons get white circular backgrounds, while shaped icons (circles, triangles) render directly.
 *
 * @example
 * ```tsx
 * <div className={toastIconVariants({ type: 'success', hasBackground: true })}>
 *   <SuccessIcon />
 * </div>
 * ```
 */
export const toastIconVariants = cva(
  // Base classes for all toast icons
  ['flex h-6 w-6 items-center justify-center'],
  {
    variants: {
      hasBackground: {
        true: 'rounded-full bg-white',
        false: '',
      },
      type: {
        success: 'text-emerald-600',
        error: 'text-red-600',
        network: 'text-red-600',
        permission: 'text-red-600',
        server: 'text-red-600',
        client: 'text-red-600',
        unknown: 'text-red-600',
        info: 'text-sky-600',
        warning: 'text-orange-600',
        validation: 'text-orange-600',
      },
    },
    defaultVariants: {
      hasBackground: false,
      type: 'info',
    },
  }
)

/**
 * Toast close button variants for close button styling.
 *
 * Provides consistent styling for close buttons with proper theming based on toast type.
 * Uses opacity states for hover interactions.
 *
 * @example
 * ```tsx
 * <button className={toastCloseButtonVariants({ type: 'success' })}>
 *   <CloseIcon />
 * </button>
 * ```
 */
export const toastCloseButtonVariants = cva(
  // Base classes for all close buttons
  [
    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100',
  ],
  {
    variants: {
      type: {
        success: 'text-white',
        error: 'text-white',
        network: 'text-white',
        permission: 'text-white',
        server: 'text-white',
        client: 'text-white',
        unknown: 'text-white',
        info: 'text-white',
        warning: 'text-white',
        validation: 'text-white',
      },
    },
    defaultVariants: {
      type: 'info',
    },
  }
)

// TypeScript type exports for component prop typing

/**
 * Type definition for toastMessageVariants props.
 * Use this when defining component props that accept toast message styling options.
 */
export type ToastMessageVariants = VariantProps<typeof toastMessageVariants>

/**
 * Type definition for toastIconVariants props.
 * Use this for icon wrapper styling within toast messages.
 */
export type ToastIconVariants = VariantProps<typeof toastIconVariants>

/**
 * Type definition for toastCloseButtonVariants props.
 * Use this for close button styling within toast messages.
 */
export type ToastCloseButtonVariants = VariantProps<typeof toastCloseButtonVariants>

export type { ToastType }
