import { JSX, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router'

import type { User } from '@prisma/client'
import type { SortingState } from '@tanstack/react-table'

import { DataTable, DataTablePagination } from '~/components/DataTable'
import { GroupIcon } from '~/components/icons'
import { Panel } from '~/components/Panel'
import { createUserColumns, UserMobileRow } from '~/features/users/components'
import { validateRole } from '~/features/users/utils/roleUtils'
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

  // Get pagination parameters from URL search params
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const pageSize = 50 // Reasonable page size for performance

  const { users, total } = await getAllUsersWithPagination({
    page,
    pageSize,
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
    const roleValue = formData.get('role')

    if (!userId) {
      return { error: 'Missing user ID' }
    }

    try {
      const newRole = validateRole(roleValue)

      await updateUserRole({
        userId,
        newRole,
        performedBy: currentUser.id,
        // No reason provided for quick role updates from user list
        // Admin can view full audit trail on user detail page
      })
      return { success: true }
    } catch (error) {
      if (error instanceof Response) {
        throw error
      }
      return {
        error: error instanceof Error ? error.message : 'Failed to update role',
      }
    }
  }

  return { error: 'Invalid action' }
}

export function AdminUsersIndexPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { users, total } = useLoaderData<LoaderData>()
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  const handleUserClick = (userId: string) => {
    navigate(`/a7k9m2x5p8w1n4q6r3y8b5t1/users/${userId}`)
  }

  // Pagination calculations
  const pageSize = 50
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const totalPages = Math.ceil(total / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Create columns with memoization to prevent unnecessary re-renders
  const columns = useMemo(
    () =>
      createUserColumns({
        t,
        formatDate,
        onEdit: handleUserClick,
      }),
    [t, formatDate]
  )

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
      <div className={cn('mb-6 w-full lg:w-fit', STATS_PANEL_MIN_WIDTH)}>
        <Panel color={PANEL_COLOR} variant='content-panel'>
          <DataTable
            data={[...users]}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
            onRowClick={row => handleUserClick(row.id)}
            renderMobileRow={row => (
              <UserMobileRow
                key={row.id}
                user={row}
                onClick={() => handleUserClick(row.id)}
              />
            )}
            emptyState={
              users.length === 0 ? (
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
              ) : undefined
            }
          />

          {/* Pagination Controls - Using ShadCN pattern */}
          {users.length > 0 ? (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
            />
          ) : null}
        </Panel>
      </div>
    </div>
  )
}

// Default export for React Router
export default AdminUsersIndexPage
