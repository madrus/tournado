import type { Team } from '@prisma/client'

export type TeamListItem = Pick<Team, 'id' | 'clubName' | 'teamName' | 'category'>

export type TournamentListItem = {
  id: string
  name: string
  location: string
}

export type TeamsLoaderData = {
  teamListItems: TeamListItem[]
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
}

export type TournamentFilterOption = {
  value: string
  label: string
}
