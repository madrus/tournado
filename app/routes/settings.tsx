import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'

import { User } from '@prisma/client'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass } from '~/utils/rtlUtils'
import { requireUser } from '~/utils/session.server'

import type { Route } from './+types/settings'

// Route metadata - this is a protected route

type LoaderData = {
  user: User
}

export const meta: MetaFunction = () => [
  { title: 'Settings | Tournado' },
  {
    name: 'description',
    content: 'Configure your tournament settings, preferences, and account options.',
  },
  { property: 'og:title', content: 'Settings | Tournado' },
  {
    property: 'og:description',
    content: 'Configure your tournament settings, preferences, and account options.',
  },
  { property: 'og:type', content: 'website' },
]

// Route metadata - this is a protected route
export const handle: RouteMetadata = {
  isPublic: false,
  // When roles are implemented:
  // roles: ['tournamentOrganiser', 'admin']
  title: 'common.titles.settings',
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  const user = await requireUser(request)
  return { user }
}

export default function SettingsPage(): JSX.Element {
  const { t, i18n } = useTranslation()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        {t('common.titles.settings')}
      </h1>
      <p>
        This is a protected route example that would redirect to login if not
        authenticated.
      </p>
      <p>User settings will be implemented here.</p>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
