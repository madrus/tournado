import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { useOptionalUser } from '@/utils'

export const meta: MetaFunction = () => [{ title: 'Tournado' }]

export default function Index() {
  const user = useOptionalUser()
  return (
    <main className='relative min-h-screen bg-emerald-50 sm:flex sm:items-center sm:justify-center'>
      <div className='relative sm:pb-16 sm:pt-8'>
        <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
          <div className='relative sm:overflow-hidden sm:rounded-2xl'>
            <div className='relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32'>
              <h1 className='text-center text-6xl font-extrabold tracking-tight lg:text-9xl'>
                <span className='block uppercase text-brand drop-shadow'>Tournado</span>
              </h1>
              <div className='mx-auto mt-10 flex w-full max-w-sm flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row sm:justify-center'>
                {user ? (
                  <Link
                    to='/notes'
                    className='flex w-1/2 min-w-[200px] items-center justify-center rounded-full border border-red-500 bg-emerald-50 px-6 py-2 text-center text-base font-medium text-brand shadow-sm hover:bg-white hover:text-red-600 lg:w-1/2'
                  >
                    {'View notes for '}
                    {user.email}
                  </Link>
                ) : (
                  <div className='flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5'>
                    <Link
                      to='/join'
                      className='flex w-1/2 min-w-[120px] items-center justify-center rounded-full border border-red-500 border-transparent bg-emerald-50 px-6 py-2 text-base font-medium text-red-600 shadow-sm hover:bg-white lg:w-1/3'
                    >
                      Sign up
                    </Link>
                    <Link
                      to='/login'
                      className='flex w-1/2 min-w-[120px] items-center justify-center rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700 lg:w-1/3'
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
