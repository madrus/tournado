import { JSX, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Table } from '@tanstack/react-table'

import { CloseIcon, SearchIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

import {
  dataTableFilterInputVariants,
  dataTableToolbarVariants,
} from './dataTable.variants'
import { DataTableViewOptions } from './DataTableViewOptions'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  children?: ReactNode
  className?: string
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder,
  children,
  className,
}: DataTableToolbarProps<TData>): JSX.Element {
  const { t } = useTranslation()
  const isFiltered = table.getState().columnFilters.length > 0

  const column = searchColumn ? table.getColumn(searchColumn) : undefined

  return (
    <div className={cn(dataTableToolbarVariants(), className)}>
      <div className='flex flex-1 items-center gap-2'>
        {column ? (
          <div className='relative flex-1 md:max-w-sm'>
            <SearchIcon
              className='text-foreground-lighter absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
              aria-hidden='true'
            />
            <input
              type='text'
              placeholder={searchPlaceholder || t('datatable.search', 'Search...')}
              value={(column.getFilterValue() as string) ?? ''}
              onChange={event => column.setFilterValue(event.target.value)}
              className={cn(dataTableFilterInputVariants(), 'pl-9')}
            />
            {column.getFilterValue() ? (
              <button
                type='button'
                onClick={() => column.setFilterValue('')}
                className='hover:bg-accent absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1'
                aria-label={t('datatable.clearSearch', 'Clear search')}
              >
                <CloseIcon className='h-4 w-4' aria-hidden='true' />
              </button>
            ) : null}
          </div>
        ) : null}
        {children}
        {isFiltered ? (
          <button
            type='button'
            onClick={() => table.resetColumnFilters()}
            className='border-border bg-background hover:bg-accent rounded-md border px-3 py-2 text-sm transition-colors'
          >
            {t('datatable.resetFilters', 'Reset')}
          </button>
        ) : null}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
