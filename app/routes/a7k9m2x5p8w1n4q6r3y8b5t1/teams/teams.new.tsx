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
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { createTeamFromFormData } from '~/utils/teamCreation.server'

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

    // Ensure we have a valid team with an ID before redirecting
    if (!result?.team?.id) {
      return Response.json(
        { errors: { general: 'Team creation failed - invalid team data' } },
        { status: 500 }
      )
    }

    // Redirect to admin team detail page with success parameter
    return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${result.team.id}?success=created`)
  }

  return Response.json({ errors: {} })
}

export default function AdminNewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<TeamCreateActionData>()
  const { resetForm } = useTeamFormStore()

  // Reset the form on every mount to ensure a clean slate
  useEffect(() => {
    resetForm()
  }, [resetForm])

  return (
    <div className='space-y-8' data-testid='admin-new-team-container'>
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
      />
    </div>
  )
}
