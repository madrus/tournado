import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { useOptionalUser } from '@/utils'

export const meta: MetaFunction = () => [{ title: 'Tournado' }]

export default function Index() {
  const user = useOptionalUser()
  return (
    <main className='relative flex min-h-screen items-center justify-center bg-emerald-50'>
      <div className='relative pb-16 pt-8'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='relative overflow-hidden rounded-2xl'>
            <div className='relative px-4 pb-8 pt-16 md:px-8 md:pb-20 md:pt-24 lg:pt-32'>
              <h1 className='text-center text-6xl font-extrabold tracking-tight md:text-9xl'>
                <span className='block uppercase text-brand drop-shadow'>Tournado</span>
              </h1>
              <div className='mx-auto mt-10 flex w-full max-w-sm flex-col items-center justify-center gap-4 md:max-w-none md:flex-row'>
                {user ? (
                  <Link
                    to='/notes'
                    className='flex w-1/2 min-w-[200px] items-center justify-center rounded-full border border-red-500 bg-emerald-50 px-6 py-2 text-center text-base font-medium text-brand shadow-sm hover:bg-white hover:text-red-600 md:w-1/2'
                  >
                    {'View notes for '}
                    {user.email}
                  </Link>
                ) : (
                  <div className='flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-5'>
                    <Link
                      to='/join'
                      className='flex w-1/2 min-w-[120px] items-center justify-center rounded-full border border-red-500 bg-emerald-50 px-6 py-2 text-base font-medium text-red-600 shadow-sm hover:bg-white md:w-1/3'
                    >
                      Sign up
                    </Link>
                    <Link
                      to='/login'
                      className='flex w-1/2 min-w-[120px] items-center justify-center rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700 md:w-1/3'
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
