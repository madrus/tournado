import { Link } from '@remix-run/react'

import { useTranslation } from 'react-i18next'

export default function TeamIndexPage() {
  const { t } = useTranslation()

  return (
    <p>
      {t('teams.noTeamSelected')}{' '}
      <Link
        to='new'
        className='text-blue-500 underline'
        aria-label={t('teams.createNewTeam')}
      >
        {t('teams.createNewTeam')}
      </Link>
    </p>
  )
}
