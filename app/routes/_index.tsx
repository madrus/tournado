import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLink } from '~/components/PrefetchLink'
import type { RouteMetadata } from '~/utils/route-types'
import { getUser } from '~/utils/session.server'

type LoaderData = {
  user: User | null
}

export const meta: MetaFunction = () => [
  { title: 'Tournado - Tournament Management Made Easy' },
  {
    name: 'description',
    content:
      'Manage your sports tournaments with ease. Create, organize, and track your teams and matches in one place.',
  },
  { property: 'og:title', content: 'Tournado - Tournament Management Made Easy' },
  {
    property: 'og:description',
    content:
      'Manage your sports tournaments with ease. Create, organize, and track your teams and matches in one place.',
  },
  { property: 'og:type', content: 'website' },
]

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.welcome',
}

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  const user = await getUser(request)
  return { user }
}

export default function IndexPage(): JSX.Element {
  const { t } = useTranslation()
  const { user } = useLoaderData<LoaderData>()

  // Determine the correct teams route based on user role
  const teamsRoute =
    user?.role === 'ADMIN' ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' : '/teams'

  return (
    <main className='flex h-full flex-col'>
      {/* Hero Section */}
      <div className='flex flex-1 flex-col justify-center pt-16 pb-20'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>
              {t('common.appName')}
            </h1>
            <p className='text-foreground-light mt-6 text-lg leading-8'>
              {t('landing.hero.description')}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <ActionLink
                to={teamsRoute}
                className='rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
              >
                {t('landing.hero.viewTeams')}
              </ActionLink>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='bg-white py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2 className='text-brand-dark text-base leading-7 font-semibold'>
              {t('landing.features.title')}
            </h2>
            <p className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
              {t('landing.features.subtitle')}
            </p>
            <p className='text-foreground-light mt-6 text-lg leading-8'>
              {t('landing.features.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
