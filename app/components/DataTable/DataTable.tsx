import { JSX, ReactNode } from 'react'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'

import { cn } from '~/utils/misc'

import {
  type DatatableColorVariant,
  datatableContainerVariants,
  datatableRowVariants,
} from '../shared/datatable.variants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'

/**
 * Helper to generate header background classes.
 * Returns static Tailwind classes for header row.
 * Should be lighter than first row in light mode, darker in dark mode:
 * Light mode: white (lightest)
 * Dark mode: -950 (darker than -900)
 */
function getHeaderClasses(color: DatatableColorVariant): string {
  const headerClasses: Record<DatatableColorVariant, string> = {
    slate: 'bg-white dark:bg-slate-950',
    teal: 'bg-white dark:bg-teal-950',
    brand: 'bg-white dark:bg-brand-950',
    primary: 'bg-white dark:bg-primary-950',
    emerald: 'bg-white dark:bg-emerald-950',
    blue: 'bg-white dark:bg-blue-950',
    red: 'bg-white dark:bg-red-950',
    cyan: 'bg-white dark:bg-cyan-950',
    yellow: 'bg-white dark:bg-yellow-950',
    green: 'bg-white dark:bg-green-950',
    violet: 'bg-white dark:bg-violet-950',
    zinc: 'bg-white dark:bg-zinc-950',
    orange: 'bg-white dark:bg-orange-950',
    amber: 'bg-white dark:bg-amber-950',
    lime: 'bg-white dark:bg-lime-950',
    sky: 'bg-white dark:bg-sky-950',
    indigo: 'bg-white dark:bg-indigo-950',
    purple: 'bg-white dark:bg-purple-950',
    fuchsia: 'bg-white dark:bg-fuchsia-950',
    pink: 'bg-white dark:bg-pink-950',
    rose: 'bg-white dark:bg-rose-950',
  }
  return headerClasses[color]
}

/**
 * Helper to generate stripe classes for alternating row colors.
 * Returns static Tailwind classes based on color and stripe type.
 * Pattern (based on index % 2 === 1 being "even"):
 * - isEven=true (indices 1,3,5...): white in light, -950 in dark (lighter rows)
 * - isEven=false (indices 0,2,4...): -100 in light, -900 in dark (darker rows)
 */
