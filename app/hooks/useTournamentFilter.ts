import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import type { TournamentListItem } from '~/lib/lib.types'

type UseTournamentFilterProps = {
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
}

type UseTournamentFilterReturn = {
  tournamentOptions: { value: string; label: string }[]
  selectedValue: string
  onChange: (value: string) => void
}

export function useTournamentFilter({
  tournamentListItems,
  selectedTournamentId,
}: UseTournamentFilterProps): UseTournamentFilterReturn {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tournamentOptions = useMemo(() => {
    const allOption = { value: 'all', label: t('teams.allTournaments') }

    if (!tournamentListItems?.length) {
      return [allOption]
    }

    const tournamentOptionsFromData = tournamentListItems.map(tournament => ({
      value: tournament.id,
      label: tournament.name,
    }))

    return [allOption, ...tournamentOptionsFromData]
  }, [tournamentListItems, t])

  const selectedValue = useMemo(() => {
    if (!selectedTournamentId) return 'all'

    // Check if the selected tournament exists in the list
    const tournamentExists = tournamentListItems?.some(
      tournament => tournament.id === selectedTournamentId
    )

    return tournamentExists ? selectedTournamentId : 'all'
  }, [selectedTournamentId, tournamentListItems])

  const onChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === 'all') {
      newSearchParams.delete('tournament')
    } else {
      newSearchParams.set('tournament', value)
    }

    const queryString = newSearchParams.toString()
    navigate(queryString ? `?${queryString}` : '')
  }

  return {
    tournamentOptions,
    selectedValue,
    onChange,
  }
}
