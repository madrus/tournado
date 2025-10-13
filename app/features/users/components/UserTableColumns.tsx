import { JSX } from 'react'

import type { User } from '@prisma/client'
import { Text } from '@radix-ui/themes'
import { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '~/components/DataTable'
import { EditIcon } from '~/components/icons'
import {
  datatableActionButtonVariants,
  datatableCellTextVariants,
} from '~/components/shared/datatable.variants'
import { cn } from '~/utils/misc'

import { getRoleBadgeVariant } from '../utils/roleUtils'
import { RoleDropdown } from './RoleDropdown'

type ColumnContext = {
  t: (key: string, options?: Record<string, unknown>) => string
  formatDate: (date: Date | string) => string
  onEdit: (id: string) => void
}

export function createUserColumns(context: ColumnContext): ColumnDef<User>[] {
  const { t, formatDate, onEdit } = context

  return [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('users.fields.email')} />
      ),
      cell: ({ row }) => (
        <div>
          <Text
            size='3'
            className={datatableCellTextVariants({
              variant: 'secondary',
            })}
          >
            {row.original.email}
          </Text>
          {!row.original.active ? (
            <div className='mt-1'>
              <Text
                size='1'
                className={cn(
                  'text-destructive',
                  datatableCellTextVariants({
                    variant: 'secondary',
                  })
                )}
              >
                {t('users.messages.deactivated')}
              </Text>
            </div>
          ) : null}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'displayName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('users.fields.displayName')} />
      ),
      cell: ({ row }) => (
        <Text
          size='3'
          className={datatableCellTextVariants({
            variant: 'secondary',
          })}
        >
          {row.original.displayName || '-'}
        </Text>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <div className='flex justify-center'>
          <DataTableColumnHeader
            column={column}
            title={t('users.fields.currentRole')}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex justify-center pt-0.5'>
          <span className={getRoleBadgeVariant(row.original.role)}>
            {t(`roles.${row.original.role.toLowerCase()}`)}
          </span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className='flex justify-center'>
          <DataTableColumnHeader column={column} title={t('users.fields.createdAt')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-center'>
          <Text
            size='3'
            className={datatableCellTextVariants({
              variant: 'secondary',
            })}
          >
            {formatDate(row.original.createdAt)}
          </Text>
        </div>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.createdAt).getTime()
        const dateB = new Date(rowB.original.createdAt).getTime()
        return dateA - dateB
      },
    },
    {
      id: 'assignRole',
      header: () => (
        <div className='flex justify-center'>
          <span className='font-semibold'>{t('users.fields.assignRole')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <RoleDropdown user={row.original} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: () => (
        <div className='flex w-6 items-center justify-center'>
          <span className='sr-only'>{t('common.actions.actions')}</span>
          <EditIcon className='h-5 w-5' aria-hidden='true' />
        </div>
      ),
      cell: ({ row }): JSX.Element => (
        <div className='flex w-6 items-center justify-center'>
          <button
            onClick={event => {
              event.stopPropagation()
              onEdit(row.original.id)
            }}
            className={datatableActionButtonVariants({
              action: 'edit',
            })}
            title={t('common.actions.edit')}
            aria-label={t('common.actions.edit')}
            type='button'
          >
            <EditIcon className='h-5 w-5' aria-hidden='true' />
          </button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
