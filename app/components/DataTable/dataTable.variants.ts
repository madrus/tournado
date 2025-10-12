import { cva, type VariantProps } from 'class-variance-authority'

import {
  type ColorVariantKey,
  createColorVariantMapping,
} from '../shared/colorVariants'

/**
 * DataTable wrapper variants - integrates with existing datatable system
 */
export const dataTableWrapperVariants = cva(['w-full space-y-4'], {
  variants: {
    color: createColorVariantMapping(() => ''),
  },
  defaultVariants: {
    color: 'slate',
  },
})

/**
 * DataTable table element variants
 */
export const dataTableVariants = cva(['w-full border-collapse'], {
  variants: {
    color: createColorVariantMapping(() => ''),
  },
  defaultVariants: {
    color: 'slate',
  },
})

/**
 * DataTable header cell variants
 */
export const dataTableHeaderCellVariants = cva(
  [
    'h-12 px-4 text-left align-middle font-medium',
    'transition-colors',
    '[&:has([role=checkbox])]:pr-0',
  ],
  {
    variants: {
      color: createColorVariantMapping(() => ''),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * DataTable body cell variants
 */
export const dataTableCellVariants = cva(
  ['px-4 py-3 align-middle', '[&:has([role=checkbox])]:pr-0'],
  {
    variants: {
      color: createColorVariantMapping(() => ''),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * DataTable toolbar variants
 */
export const dataTableToolbarVariants = cva(
  ['flex items-center justify-between gap-4'],
  {
    variants: {
      color: createColorVariantMapping(() => ''),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

/**
 * DataTable filter input variants
 */
export const dataTableFilterInputVariants = cva(
  [
    'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
    'bg-background border-border text-foreground',
    'placeholder:text-foreground-lighter',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      color: createColorVariantMapping(() => ''),
    },
    defaultVariants: {
      color: 'slate',
    },
  }
)

// Type exports
export type DataTableWrapperVariants = VariantProps<typeof dataTableWrapperVariants>
export type DataTableVariants = VariantProps<typeof dataTableVariants>
export type DataTableHeaderCellVariants = VariantProps<
  typeof dataTableHeaderCellVariants
>
export type DataTableCellVariants = VariantProps<typeof dataTableCellVariants>
export type DataTableToolbarVariants = VariantProps<typeof dataTableToolbarVariants>
export type DataTableFilterInputVariants = VariantProps<
  typeof dataTableFilterInputVariants
>
export type DataTableColorVariant = ColorVariantKey
