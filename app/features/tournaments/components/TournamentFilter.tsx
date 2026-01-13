import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { ComboField } from '~/components/inputs/ComboField'
import { useTournamentFilter } from '~/features/tournaments/hooks/useTournamentFilter'
import type { TournamentListItem } from '~/features/tournaments/types'
import type { ColorAccent } from '~/lib/lib.types'
import { getLatinTextClass } from '~/utils/rtlUtils'

type TournamentFilterProps = {
	tournamentListItems: readonly TournamentListItem[]
	selectedTournamentId?: string
	basePath?: string
	className?: string
	color?: ColorAccent
	label?: string
	placeholder?: string
	showAllOption?: boolean
}

export function TournamentFilter({
	tournamentListItems,
	selectedTournamentId,
	basePath,
	className = 'w-60',
	color = 'primary',
	label,
	placeholder,
	showAllOption = true,
}: TournamentFilterProps): ReactElement {
	const { t } = useTranslation()
	const { tournamentOptions, selectedValue, onChange } = useTournamentFilter({
		tournamentListItems,
		selectedTournamentId,
		basePath,
	})
	const latinTextClass = getLatinTextClass()

	// For competition page, filter out the "all" option if showAllOption is false
	const filteredOptions = showAllOption
		? tournamentOptions
		: tournamentOptions.filter((option) => option.value !== 'all')

	// Adjust selected value if we're not showing "all" option and no tournament is selected
	const adjustedSelectedValue =
		!showAllOption && selectedValue === 'all' ? '' : selectedValue

	return (
		<ComboField
			name='tournamentFilter'
			label={label || t('teams.filterByTournament')}
			value={adjustedSelectedValue}
			onChange={onChange}
			options={filteredOptions}
			placeholder={placeholder || t('teams.allTournaments')}
			className={className}
			color={color}
			valueClassName={adjustedSelectedValue !== 'all' ? latinTextClass : ''}
			getOptionTextClassName={(option) =>
				option.value === 'all' ? '' : latinTextClass
			}
		/>
	)
}
