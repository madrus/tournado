import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router'

import type { User, UserAuditLog } from '@prisma/client'

import { UserAuditLogList } from '~/features/users/components/UserAuditLogList'
import { UserDetailCard } from '~/features/users/components/UserDetailCard'
import { validateRole } from '~/features/users/utils/roleUtils'
import { ADMIN_DASHBOARD_URL } from '~/lib/lib.constants'
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
import { toast } from '~/utils/toastUtils'

export const handle: RouteMetadata = {
  authorization: {
    requiredRoles: ['ADMIN'],
  },
}

type LoaderData = {
  targetUser: User
  currentUserId: string
  auditLogs: readonly (UserAuditLog & {
    admin: {
      id: string
      email: string
      displayName: string | null
    }
  })[]
}

export const loader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  const currentUser = await requireUserWithMetadata(request, handle)

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

  return { targetUser, currentUserId: currentUser.id, auditLogs }
}

export const action = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<Response> => {
  const currentUser = await requireUserWithMetadata(request, handle)

  const { userId } = params
  if (!userId) {
    throw new Response('User ID required', { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const roleValue = formData.get('role')

  try {
    if (intent === 'updateDisplayName') {
      const displayName = (formData.get('displayName') as string) || ''

      await updateUserDisplayName({
        userId,
        displayName,
        performedBy: currentUser.id,
      })

      return redirect(`${ADMIN_DASHBOARD_URL}/users/${userId}?success=displayName`)
    }

    if (intent === 'updateRole') {
      // Prevent users from changing their own role
      if (userId === currentUser.id) {
        return redirect(
          `${ADMIN_DASHBOARD_URL}/users/${userId}?error=${encodeURIComponent('You cannot change your own role.')}`
        )
      }

      const newRole = validateRole(roleValue)

      await updateUserRole({
        userId,
        newRole,
        performedBy: currentUser.id,
      })

      return redirect(`${ADMIN_DASHBOARD_URL}/users/${userId}?success=role`)
    }

    if (intent === 'deactivate') {
      // Prevent users from deactivating themselves
      if (userId === currentUser.id) {
        return redirect(
          `${ADMIN_DASHBOARD_URL}/users/${userId}?error=${encodeURIComponent('You cannot deactivate your own account.')}`
        )
      }

      await deactivateUser({
        userId,
        performedBy: currentUser.id,
      })

      return redirect(`${ADMIN_DASHBOARD_URL}/users/${userId}?success=deactivate`)
    }

    if (intent === 'reactivate') {
      // Prevent users from reactivating themselves (this should never happen since they're active)
      if (userId === currentUser.id) {
        return redirect(
          `${ADMIN_DASHBOARD_URL}/users/${userId}?error=${encodeURIComponent('You cannot reactivate your own account.')}`
        )
      }

      await reactivateUser({
        userId,
        performedBy: currentUser.id,
      })

      return redirect(`${ADMIN_DASHBOARD_URL}/users/${userId}?success=reactivate`)
    }

    throw new Response('Invalid intent', { status: 400 })
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return redirect(
      `${ADMIN_DASHBOARD_URL}/users/${userId}?error=${encodeURIComponent(errorMessage)}`
    )
  }
}

export default function UserDetailRoute(): JSX.Element {
  const { t } = useTranslation()
  const { targetUser, currentUserId, auditLogs } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const isSubmitting = navigation.state === 'submitting'

  // Handle success and error toasts
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'role') {
      toast.success(t('users.messages.roleUpdatedSuccessfully'))
    } else if (success === 'deactivate') {
      toast.success(t('users.messages.userDeactivatedSuccessfully'))
    } else if (success === 'reactivate') {
      toast.success(t('users.messages.userReactivatedSuccessfully'))
    } else if (success === 'displayName') {
      toast.success(t('users.messages.displayNameUpdatedSuccessfully'))
    }

    if (error) {
      toast.error(error) // error is already decoded!
    }

    // Clean up search params after showing toasts
    if (success || error) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('success')
      nextParams.delete('error')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  return (
    <div className={cn('w-full max-w-4xl space-y-6', STATS_PANEL_MIN_WIDTH)}>
      <UserDetailCard
        user={targetUser}
        currentUserId={currentUserId}
        isSubmitting={isSubmitting}
      />
      <UserAuditLogList auditLogs={auditLogs} />
    </div>
  )
}
