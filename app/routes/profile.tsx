import { useTranslation } from 'react-i18next'
import { type LoaderFunctionArgs } from 'react-router'

import type { RouteMetadata } from '~/utils/route-types'
import { requireUser } from '~/utils/session.server'

// Route metadata - this is a protected route
export const handle: RouteMetadata = {
  isPublic: false,
  // When roles are implemented:
  // roles: ['tournamentOrganiser', 'admin']
  title: 'common.titles.settings',
}

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  // This ensures only authenticated users can access this route
  const user = await requireUser(request)
  return Response.json({ user })
}

export default function SettingsPage(): JSX.Element {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('common.titles.settings')}</h1>
      <p>
        This is a protected route example that would redirect to login if not
        authenticated.
      </p>
      <p>User settings will be implemented here.</p>
    </div>
  )
}
