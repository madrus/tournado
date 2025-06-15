import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLinkButton } from '~/components/buttons'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinContentClass, getTypographyClasses } from '~/utils/rtlUtils'
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
  const { t, i18n } = useTranslation()
  const { user } = useLoaderData<LoaderData>()

  // Get RTL-aware typography classes
  const typography = getTypographyClasses(i18n.language)

  // Determine the correct teams route based on user role
  const teamsRoute =
    user?.role === 'ADMIN' ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' : '/teams'

  return (
    <main className='flex h-full flex-col'>
      {/* Hero Section */}
      <div className='flex flex-1 flex-col justify-center pt-16 pb-20'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h1
              className={cn(
                'app-name text-4xl sm:text-6xl',
                typography.appName, // Use specific app name styling for consistent positioning
                getLatinContentClass(i18n.language) // Mark app name as Latin content
              )}
            >
              {t('common.appName')}
            </h1>
            <p
              className={cn(
                'text-foreground-light mt-6 min-h-[3.5rem] text-lg leading-8', // Ensure consistent height for 2 lines
                typography.centerAlign
              )}
            >
              {t('landing.hero.description')}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <ActionLinkButton
                to={teamsRoute}
                icon='apparel'
                label={t('landing.hero.viewTeams')}
                variant='emerald'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='bg-white py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2
              className={cn(
                'text-brand-dark text-base leading-7 font-semibold',
                typography.centerAlign
              )}
            >
              {t('landing.features.title')}
            </h2>
            <p
              className={cn(
                'mt-2 text-3xl font-bold sm:text-4xl',
                typography.title,
                typography.heading,
                typography.centerAlign
              )}
            >
              {t('landing.features.subtitle')}
            </p>
            <p
              className={cn(
                'text-foreground-light mt-6 text-lg leading-8',
                typography.centerAlign
              )}
            >
              {t('landing.features.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
