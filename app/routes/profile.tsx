import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { useTranslation } from 'react-i18next'

import type { RouteMetadata } from '~/utils/route-types'
import { requireUser } from '~/utils/session.server'

// Route metadata - this is a protected route
export const handle: RouteMetadata = {
  isPublic: false,
  // When roles are implemented:
  // roles: ['tournamentOrganiser', 'admin']
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // This ensures only authenticated users can access this route
  const user = await requireUser(request)
  return json({ user })
}

export default function ProfilePage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('common.profile')}</h1>
      <p>
        This is a protected route example that would redirect to login if not
        authenticated.
      </p>
      <p>In the future, it could also check for specific roles.</p>
    </div>
  )
}
