import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { Form, useActionData, useLoaderData, useSubmit } from 'react-router'

import type { Role, User } from '@prisma/client'
import { Text } from '@radix-ui/themes'

import { EditIcon, GroupIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import {
  datatableActionButtonVariants,
  datatableCellTextVariants,
  datatableContainerVariants,
  datatableHeaderTextVariants,
  datatableHeaderVariants,
  datatableRowVariants,
} from '~/components/shared/datatable.variants'
import { getRoleBadgeVariant } from '~/features/users/utils/roleUtils'
import { getAllUsersWithPagination, updateUserRole } from '~/models/user.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

import type { Route } from './+types/users._index'

// Local constants
const PANEL_COLOR = 'teal' as const

// Route metadata - requires users read permission
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    redirectTo: '/unauthorized',
  },
}

export const meta: MetaFunction = () => [
  { title: 'User Management | Admin | Tournado' },
  {
    name: 'description',
    content:
      'Manage all users in the system. View, edit user roles and oversee user accounts.',
  },
  { property: 'og:title', content: 'User Management | Admin | Tournado' },
  {
    property: 'og:description',
    content:
      'Manage all users in the system. View, edit user roles and oversee user accounts.',
  },
  { property: 'og:type', content: 'website' },
]

type LoaderData = {
  users: readonly User[]
  total: number
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Require permission to read users
  await requireUserWithPermission(request, 'users:approve')

  // Get all users for now (we can add pagination later if needed)
  const { users, total } = await getAllUsersWithPagination({
    page: 1,
    pageSize: 1000,
  })

  return { users, total }
}

type ActionData = {
  error?: string
  success?: boolean
}

export async function action({ request }: Route.ActionArgs): Promise<ActionData> {
  const currentUser = await requireUserWithPermission(request, 'roles:assign')

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'updateRole') {
    const userId = formData.get('userId') as string
    const newRole = formData.get('role') as Role

    if (!userId || !newRole) {
      return { error: 'Missing required fields' }
    }

    try {
      await updateUserRole({
        userId,
        newRole,
        performedBy: currentUser.id,
        reason: 'Quick role update from user list',
      })
      return { success: true }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update role',
      }
    }
  }

  return { error: 'Invalid action' }
}

