import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

const DesktopFooter = (): JSX.Element => {
  const { i18n } = useTranslation()

  return (
    <footer className='hidden border-t border-emerald-950/10 bg-emerald-900 md:block'>
      <div
        className='container mx-auto grid h-14 grid-cols-2 px-4'
        data-testid='footer-container'
      >
        <div className='flex items-center' data-testid='footer-left-section'>
          <Link to='/' className='flex items-center'>
            <span
              className={cn(
                'm-0 p-0 leading-[1] font-light text-white/90',
                getLatinTextClass(i18n.language)
              )}
            >
              Tournado
            </span>
          </Link>
        </div>
        <div
          className='flex items-center justify-end'
          data-testid='footer-right-section'
        >
          <span
            data-testid='footer-attribution'
            aria-label='Built with love by Madrus4U'
            className={cn(
              'm-0 p-0 leading-[1] text-white/90',
              getLatinTextClass(i18n.language)
            )}
          >
            Built with ♥️ by{' '}
            <a
              href='https://madrus4u.com'
              target='_blank'
              rel='noopener noreferrer'
              className='underline hover:text-white'
            >
              Madrus4U
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default DesktopFooter
