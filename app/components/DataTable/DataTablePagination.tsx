import type { JSX } from 'react'
import { useMemo } from 'react'
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

  // Generate stable keys and split text parts in a single pass
  const showingText = t('common.pagination.showing', { from, to, total })
  const pageInfoText = t('common.pagination.pageInfo', {
    current: currentPage,
    total: totalPages,
  })

  const showingPartsWithKeys = useMemo(
    () =>
      showingText.split(/(\d+)/).map((part, index) => ({
        part,
        key: index,
        isNumber: /^\d+$/.test(part),
      })),
    [showingText],
  )
  const pageInfoPartsWithKeys = useMemo(
    () =>
      pageInfoText.split(/(\d+)/).map((part, index) => ({
        part,
        key: index,
        isNumber: /^\d+$/.test(part),
      })),
    [pageInfoText],
  )

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 px-3.5 pt-4 md:flex-row',
        className,
      )}
    >
      {/* Row count info */}
      <div className='text-foreground text-sm'>
        {showingPartsWithKeys.map(({ part, key, isNumber }) =>
          isNumber ? (
            <span key={key} className={latinFontClass}>
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 ? (
        <nav
          className='flex items-center gap-2 self-end md:self-auto'
          aria-label={'Pagination'}
        >
          {hasPrevPage ? (
            <Link
              to={`?page=${currentPage - 1}`}
              className='rounded border border-border bg-background px-3 py-1 text-sm transition-colors hover:bg-neutral'
            >
              {t('common.pagination.previous')}
            </Link>
          ) : (
            <button
              type='button'
              disabled
              className='cursor-not-allowed rounded border border-border bg-muted px-3 py-1 text-muted-foreground text-sm'
            >
              {t('common.pagination.previous')}
            </button>
          )}

          <span className='flex items-center px-3 py-1 text-foreground text-sm'>
            {pageInfoPartsWithKeys.map(({ part, key, isNumber }) =>
              isNumber ? (
                <span key={key} className={latinFontClass}>
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </span>

          {hasNextPage ? (
            <Link
              to={`?page=${currentPage + 1}`}
              className='rounded border border-border bg-background px-3 py-1 text-sm transition-colors hover:bg-neutral'
            >
              {t('common.pagination.next')}
            </Link>
          ) : (
            <button
              type='button'
              disabled
              className='cursor-not-allowed rounded border border-border bg-muted px-3 py-1 text-muted-foreground text-sm'
            >
              {t('common.pagination.next')}
            </button>
          )}
        </nav>
      ) : null}
    </div>
  )
}
