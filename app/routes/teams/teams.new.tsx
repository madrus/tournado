import { JSX, useEffect } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
} from 'react-router'

import { TeamForm } from '~/features/teams/components/TeamForm'
import { useTeamFormStore } from '~/features/teams/stores/useTeamFormStore'
import type { TeamCreateActionData } from '~/features/teams/types'
import { createTeamFromFormData } from '~/features/teams/utils/teamCreation.server'
import { isRateLimitResponse, withAdminRateLimit } from '~/utils/adminMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'

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
  const response = await withAdminRateLimit(request, async () => {
    const result = await createTeamFromFormData(await request.formData())

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

    // Redirect to team details page with success parameter
    return redirect(`/teams/${result.team.id}?success=created`)
  })

  if (isRateLimitResponse(response)) {
    return response
  }

  return response as Response
}

export default function NewTeamPage(): JSX.Element {
  const actionData = useActionData<TeamCreateActionData>()
  const { resetForm } = useTeamFormStore()

  // Reset the form on every mount to ensure a clean slate
  useEffect(() => {
    resetForm()
  }, [resetForm])

  return <TeamForm mode='create' variant='public' errors={actionData?.errors || {}} />
}
