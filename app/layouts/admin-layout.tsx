import type { JSX } from 'react'
import { Outlet } from 'react-router'

export default function AdminLayout(): JSX.Element {
  return (
    <div className='admin-layout'>
      {/* In the future, we can add admin-specific navigation, sidebar, etc. here */}
      <Outlet />
    </div>
  )
}
