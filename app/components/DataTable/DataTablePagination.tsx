import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { cn } from '~/utils/misc'

type DataTablePaginationProps = {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  hasPrevPage: boolean
  hasNextPage: boolean
  className?: string
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  hasPrevPage,
  hasNextPage,
  className,
}: DataTablePaginationProps): JSX.Element {
  const { t } = useTranslation()
  const { latinFontClass } = useLanguageDirection()

  // Handle empty results: show "0–0 of 0" instead of "1–0 of 0"
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = total === 0 ? 0 : Math.min(currentPage * pageSize, total)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 px-3.5 pt-4 md:flex-row',
        className
      )}
    >
      {/* Row count info */}
      <div className='text-foreground text-base'>
        {t('common.pagination.showing', {
          from,
          to,
          total,
        })
          .split(/(\d+)/)
          .map((part, index) =>
            /^\d+$/.test(part) ? (
              <span key={index} className={latinFontClass}>
                {part}
              </span>
            ) : (
              part
            )
          )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 ? (
        <nav
          className='flex items-center gap-2 self-end md:self-auto'
          aria-label={t('common.pagination.ariaLabel', {
            defaultValue: 'Pagination',
          })}
        >
          {hasPrevPage ? (
            <Link
              to={`?page=${currentPage - 1}`}
              className='bg-background hover:bg-accent border-border rounded border px-3 py-1 text-sm transition-colors'
            >
              {t('common.pagination.previous')}
            </Link>
          ) : (
            <button
              disabled
              className='bg-muted text-muted-foreground border-border cursor-not-allowed rounded border px-3 py-1 text-sm'
            >
              {t('common.pagination.previous')}
            </button>
          )}

          <span className='text-foreground flex items-center px-3 py-1 text-sm'>
            {t('common.pagination.pageInfo', {
              current: currentPage,
              total: totalPages,
            })
              .split(/(\d+)/)
              .map((part, index) =>
                /^\d+$/.test(part) ? (
                  <span key={index} className={latinFontClass}>
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
          </span>

          {hasNextPage ? (
            <Link
              to={`?page=${currentPage + 1}`}
              className='bg-background hover:bg-accent border-border rounded border px-3 py-1 text-sm transition-colors'
            >
              {t('common.pagination.next')}
            </Link>
          ) : (
            <button
              disabled
              className='bg-muted text-muted-foreground border-border cursor-not-allowed rounded border px-3 py-1 text-sm'
            >
              {t('common.pagination.next')}
            </button>
          )}
        </nav>
      ) : null}
    </div>
  )
}
