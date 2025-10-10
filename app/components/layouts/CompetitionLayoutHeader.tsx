import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { TournamentFilter } from '~/components/TournamentFilter'
import type { TournamentListItem } from '~/lib/lib.types'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

type CompetitionLayoutHeaderProps = {
  variant: 'admin'
  tournamentListItems: readonly TournamentListItem[]
  selectedTournamentId?: string
  className?: string
}

export function CompetitionLayoutHeader({
  variant,
  tournamentListItems,
  selectedTournamentId,
  className,
}: CompetitionLayoutHeaderProps): JSX.Element {
  const { t, i18n } = useTranslation()

  const isAdmin = variant === 'admin'
  const title = isAdmin ? t('admin.competition.title') : t('common.titles.competition')
  const description = isAdmin
    ? t('admin.competition.description')
    : t('competition.description')

  return (
    <div
      className={cn('border-button-neutral-secondary-border border-b pb-6', className)}
      data-testid='competition-header-admin'
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className={cn('text-3xl font-bold', getLatinTitleClass(i18n.language))}>
            {title}
          </h1>
          <p className='text-foreground mt-1'>{description}</p>
        </div>

        {/* Tournament Selector */}
        <div className='flex justify-end gap-4 md:justify-end rtl:justify-start rtl:md:justify-start'>
          <TournamentFilter
            tournamentListItems={tournamentListItems}
            selectedTournamentId={selectedTournamentId}
            className='min-w-64'
            showAllOption={false}
          />
        </div>
      </div>
    </div>
  )
}
