import { SportsIcon, TrophyIcon } from '~/components/icons'
import type { CompetitionTabConfig } from './types'

export const tabs: readonly CompetitionTabConfig[] = [
	{
		nameKey: 'admin.competition.groups',
		href: 'groups',
		icon: SportsIcon,
		disabled: false,
	},
	{
		nameKey: 'admin.competition.playoffs',
		href: 'playoffs',
		icon: TrophyIcon,
		disabled: true, // Coming soon
	},
] as const
