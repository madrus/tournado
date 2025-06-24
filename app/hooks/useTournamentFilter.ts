import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import type { TournamentFilterOption, TournamentListItem } from '~/lib/teams.types'

type UseTournamentFilterProps = {
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
}

export function useTournamentFilter({
  tournamentListItems,
  selectedTournamentId,
}: UseTournamentFilterProps) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const handleTournamentFilterChange = (tournamentId: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (tournamentId === 'all') {
      newSearchParams.delete('tournament')
    } else {
      newSearchParams.set('tournament', tournamentId)
    }
    setSearchParams(newSearchParams, { replace: true })
  }

  // Prepare tournament options for the combo field
  const tournamentOptions: TournamentFilterOption[] = [
    { value: 'all', label: t('teams.allTournaments') },
    ...tournamentListItems.map(tournament => ({
      value: tournament.id,
      label: `${tournament.name} - ${tournament.location}`,
    })),
  ]

  return {
    tournamentOptions,
    selectedValue: selectedTournamentId || 'all',
    onChange: handleTournamentFilterChange,
  }
}
