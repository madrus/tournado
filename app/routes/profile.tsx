import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'

import type { User } from '@prisma/client'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { ProfileLayoutHeader } from '~/components/layouts'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { getLatinTitleClass } from '~/utils/rtlUtils'

import type { Route } from './+types/profile'

// Route metadata - this is a protected route with enhanced configuration

type LoaderData = {
  user: User
}

export const meta: MetaFunction = () => [
  { title: 'Profile | Tournado' },
  {
    name: 'description',
    content:
      'Manage your profile settings and account information for tournament management.',
  },
  { property: 'og:title', content: 'Profile | Tournado' },
  {
    property: 'og:description',
    content:
      'Manage your profile settings and account information for tournament management.',
  },
  { property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
  isPublic: false,
  title: 'common.titles.profile',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    // Only authenticated users with roles can access profiles (no visitors)
    requiredRoles: ['referee', 'manager', 'admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
  protection: {
    autoCheck: true,
    // Custom check example: ensure user can only access their own profile
    customCheck: async (_request, _user) => true,
  },
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Use the enhanced protection system
  const user = await requireUserWithMetadata(request, handle)
  return { user }
}

export default function ProfilePage(): JSX.Element {
  const { i18n } = useTranslation()

  return (
    <div data-testid='profile-container'>
      <ProfileLayoutHeader />
      <div className='mt-8 space-y-6'>
        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Account Settings
          </h2>
          <ul className='text-foreground space-y-2'>
            <li>• Personal information management</li>
            <li>• Password and security settings</li>
            <li>• Notification preferences</li>
            <li>• Privacy and data settings</li>
            <li>• Account deletion options</li>
          </ul>
        </section>

        <section>
          <h2
            className={cn(
              'mb-4 text-2xl font-semibold',
              getLatinTitleClass(i18n.language)
            )}
          >
            Tournament Access
          </h2>
          <p className='text-foreground'>
            Your profile provides access to tournament management features based on your
            role and permissions.
          </p>
        </section>
      </div>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
