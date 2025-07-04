// This is called a "splat route" and as it's in the root `/app/routes/`
// directory, it's a catchall. If no other routes match, this one will and we
// can know that the user is hitting a URL that doesn't exist. By throwing a
// 404 from the loader, we can force the error boundary to render which will
// ensure the user gets the right status code and we can display a nicer error
// message for them than the React Router v7 and/or browser default.
import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { useLocation } from 'react-router'

import { GeneralErrorBoundary } from '~/components/GeneralErrorBoundary'
import { ErrorRecoveryLink } from '~/components/PrefetchLink'
import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

export const meta: MetaFunction = () => [
  { title: 'Page Not Found | Tournado' },
  {
    name: 'description',
    content:
      'The page you are looking for could not be found. Return to Tournado to continue managing your tournaments.',
  },
  { property: 'og:title', content: 'Page Not Found | Tournado' },
  {
    property: 'og:description',
    content:
      'The page you are looking for could not be found. Return to Tournado to continue managing your tournaments.',
  },
  { property: 'og:type', content: 'website' },
]

export async function loader(): Promise<void> {
  throw new Response('Not found', { status: 404 })
}

export default function NotFoundPage(): JSX.Element {
  // due to the loader, this component will never be rendered, but we'll return
  // the error boundary just in case.
  return <ErrorBoundary />
}

export function ErrorBoundary(): JSX.Element {
  const location = useLocation()
  const { i18n } = useTranslation()

  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <h1 className={cn(getLatinTitleClass(i18n.language))}>
                We can't find this page:
              </h1>
              <pre className='text-foreground text-lg break-all whitespace-pre-wrap'>
                {location.pathname}
              </pre>
            </div>
            <ErrorRecoveryLink to='/' className='text-foreground text-base underline'>
              Back to home
            </ErrorRecoveryLink>
          </div>
        ),
      }}
    />
  )
}
