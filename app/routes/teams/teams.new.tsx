import { JSX, useEffect } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
} from 'react-router'

import { Division } from '@prisma/client'

import { TeamForm } from '~/components/TeamForm'
import { getDivisionLabel } from '~/lib/lib.helpers'
import type { TeamCreateActionData } from '~/lib/lib.types'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
import type { RouteMetadata } from '~/utils/route-types'
import { createTeamFromFormData } from '~/utils/team-creation.server'

export const meta: MetaFunction = () => [
  { title: 'New Team | Tournado' },
  {
    name: 'description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:title', content: 'New Team | Tournado' },
  {
    property: 'og:description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:type', content: 'website' },
]

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.addTeam',
}

export const loader = async ({ request: _ }: LoaderFunctionArgs): Promise<void> => {
  // Tournaments are now loaded automatically by the root layout
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const result = await createTeamFromFormData(await request.formData())

  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 400 })
  }

  return Response.json(
    {
      success: true,
      team: result.team,
    },
    { status: 200 }
  )
}

export default function NewTeamPage(): JSX.Element {
  const actionData = useActionData<TeamCreateActionData>()

  // Reset the form on every mount to ensure a clean slate
  useEffect(() => {
    const { resetForm } = useTeamFormStore.getState()
    resetForm()
  }, [])

  // Prepare success message with translated division label
  const successMessage =
    actionData?.success && actionData.team
      ? `Team "${actionData.team.teamName}" (${getDivisionLabel(actionData.team.division as Division, 'en')}) created successfully!`
      : undefined

  const handleReset = () => {
    const { resetForm } = useTeamFormStore.getState()
    resetForm()
  }

  return (
    <TeamForm
      mode='create'
      variant='public'
      errors={actionData?.errors || {}}
      isSuccess={actionData?.success || false}
      successMessage={successMessage}
      onCancel={handleReset}
    />
  )
}
