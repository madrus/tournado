import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { useOptionalUser } from '@/utils'

export const meta: MetaFunction = () => [{ title: 'Tournado' }]

export default function Index() {
  const user = useOptionalUser()
  return (
    <main className='relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center'>
      <div className='relative sm:pb-16 sm:pt-8'>
        <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>
          <div className='relative sm:overflow-hidden sm:rounded-2xl'>
            <div className='relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32'>
              <h1 className='text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl'>
                <span className='block uppercase text-[color:#e63920] drop-shadow'>
                  Tournado
                </span>
              </h1>
              <p className='mx-auto mt-6 max-w-lg text-center text-xl text-white sm:max-w-3xl'>
                Check the README.md file for instructions on how to get this project
                deployed.
              </p>
              <div className='mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center'>
                {user ? (
                  <Link
                    to='/notes'
                    className='flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8'
                  >
                    View Notes for {user.email}
                  </Link>
                ) : (
                  <div className='space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0'>
                    <Link
                      to='/join'
                      className='flex items-center justify-center rounded-full border border-gray-300 border-transparent bg-white px-6 py-2 text-base font-medium text-gray-700 shadow-sm hover:border-red-500 hover:bg-yellow-50 hover:text-red-600 sm:px-8'
                    >
                      Sign up
                    </Link>
                    <Link
                      to='/login'
                      className='flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700'
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
