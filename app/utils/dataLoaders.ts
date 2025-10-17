import type { TeamsLoaderData } from '~/features/teams/types'
import { getFilteredTeamListItems } from '~/models/team.server'
import { getAllTournamentListItems } from '~/models/tournament.server'

/**
 * Shared loader function for both public and admin teams pages
 * Loads teams and tournaments with optional tournament filtering
 */
export async function loadTeamsAndTournamentsData(
  request: Request
): Promise<TeamsLoaderData> {
  const url = new URL(request.url)
  const tournamentId = url.searchParams.get('tournament')

  const [teamListItems, tournamentListItems] = await Promise.all([
    getFilteredTeamListItems({ tournamentId: tournamentId || undefined }),
    getAllTournamentListItems(),
  ])

  return {
    teamListItems,
    tournamentListItems,
    selectedTournamentId: tournamentId || undefined,
  }
}
