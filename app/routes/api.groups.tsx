/**
 * Resource Route: Groups API
 *
 * Pure data endpoint for group stage access across user roles.
 * This route has no UI component - it only serves JSON data.
 *
 * Authorization: Permission-based (groups:manage)
 * - REFEREE, MANAGER, ADMIN can access
 *
 * Use cases:
 * - REFEREE: View group standings to update match results
 * - MANAGER: Access group data for tournament management
 * - ADMIN: Full access to group management data
 *
 * Query Parameters:
 * - tournament (required): Tournament ID to fetch groups for
 *   Example: /api/groups?tournament=xyz123
 */
import type { LoaderFunctionArgs } from 'react-router'
import { getTournamentGroupStages } from '~/models/group.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
	// Permission-based authorization - REFEREE, MANAGER, ADMIN
	await requireUserWithPermission(request, 'groups:manage')

	// Get tournament ID from query parameter (required)
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')

	if (!tournamentId) {
		return Response.json(
			{
				error: 'Missing required parameter',
				message: 'Tournament ID is required. Use: /api/groups?tournament=xyz',
			},
			{ status: 400 },
		)
	}

	// Get group stage for the tournament
	const groupStages = await getTournamentGroupStages(tournamentId)

	// Return JSON using native Response.json()
	return Response.json({ groupStages })
}

// No default export = Resource route (data-only, no UI)
