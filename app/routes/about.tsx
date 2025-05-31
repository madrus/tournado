import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import type { RouteMetadata } from '~/utils/route-types'

// Type definition for loader data
type LoaderData = {
  version: string
}

//! TODO: replace with generated type
interface LoaderArgs {
  request: Request
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

export async function loader({ request: _request }: LoaderArgs): Promise<LoaderData> {
  // Read version from package.json
  const packageJson = await import('../../package.json')
  return { version: packageJson.version }
}

export default function AboutPage(): JSX.Element {
  const { t } = useTranslation()
  const { version } = useLoaderData<LoaderData>()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>{t('common.titles.about')}</h1>
      <div className='space-y-6'>
        <section>
          <h2 className='mb-4 text-2xl font-semibold'>About Tournado</h2>
          <p className='text-gray-700'>
            Tournado is a comprehensive tournament management platform designed to
            streamline the organization and management of sports tournaments for
            organizations and teams.
          </p>
          <p className='mt-2 text-sm text-gray-500'>
            Version: <span className='font-mono font-semibold'>{version}</span>
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-2xl font-semibold'>Features</h2>
          <ul className='space-y-2 text-gray-700'>
            <li>• Tournament creation and management</li>
            <li>• Team registration and player management</li>
            <li>• Schedule generation and match tracking</li>
            <li>• Real-time updates and notifications</li>
            <li>• Comprehensive reporting and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className='mb-4 text-2xl font-semibold'>Technology Stack</h2>
          <p className='text-gray-700'>
            Built with modern web technologies including React Router v7, TypeScript,
            Prisma, and SQLite for a robust and scalable solution.
          </p>
        </section>
      </div>
    </div>
  )
}

export { GeneralErrorBoundary as ErrorBoundary }
