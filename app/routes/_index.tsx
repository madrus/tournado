import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import { ActionButton, ActionLinkButton } from '~/components/buttons'
import { useTheme } from '~/hooks/useTheme'
import { cn } from '~/utils/misc'
import { hasAdminPanelAccess } from '~/utils/rbac'
import type { RouteMetadata } from '~/utils/routeTypes'
import { getLatinTitleClass, getTypographyClasses } from '~/utils/rtlUtils'
import { getUser } from '~/utils/session.server'
import { toast } from '~/utils/toastUtils'

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

  // Determine the correct teams route based on user permissions
  const teamsRoute = hasAdminPanelAccess(user)
    ? '/a7k9m2x5p8w1n4q6r3y8b5t1/teams'
    : '/teams'

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
                getLatinTitleClass(i18n.language),
                getThemeColor('title')
              )}
            >
              {t('common.appName')}
            </h1>
            <p
              className={cn(
                'text-foreground mt-6 min-h-[3.5rem] text-lg leading-8',
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
                variant='primary'
                color='primary'
                data-testid='view-teams-button'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Examples Section */}
      <div className='py-12'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='mb-8 text-2xl font-bold'>Toast Notifications Demo</h2>
            <div className='flex flex-wrap justify-center gap-4'>
              <ActionButton
                icon='check'
                variant='primary'
                color='emerald'
                className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
                onClick={() =>
                  toast.success('Team created successfully!', {
                    description: 'Your team has been added to the tournament.',
                  })
                }
              >
                Success Toast
              </ActionButton>
              <ActionButton
                icon='error'
                variant='primary'
                color='red'
                className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
                onClick={() =>
                  toast.error('Failed to save team', {
                    description: 'Please check your connection and try again.',
                  })
                }
              >
                Error Toast
              </ActionButton>
              <ActionButton
                icon='warning'
                variant='secondary'
                color='orange'
                className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
                onClick={() =>
                  toast.warning('Tournament is full', {
                    description: 'Only 2 spots remaining for registration.',
                  })
                }
              >
                Warning Toast
              </ActionButton>
              <ActionButton
                icon='info'
                variant='secondary'
                color='sky'
                className='!border-violet-600 !bg-violet-600 !text-white hover:!bg-violet-700'
                onClick={() =>
                  toast.info('New update available', {
                    description: 'Version 2.1.0 includes performance improvements.',
                  })
                }
              >
                Info Toast
              </ActionButton>
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
                'text-brand-accent block text-base leading-7 font-semibold',
                typography.centerAlign
              )}
              role='heading'
              aria-level={2}
            >
              {t('landing.features.title')}
            </h2>
            <h3
              className={cn(
                'text-title mt-2 text-3xl font-bold sm:text-4xl',
                typography.title,
                typography.heading,
                typography.centerAlign,
                getThemeColor('title')
              )}
            >
              {t('landing.features.subtitle')}
            </h3>
            <p
              className={cn(
                'text-foreground mt-6 text-lg leading-8',
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
