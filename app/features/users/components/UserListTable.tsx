import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Link } from 'react-router'

import type { User } from '@prisma/client'

import { EditIcon } from '~/components/icons'
import { getRoleBadgeVariant } from '~/features/users/utils/roleUtils'

type UserListTableProps = {
  users: readonly User[]
  total: number
  totalPages: number
  currentPage: number
}

export const UserListTable = (props: Readonly<UserListTableProps>): JSX.Element => {
  const { users, total, totalPages, currentPage } = props
  const { t } = useTranslation()

  return (
    <div className='bg-card rounded-lg shadow'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-muted'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold'>
                {t('users.fields.email')}
              </th>
              <th className='px-4 py-3 text-left font-semibold'>
                {t('users.fields.displayName')}
              </th>
              <th className='px-4 py-3 text-center font-semibold'>
                {t('users.fields.currentRole')}
              </th>
              <th className='px-4 py-3 text-center font-semibold'>
                {t('users.fields.createdAt')}
              </th>
              <th className='px-4 py-3 text-center font-semibold'>
                {t('users.fields.assignRole')}
              </th>
              <th className='w-16 px-4 py-3 text-center'></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className='border-border hover:bg-muted/50 border-t'>
                <td className='px-4 py-3'>
                  <div className='font-medium'>{user.email}</div>
                  {!user.active ? (
                    <div className='text-destructive text-xs'>
                      {t('users.messages.deactivated')}
                    </div>
                  ) : null}
                </td>
                <td className='px-4 py-3 text-left'>{user.displayName || '-'}</td>
                <td className='px-4 py-3 text-center'>
                  <span className={getRoleBadgeVariant(user.role)}>
                    {t(`roles.${user.role.toLowerCase()}`)}
                  </span>
                </td>
                <td className='px-4 py-3 text-center'>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className='px-4 py-3 text-center'>
                  <Form method='post' className='flex justify-center'>
                    <input type='hidden' name='intent' value='updateRole' />
                    <input type='hidden' name='userId' value={user.id} />
                    <select
                      name='role'
                      defaultValue={user.role}
                      onChange={event => {
                        if (event.currentTarget.value !== user.role) {
                          event.currentTarget.form?.requestSubmit()
                        }
                      }}
                      className='bg-background border-border rounded border px-2 py-1 text-sm'
                    >
                      <option value='PUBLIC'>{t('roles.public')}</option>
                      <option value='MANAGER'>{t('roles.manager')}</option>
                      <option value='ADMIN'>{t('roles.admin')}</option>
                      <option value='REFEREE'>{t('roles.referee')}</option>
                      <option value='EDITOR'>{t('roles.editor')}</option>
                      <option value='BILLING'>{t('roles.billing')}</option>
                    </select>
                  </Form>
                </td>
                <td className='w-16 px-4 py-3 text-center'>
                  <Link
                    to={`/a7k9m2x5p8w1n4q6r3y8b5t1/users/${user.id}`}
                    className='text-foreground hover:text-foreground/80 inline-flex items-center justify-center'
                    aria-label={t('common.actions.edit')}
                  >
                    <EditIcon size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className='border-border flex flex-col gap-2 border-t px-4 py-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='text-foreground/60 text-sm'>
          {t('common.pagination.showing', { count: users.length, total })}
        </div>
        <div className='flex gap-2'>
          {currentPage > 1 ? (
            <Link
              to={`?page=${currentPage - 1}`}
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1'
            >
              {t('common.pagination.previous')}
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link
              to={`?page=${currentPage + 1}`}
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1'
            >
              {t('common.pagination.next')}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
