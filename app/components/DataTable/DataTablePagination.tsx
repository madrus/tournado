import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Table } from '@tanstack/react-table'

import { cn } from '~/utils/misc'

type DataTablePaginationProps<TData> = {
  table?: Table<TData>
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  hasPrevPage: boolean
  hasNextPage: boolean
  className?: string
}

export function DataTablePagination<TData>({
  currentPage,
  totalPages,
  pageSize,
  total,
  hasPrevPage,
  hasNextPage,
  className,
}: DataTablePaginationProps<TData>): JSX.Element {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 px-3.5 pt-4 sm:flex-row',
        className
      )}
    >
      {/* Row count info */}
      <div className='text-foreground text-base'>
        {t('common.pagination.showing', {
          from: (currentPage - 1) * pageSize + 1,
          to: Math.min(currentPage * pageSize, total),
          total,
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 ? (
        <div className='flex items-center gap-2 self-end sm:self-auto'>
          {hasPrevPage ? (
            <Link
              to={`?page=${currentPage - 1}`}
              className='bg-background hover:bg-accent rounded border border-slate-300 px-3 py-1 text-sm transition-colors dark:border-slate-700'
            >
              {t('common.pagination.previous')}
            </Link>
          ) : (
            <button
              disabled
              className='cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
            >
              {t('common.pagination.previous')}
            </button>
          )}

          <span className='text-foreground flex items-center px-3 py-1 text-sm'>
            {t('common.pagination.pageInfo', {
              current: currentPage,
              total: totalPages,
            })}
          </span>

          {hasNextPage ? (
            <Link
              to={`?page=${currentPage + 1}`}
              className='bg-background hover:bg-accent rounded border border-slate-300 px-3 py-1 text-sm transition-colors dark:border-slate-700'
            >
              {t('common.pagination.next')}
            </Link>
          ) : (
            <button
              disabled
              className='cursor-not-allowed rounded border border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
            >
              {t('common.pagination.next')}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
