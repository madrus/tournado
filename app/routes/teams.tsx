import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useRouteError,
} from '@remix-run/react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { getTeamListItems } from '@/models/team.server'
import { useUser } from '@/utils'
import { requireUserId } from '@/utils/session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  const teamListItems = await getTeamListItems({ userId })
  return json({ teamListItems })
}

export default function TeamsPage() {
  const { t } = useTranslation()
  const data = useLoaderData<typeof loader>()
  const user = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const isNewTeamPage = location.pathname === '/teams/new'

  return (
    <div className='flex h-screen flex-col overflow-hidden'>
      <header className='safe-top relative h-14 bg-emerald-800 px-4 text-white'>
        <button
          className='absolute top-1/2 left-4 -translate-y-1/2 rounded-sm p-1 md:hidden'
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label='Toggle menu'
        >
          <svg
            className='h-7 w-7'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
        <h1 className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold'>
          <Link to='.'>{t('teams.title')}</Link>
        </h1>
        <div className='absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-4'>
          <p className='hidden text-sm md:block'>{user.email}</p>
          <LanguageSwitcher />
          <Form action='/logout' method='post'>
            <button
              type='submit'
              className='rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-600 active:bg-emerald-600'
            >
              {t('auth.logout')}
            </button>
          </Form>
        </div>
      </header>

      <div className='h-1.5 w-full bg-red-500' />

      <main className='flex flex-1 overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white md:flex-row'>
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen ? (
          <div
            className='bg-opacity-50 fixed inset-0 top-[62px] z-40 bg-black md:hidden'
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        {/* Sidebar */}
        <div
          className={`absolute z-50 w-80 transform bg-gradient-to-b from-emerald-50 via-white to-white transition-transform duration-300 ease-in-out md:relative md:top-0 ${
            isSidebarOpen
              ? 'fixed top-[62px] h-[calc(100vh-58px)] translate-x-0 shadow-lg'
              : '-translate-x-full'
          }`}
        >
          <div className='relative flex h-full flex-col'>
            <div className='p-4'>
              <Link
                to='new'
                className='flex w-full min-w-[120px] items-center justify-center rounded-full border border-emerald-600 bg-white px-6 py-2 text-center text-base font-semibold text-emerald-600 shadow-xs hover:bg-emerald-50'
                aria-label='Sidebar button to add a new team'
              >
                {t('teams.newTeam')}
              </Link>
            </div>

            <hr className='border-gray-300' />

            <div className='pb-safe flex-1 overflow-y-auto'>
              {data.teamListItems?.length === 0 ? (
                <p className='p-4 text-center text-gray-500'>{t('teams.noTeams')}</p>
              ) : (
                <ol>
                  {data.teamListItems?.map(team => (
                    <li key={team.id}>
                      <NavLink
                        className={({ isActive }) =>
                          `block border-b p-4 text-xl ${
                            isActive ? 'bg-white font-semibold' : 'hover:bg-gray-100'
                          }`
                        }
                        to={team.id}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        📝 {team.teamName}
                      </NavLink>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto p-4 md:p-6'>
          <Outlet />
        </div>

        {/* Mobile Floating Action Add Team Button */}
        {!isNewTeamPage ? (
          <Link
            to='new'
            className='safe-bottom fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 pt-3 text-white shadow-xl hover:bg-emerald-700 md:hidden'
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

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)
  return (
    <div>
      An unexpected error occurred:{' '}
      {error instanceof Error ? error.message : 'Unknown error'}
    </div>
  )
}