export default function AdminUsersIndexPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { users, total } = useLoaderData<LoaderData>()
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  const handleUserClick = (userId: string) => {
    // Navigate to user details/edit page
    window.location.href = `/a7k9m2x5p8w1n4q6r3y8b5t1/users/${userId}`
  }

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='space-y-6' data-testid='admin-users-page-content'>
      {/* Stats using optimized dashboard panels */}
      <div
        className={cn('grid w-full grid-cols-1 gap-5 lg:w-fit', STATS_PANEL_MIN_WIDTH)}
      >
        <Panel
          color={PANEL_COLOR}
          variant='dashboard-panel'
          icon={<GroupIcon size={24} variant='outlined' />}
          iconColor='brand'
          title={t('users.titles.totalUsers', 'Total Users')}
          showGlow
          data-testid='users-total-stat'
        >
          {total}
        </Panel>
      </div>

      {/* Success/Error Messages */}
      {actionData?.error ? (
        <div className='bg-destructive/10 text-destructive rounded-md p-4'>
          {actionData.error}
        </div>
      ) : null}

      {actionData?.success ? (
        <div className='rounded-md bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400'>
          {t('users.messages.roleUpdatedSuccessfully')}
        </div>
      ) : null}

      {/* Users List */}
      <div className={cn('w-full lg:w-fit', STATS_PANEL_MIN_WIDTH)}>
        <Panel color={PANEL_COLOR} variant='content-panel'>
          {users.length === 0 ? (
            <div className='py-12 text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100'>
                <GroupIcon className='text-slate-400' size={24} />
              </div>
              <p className='mb-2 text-base font-medium text-slate-900'>
                {t('users.messages.noUsers', 'No users found')}
              </p>
              <p className='mb-6 text-sm text-slate-600'>
                {t(
                  'users.messages.noUsersDescription',
                  'No users have been created yet.'
                )}
              </p>
            </div>
          ) : (
            <div className={datatableContainerVariants({ color: 'slate' })}>
              {/* Header - only show on desktop using CSS */}
              <div
                className={cn(
                  datatableHeaderVariants({ color: 'slate' }),
                  'hidden lg:block'
                )}
              >
                <div className='grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4'>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('users.fields.email')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('users.fields.displayName')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('users.fields.currentRole')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('users.fields.createdAt')}
                    </Text>
                  </div>
                  <div className='flex items-start'>
                    <Text
                      size='1'
                      weight='medium'
                      className={datatableHeaderTextVariants({ color: 'slate' })}
                    >
                      {t('users.fields.assignRole')}
                    </Text>
                  </div>
                  <div className='flex w-6 items-start justify-center'>
                    <span className='sr-only'>{t('common.actions.actions')}</span>
                    <EditIcon
                      className={cn(
                        'h-4 w-4',
                        datatableHeaderTextVariants({ color: 'slate' })
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* User Items */}
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={cn(
                    datatableRowVariants({
                      color: 'slate',
                      variant: index === users.length - 1 ? 'last' : 'default',
                    })
                  )}
                >
                  {/* Mobile: Stacked layout */}
                  <div className='lg:hidden'>
                    <div
                      className='cursor-pointer px-6 py-4'
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='min-w-0 flex-1'>
                          <Text
                            size='2'
                            weight='medium'
                            className={cn(
                              'block',
                              datatableCellTextVariants({ variant: 'primary' })
                            )}
                          >
                            {user.email}
                          </Text>
                          <Text
                            size='1'
                            className={cn(
                              'mt-1 block',
                              datatableCellTextVariants({ variant: 'secondary' })
                            )}
                          >
                            {user.displayName || '-'}
                          </Text>
                        </div>
                        <div className='ml-4 flex-shrink-0 text-right'>
                          <span className={getRoleBadgeVariant(user.role)}>
                            {t(`roles.${user.role.toLowerCase()}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Table-like grid layout */}
                  <div className='hidden grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_auto] gap-4 px-3 py-4 lg:grid'>
                    <div
                      className='flex cursor-pointer items-start'
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div>
                        <Text
                          size='2'
                          weight='medium'
                          className={datatableCellTextVariants({
                            variant: 'primary',
                          })}
                        >
                          {user.email}
                        </Text>
                        {!user.active ? (
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
                    </div>
                    <div className='flex items-start'>
                      <Text
                        size='2'
                        className={datatableCellTextVariants({
                          variant: 'secondary',
                        })}
                      >
                        {user.displayName || '-'}
                      </Text>
                    </div>
                    <div className='flex items-start'>
                      <span className={getRoleBadgeVariant(user.role)}>
                        {t(`roles.${user.role.toLowerCase()}`)}
                      </span>
                    </div>
                    <div className='flex items-start'>
                      <Text
                        size='2'
                        className={datatableCellTextVariants({
                          variant: 'secondary',
                        })}
                      >
                        {formatDate(user.createdAt)}
                      </Text>
                    </div>
                    <div className='flex items-start'>
                      <Form
                        method='post'
                        onChange={event => {
                          const formData = new FormData(event.currentTarget)
                          const newRole = formData.get('role') as string
                          if (newRole !== user.role) {
                            submit(event.currentTarget)
                          }
                        }}
                      >
                        <input type='hidden' name='intent' value='updateRole' />
                        <input type='hidden' name='userId' value={user.id} />
                        <select
                          name='role'
                          defaultValue={user.role}
                          className='bg-background border-border rounded border px-2 py-1 text-sm'
                          onClick={event => event.stopPropagation()}
                        >
                          <option value='PUBLIC'>{t('roles.public')}</option>
                          <option value='MANAGER'>{t('roles.manager')}</option>
                          <option value='ADMIN'>{t('roles.admin')}</option>
                          <option value='REFEREE'>{t('roles.referee')}</option>
                          <option value='EDITOR'>{t('roles.editor')}</option>
                          <option value='BILLING'>{t('roles.billing')}</option>
                        </select>
                      </Form>
                    </div>
                    <div className='flex w-6 items-start justify-center'>
                      <button
                        onClick={event => {
                          event.stopPropagation()
                          handleUserClick(user.id)
                        }}
                        className={datatableActionButtonVariants({
                          action: 'edit',
                        })}
                        title={t('common.actions.edit')}
                      >
                        <EditIcon className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
