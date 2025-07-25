import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ComboField } from '~/components/inputs/ComboField'
import { useTournamentFilter } from '~/hooks/useTournamentFilter'
import type { ColorAccent, TournamentListItem } from '~/lib/lib.types'

type TournamentFilterProps = {
  tournamentListItems: TournamentListItem[]
  selectedTournamentId?: string
  className?: string
  color?: ColorAccent
}

export function TournamentFilter({
  tournamentListItems,
  selectedTournamentId,
  className = 'max-w-md',
  color = 'emerald',
}: TournamentFilterProps): ReactElement {
  const { t } = useTranslation()
  const { tournamentOptions, selectedValue, onChange } = useTournamentFilter({
    tournamentListItems,
    selectedTournamentId,
  })

  return (
    <ComboField
      name='tournamentFilter'
      label={t('teams.filterByTournament')}
      value={selectedValue}
      onChange={onChange}
      options={tournamentOptions}
      placeholder={t('teams.allTournaments')}
      className={className}
      color={color}
    />
  )
}
