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
      <div className='space-y-6'>
        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Application Settings
          </h2>
          <p className='text-foreground-light'>
            Configure your tournament settings, preferences, and account options for
            optimal experience.
          </p>
        </section>

        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Preferences
          </h2>
          <ul className='text-foreground-light space-y-2'>
            <li>• Language and regional settings</li>
            <li>• Theme and appearance options</li>
            <li>• Notification preferences</li>
            <li>• Privacy and security settings</li>
            <li>• Data export and backup options</li>
          </ul>
        </section>

        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Tournament Configuration
          </h2>
          <p className='text-foreground-light'>
            Customize tournament management settings and default configurations for your
            organization.
          </p>
        </section>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
