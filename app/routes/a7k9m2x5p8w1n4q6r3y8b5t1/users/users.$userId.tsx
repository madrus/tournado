import type { JSX } from 'react'
import { useEffect, useRef } from 'react'
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
import { UserDeactivate } from '~/features/users/components/UserDeactivate'
import { UserDetailCard } from '~/features/users/components/UserDetailCard'
import { validateRole } from '~/features/users/utils/roleUtils'
import {
  deactivateUser,
  getUserById,
  reactivateUser,
  updateUserDisplayName,
  updateUserRole,
} from '~/models/user.server'
import { getUserAuditLogs } from '~/models/userAuditLog.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['ADMIN'],
  },
}

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
  success?: 'role' | 'deactivate' | 'reactivate' | 'displayName'
}

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  await requireUserWithMetadata(request, handle)

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
  const currentUser = await requireUserWithMetadata(request, handle)

  const { userId } = params
  if (!userId) {
    throw new Response('User ID required', { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const roleValue = formData.get('role')
  const reason = (formData.get('reason') as string | null) || undefined

  try {
    if (intent === 'updateDisplayName') {
      const displayName = (formData.get('displayName') as string) || ''

      await updateUserDisplayName({
        userId,
        displayName,
        performedBy: currentUser.id,
      })

      return { success: 'displayName' }
    }

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

  // Accumulate success types
  const successTypesRef = useRef<NonNullable<ActionData['success']>[]>([])

  const getSuccessMessage = (
    successType: NonNullable<ActionData['success']>
  ): string => {
    switch (successType) {
      case 'role':
        return t('users.messages.roleUpdatedSuccessfully')
      case 'deactivate':
        return t('users.messages.userDeactivatedSuccessfully')
      case 'reactivate':
        return t('users.messages.userReactivatedSuccessfully')
      case 'displayName':
        return t('users.messages.displayNameUpdatedSuccessfully')
    }
  }

  // Add new success types to the accumulated list
  useEffect(() => {
    if (actionData?.success && !successTypesRef.current.includes(actionData.success)) {
      successTypesRef.current.push(actionData.success)
    }
  }, [actionData?.success])

  const hasSuccessMessages = successTypesRef.current.length > 0

  return (
    <>
      {actionData?.error ? (
        <div className='bg-destructive/10 text-destructive mb-4 rounded-md p-4'>
          {actionData.error}
        </div>
      ) : null}

      {hasSuccessMessages ? (
        <div className='bg-success/10 text-success mb-4 rounded-md p-4'>
          {successTypesRef.current.length === 1 ? (
            <div>{getSuccessMessage(successTypesRef.current[0])}</div>
          ) : (
            <ul className='list-inside list-disc space-y-1'>
              {successTypesRef.current.map((type, index) => (
                <li key={index}>{getSuccessMessage(type)}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <div className={cn('w-full max-w-4xl space-y-6', STATS_PANEL_MIN_WIDTH)}>
        <UserDetailCard user={targetUser} isSubmitting={isSubmitting} />
        <UserDeactivate user={targetUser} isSubmitting={isSubmitting} />
        <UserAuditLogList auditLogs={auditLogs} />
      </div>
    </>
  )
}
