import type { JSX } from 'react'
import { redirect } from 'react-router'

import { adminPath } from '~/utils/adminRoutes'
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
		return redirect(adminPath(`/competition/groups?tournament=${tournamentId}`))
	} else {
		return redirect(adminPath('/competition/groups'))
	}
}

const CompetitionIndex = (): JSX.Element => <></>

export default CompetitionIndex
