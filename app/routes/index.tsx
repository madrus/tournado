import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { useTranslation } from 'react-i18next'

import { getUser } from '~/utils/session.server'

export const meta: MetaFunction = () => [{ title: 'Tournado' }]

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  const user = await getUser(request)
  return json({ user })
}

export default function Index(): JSX.Element {
  const { t } = useTranslation()

  return (
    <main className='relative bg-emerald-50'>
      {/* Hero Section */}
      <div className='relative pt-16 pb-20'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
              {t('common.appName')}
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              {t('landing.hero.description')}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Link
                to='/teams'
                className='rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
              >
                {t('landing.hero.viewTeams')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='bg-white py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:text-center'>
            <h2 className='text-base leading-7 font-semibold text-emerald-600'>
              {t('landing.features.title')}
            </h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              {t('landing.features.subtitle')}
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              {t('landing.features.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
