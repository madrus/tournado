import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'

import type { User } from '@prisma/client'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'
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
    // Only participants, admins, and tournament organisers can access profiles
    requiredRoles: ['participant', 'admin', 'tournamentOrganiser'],
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
  const { t, i18n } = useTranslation()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className={cn('mb-8 text-3xl font-bold', getLatinTitleClass(i18n.language))}>
        {t('common.titles.profile')}
      </h1>
      <div className='mb-6 rounded-lg bg-green-50 p-4'>
        <h3
          className={cn(
            'mb-2 text-lg font-semibold text-green-800',
            getLatinTitleClass(i18n.language)
          )}
        >
          ✅ Enhanced Route Protection Active
        </h3>
        <ul className='space-y-1 text-sm text-green-700'>
          <li>• Authentication required</li>
          <li>• Role-based access control enabled</li>
          <li>• Custom protection logic applied</li>
          <li>• Automatic redirect to /auth/signin if not authenticated</li>
          <li>• Automatic redirect to /unauthorized if insufficient permissions</li>
        </ul>
      </div>
      <p>
        This is a protected route example that demonstrates the enhanced route
        protection system.
      </p>
      <p>User settings will be implemented here.</p>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
