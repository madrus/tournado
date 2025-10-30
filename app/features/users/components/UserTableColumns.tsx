import { JSX } from 'react'
import type { FetcherWithComponents } from 'react-router'

import type { Role, User } from '@prisma/client'
import { Text } from '@radix-ui/themes'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/Badge'
import { DataTableColumnHeader } from '~/components/DataTable'
import { EditIcon } from '~/components/icons'
import { ComboField, type Option } from '~/components/inputs/ComboField'
import {
  datatableActionButtonVariants,
  datatableCellTextVariants,
} from '~/components/shared/datatable.variants'
import { cn } from '~/utils/misc'

const ROLES: Role[] = ['PUBLIC', 'MANAGER', 'ADMIN', 'REFEREE', 'EDITOR', 'BILLING']

type ColumnContext = {
  t: (key: string, options?: Record<string, unknown>) => string
  formatDate: (date: Date | string) => string
  onEdit: (id: string) => void
  latinFontClass: string
  fetcher: FetcherWithComponents<unknown>
}

export function createUserColumns(context: ColumnContext): ColumnDef<User>[] {
  const { t, formatDate, onEdit, latinFontClass, fetcher } = context

  return [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('users.fields.email')} />
      ),
      cell: ({ row }) => (
        <div>
          <Text
            className={cn(
              datatableCellTextVariants({
                variant: 'secondary',
              }),
              latinFontClass
            )}
          >
            {row.original.email}
          </Text>
          {!row.original.active ? (
            <div className='mt-1'>
              <Badge color='red'>{t('users.messages.deactivated')}</Badge>
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
        <div className='flex w-full justify-start'>
          <DataTableColumnHeader
            column={column}
            title={t('users.fields.displayName')}
            className='justify-start'
          />
        </div>
      ),
      cell: ({ row }) => (
        <Text
          className={cn(
            datatableCellTextVariants({
              variant: 'secondary',
            }),
            latinFontClass
          )}
        >
          {row.original.displayName || '-'}
        </Text>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'role',
      id: 'assignedRole',
      header: ({ column }) => (
        <div className='flex justify-start'>
          <DataTableColumnHeader
            column={column}
            title={t('users.fields.assignedRole')}
            className='justify-start'
          />
        </div>
      ),
      cell: ({ row }) => {
        const roleOptions: Option[] = ROLES.map(role => ({
          value: role,
          label: t(`roles.${role.toLowerCase()}`),
        }))

        return (
          <div
            className='flex items-center justify-start'
            onClick={event => event.stopPropagation()}
          >
            <ComboField
              name={`role-${row.original.id}`}
              options={roleOptions}
              value={row.original.role}
              onChange={newRole => {
                if (newRole !== row.original.role) {
                  const formData = new FormData()
                  formData.set('intent', 'updateRole')
                  formData.set('userId', row.original.id)
                  formData.set('role', newRole)
                  fetcher.submit(formData, { method: 'post' })
                }
              }}
              disabled={!row.original.active}
              compact={true}
              color='slate'
              className='w-32'
            />
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className='flex justify-start'>
          <DataTableColumnHeader
            column={column}
            title={t('users.fields.createdAt')}
            className='justify-start'
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-start'>
          <Text
            className={datatableCellTextVariants({
              variant: 'secondary',
            })}
          >
            {formatDate(row.original.createdAt)
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
