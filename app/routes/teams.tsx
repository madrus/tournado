import { JSX } from 'react'
import { Outlet } from 'react-router'

export default function TeamsLayout(): JSX.Element {
  return (
    <div
      className='pb-safe-bottom container mx-auto min-h-screen min-w-[320px] px-4 py-8'
      data-testid='teams-layout-container'
    >
      <Outlet />
    </div>
  )
}
