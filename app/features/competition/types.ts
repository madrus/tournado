import type { SportsIcon, TrophyIcon } from '~/components/icons'

export type CompetitionTabConfig = {
  nameKey: string
  href: 'groups' | 'playoffs'
  icon: typeof SportsIcon | typeof TrophyIcon
  disabled: boolean
}
