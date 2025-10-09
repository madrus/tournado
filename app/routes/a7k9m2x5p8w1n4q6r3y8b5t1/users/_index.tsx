import { type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from 'react-router'

import type { Role, User } from '@prisma/client'

import { UserListTable } from '~/features/users/components/UserListTable'
import { getAllUsersWithPagination, updateUserRole } from '~/models/user.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

type LoaderData = {
  users: readonly User[]
  total: number
  totalPages: number
  currentPage: number
}

type ActionData = {
  error?: string
  success?: boolean
}

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  // Require users:approve permission (ADMIN only)
  await requireUserWithPermission(request, 'users:approve')

  // Get pagination params from URL
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const role = (url.searchParams.get('role') as Role | null) || undefined

  const { users, total, totalPages } = await getAllUsersWithPagination({
    page,
    pageSize: 20,
    role,
  })

  return {
    users,
    total,
    totalPages,
    currentPage: page,
  }
}

export const action = async ({ request }: ActionFunctionArgs): Promise<ActionData> => {
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

export default function UsersIndexRoute(): JSX.Element {
  const { t } = useTranslation()
  const { users, total, totalPages, currentPage } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>{t('users.titles.userManagement')}</h1>
        <p className='text-foreground/60 mt-2'>
          {t('users.descriptions.manageUsersAndRoles')}
        </p>
      </div>

      {actionData?.error ? (
        <div className='bg-destructive/10 text-destructive mb-4 rounded-md p-4'>
          {actionData.error}
        </div>
      ) : null}

      {actionData?.success ? (
        <div className='mb-4 rounded-md bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400'>
          {t('users.messages.roleUpdatedSuccessfully')}
        </div>
      ) : null}

      <UserListTable
        users={users}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}
