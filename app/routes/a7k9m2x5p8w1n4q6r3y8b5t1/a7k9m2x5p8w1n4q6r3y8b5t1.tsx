import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

export default function AdminLayout(): JSX.Element {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Outlet />
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
