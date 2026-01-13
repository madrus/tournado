/**
 * Resource Route: Tournaments API
 *
 * Pure data endpoint for tournament access across different user roles.
 * This route has no UI component - it only serves JSON data.
 *
 * Authorization: Permission-based (tournaments:read)
 * - PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN can access
 *
 * Use cases:
 * - REFEREE: Filter tournaments to view assigned matches
 * - EDITOR: View tournaments for reporting
 * - BILLING: Access tournament data for billing purposes
 */
import type { LoaderFunctionArgs } from 'react-router'
import { getAllTournaments } from '~/models/tournament.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
	// Permission-based authorization - allows multiple roles
	await requireUserWithPermission(request, 'tournaments:read')

	// Get all tournaments (future: add filtering support via query params)
	const tournaments = await getAllTournaments()

	// Serialize dates to ISO strings for JSON transport
	const tournamentsList = tournaments.map((tournament) => ({
		...tournament,
		startDate: tournament.startDate.toISOString(),
		endDate: tournament.endDate?.toISOString() || null,
	}))

	// Return JSON using native Response.json()
	return Response.json({ tournaments: tournamentsList })
}

// No default export = Resource route (data-only, no UI)
