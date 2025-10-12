import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { Table } from '@tanstack/react-table'

import { ChevronLeftIcon, ChevronRightIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  totalCount?: number
  className?: string
}

export function DataTablePagination<TData>({
  table,
  totalCount,
  className,
}: DataTablePaginationProps<TData>): JSX.Element {
  const { t } = useTranslation()

  const currentPage = table.getState().pagination.pageIndex + 1
  const pageCount = table.getPageCount()
  const pageSize = table.getState().pagination.pageSize
  const rowCount = totalCount ?? table.getFilteredRowModel().rows.length

  const showingFrom = (currentPage - 1) * pageSize + 1
  const showingTo = Math.min(currentPage * pageSize, rowCount)

  return (
    <div
      className={cn(
        'border-border flex items-center justify-between border-t px-6 py-4',
        className
      )}
    >
      <div className='text-foreground-light text-sm'>
        {t('common.pagination.showing', {
          from: showingFrom,
          to: showingTo,
          total: rowCount,
        })}
      </div>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={cn(
            'rounded border px-3 py-1 text-sm transition-colors',
            'focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            table.getCanPreviousPage()
              ? 'bg-background border-border hover:bg-accent cursor-pointer'
              : 'border-border/50 bg-muted text-foreground-lighter cursor-not-allowed'
          )}
          aria-label={t('common.pagination.previous')}
        >
          <span className='flex items-center gap-1'>
            <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
            <span>{t('common.pagination.previous')}</span>
          </span>
        </button>
        <span className='text-foreground flex items-center px-3 py-1 text-sm'>
          {t('common.pagination.pageInfo', { current: currentPage, total: pageCount })}
        </span>
        <button
          type='button'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={cn(
            'rounded border px-3 py-1 text-sm transition-colors',
            'focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            table.getCanNextPage()
              ? 'bg-background border-border hover:bg-accent cursor-pointer'
              : 'border-border/50 bg-muted text-foreground-lighter cursor-not-allowed'
          )}
          aria-label={t('common.pagination.next')}
        >
          <span className='flex items-center gap-1'>
            <span>{t('common.pagination.next')}</span>
            <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
          </span>
        </button>
      </div>
    </div>
  )
}
