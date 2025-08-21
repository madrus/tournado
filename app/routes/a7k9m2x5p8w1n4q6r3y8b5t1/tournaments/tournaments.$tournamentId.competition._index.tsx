import { redirect } from 'react-router'

import { requireAdminUser } from '~/utils/rbacMiddleware.server'

import type { Route } from './+types/tournaments.$tournamentId.competition._index'

export async function loader({ request, params }: Route.LoaderArgs): Promise<Response> {
  await requireAdminUser(request)

  // Redirect to pools tab as default
  const { tournamentId } = params as { tournamentId: string }
  return redirect(
    `/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments/${tournamentId}/competition/pools`
  )
}
