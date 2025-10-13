import { cva, type VariantProps } from 'class-variance-authority'

import { type ColorVariantKey, createColorVariantMapping } from './colorVariants'

/**
 * Datatable container variants for data table wrapper styling.
 *
 * Provides consistent container styling for data tables with themed borders and backgrounds.
 * Uses subtle -50 backgrounds in light mode and -950 in dark mode for optimal content contrast.
 *
 * Pattern:
 * - Light mode: -200 borders with -50 backgrounds
 * - Dark mode: -800 borders with -950 backgrounds
 *
 * @example
 * ```tsx
 * <div className={datatableContainerVariants({ color: 'brand' })}>
 *   <table>...</table>
 * </div>
 * ```
 */
export const datatableContainerVariants = cva(
  // Base classes - container styling
  ['w-full overflow-hidden rounded-lg border'],
  {
    variants: {
      /**
       * Color theme variants for container borders and backgrounds.
       * Uses subtle colors appropriate for data table contexts.
       */
      color: createColorVariantMapping(
        color =>
          `border-${color}-200 bg-${color}-50 dark:border-${color}-800 dark:bg-${color}-950`
      ),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * Datatable header row variants for table headers.
 *
 * Provides themed styling for table header rows with stronger contrast than container.
 * Uses -100 backgrounds in light mode and -900 in dark mode for header emphasis.
 *
 * @example
 * ```tsx
 * <thead className={datatableHeaderVariants({ color: 'brand' })}>
 *   <tr>...</tr>
 * </thead>
 * ```
 */
export const datatableHeaderVariants = cva(
  // Base classes for header row
  ['border-b px-3 py-3'],
  {
    variants: {
      /**
       * Color theme variants for header styling with stronger contrast.
       */
      color: createColorVariantMapping(
        color =>
          `border-${color}-200 bg-${color}-100 dark:border-${color}-700 dark:bg-${color}-900`
      ),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * Datatable header text variants for table column headers.
 *
 * Provides styling for table header text with adaptive colors and consistent typography.
 * Uses small caps formatting typical for data table headers.
 *
 * @example
 * ```tsx
 * <th className={datatableHeaderTextVariants({ color: 'brand' })}>
 *   Column Header
 * </th>
 * ```
 */
export const datatableHeaderTextVariants = cva(
  // Base classes for header text
  ['text-xs font-medium uppercase tracking-wider'],
  {
    variants: {
      /**
       * Header text color variants using adaptive header classes.
       * Provides consistent text colors optimized for header readability.
       */
      color: createColorVariantMapping(color => `text-adaptive-${color}-header`),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * Datatable row variants for table data rows.
 *
 * Provides styling for interactive table rows with hover effects and theming.
 * Includes support for special row variants like the last row styling.
 *
 * Pattern:
 * - Light mode: -100 borders with -50 hover backgrounds
 * - Dark mode: -800 borders with -900/50 hover backgrounds
 *
 * @example
 * ```tsx
 * <tr className={datatableRowVariants({ color: 'brand', variant: 'default' })}>
 *   <td>Row content</td>
 * </tr>
 * ```
 */
export const datatableRowVariants = cva(
  // Base classes for data rows
  ['border-b transition-colors'],
  {
    variants: {
      /**
       * Color theme variants for row borders and hover states.
       * Uses subtle colors for non-intrusive row highlighting.
       */
      color: createColorVariantMapping(
        color => `border-${color}-100 dark:border-${color}-800`
      ),
      /**
       * Row layout variants for special positioning and alternating colors.
       */
      variant: {
        default: '',
        last: 'border-b-0 rounded-b-lg',
      },
      /**
       * Interaction variants for row clickability.
       * Controls cursor style based on whether the row is interactive.
       */
      interaction: {
        clickable: 'cursor-pointer',
        static: '',
      },
    },
    defaultVariants: {
      color: 'slate',
      variant: 'default',
      interaction: 'clickable',
    },
  }
)

// Datatable cell text styling
export const datatableCellTextVariants = cva(
  // Base classes for cell text
  [''],
  {
    variants: {
      variant: {
        primary: 'text-sm font-medium text-adaptive-cell-primary',
        secondary: 'text-sm text-adaptive-cell-secondary',
        muted: 'text-sm text-adaptive-cell-muted',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

// Datatable action button styling
export const datatableActionButtonVariants = cva(
  // Base classes for action buttons
  ['flex items-center justify-center rounded-full p-1 transition-colors duration-200'],
  {
    variants: {
      action: {
        delete:
          'text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300',
        edit: 'text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300',
        view: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300',
      },
    },
    defaultVariants: {
      action: 'view',
    },
  }
)

/**
 * Datatable delete area variants for mobile swipe actions.
 *
 * Provides styling for the delete area revealed during mobile swipe gestures.
 * Uses strong background colors to clearly indicate destructive actions.
 *
 * Design Pattern:
 * - Full screen width for easy touch targets
 * - Centered content layout
 * - Strong -500/-600 colors for clear action indication
 *
 * @example
 * ```tsx
 * <div className={datatableDeleteAreaVariants({ color: 'red' })}>
 *   <DeleteIcon />
 * </div>
 * ```
 */
export const datatableDeleteAreaVariants = cva(
  // Base classes for delete area
  ['flex w-screen flex-shrink-0 items-center justify-center'],
  {
    variants: {
      /**
       * Color variants for delete area backgrounds.
       * Limited to destructive action colors (red/brand).
       */
      color: {
        red: 'bg-red-500 dark:bg-red-600',
        brand: 'bg-brand-500 dark:bg-brand-600',
      },
    },
    defaultVariants: {
      color: 'red',
    },
  }
)

// TypeScript type exports for component prop typing

/**
 * Type definition for datatableContainerVariants props.
 * Use this when defining component props that accept datatable container styling options.
 */
export type DatatableContainerVariants = VariantProps<typeof datatableContainerVariants>

/**
 * Type definition for datatableHeaderVariants props.
 * Use this for datatable header row styling options.
 */
export type DatatableHeaderVariants = VariantProps<typeof datatableHeaderVariants>

/**
 * Type definition for datatableHeaderTextVariants props.
 * Use this for datatable header text styling options.
 */
export type DatatableHeaderTextVariants = VariantProps<
  typeof datatableHeaderTextVariants
>

/**
 * Type definition for datatableRowVariants props.
 * Use this for datatable row styling options.
 */
export type DatatableRowVariants = VariantProps<typeof datatableRowVariants>

/**
 * Type definition for datatableCellTextVariants props.
 * Use this for datatable cell text styling options.
 */
export type DatatableCellTextVariants = VariantProps<typeof datatableCellTextVariants>

/**
 * Type definition for datatableActionButtonVariants props.
 * Use this for datatable action button styling options.
 */
export type DatatableActionButtonVariants = VariantProps<
  typeof datatableActionButtonVariants
>

/**
 * Type definition for datatableDeleteAreaVariants props.
 * Use this for datatable delete area styling options.
 */
export type DatatableDeleteAreaVariants = VariantProps<
  typeof datatableDeleteAreaVariants
>

/**
 * Shared color variant key type for datatable components.
 * Ensures consistency with the design system's color palette.
 */
export type DatatableColorVariant = ColorVariantKey
