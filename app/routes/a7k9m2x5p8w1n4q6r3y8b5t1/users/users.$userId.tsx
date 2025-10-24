import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router'

import type { User, UserAuditLog } from '@prisma/client'

import { UserAuditLogList } from '~/features/users/components/UserAuditLogList'
import { UserDeactivationForm } from '~/features/users/components/UserDeactivationForm'
import { UserDetailCard } from '~/features/users/components/UserDetailCard'
import { validateRole } from '~/features/users/utils/roleUtils'
import {
  deactivateUser,
  getUserById,
  reactivateUser,
  updateUserRole,
} from '~/models/user.server'
import { getUserAuditLogs } from '~/models/userAuditLog.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

type LoaderData = {
  targetUser: User
  auditLogs: readonly (UserAuditLog & {
    admin: {
      id: string
      email: string
      displayName: string | null
    }
  })[]
}

type ActionData = {
  error?: string
  success?: 'role' | 'deactivate' | 'reactivate'
}

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  await requireUserWithPermission(request, 'users:approve')

  const { userId } = params
  if (!userId) {
    throw new Response('User ID required', { status: 400 })
  }

  const [targetUser, auditLogs] = await Promise.all([
    getUserById(userId),
    getUserAuditLogs({ userId, limit: 50 }),
  ])

  if (!targetUser) {
    throw new Response('User not found', { status: 404 })
  }

  return { targetUser, auditLogs }
}

export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<ActionData> => {
  const currentUser = await requireUserWithPermission(request, 'roles:assign')

  const { userId } = params
  if (!userId) {
    throw new Response('User ID required', { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const roleValue = formData.get('role')
  const reason = (formData.get('reason') as string | null) || undefined

  try {
    if (intent === 'updateRole') {
      const newRole = validateRole(roleValue)

      await updateUserRole({
        userId,
        newRole,
        performedBy: currentUser.id,
        reason,
      })

      return { success: 'role' }
    }

    if (intent === 'deactivate') {
      await deactivateUser({
        userId,
        performedBy: currentUser.id,
        reason,
      })

      return { success: 'deactivate' }
    }

    if (intent === 'reactivate') {
      await reactivateUser({
        userId,
        performedBy: currentUser.id,
        reason,
      })

      return { success: 'reactivate' }
    }

    throw new Response('Invalid intent', { status: 400 })
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export default function UserDetailRoute(): JSX.Element {
  const { t } = useTranslation()
  const { targetUser, auditLogs } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  return (
    <>
      {actionData?.error ? (
        <div className='bg-destructive/10 text-destructive mb-4 rounded-md p-4'>
          {actionData.error}
        </div>
      ) : null}

      {actionData?.success ? (
        <div className='bg-success/10 text-success mb-4 rounded-md p-4'>
          {t(
            actionData.success === 'role'
              ? 'users.messages.roleUpdatedSuccessfully'
              : actionData.success === 'deactivate'
                ? 'users.messages.userDeactivatedSuccessfully'
                : 'users.messages.userReactivatedSuccessfully'
          )}
        </div>
      ) : null}

      <div className='grid grid-cols-1 gap-2 lg:grid-cols-2'>
        <div>
          <UserDetailCard user={targetUser} isSubmitting={isSubmitting} />
          <UserDeactivationForm user={targetUser} isSubmitting={isSubmitting} />
        </div>
        <UserAuditLogList auditLogs={auditLogs} />
      </div>
    </>
  )
}
