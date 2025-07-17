import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useActionData,
} from 'react-router'

import { TeamForm } from '~/components/TeamForm'
import type { TeamCreateActionData } from '~/lib/lib.types'
import type { User } from '~/models/user.server'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'
import { createTeamFromFormData } from '~/utils/team-creation.server'

// Route metadata - authenticated users can access (team creation is also public via /teams/new)
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  // No authorization restrictions - all authenticated users can access team creation
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
  user: User
}> {
  const user = await requireUserWithMetadata(request, handle)
  return { user }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  await requireUserWithMetadata(request, handle)

  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'create') {
    const result = await createTeamFromFormData(formData)

    if (!result.success) {
      return Response.json({ errors: result.errors }, { status: 400 })
    }

    // Redirect to the new team's edit page on success
    return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${result.team?.id}`)
  }

  return Response.json({ errors: {} })
}

export default function AdminNewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<TeamCreateActionData>()

  // Reset the form on every mount to ensure a clean slate
  useEffect(() => {
    const { resetForm } = useTeamFormStore.getState()
    resetForm()
  }, [])

  // This page now redirects on success, so a success message is no longer needed here.
  const successMessage = undefined

  const handleReset = () => {
    const { resetForm } = useTeamFormStore.getState()
    resetForm()
  }

  return (
    <div className='space-y-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{t('admin.teams.newTeam')}</h1>
        <p className='text-foreground mt-2'>
          {t('admin.teams.createNewTeamDescription')}
        </p>
      </div>

      <TeamForm
        mode='create'
        variant='admin'
        intent='create'
        submitButtonText={t('common.actions.save')}
        errors={actionData?.errors || {}}
        isSuccess={actionData?.success || false}
        successMessage={successMessage}
        onCancel={handleReset}
      />
    </div>
  )
}
