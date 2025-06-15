import { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { getLatinContentClass } from '~/utils/rtlUtils'

const DesktopFooter = (): JSX.Element => {
  const { i18n } = useTranslation()

  return (
    <footer className='hidden md:block'>
      <div className='container mx-auto grid h-14 grid-cols-2 px-4'>
        <div className='flex items-center'>
          <Link to='/' className='flex items-center'>
            <span
              className={`m-0 p-0 leading-[1] font-light ${getLatinContentClass(i18n.language)}`}
            >
              Tournado
            </span>
          </Link>
        </div>
        <div className='flex items-center justify-end'>
          <span
            className={`m-0 p-0 leading-[1] ${getLatinContentClass(i18n.language)}`}
          >
            Built with ♥️ by Madrus
          </span>
        </div>
      </div>
    </footer>
  )
}

export default DesktopFooter
