import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'

// Add the context type that was in the original file
type ContextType = {
  type: 'sidebar' | 'main'
}

export default function TeamsLayout(): JSX.Element {
  const { t } = useTranslation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const isNewTeamPage = location.pathname === '/teams/new'

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <main className='flex flex-1 overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white md:flex-row'>
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen ? (
          <div
            className='fixed inset-0 z-40 bg-black/50 md:hidden'
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        {/* Sidebar */}
        <div
          className={`absolute top-0 z-50 h-full w-80 transform bg-gradient-to-b from-emerald-50 via-white to-white transition-transform duration-300 ease-in-out md:relative md:top-0 ${
            isSidebarOpen
              ? 'fixed translate-x-0 shadow-lg'
              : '-translate-x-full md:translate-x-0'
          } border-r border-red-500`}
        >
          <div className='relative flex h-full flex-col'>
            <div className='p-4'>
              <Link
                to='new'
                className='flex w-full min-w-[120px] items-center justify-center rounded-full border border-red-500 bg-white px-6 py-2 text-center text-base font-semibold text-red-500 shadow-xs hover:bg-red-50'
                aria-label='Sidebar button to add a new team'
              >
                {t('teams.newTeam')}
              </Link>
            </div>

            <hr className='border-gray-300' />

            {/* Team List */}
            <div className='pb-safe flex-1 overflow-y-auto'>
              <Outlet context={{ type: 'sidebar' } as ContextType} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='h-full flex-1 overflow-y-auto p-4 md:p-6'>
          <Outlet context={{ type: 'main' } as ContextType} />
        </div>

        {/* Mobile Floating Action Add Team Button */}
        {!isNewTeamPage ? (
          <Link
            to='new'
            className='safe-bottom fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 pt-3 text-white shadow-xl hover:bg-red-600 md:hidden'
            role='link'
            aria-label={t('teams.newTeam')}
          >
            <span className='text-3xl text-white'>+</span>
          </Link>
        ) : null}
      </main>
    </div>
  )
}
