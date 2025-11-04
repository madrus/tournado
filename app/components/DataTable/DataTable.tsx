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
  getDatatableHeaderClasses,
  getDatatableStripeClasses,
} from './dataTable.variants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table'

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
              <TableRow
                key={headerGroup.id}
                className={getDatatableHeaderClasses(color)}
              >
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
              const isEven = index % 2 === 1 // 1,3,5... are "even" (lighter - white/-950)

              return (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={event => {
                    // Check if event came from an interactive element
                    const target = event.target as HTMLElement
                    const isInteractiveElement = target.closest(
                      'button, input, select, textarea, [role="button"], [role="combobox"], [role="tab"]'
                    )

                    if (event.key === 'Enter' && onRowClick && !isInteractiveElement) {
                      event.preventDefault()
                      onRowClick(row.original)
                    }

                    // Handle Space on keyDown to prevent page scroll
                    if (
                      (event.key === ' ' || event.key === 'Spacebar') &&
                      onRowClick &&
                      !isInteractiveElement
                    ) {
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
                    getDatatableStripeClasses(color, isEven), // First row (0) gets false = odd (-100)
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
          const isEven = index % 2 === 1 // 1,3,5... are "even" (lighter - white/-950)

          return (
            <div
              key={row.id}
              className={cn(
                datatableRowVariants({
                  color,
                  variant: isLast ? 'last' : 'default',
                }),
                getDatatableStripeClasses(color, isEven), // First row (0) gets false = odd (-100)
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
