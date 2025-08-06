import { JSX, useEffect } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
} from 'react-router'

import { TeamForm } from '~/components/TeamForm'
import type { TeamCreateActionData } from '~/lib/lib.types'
import { useTeamFormStore } from '~/stores/useTeamFormStore'
import { isRateLimitResponse, withAdminRateLimit } from '~/utils/adminMiddleware.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { createTeamFromFormData } from '~/utils/teamCreation.server'

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

    // Redirect to team details page on success (same as admin route)
    return redirect(`/teams/${result.team?.id}`)
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
