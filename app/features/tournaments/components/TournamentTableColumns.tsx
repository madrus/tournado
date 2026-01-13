import { Text } from '@radix-ui/themes'
import type { ColumnDef } from '@tanstack/react-table'
import type { JSX } from 'react'
import { DataTableColumnHeader } from '~/components/DataTable'
import {
  datatableActionButtonVariants,
  datatableCellTextVariants,
} from '~/components/DataTable/dataTable.variants'
import { DeleteIcon } from '~/components/icons'
import type { TournamentListItem } from '~/features/tournaments/types'
import { cn } from '~/utils/misc'

type ColumnContext = {
  t: (key: string) => string
  formatDate: (date: Date | string) => string
  onDelete: (id: string) => void
  latinFontClass: string
}

export function createTournamentColumns(
  context: ColumnContext,
): ColumnDef<TournamentListItem>[] {
  const { t, formatDate, onDelete, latinFontClass } = context

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('tournaments.name')} />
      ),
      cell: ({ row }) => (
        <div>
          <Text
            size='2'
            weight='medium'
            className={cn(
              datatableCellTextVariants({
                variant: 'primary',
              }),
              latinFontClass,
            )}
          >
            {row.original.name}
          </Text>
          <div className='mt-1'>
            <Text
              size='1'
              className={cn(
                datatableCellTextVariants({
                  variant: 'secondary',
                }),
                latinFontClass,
              )}
            >
              {row.original.location}
            </Text>
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('tournaments.startDate')} />
      ),
      cell: ({ row }) => (
        <Text
          size='2'
          className={datatableCellTextVariants({
            variant: 'secondary',
          })}
        >
          {formatDate(row.original.startDate)
            .split(/(\d+)/)
            .map((part, index) =>
              /^\d+$/.test(part) ? (
                <span key={`start-${index}-${part}`} className={latinFontClass}>
                  {part}
                </span>
              ) : (
                part
              ),
            )}
        </Text>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.startDate).getTime()
        const dateB = new Date(rowB.original.startDate).getTime()
        return dateA - dateB
      },
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('tournaments.endDate')} />
      ),
      cell: ({ row }) => (
        <Text
          size='2'
          className={datatableCellTextVariants({
            variant: 'secondary',
          })}
        >
          {row.original.endDate
            ? formatDate(row.original.endDate)
                .split(/(\d+)/)
                .map((part, index) =>
                  /^\d+$/.test(part) ? (
                    <span key={`end-${index}-${part}`} className={latinFontClass}>
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )
            : '-'}
        </Text>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.endDate
          ? new Date(rowA.original.endDate).getTime()
          : 0
        const dateB = rowB.original.endDate
          ? new Date(rowB.original.endDate).getTime()
          : 0
        return dateA - dateB
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className='flex w-6 items-center justify-center'>
          <span className='sr-only'>{t('common.actions.actions')}</span>
          <DeleteIcon className='h-4 w-4' aria-hidden='true' />
        </div>
      ),
      cell: ({ row }): JSX.Element => (
        <div className='flex w-6 items-center justify-center'>
          <button
            onClick={event => {
              event.stopPropagation()
              onDelete(row.original.id)
            }}
            className={datatableActionButtonVariants({
              action: 'delete',
            })}
            title={t('tournaments.deleteTournament')}
            aria-label={t('tournaments.deleteTournament')}
            type='button'
          >
            <DeleteIcon className='h-4 w-4' aria-hidden='true' />
          </button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
