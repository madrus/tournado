import { JSX, useEffect } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
} from 'react-router'

import { TeamForm } from '~/features/teams/components/TeamForm'
import { useTeamFormStore } from '~/features/teams/stores/useTeamFormStore'
import type { TeamCreateActionData } from '~/features/teams/types'
import { handleTeamCreation } from '~/features/teams/utils/teamActions.server'
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
    const formData = await request.formData()
    return handleTeamCreation(formData, '/teams/{teamId}')
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
