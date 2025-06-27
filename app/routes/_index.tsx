import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionLinkButton } from '~/components/buttons'
import { useTheme } from '~/hooks/useTheme'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'
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
  const { theme, getThemeColor } = useTheme()

  // Get RTL-aware typography classes
  const typography = getTypographyClasses(i18n.language)

  // Determine the correct teams route based on user role
  const teamsRoute =
    user?.role === 'ADMIN' ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams' : '/teams'

  return (
    <main className={`flex h-full flex-col ${theme}`}>
      {/* Hero Section */}
      <div className='pt-16 pb-8'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h1
              className={cn(
                'text-4xl sm:text-6xl',
                typography.appName,
                getLatinTitleClass(i18n.language)
              )}
              style={{ color: getThemeColor('title') }}
            >
              {t('common.appName')}
            </h1>
            <p
              className={cn(
                'mt-6 min-h-[3.5rem] text-lg leading-8',
                typography.centerAlign
              )}
              style={{ color: getThemeColor('foregroundLight') }}
            >
              {t('landing.hero.description')}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <ActionLinkButton
                to={teamsRoute}
                icon='apparel'
                label={t('landing.hero.viewTeams')}
                variant='primary'
                color='emerald'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2
              className={cn(
                'block text-base leading-7 font-semibold',
                typography.centerAlign
              )}
              style={{ color: getThemeColor('brandAccent') }}
              role='heading'
              aria-level={2}
            >
              {t('landing.features.title')}
            </h2>
            <h3
              className={cn(
                'mt-2 text-3xl font-bold sm:text-4xl',
                typography.title,
                typography.heading,
                typography.centerAlign
              )}
              style={{ color: getThemeColor('title') }}
            >
              {t('landing.features.subtitle')}
            </h3>
            <p
              className={cn('mt-6 text-lg leading-8', typography.centerAlign)}
              style={{ color: getThemeColor('foregroundLight') }}
            >
              {t('landing.features.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
