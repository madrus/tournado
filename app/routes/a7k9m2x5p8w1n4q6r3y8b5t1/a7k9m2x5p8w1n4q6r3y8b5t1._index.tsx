import { JSX } from 'react'
import { type MetaFunction, useLoaderData } from 'react-router'

import type { User } from '@prisma/client'

import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

type LoaderData = {
  user: User
}

//! TODO: replace with generated type
type LoaderArgs = {
  request: Request
}

export const meta: MetaFunction = () => [
  { title: 'Admin Panel | Tournado' },
  {
    name: 'description',
    content: 'Administrative panel for tournament management and user administration.',
  },
  { property: 'og:title', content: 'Admin Panel | Tournado' },
  {
    property: 'og:description',
    content: 'Administrative panel for tournament management and user administration.',
  },
  { property: 'og:type', content: 'website' },
]

export const handle: RouteMetadata = {
  isPublic: false,
  title: 'Admin Panel',
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    // Only admins can access this route
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
  protection: {
    autoCheck: true,
    // Custom check: additional validation for admin access
    customCheck: async (_request, user) => user !== null, // Placeholder logic
  },
}

export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
  // Enhanced protection automatically handles authentication and authorization
  const user = await requireUserWithMetadata(request, handle)
  return { user }
}

export default function AdminDashboard(): JSX.Element {
  const { user } = useLoaderData<LoaderData>()

  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold'>User Management</h3>
        <p className='mb-4 text-gray-600'>Manage user accounts and permissions.</p>
        <div className='space-y-2'>
          <p>
            <strong>Current User:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
        </div>
      </div>

      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold'>Tournament Management</h3>
        <p className='mb-4 text-gray-600'>Oversee all tournaments and competitions.</p>
        <button className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
          Manage Tournaments
        </button>
      </div>

      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold'>System Settings</h3>
        <p className='mb-4 text-gray-600'>
          Configure application settings and preferences.
        </p>
        <button className='rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700'>
          System Config
        </button>
      </div>

      <div className='rounded-lg border bg-white p-6 shadow-sm'>
        <h3 className='mb-4 text-lg font-semibold'>Reports & Analytics</h3>
        <p className='mb-4 text-gray-600'>
          View platform usage and tournament statistics.
        </p>
        <button className='rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700'>
          View Reports
        </button>
      </div>
    </div>
  )
}
