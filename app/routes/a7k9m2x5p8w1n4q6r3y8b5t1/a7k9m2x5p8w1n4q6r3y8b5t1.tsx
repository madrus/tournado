import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

export default function AdminLayout(): JSX.Element {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Admin Panel</h1>

      <div className='mb-6 rounded-lg bg-blue-50 p-4'>
        <h3 className='mb-2 text-lg font-semibold text-blue-800'>
          🔒 Admin-Only Route Protection
        </h3>
        <ul className='space-y-1 text-sm text-blue-700'>
          <li>• Only users with 'admin' role can access this page</li>
          <li>• Automatic redirect to /unauthorized for non-admin users</li>
          <li>• Enhanced protection with custom validation</li>
        </ul>
      </div>

      <Outlet />
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