function getStripeClasses(color: DatatableColorVariant, isEven: boolean): string {
  // isEven=true: lighter rows (white in light, -950 in dark)
  const evenClasses: Record<DatatableColorVariant, string> = {
    slate: 'bg-white hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800',
    teal: 'bg-white hover:bg-teal-200 dark:bg-teal-950 dark:hover:bg-teal-800',
    brand: 'bg-white hover:bg-brand-200 dark:bg-brand-950 dark:hover:bg-brand-800',
    primary:
      'bg-white hover:bg-primary-200 dark:bg-primary-950 dark:hover:bg-primary-800',
    emerald:
      'bg-white hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-800',
    blue: 'bg-white hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-800',
    red: 'bg-white hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-800',
    cyan: 'bg-white hover:bg-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-800',
    yellow: 'bg-white hover:bg-yellow-200 dark:bg-yellow-950 dark:hover:bg-yellow-800',
    green: 'bg-white hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-800',
    violet: 'bg-white hover:bg-violet-200 dark:bg-violet-950 dark:hover:bg-violet-800',
    zinc: 'bg-white hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800',
    orange: 'bg-white hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-800',
    amber: 'bg-white hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-800',
    lime: 'bg-white hover:bg-lime-200 dark:bg-lime-950 dark:hover:bg-lime-800',
    sky: 'bg-white hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-800',
    indigo: 'bg-white hover:bg-indigo-200 dark:bg-indigo-950 dark:hover:bg-indigo-800',
    purple: 'bg-white hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-800',
    fuchsia:
      'bg-white hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:hover:bg-fuchsia-800',
    pink: 'bg-white hover:bg-pink-200 dark:bg-pink-950 dark:hover:bg-pink-800',
    rose: 'bg-white hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-800',
  }

  // isEven=false: darker rows (-100 in light, -900 in dark)
  const oddClasses: Record<DatatableColorVariant, string> = {
    slate: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800',
    teal: 'bg-teal-100 hover:bg-teal-200 dark:bg-teal-900 dark:hover:bg-teal-800',
    brand: 'bg-brand-100 hover:bg-brand-200 dark:bg-brand-900 dark:hover:bg-brand-800',
    primary:
      'bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:hover:bg-primary-800',
    emerald:
      'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800',
    blue: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800',
    red: 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800',
    cyan: 'bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900 dark:hover:bg-cyan-800',
    yellow:
      'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800',
    green: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800',
    violet:
      'bg-violet-100 hover:bg-violet-200 dark:bg-violet-900 dark:hover:bg-violet-800',
    zinc: 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800',
    orange:
      'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800',
    amber: 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800',
    lime: 'bg-lime-100 hover:bg-lime-200 dark:bg-lime-900 dark:hover:bg-lime-800',
    sky: 'bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800',
    indigo:
      'bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800',
    purple:
      'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800',
    fuchsia:
      'bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-900 dark:hover:bg-fuchsia-800',
    pink: 'bg-pink-100 hover:bg-pink-200 dark:bg-pink-900 dark:hover:bg-pink-800',
    rose: 'bg-rose-100 hover:bg-rose-200 dark:bg-rose-900 dark:hover:bg-rose-800',
  }

  return isEven ? evenClasses[color] : oddClasses[color]
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  // eslint-disable-next-line id-blacklist
  data: TData[]
  color?: DatatableColorVariant

  // Sorting
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>

  // Pagination
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  pageCount?: number
  manualPagination?: boolean

  // Column visibility
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  // Global filter
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>

  // Custom rendering
  renderMobileRow?: (row: TData, index: number) => ReactNode
  onRowClick?: (row: TData) => void

  // Styling
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: TData, index: number) => string)

  // Empty state
  emptyState?: ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  // eslint-disable-next-line id-blacklist
  data,
  color = 'slate',
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  pageCount,
  manualPagination = false,
  columnVisibility,
  onColumnVisibilityChange,
  globalFilter,
  onGlobalFilterChange,
  renderMobileRow,
  onRowClick,
  className,
  headerClassName,
  rowClassName,
  emptyState,
}: DataTableProps<TData, TValue>): JSX.Element {
  const table = useReactTable({
    // eslint-disable-next-line id-blacklist
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    onGlobalFilterChange,
    manualPagination,
    pageCount,
    state: {
      sorting,
      ...(pagination && { pagination }),
      ...(columnVisibility && { columnVisibility }),
      ...(globalFilter !== undefined && { globalFilter }),
    },
  })

  const rows = table.getRowModel().rows

  // eslint-disable-next-line id-blacklist
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn(datatableContainerVariants({ color }), className)}>
      {/* Desktop table - using ShadCN Table primitives */}
      <div className='hidden overflow-hidden rounded-lg md:block'>
        <Table>
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className={getHeaderClasses(color)}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const isLast = index === rows.length - 1
              const isEven = index % 2 === 1 // 1,3,5... are "even" (darker -100)

              return (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={event => {
                    if ((event.key === 'Enter' || event.key === ' ') && onRowClick) {
                      event.preventDefault()
                      onRowClick(row.original)
                    }
                  }}
                  tabIndex={onRowClick ? 0 : -1}
                  role={onRowClick ? 'button' : undefined}
                  className={cn(
                    datatableRowVariants({
                      color,
                      variant: isLast ? 'last' : 'default',
                      interaction: onRowClick ? 'clickable' : 'static',
                    }),
                    getStripeClasses(color, isEven), // First row (0) gets false = odd (-50)
                    onRowClick &&
                      'focus-visible:ring-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    typeof rowClassName === 'function'
                      ? rowClassName(row.original, index)
                      : rowClassName
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - custom component */}
      <div className='md:hidden'>
        {rows.map((row, index) => {
          const isLast = index === rows.length - 1
          const isEven = index % 2 === 1 // 1,3,5... are "even" (darker -100)

          return (
            <div
              key={row.id}
              className={cn(
                datatableRowVariants({
                  color,
                  variant: isLast ? 'last' : 'default',
                }),
                getStripeClasses(color, isEven), // First row (0) gets false = odd (-50)
                typeof rowClassName === 'function'
                  ? rowClassName(row.original, index)
                  : rowClassName
              )}
            >
              {renderMobileRow ? renderMobileRow(row.original, index) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
