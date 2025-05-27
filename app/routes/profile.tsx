import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'

import type { User } from '@prisma/client'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUser } from '~/utils/session.server'

// Route metadata - this is a protected route

type LoaderData = {
  user: User
}

//! TODO: replace with generated type
interface LoaderArgs {
  request: Request
}

export const meta: MetaFunction = () => [{ title: 'Settings' }]

export const handle: RouteMetadata = {
  isPublic: false,
  // When roles are implemented:
  // roles: ['tournamentOrganiser', 'admin']
  title: 'common.titles.profile',
}

export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
  // This ensures only authenticated users can access this route
  const user = await requireUser(request)
  return { user }
}

export default function ProfilePage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>{t('common.titles.profile')}</h1>
      <p>
        This is a protected route example that would redirect to login if not
        authenticated.
      </p>
      <p>User settings will be implemented here.</p>
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
