import { redirect } from 'react-router'

import { requireAdminUser } from '~/utils/rbacMiddleware.server'

import type { Route } from './+types/competition._index'

export async function loader({
  request,
  params: _params,
}: Route.LoaderArgs): Promise<Response> {
  await requireAdminUser(request)

  // Since competition is now top-level, redirect to groups tab with tournament param
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  if (tournamentId) {
    return redirect(
      `/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups?tournament=${tournamentId}`
    )
  } else {
    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups')
  }
}
