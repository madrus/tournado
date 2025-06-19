import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useActionData,
} from 'react-router'

import { TeamForm } from '~/components/TeamForm'
import { validateEntireForm } from '~/lib/lib.form'
import type { TeamCreateActionData, TeamFormData } from '~/lib/lib.types'
import type { User } from '~/models/user.server'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

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
    const teamData: TeamFormData = {
      tournamentId: String(formData.get('tournamentId') || ''),
      clubName: String(formData.get('clubName') || ''),
      teamName: String(formData.get('teamName') || '') as TeamFormData['teamName'],
      division: String(formData.get('division') || ''),
      category: String(formData.get('category') || ''),
      teamLeaderName: String(formData.get('teamLeaderName') || ''),
      teamLeaderPhone: String(formData.get('teamLeaderPhone') || ''),
      teamLeaderEmail: String(
        formData.get('teamLeaderEmail') || ''
      ) as TeamFormData['teamLeaderEmail'],
      privacyAgreement: formData.get('privacyAgreement') === 'on',
    }

    const errors = validateEntireForm(teamData, 'create')

    if (Object.keys(errors).length > 0) {
      return Response.json({ errors }, { status: 400 })
    }

    // For now, just use the data directly until we implement proper createTeam
    // await createTeam(teamData)

    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
  }

  return Response.json({ errors: {} })
}

export default function AdminNewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<TeamCreateActionData>()

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>{t('admin.teams.newTeam')}</h1>
        <p className='mt-2 text-gray-600'>
          {t('admin.teams.createNewTeamDescription')}
        </p>
      </div>

      <TeamForm
        mode='create'
        variant='admin'
        intent='create'
        submitButtonText={t('admin.teams.createTeam')}
        errors={actionData?.errors || {}}
      />
    </div>
  )
}
