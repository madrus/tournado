import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '~/utils/misc'
import { getLatinTextClass } from '~/utils/rtlUtils'

const DesktopFooter = (): JSX.Element => {
  const { i18n } = useTranslation()

  return (
    <footer className='bg-footer border-footer/10 hidden border-t md:block'>
      <div className='container mx-auto grid h-14 grid-cols-2 px-4'>
        <div className='flex items-center'>
          <Link to='/' className='flex items-center'>
            <span
              className={cn(
                'text-footer-foreground m-0 p-0 leading-[1] font-light',
                getLatinTextClass(i18n.language)
              )}
            >
              Tournado
            </span>
          </Link>
        </div>
        <div className='flex items-center justify-end'>
          <span
            className={cn(
              'text-footer-foreground m-0 p-0 leading-[1]',
              getLatinTextClass(i18n.language)
            )}
          >
            Built with ♥️ by Madrus4U
          </span>
        </div>
      </div>
    </footer>
  )
}

export default DesktopFooter
