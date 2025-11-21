import type { TeamsLoaderData } from '~/features/teams/types'
import { getFilteredTeams } from '~/models/team.server'
import { getAllTournaments } from '~/models/tournament.server'

/**
 * Shared loader function for both public and admin teams pages
 * Loads teams and tournaments with optional tournament filtering
 */
export async function loadTeamsAndTournamentsData(request: Request): Promise<TeamsLoaderData> {
	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')

	const [teamListItems, tournamentListItemsRaw] = await Promise.all([
		getFilteredTeams({ tournamentId: tournamentId || undefined }),
		getAllTournaments(),
	])

	// Serialize dates to ISO strings for JSON transport
	const tournamentListItems = tournamentListItemsRaw
		? tournamentListItemsRaw.map((tournament) => ({
				...tournament,
				startDate: tournament.startDate.toISOString(),
				endDate: tournament.endDate?.toISOString() || null,
			}))
		: tournamentListItemsRaw

	return {
		teamListItems,
		tournamentListItems,
		selectedTournamentId: tournamentId || undefined,
	}
}
