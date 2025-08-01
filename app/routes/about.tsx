import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import type { Route } from './+types/about'

// Type definition for loader data
type LoaderData = {
  version: string
}

// Route metadata - this is a public route
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.about',
}

export const meta: MetaFunction = () => [
  { title: 'About | Tournado' },
  {
    name: 'description',
    content:
      'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
  },
  { property: 'og:title', content: 'About | Tournado' },
  {
    property: 'og:description',
    content:
      'Learn about Tournado - the comprehensive tournament management platform for sports organizations and teams.',
  },
  { property: 'og:type', content: 'website' },
]

export async function loader({
  request: _request,
}: Route.LoaderArgs): Promise<LoaderData> {
  // Read version from package.json
  const packageJson = await import('../../package.json')
  return { version: packageJson.version }
}

export default function AboutPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { version } = useLoaderData<LoaderData>()

  return (
    <div data-testid='about-container'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        {t('common.titles.about')}
      </h1>
      <div className='space-y-6'>
        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            About Tournado
          </h2>
          <p className='text-foreground'>
            Tournado is a comprehensive tournament management platform designed to
            streamline the organization and management of sports tournaments for
            organizations and teams.
          </p>
          <p className='text-foreground-lighter mt-2 text-sm'>
            Version: <span className='font-mono font-semibold'>{version}</span>
          </p>
        </section>

        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Features
          </h2>
          <ul className='text-foreground space-y-2'>
            <li>• Tournament creation and management</li>
            <li>• Team registration and player management</li>
            <li>• Schedule generation and match tracking</li>
            <li>• Real-time updates and notifications</li>
            <li>• Comprehensive reporting and analytics</li>
          </ul>
        </section>

        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Technology Stack
          </h2>
          <p className='text-foreground'>
            Built with modern web technologies including React Router v7, TypeScript,
            Prisma, and SQLite for a robust and scalable solution.
          </p>
        </section>
      </div>
    </div>
  )
}

export { GeneralErrorBoundary as ErrorBoundary }
