import { JSX } from 'react'
import { Outlet } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'

export default function AdminLayout(): JSX.Element {
  return (
    <div
      className='container mx-auto min-h-full min-w-[320px] px-4 py-8'
      data-testid='admin-layout-container'
    >
      <Outlet />
    </div>
  )
}

export { AuthErrorBoundary as ErrorBoundary }
